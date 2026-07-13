import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isManual = searchParams.get("manual") === "true"

    // 1. Obtener configuración automática
    const { data: configData, error: configError } = await supabase
      .from("configuracion_automatico")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)

    if (configError) throw configError

    const config = configData?.[0] || {
      dia_reporte_automatico: 28,
      hora_reporte_automatico: "08:00",
      telefono_reportes: ""
    }

    const diaReporte = config.dia_reporte_automatico || 28
    const horaConfig = config.hora_reporte_automatico || "08:00"
    const telefonoDestino = searchParams.get("telefono") || config.telefono_reportes || ""

    // Validar si hoy es el día y la hora del envío (ajustado a la hora de Colombia)
    const hoyColombia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
    const diaHoy = hoyColombia.getDate()
    const horaHoy = hoyColombia.getHours()
    const minutoHoy = hoyColombia.getMinutes()

    const [schedHour, schedMin] = String(horaConfig).split(":").map(Number)
    const schedMinutesTotal = (schedHour !== undefined ? schedHour : 8) * 60 + (schedMin !== undefined ? schedMin : 0)
    const currentMinutesTotal = horaHoy * 60 + minutoHoy

    const mesAnioHoy = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}`
    const yaEnviadoEsteMes = config.fecha_ultimo_reporte && config.fecha_ultimo_reporte.startsWith(mesAnioHoy)

    if (!isManual) {
      if (yaEnviadoEsteMes) {
        return NextResponse.json({
          success: true,
          message: `El informe mensual de deudores ya fue enviado para este periodo (${mesAnioHoy}).`
        })
      }

      if (diaHoy !== diaReporte || currentMinutesTotal < schedMinutesTotal) {
        // Si la hora actual coincide con la hora configurada para reportes, enviamos un ping de conexión al administrador para mantener activa la API
        if (horaHoy === (schedHour !== undefined ? schedHour : 8) && telefonoDestino) {
          try {
            const origin = new URL(request.url).origin
            let telefonoClean = String(telefonoDestino).replace(/[^0-9]/g, "")
            if (telefonoClean.length === 10 && !telefonoClean.startsWith("57")) {
              telefonoClean = "57" + telefonoClean
            }
            if (telefonoClean) {
              await fetch(`${origin}/api/whatsapp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  telefono: telefonoClean,
                  mensaje: `⚙️ Conexión Activa Torre Admin: El sistema está en línea y funcionando hoy ${diaHoy}/${hoyColombia.getMonth() + 1}.`
                })
              })
            }
          } catch (e) {
            console.error("Error al enviar ping de conexión:", e)
          }
        }

        const formattedSchedTime = `${(schedHour !== undefined ? schedHour : 8) < 10 ? '0' + (schedHour !== undefined ? schedHour : 8) : (schedHour !== undefined ? schedHour : 8)}:${(schedMin !== undefined ? schedMin : 0) < 10 ? '0' + (schedMin !== undefined ? schedMin : 0) : (schedMin !== undefined ? schedMin : 0)}`
        const formattedCurrentTime = `${horaHoy < 10 ? '0' + horaHoy : horaHoy}:${minutoHoy < 10 ? '0' + minutoHoy : minutoHoy}`

        return NextResponse.json({
          success: true,
          message: `Hora Colombia: ${formattedCurrentTime} del día ${diaHoy}. El informe automático está configurado para el día ${diaReporte} a las ${formattedSchedTime}. No se envió reporte. Se envió ping de conexión.`
        })
      }
    }

    if (!telefonoDestino) {
      return NextResponse.json({
        success: false,
        error: "No se ha configurado un teléfono de destino para el informe en el panel de configuración."
      }, { status: 400 })
    }

    // 2. Obtener Unidades
    const { data: unidades, error: errorUnidades } = await supabase
      .from("unidades")
      .select("*")

    if (errorUnidades) throw errorUnidades

    // 3. Obtener Mensualidades Pendientes
    const { data: mensualidades, error: errorMens } = await supabase
      .from("mensualidades")
      .select("*")
      .eq("estado", "Pendiente")

    // 4. Obtener Proyectos Pendientes
    const { data: proyectos, error: errorProy } = await supabase
      .from("proyectos_asignados")
      .select("*")
      .eq("estado", "Pendiente")

    // 5. Obtener Cartera (Periodo Anterior)
    const { data: cartera, error: errorCart } = await supabase
      .from("cartera")
      .select("*")

    const mapaMensualidades: Record<string, any[]> = {}
    if (mensualidades) {
      mensualidades.forEach((m) => {
        if (!mapaMensualidades[m.unidad]) mapaMensualidades[m.unidad] = []
        mapaMensualidades[m.unidad].push(m)
      })
    }

    const mapaProyectos: Record<string, any[]> = {}
    if (proyectos) {
      proyectos.forEach((p) => {
        if (!mapaProyectos[p.unidad]) mapaProyectos[p.unidad] = []
        mapaProyectos[p.unidad].push(p)
      })
    }

    const mapaCartera: Record<string, number> = {}
    if (cartera) {
      cartera.forEach((c) => {
        mapaCartera[c.unidad] = Number(c.deuda) || 0
      })
    }

    // 6. Construir el reporte línea por línea
    let mensajeReporte = `*Informe de Deudores y Cartera*\n`
    mensajeReporte += `*Alto de Santa Elena - Condominio*\n`
    mensajeReporte += `Fecha: ${hoyColombia.toLocaleDateString("es-CO")}\n`
    mensajeReporte += `-----------------------------\n\n`

    let totalCopropiedad = 0
    let deudoresEncontrados = 0

    const formatoPesos = (val: number) => {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      }).format(val)
    }

    (unidades || []).forEach((u) => {
      const deudasMens = mapaMensualidades[u.unidad] || []
      const deudasProy = mapaProyectos[u.unidad] || []
      const deudaAnterior = mapaCartera[u.unidad] || 0

      // Si no debe nada, no se incluye en el reporte
      if (deudasMens.length === 0 && deudasProy.length === 0 && deudaAnterior === 0) {
        return
      }

      deudoresEncontrados++
      let totalUnidad = 0

      mensajeReporte += `*Apartamento ${u.unidad}* (${u.propietario || "Sin Nombre"})\n`

      if (deudasMens.length > 0) {
        const meses = deudasMens.map((m) => `${m.mes} ${m.anio}`).join(", ")
        const subtotalMens = deudasMens.reduce((acc, m) => acc + (Number(m.valor) || 0), 0)
        totalUnidad += subtotalMens
        mensajeReporte += `  • Cuotas: ${meses} (${formatoPesos(subtotalMens)})\n`
      }

      if (deudasProy.length > 0) {
        const proyectosText = deudasProy.map((p) => p.proyecto).join(", ")
        const subtotalProy = deudasProy.reduce((acc, p) => acc + (Number(p.valor) || 0), 0)
        totalUnidad += subtotalProy
        mensajeReporte += `  • Proyectos: ${proyectosText} (${formatoPesos(subtotalProy)})\n`
      }

      if (deudaAnterior > 0) {
        totalUnidad += deudaAnterior
        mensajeReporte += `  • Adm. Anterior: ${formatoPesos(deudaAnterior)}\n`
      }

      totalCopropiedad += totalUnidad
      mensajeReporte += `  *Total Deuda:* ${formatoPesos(totalUnidad)}\n`
      mensajeReporte += `-----------------------------\n`
    })

    mensajeReporte += `\n*Total Deudores:* ${deudoresEncontrados}\n`
    mensajeReporte += `*Cartera Total Copropiedad:* ${formatoPesos(totalCopropiedad)}\n\n`
    mensajeReporte += `_Reporte generado de forma automática por el sistema de cartera._`

    if (deudoresEncontrados === 0) {
      mensajeReporte = `*Informe de Deudores*\n*Alto de Santa Elena*\n\nExcelente noticia: A la fecha no existen deudores pendientes en el sistema.`
    }

    // 7. Enviar por API de WhatsApp
    let destinationPhone = String(telefonoDestino).replace(/[^0-9]/g, "")
    if (destinationPhone.length === 10 && !destinationPhone.startsWith("57")) {
      destinationPhone = "57" + destinationPhone
    }

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: destinationPhone,
          type: "text",
          text: {
            body: mensajeReporte
          }
        })
      }
    )

    const responseData = await response.json()

    if (response.ok && !isManual) {
      const fechaHoyString = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}-${hoyColombia.getDate()}`
      await supabase
        .from("configuracion_automatico")
        .update({ fecha_ultimo_reporte: fechaHoyString })
        .eq("id", config.id)
    }

    return NextResponse.json({
      success: response.ok,
      destinatario: telefonoDestino,
      deudores: deudoresEncontrados,
      total_cartera: totalCopropiedad,
      whatsapp_response: responseData
    })

  } catch (error: any) {
    console.error("Error en reporte cron:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Error interno del servidor"
    }, { status: 500 })
  }
}
