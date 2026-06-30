import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isManual = searchParams.get("manual") === "true"
    const singleUnidad = searchParams.get("unidad") // To test/send to a single unit

    // 1. Obtener última configuración de mora de la base de datos
    const { data: configData, error: configError } = await supabase
      .from("configuracion_tasas_mora")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)

    if (configError) throw configError

    const config = configData?.[0] || {
      envio_automatico_avisos: false,
      dia_envio_avisos: 1,
      hora_envio_avisos: "08:00",
      dia_limite_pago: 5,
      dias_gracia_multas: 15,
      dias_gracia_proyectos: 60
    }

    const isAutoEnabled = config.envio_automatico_avisos || false
    const diaEnvio = config.dia_envio_avisos || 1
    const horaEnvioConfig = config.hora_envio_avisos || "08:00"

    // Validar si hoy es el día y la hora de envío (ajustado a la hora de Colombia)
    const hoyColombia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
    const diaHoy = hoyColombia.getDate()
    const horaHoy = hoyColombia.getHours()
    const minutoHoy = hoyColombia.getMinutes()

    const [schedHour, schedMin] = String(horaEnvioConfig).split(":").map(Number)
    const schedMinutesTotal = (schedHour !== undefined ? schedHour : 8) * 60 + (schedMin !== undefined ? schedMin : 0)
    const currentMinutesTotal = horaHoy * 60 + minutoHoy

    const mesAnioHoy = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}`
    const yaEnviadoEsteMes = config.fecha_ultimo_aviso && config.fecha_ultimo_aviso.startsWith(mesAnioHoy)

    // Si no es ejecución manual, validar que la automatización esté activa y coincida fecha/hora
    if (!isManual && !singleUnidad) {
      if (!isAutoEnabled) {
        return NextResponse.json({
          success: true,
          message: "El envío automático de avisos está desactivado."
        })
      }
      if (yaEnviadoEsteMes) {
        return NextResponse.json({
          success: true,
          message: `Los avisos de cobro ya fueron enviados automáticamente para este periodo (${mesAnioHoy}).`
        })
      }
      if (diaHoy !== diaEnvio || currentMinutesTotal < schedMinutesTotal) {
        const formattedSchedTime = `${(schedHour !== undefined ? schedHour : 8) < 10 ? '0' + (schedHour !== undefined ? schedHour : 8) : (schedHour !== undefined ? schedHour : 8)}:${(schedMin !== undefined ? schedMin : 0) < 10 ? '0' + (schedMin !== undefined ? schedMin : 0) : (schedMin !== undefined ? schedMin : 0)}`
        const formattedCurrentTime = `${horaHoy < 10 ? '0' + horaHoy : horaHoy}:${minutoHoy < 10 ? '0' + minutoHoy : minutoHoy}`

        return NextResponse.json({
          success: true,
          message: `Hora Colombia: ${formattedCurrentTime} del día ${diaHoy}. El envío automático está programado para el día ${diaEnvio} a las ${formattedSchedTime}. No se enviaron avisos.`
        })
      }
    }

    // 2. Obtener Unidades
    let queryUnidades = supabase.from("unidades").select("*")
    if (singleUnidad) {
      queryUnidades = queryUnidades.eq("unidad", singleUnidad)
    }
    const { data: unidades, error: errorUnidades } = await queryUnidades
    if (errorUnidades) throw errorUnidades
    if (!unidades || unidades.length === 0) {
      return NextResponse.json({ success: true, message: "No hay unidades para procesar." })
    }

    // 3. Obtener configuración general para el aviso (nombre de la torre, logo, etc.) desde Supabase
    const nombreTorre = config.nombre_torre || "Torre 44"
    const logoUrl = config.logo_url || ""
    const direccion = config.direccion_torre || ""
    const montoFijoBase = parseFloat(config.monto_fijo || "20000")
    
    // Obtener todas las tasas históricas para liquidar mora
    const { data: tasasHistoricas } = await supabase.from("configuracion_tasas_mora").select("*")
    const mapaTasas: Record<string, { ibc: number, mult: number }> = {}
    if (tasasHistoricas) {
      tasasHistoricas.forEach((t: any) => {
        mapaTasas[`${String(t.mes_vigencia).toLowerCase()}_${t.ano_vigencia}`] = {
          ibc: parseFloat(t.ibc_banco_anual),
          mult: parseFloat(t.multiplicador_ley)
        }
      })
    }

    // Mes y año actual del ciclo de cobro (el próximo mes si se envía a fin de mes)
    const mesesNombres = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    const fechaCiclo = hoyColombia.getDate() > 20
      ? new Date(hoyColombia.getFullYear(), hoyColombia.getMonth() + 1, 1)
      : hoyColombia
    const mesVigente = mesesNombres[fechaCiclo.getMonth()]
    const anoVigente = fechaCiclo.getFullYear()
    const periodoTexto = `${mesVigente} de ${anoVigente}`

    // 4. Procesar y enviar cada unidad
    const resultados: any[] = []
    const origin = new URL(request.url).origin

    for (const u of unidades) {
      try {
        let telefonoClean = String(u.telefono || "").replace(/[^0-9]/g, "")
        if (telefonoClean.length === 10 && !telefonoClean.startsWith("57")) {
          telefonoClean = "57" + telefonoClean
        }
        if (!telefonoClean) {
          resultados.push({ unidad: u.unidad, success: false, error: "No tiene número de teléfono" })
          continue
        }

        // Consultar mensualidades pendientes
        const { data: mensualidades } = await supabase
          .from("mensualidades")
          .select("*")
          .eq("unidad", u.unidad)
          .eq("estado", "Pendiente")

        // Consultar multas pendientes
        const { data: multas } = await supabase
          .from("multas_asignadas")
          .select("*")
          .eq("unidad", u.unidad)
          .eq("estado", "Pendiente")

        // Consultar proyectos pendientes
        const { data: proyectos } = await supabase
          .from("proyectos_asignados")
          .select("*")
          .eq("unidad", u.unidad)
          .eq("estado", "Pendiente")

        // Deuda de cartera anterior
        const { data: cartera } = await supabase
          .from("cartera")
          .select("deuda")
          .eq("unidad", u.unidad)
          .single()
        const deudaCartera = Number(cartera?.deuda) || 0

        // Calcular mora e interés
        let interesMoraAcumulado = 0
        const startOfToday = new Date(hoyColombia)
        startOfToday.setHours(0, 0, 0, 0)

        // 1. Mensualidades (ordinarias)
        const mensualidadVigente = mensualidades?.find(
          (m: any) => String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
        )
        const montoCuota = mensualidadVigente ? parseFloat(mensualidadVigente.valor) : (montoFijoBase || 120000)

        if (mensualidades) {
          mensualidades.forEach((m: any) => {
            const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
            if (esMesActual) return

            const fechaLimite = new Date(m.fecha_limite)
            fechaLimite.setHours(0, 0, 0, 0)
            const diffTime = startOfToday.getTime() - fechaLimite.getTime()
            const diasRetraso = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0

            if (diasRetraso > 0) {
              const claveMes = `${String(m.mes).toLowerCase()}_${m.anio}`
              const tasaInfo = mapaTasas[claveMes]
              let tasaDiaria = 0
              if (tasaInfo) {
                let ibcVal = parseFloat(String(tasaInfo.ibc))
                if (ibcVal < 1) ibcVal = ibcVal * 100
                const usuraAnual = ibcVal * parseFloat(String(tasaInfo.mult || 1.5))
                tasaDiaria = Math.pow(1 + usuraAnual / 100, 1 / 365) - 1
              } else {
                tasaDiaria = (2.4 / 100) / 30
              }
              interesMoraAcumulado += Math.round((Number(m.valor) || 0) * tasaDiaria * diasRetraso)
            }
          })
        }

        // 2. Multas
        const graciaMultas = config.dias_gracia_multas || 15
        if (multas) {
          multas.forEach((m: any) => {
            const fechaAsig = new Date(m.fecha_asignacion || m.created_at)
            fechaAsig.setHours(0, 0, 0, 0)
            const diffTime = startOfToday.getTime() - fechaAsig.getTime()
            const diasRetraso = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0

            if (diasRetraso > graciaMultas) {
              const mesNombre = mesesNombres[fechaAsig.getMonth()]
              const claveMes = `${String(mesNombre).toLowerCase()}_${fechaAsig.getFullYear()}`
              const tasaInfo = mapaTasas[claveMes]
              let tasaDiaria = 0
              if (tasaInfo) {
                let ibcVal = parseFloat(String(tasaInfo.ibc))
                if (ibcVal < 1) ibcVal = ibcVal * 100
                const usuraAnual = ibcVal * parseFloat(String(tasaInfo.mult || 1.5))
                tasaDiaria = Math.pow(1 + usuraAnual / 100, 1 / 365) - 1
              } else {
                tasaDiaria = (2.4 / 100) / 30
              }
              interesMoraAcumulado += Math.round((Number(m.valor) || 0) * tasaDiaria * (diasRetraso - graciaMultas))
            }
          })
        }

        // 3. Proyectos
        const graciaProyectos = config.dias_gracia_proyectos || 60
        if (proyectos) {
          proyectos.forEach((p: any) => {
            const fechaAsig = new Date(p.fecha || p.created_at)
            fechaAsig.setHours(0, 0, 0, 0)
            const diffTime = startOfToday.getTime() - fechaAsig.getTime()
            const diasRetraso = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0

            if (diasRetraso > graciaProyectos) {
              const mesNombre = mesesNombres[fechaAsig.getMonth()]
              const claveMes = `${String(mesNombre).toLowerCase()}_${fechaAsig.getFullYear()}`
              const tasaInfo = mapaTasas[claveMes]
              let tasaDiaria = 0
              if (tasaInfo) {
                let ibcVal = parseFloat(String(tasaInfo.ibc))
                if (ibcVal < 1) ibcVal = ibcVal * 100
                const usuraAnual = ibcVal * parseFloat(String(tasaInfo.mult || 1.5))
                tasaDiaria = Math.pow(1 + usuraAnual / 100, 1 / 365) - 1
              } else {
                tasaDiaria = (2.4 / 100) / 30
              }
              interesMoraAcumulado += Math.round((Number(p.valor) || 0) * tasaDiaria * (diasRetraso - graciaProyectos))
            }
          })
        }

        // Ensamblar Cargos Adicionales
        const cargos: any[] = []
        
        // Agregar mensualidades atrasadas como cargo adicional
        if (mensualidades) {
          mensualidades.forEach((m: any) => {
            const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
            if (!esMesActual) {
              cargos.push({ concepto: `Membresía ${m.mes} ${m.anio}`, monto: Number(m.valor) })
            }
          })
        }

        // Agregar multas pendientes
        if (multas) {
          multas.forEach((m: any) => {
            cargos.push({ concepto: `Multa: ${m.tipo_multa || "General"}`, monto: Number(m.valor) })
          })
        }

        // Agregar proyectos pendientes
        if (proyectos) {
          proyectos.forEach((p: any) => {
            cargos.push({ concepto: `Proyecto: ${p.proyecto || "General"}`, monto: Number(p.valor) })
          })
        }

        // Agregar intereses acumulados si existen
        if (interesMoraAcumulado > 0) {
          cargos.push({ concepto: "Intereses de Mora (Ley 675)", monto: interesMoraAcumulado })
        }

        // Agregar deuda de cartera si existe
        if (deudaCartera > 0) {
          cargos.push({ concepto: "Cartera Anterior Pendiente", monto: deudaCartera })
        }

        // Configuración de texto pie desde Supabase
        const mensajeAviso = config.mensaje_aviso || "El pago de la administración debe realizarse a mas tardar el día 5 de cada mes. Los pagos realizados después del día 10 de cada mes generaran mora. cuenta de pago: NEQUIS 3152127700 a nombre de JHANETH SOLARTE por favor indicar el numero de apartamento."

        // Generar la URL dinámica de la imagen para este apartamento
        const queryParams = new URLSearchParams({
          nombreTorre,
          logoUrl,
          periodo: periodoTexto,
          unidad: u.unidad,
          propietario: u.propietario,
          montoCuota: String(montoCuota),
          cargos: JSON.stringify(cargos),
          mensajePie: mensajeAviso,
          direccion
        })

        let dynamicImageUrl = `${origin}/api/aviso-image?${queryParams.toString()}&t=${Date.now()}`

        // Si se ejecuta en localhost, usar una imagen de marcador de posición pública directa (.png) para que Meta pueda descargarla y el mensaje se entregue
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          dynamicImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/640px-WhatsApp.svg.png"
        }

        // Llamar a la API de WhatsApp para enviarlo
        const msgText = `Hola ${u.propietario}, le envío su aviso de cobro para ${periodoTexto}.`
        
        const resWhatsapp = await fetch(`${origin}/api/whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefono: telefonoClean,
            mensaje: msgText,
            imageUrl: dynamicImageUrl
          })
        })

        const dataWhatsapp = await resWhatsapp.json()

        if (resWhatsapp.ok && dataWhatsapp.success) {
          resultados.push({ unidad: u.unidad, success: true, ref: dataWhatsapp.ref })
        } else {
          resultados.push({ unidad: u.unidad, success: false, error: dataWhatsapp.error || "Error al enviar WhatsApp" })
        }

      } catch (err: any) {
        resultados.push({ unidad: u.unidad, success: false, error: err.message || "Error inesperado" })
      }
    }

    // Si se enviaron avisos con éxito y no es manual, registramos la fecha del último envío masivo de avisos
    if (!isManual && !singleUnidad && resultados.some(r => r.success)) {
      const fechaHoyString = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}-${hoyColombia.getDate()}`
      await supabase
        .from("configuracion_tasas_mora")
        .update({ fecha_ultimo_aviso: fechaHoyString })
        .eq("id", config.id)
    }

    return NextResponse.json({
      success: true,
      periodo: periodoTexto,
      total_procesado: unidades.length,
      resultados
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
