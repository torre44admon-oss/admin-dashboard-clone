import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function parseDestinations(telefonoDestino: string, filterReports: boolean): string[] {
  let destinations: string[] = []
  try {
    if (telefonoDestino.startsWith("[")) {
      const parsed = JSON.parse(telefonoDestino) as { phone: string; reports: boolean; commands: boolean }[]
      parsed.forEach(item => {
        let clean = String(item.phone || "").replace(/[^0-9]/g, "")
        if (clean.length === 10 && !clean.startsWith("57")) {
          clean = "57" + clean
        }
        if (clean) {
          if (!filterReports || item.reports) {
            destinations.push(clean)
          }
        }
      })
    } else {
      const oldPhones = telefonoDestino.split(/[,;]+/)
      oldPhones.forEach((p: string) => {
        let clean = p.replace(/[^0-9]/g, "")
        if (clean.length === 10 && !clean.startsWith("57")) {
          clean = "57" + clean
        }
        if (clean) {
          destinations.push(clean)
        }
      })
    }
  } catch (e) {
    console.error("Error al parsear teléfonos de destino:", e)
  }
  return destinations
}

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

      // Validar día y que la hora actual esté dentro de la ventana del reporte (o posterior)
      if (diaHoy !== diaReporte || currentMinutesTotal < schedMinutesTotal) {
        const formattedSchedTime = `${(schedHour !== undefined ? schedHour : 8) < 10 ? '0' + (schedHour !== undefined ? schedHour : 8) : (schedHour !== undefined ? schedHour : 8)}:${(schedMin !== undefined ? schedMin : 0) < 10 ? '0' + (schedMin !== undefined ? schedMin : 0) : (schedMin !== undefined ? schedMin : 0)}`
        const formattedCurrentTime = `${horaHoy < 10 ? '0' + horaHoy : horaHoy}:${minutoHoy < 10 ? '0' + minutoHoy : minutoHoy}`

        return NextResponse.json({
          success: true,
          message: `Hora Colombia: ${formattedCurrentTime} del día ${diaHoy}. El informe automático está configurado para el día ${diaReporte} a las ${formattedSchedTime}. No se envió reporte.`
        })
      }
    }

    if (!telefonoDestino) {
      return NextResponse.json({
        success: false,
        error: "No se ha configurado un teléfono de destino para el informe en el panel de configuración."
      }, { status: 400 })
    }

    // 2. Obtener nombre de la torre desde configuracion
    const { data: torreData } = await supabase
      .from("configuracion_torre")
      .select("nombre_torre")
      .order("id", { ascending: false })
      .limit(1)
    const nombreTorre = torreData?.[0]?.nombre_torre || "Condominio"

    // 3. Obtener Unidades
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
    
    // 5. Obtener Multas Pendientes
    const { data: multas } = await supabase
      .from("portafolio_multas")
      .select("*")
      .in("estado", ["Pendiente", "Vencida"])

    // 6. Obtener Cartera (Periodo Anterior)
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

    const mapaMultas: Record<string, any[]> = {}
    if (multas) {
      multas.forEach((m) => {
        if (!mapaMultas[m.unidad]) mapaMultas[m.unidad] = []
        mapaMultas[m.unidad].push(m)
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

    // 7. Construir el reporte anónimo y formal para la comunidad
    let lineasApartamentos: string[] = []
    let totalCopropiedad = 0
    let deudoresEncontrados = 0

    const formatoPesos = (val: number) => {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(val)
    }

    (unidades || []).forEach((u) => {
      const deudasMens = mapaMensualidades[u.unidad] || []
      const deudasMult = mapaMultas[u.unidad] || []
      const deudasProy = mapaProyectos[u.unidad] || []
      const deudaAnterior = mapaCartera[u.unidad] || 0

      // Si no debe nada, no se incluye en el reporte
      if (deudasMens.length === 0 && deudasMult.length === 0 && deudasProy.length === 0 && deudaAnterior === 0) {
        return
      }

      deudoresEncontrados++
      let totalUnidad = 0
      let conceptos: string[] = []

      if (deudasMens.length > 0) {
        const meses = deudasMens.map((m) => `${String(m.mes).toLowerCase()} de ${m.anio}`).join(", ")
        const subtotalMens = deudasMens.reduce((acc, m) => acc + (Number(m.valor) || 0), 0)
        totalUnidad += subtotalMens
        conceptos.push(`Cuota${deudasMens.length > 1 ? "s" : ""} de ${meses}`)
      }

      if (deudasMult.length > 0) {
        const multasText = deudasMult.map((m) => m.tipo_multa || "multa").join(", ")
        const subtotalMult = deudasMult.reduce((acc, m) => acc + (Number(m.valor) || 0), 0)
        totalUnidad += subtotalMult
        conceptos.push(`multa de ${multasText}`)
      }

      if (deudasProy.length > 0) {
        const proyectosText = deudasProy.map((p) => p.proyecto || "proyecto").join(", ")
        const subtotalProy = deudasProy.reduce((acc, p) => acc + (Number(p.valor) || 0), 0)
        totalUnidad += subtotalProy
        conceptos.push(`proyecto de ${proyectosText.toLowerCase()}`)
      }

      if (deudaAnterior > 0) {
        totalUnidad += deudaAnterior
        conceptos.push("administración anterior")
      }

      totalCopropiedad += totalUnidad
      const nombreProp = u.propietario ? ` | Propietario: ${u.propietario}` : ""
      lineasApartamentos.push(`• *Apto. ${u.unidad}*${nombreProp} | Deuda Total: ${formatoPesos(totalUnidad)}`)
    })

    const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
    const mesNombreActual = mesesNombres[hoyColombia.getMonth()]
    const diaStr = String(hoyColombia.getDate()).padStart(2, "0")
    const mesStr = String(hoyColombia.getMonth() + 1).padStart(2, "0")
    const fechaFormateada = `${diaStr}/${mesStr}/${hoyColombia.getFullYear()}`

    let mensajeReporte = `*INFORME GENERAL DE CARTERA Y MOROSIDAD*\n`
    mensajeReporte += `*CONJUNTO RESIDENCIAL ALTOS DE SANTA ELENA – TORRE 44*\n`
    mensajeReporte += `Fecha de corte: ${fechaFormateada} (Mes de ${mesNombreActual})\n\n`
    mensajeReporte += `La Administración informa el estado de deudas pendientes acumuladas *hasta el mes actual (${mesNombreActual} de ${hoyColombia.getFullYear()})* (no incluye el mes siguiente):\n\n`
    mensajeReporte += `*Relación de Apartamentos y Deudores:*\n\n`
    mensajeReporte += lineasApartamentos.join("\n") + "\n\n"
    mensajeReporte += `*Apartamentos en mora:* ${deudoresEncontrados}\n`
    mensajeReporte += `*Cartera total adeudada hasta ${mesNombreActual}:* ${formatoPesos(totalCopropiedad)}\n\n`
    mensajeReporte += `Se solicita a los propietarios en mora ponerse al día a la brevedad posible con la administración.\n\n`
    mensajeReporte += `_Reporte generado de forma automática por el sistema de cartera._`

    if (deudoresEncontrados === 0) {
      mensajeReporte = `*Informe de Deudores*\n*${nombreTorre}*\n\nExcelente noticia: A la fecha no existen deudores pendientes en el sistema.`
    }

    // 7. Enviar por API de WhatsApp a los destinatarios autorizados
    // (Si es automático mensual, filtramos solo los números que tienen activo el check de reportes. Si es manual, se envían todos los destinatarios solicitados)
    const destinationPhones = parseDestinations(telefonoDestino, !isManual)
    const phonesToSend = destinationPhones

    const results = []
    for (const phone of phonesToSend) {
      try {
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
              to: phone,
              type: "text",
              text: {
                body: mensajeReporte
              }
            })
          }
        )
        const responseData = await response.json()
        results.push({ phone, ok: response.ok, data: responseData })
      } catch (err: any) {
        results.push({ phone, ok: false, error: err.message })
      }
    }

    const anySuccess = results.some(r => r.ok)

    let botResult = null
    // 8. También enviar al grupo de WhatsApp si está configurado el bot y NO es prueba manual (!isManual)
    if (!isManual) {
      try {
        const { data: botConfig } = await supabase
          .from("configuracion_bot")
          .select("grupo_whatsapp_id, grupo_reportes_id, railway_bot_url, bot_api_key")
          .order("id", { ascending: false })
          .limit(1)

        const bot = botConfig?.[0]
        const targetGroup = bot?.grupo_reportes_id || bot?.grupo_whatsapp_id

        if (targetGroup && bot?.railway_bot_url && bot?.bot_api_key) {
          const cleanUrl = bot.railway_bot_url.replace(/\/$/, "")
          const botRes = await fetch(`${cleanUrl}/send-group`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": bot.bot_api_key
            },
            body: JSON.stringify({
              groupId: targetGroup,
              message: mensajeReporte
            })
          })
          const botData = await botRes.json()
          botResult = { ok: botRes.ok, data: botData }
        } else {
          botResult = { ok: false, error: "Bot no configurado completamente en la BD" }
        }
      } catch (botErr: any) {
        botResult = { ok: false, error: botErr.message }
      }
    }

    if ((anySuccess || botResult?.ok) && !isManual) {
      const fechaHoyString = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}-${hoyColombia.getDate()}`
      await supabase
        .from("configuracion_automatico")
        .update({ fecha_ultimo_reporte: fechaHoyString })
        .eq("id", config.id)
    }

    return NextResponse.json({
      success: anySuccess || botResult?.ok || false,
      destinatarios: destinationPhones,
      deudores: deudoresEncontrados,
      total_cartera: totalCopropiedad,
      bot_grupo_result: botResult,
      results
    })

  } catch (error: any) {
    console.error("Error en reporte cron:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Error interno del servidor"
    }, { status: 500 })
  }
}
