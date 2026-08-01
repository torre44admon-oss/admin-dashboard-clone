import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isManual = searchParams.get("manual") === "true"
    const singleUnidad = searchParams.get("unidad")
    const forceTelefono = searchParams.get("telefono")

    // 1. Obtener configuración automática (horarios, activación)
    const { data: autoData, error: autoError } = await supabase
      .from("configuracion_automatico")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
    if (autoError) throw autoError

    const autoConfig = autoData?.[0] || {
      envio_automatico_avisos: false,
      dia_envio_avisos: 1,
      hora_envio_avisos: "08:00",
      fecha_ultimo_aviso: ""
    }

    const isAutoEnabled = autoConfig.envio_automatico_avisos || false
    const diaEnvio = autoConfig.dia_envio_avisos || 1
    const horaEnvioConfig = autoConfig.hora_envio_avisos || "08:00"

    // Hora Colombia
    const hoyColombia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
    const diaHoy = hoyColombia.getDate()
    const horaHoy = hoyColombia.getHours()
    const minutoHoy = hoyColombia.getMinutes()

    const [schedHour, schedMin] = String(horaEnvioConfig).split(":").map(Number)
    const schedMinutesTotal = (schedHour !== undefined ? schedHour : 8) * 60 + (schedMin !== undefined ? schedMin : 0)
    const currentMinutesTotal = horaHoy * 60 + minutoHoy

    const mesAnioHoy = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}`
    const yaEnviadoEsteMes = autoConfig.fecha_ultimo_aviso && autoConfig.fecha_ultimo_aviso.startsWith(mesAnioHoy)

    if (!isManual && !singleUnidad) {
      if (!isAutoEnabled) {
        return NextResponse.json({ success: true, message: "El envío automático de avisos está desactivado." })
      }
      if (yaEnviadoEsteMes) {
        return NextResponse.json({ success: true, message: `Los avisos ya fueron enviados para este periodo (${mesAnioHoy}).` })
      }
      if (diaHoy !== diaEnvio || currentMinutesTotal < schedMinutesTotal) {
        const fmtSched = `${(schedHour||8)<10?'0'+(schedHour||8):(schedHour||8)}:${(schedMin||0)<10?'0'+(schedMin||0):(schedMin||0)}`
        const fmtNow = `${horaHoy<10?'0'+horaHoy:horaHoy}:${minutoHoy<10?'0'+minutoHoy:minutoHoy}`
        return NextResponse.json({ success: true, message: `Hora Colombia: ${fmtNow} del día ${diaHoy}. Programado para el día ${diaEnvio} a las ${fmtSched}. No se enviaron avisos.` })
      }
    }

    // 2. Obtener configuración de la torre
    const { data: torreData } = await supabase
      .from("configuracion_torre")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
    const torreConfig = torreData?.[0] || {}
    const nombreTorre = torreConfig.nombre_torre || "Torre 44"
    const direccion = torreConfig.direccion_torre || ""
    const montoFijoBase = parseFloat(torreConfig.monto_fijo || "20000")

    // Preparar logoUrl para aviso-image:
    // - Si es base64 (data:...) → subir a Storage (URL corta para Meta)
    // - Si es URL http (ya en Storage) → descargar aquí en Node.js y convertir a base64
    //   para pasarlo a aviso-image directamente. La función Edge de aviso-image no puede
    //   hacer fetch a URLs externas de forma confiable, pero cron-aviso sí (Node.js).
    let logoUrl = torreConfig.logo_url || ""
    if (logoUrl && logoUrl.startsWith("data:")) {
      try {
        const base64Data = logoUrl.split(",")[1]
        const logoBuffer = Buffer.from(base64Data, "base64")
        const mimeMatch = logoUrl.match(/data:([^;]+);base64/)
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png"
        const ext = mimeType.includes("webp") ? "webp" : mimeType.includes("jpeg") ? "jpg" : "png"
        const logoBlob = new Blob([logoBuffer], { type: mimeType })
        const { error: logoErr } = await supabase.storage
          .from("avisos")
          .upload(`logo-torre.${ext}`, logoBlob, { contentType: mimeType, upsert: true })
        if (!logoErr) {
          const { data: logoStorageData } = supabase.storage.from("avisos").getPublicUrl(`logo-torre.${ext}`)
          logoUrl = logoStorageData.publicUrl
        } else {
          logoUrl = "" // sin logo antes que URL gigante
        }
      } catch (logoUploadErr) {
        logoUrl = "" // sin logo antes que URL gigante
      }
    }



    // 3. Obtener mensaje del aviso
    const { data: avisoData } = await supabase
      .from("configuracion_aviso")
      .select("mensaje_aviso")
      .order("id", { ascending: false })
      .limit(1)
    const mensajeAviso = avisoData?.[0]?.mensaje_aviso || "Por favor realizar el pago a tiempo."

    // 4. Obtener tasas de mora
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

    // 5. Días de gracia desde tasas_mora
    const { data: configMoraData } = await supabase
      .from("configuracion_tasas_mora")
      .select("dia_limite_pago, dias_gracia_multas, dias_gracia_proyectos")
      .order("id", { ascending: false })
      .limit(1)
    const configMora = configMoraData?.[0] || { dia_limite_pago: 5, dias_gracia_multas: 15, dias_gracia_proyectos: 60 }

    // 6. Obtener Unidades
    let queryUnidades = supabase.from("unidades").select("*")
    if (singleUnidad) queryUnidades = queryUnidades.eq("unidad", singleUnidad)
    const { data: unidades, error: errorUnidades } = await queryUnidades
    if (errorUnidades) throw errorUnidades
    if (!unidades || unidades.length === 0) {
      return NextResponse.json({ success: true, message: "No hay unidades para procesar." })
    }

    // Mes y año del ciclo de cobro
    const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
    const fechaCiclo = new Date(hoyColombia.getFullYear(), hoyColombia.getMonth() + 1, 1)
    const mesVigente = mesesNombres[fechaCiclo.getMonth()]
    const anoVigente = fechaCiclo.getFullYear()
    const periodoTexto = `${mesVigente} de ${anoVigente}`

    const resultados: any[] = []
    const origin = new URL(request.url).origin

    // Obtener configuración del bot de Baileys
    const { data: botConfigData } = await supabase.from("configuracion_bot").select("railway_bot_url, bot_api_key").limit(1)
    const bot = botConfigData?.[0] || { railway_bot_url: "", bot_api_key: "" }

    for (const u of unidades) {
      try {
        let telefonoClean = forceTelefono 
          ? String(forceTelefono).replace(/[^0-9]/g, "")
          : String(u.telefono || "").replace(/[^0-9]/g, "")
        if (telefonoClean.length === 10 && !telefonoClean.startsWith("57")) telefonoClean = "57" + telefonoClean
        if (!telefonoClean) {
          resultados.push({ unidad: u.unidad, success: false, error: "No tiene número de teléfono" })
          continue
        }

        let { data: mensualidades } = await supabase.from("mensualidades").select("*").eq("unidad", u.unidad).eq("estado", "Pendiente")
        const { data: multas } = await supabase.from("multas_asignadas").select("*").eq("unidad", u.unidad).in("estado", ["Pendiente", "Vencida"])
        const { data: proyectos } = await supabase.from("proyectos_asignados").select("*").eq("unidad", u.unidad).eq("estado", "Pendiente")
        const { data: cartera } = await supabase.from("cartera").select("deuda").eq("unidad", u.unidad).single()
        const deudaCartera = Number(cartera?.deuda) || 0

        let interesMoraAcumulado = 0
        const startOfToday = new Date(hoyColombia)
        startOfToday.setHours(0, 0, 0, 0)

        // Verificar si ya existe mensualidad para este mes/año/unidad en la BD (sea Pagada o Pendiente)
        const { data: mensExistente } = await supabase
          .from("mensualidades")
          .select("*")
          .eq("unidad", u.unidad)
          .eq("mes", mesVigente)
          .eq("anio", anoVigente)
          .maybeSingle()

        let mensualidadVigente = mensExistente
        if (!mensExistente) {
          const diaLimite = configMora.dia_limite_pago || 5
          const fechaLimiteObj = new Date(anoVigente, fechaCiclo.getMonth(), diaLimite)
          const fechaLimiteString = `${fechaLimiteObj.getFullYear()}-${String(fechaLimiteObj.getMonth() + 1).padStart(2, '0')}-${String(fechaLimiteObj.getDate()).padStart(2, '0')}`

          const { data: newMens, error: errNew } = await supabase
            .from("mensualidades")
            .insert([{
              unidad: u.unidad,
              mes: mesVigente,
              anio: anoVigente,
              valor: montoFijoBase || 120000,
              estado: "Pendiente",
              fecha_limite: fechaLimiteString
            }])
            .select()
            .single()

          if (!errNew && newMens) {
            mensualidadVigente = newMens
            if (mensualidades) {
              mensualidades.push(newMens)
            } else {
              mensualidades = [newMens]
            }
          }
        }

        const montoCuota = mensualidadVigente ? parseFloat(mensualidadVigente.valor) : (montoFijoBase || 120000)

        if (mensualidades) {
          mensualidades.forEach((m: any) => {
            const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
            if (esMesActual) return
            const fechaLimite = new Date(m.fecha_limite)
            fechaLimite.setHours(0,0,0,0)
            const diasRetraso = Math.max(0, Math.floor((startOfToday.getTime() - fechaLimite.getTime()) / 86400000))
            if (diasRetraso > 0) {
              const claveMes = `${String(m.mes).toLowerCase()}_${m.anio}`
              const tasaInfo = mapaTasas[claveMes]
              let tasaDiaria = tasaInfo ? Math.pow(1 + (parseFloat(String(tasaInfo.ibc)) < 1 ? parseFloat(String(tasaInfo.ibc))*100 : parseFloat(String(tasaInfo.ibc))) * parseFloat(String(tasaInfo.mult||1.5)) / 100, 1/365) - 1 : (2.4/100)/30
              interesMoraAcumulado += Math.round((Number(m.valor)||0) * tasaDiaria * diasRetraso)
            }
          })
        }

        const graciaMultas = configMora.dias_gracia_multas || 15
        if (multas) {
          multas.forEach((m: any) => {
            const fechaAsig = new Date(m.fecha_asignacion || m.created_at)
            fechaAsig.setHours(0,0,0,0)
            const diasRetraso = Math.max(0, Math.floor((startOfToday.getTime() - fechaAsig.getTime()) / 86400000))
            if (diasRetraso > graciaMultas) {
              const claveMes = `${mesesNombres[fechaAsig.getMonth()].toLowerCase()}_${fechaAsig.getFullYear()}`
              const tasaInfo = mapaTasas[claveMes]
              let tasaDiaria = tasaInfo ? Math.pow(1 + (parseFloat(String(tasaInfo.ibc)) < 1 ? parseFloat(String(tasaInfo.ibc))*100 : parseFloat(String(tasaInfo.ibc))) * parseFloat(String(tasaInfo.mult||1.5)) / 100, 1/365) - 1 : (2.4/100)/30
              interesMoraAcumulado += Math.round((Number(m.valor)||0) * tasaDiaria * (diasRetraso - graciaMultas))
            }
          })
        }

        const graciaProyectos = configMora.dias_gracia_proyectos || 60
        if (proyectos) {
          proyectos.forEach((p: any) => {
            const fechaAsig = new Date(p.fecha || p.created_at)
            fechaAsig.setHours(0,0,0,0)
            const diasRetraso = Math.max(0, Math.floor((startOfToday.getTime() - fechaAsig.getTime()) / 86400000))
            if (diasRetraso > graciaProyectos) {
              const claveMes = `${mesesNombres[fechaAsig.getMonth()].toLowerCase()}_${fechaAsig.getFullYear()}`
              const tasaInfo = mapaTasas[claveMes]
              let tasaDiaria = tasaInfo ? Math.pow(1 + (parseFloat(String(tasaInfo.ibc)) < 1 ? parseFloat(String(tasaInfo.ibc))*100 : parseFloat(String(tasaInfo.ibc))) * parseFloat(String(tasaInfo.mult||1.5)) / 100, 1/365) - 1 : (2.4/100)/30
              interesMoraAcumulado += Math.round((Number(p.valor)||0) * tasaDiaria * (diasRetraso - graciaProyectos))
            }
          })
        }

        const cargos: any[] = []

        // 1. Grupos de Cuotas Vencidas (Meses Vencidos)
        if (mensualidades) {
          const mesesPasados: string[] = []
          let sumaMesesPasados = 0

          mensualidades.forEach((m: any) => {
            const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
            const indiceMesMensualidad = mesesNombres.findIndex(mn => mn.toLowerCase() === String(m.mes).toLowerCase())
            const fechaMensualidad = new Date(Number(m.anio), indiceMesMensualidad)
            const fechaVigente = new Date(anoVigente, mesesNombres.findIndex(mn => mn.toLowerCase() === mesVigente.toLowerCase()))
            const esMesPasado = fechaMensualidad < fechaVigente

            if (!esMesActual && esMesPasado) {
              mesesPasados.push(`${m.mes} ${m.anio}`)
              sumaMesesPasados += Number(m.valor) || 0
            }
          })

          if (mesesPasados.length > 0) {
            const textoMeses = mesesPasados.length > 3 
              ? `${mesesPasados.length} meses (${mesesPasados[0].split(" ")[0]} a ${mesesPasados[mesesPasados.length-1].split(" ")[0]})`
              : mesesPasados.join(", ")

            cargos.push({
              concepto: `Meses Vencidos (${textoMeses})`,
              monto: sumaMesesPasados
            })
          }
        }

        // 2. Intereses de Mora
        if (interesMoraAcumulado > 0) {
          cargos.push({
            concepto: "Intereses de Mora (Ley 675)",
            monto: interesMoraAcumulado
          })
        }

        // 3. Cargos Adicionales (Cartera Anterior, Multas, Proyectos)
        if (deudaCartera > 0) cargos.push({ concepto: "Cartera Anterior Pendiente", monto: deudaCartera })
        if (multas) multas.forEach((m: any) => cargos.push({ concepto: `Multa: ${m.tipo_multa || "General"}`, monto: Number(m.valor) }))
        if (proyectos) proyectos.forEach((p: any) => cargos.push({ concepto: `Proyecto: ${p.proyecto || "General"}`, monto: Number(p.valor) }))

        const queryParams = new URLSearchParams({
          nombreTorre, logoUrl, periodo: periodoTexto,
          unidad: u.unidad, propietario: u.propietario,
          montoCuota: String(montoCuota),
          cargos: JSON.stringify(cargos),
          mensajePie: mensajeAviso,
          direccion
        })

        const avisoImageUrl = `${origin}/api/aviso-image?${queryParams.toString()}&t=${Date.now()}`

        const msgText = `Hola ${u.propietario}, le envío su aviso de cobro para ${periodoTexto}.`

        let finalImageUrl = avisoImageUrl

        // Si no es localhost: descargar la imagen y subirla a Supabase Storage
        // para obtener una URL pública limpia que Meta pueda descargar
        if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
          try {
            const imgRes = await fetch(avisoImageUrl)
            if (imgRes.ok) {
              const imgBuffer = await imgRes.arrayBuffer()
              const imgBlob = new Blob([imgBuffer], { type: "image/png" })
              const fileName = `aviso-auto-${u.unidad}-${Date.now()}.png`
              const { error: uploadError } = await supabase.storage
                .from("avisos")
                .upload(fileName, imgBlob, { contentType: "image/png", upsert: true })
              if (!uploadError) {
                const { data: urlData } = supabase.storage.from("avisos").getPublicUrl(fileName)
                finalImageUrl = urlData.publicUrl
              }
            }
          } catch (imgErr) {
            console.log("No se pudo subir imagen a Storage, usando URL directa:", imgErr)
          }
        } else {
          finalImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/640px-WhatsApp.svg.png"
        }

        // Intentar envío vía Bot de Baileys de la copropiedad
        const jidIndividual = `${telefonoClean}@s.whatsapp.net`
        let resWhatsapp = await fetch(`${bot.railway_bot_url}/send-group`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": bot.bot_api_key
          },
          body: JSON.stringify({
            groupId: jidIndividual,
            message: msgText,
            imageUrl: finalImageUrl
          })
        })

        let dataWhatsapp: any = {}
        try {
          dataWhatsapp = await resWhatsapp.json()
        } catch {
          // Fallback a API WhatsApp si Baileys no responde
          resWhatsapp = await fetch(`${origin}/api/whatsapp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telefono: telefonoClean, mensaje: msgText, imageUrl: finalImageUrl })
          })
          try { dataWhatsapp = await resWhatsapp.json() } catch { dataWhatsapp = {} }
        }

        const enviado = resWhatsapp.ok && (dataWhatsapp?.success !== false || dataWhatsapp?.messages?.[0]?.id)
        if (enviado) {
          resultados.push({ unidad: u.unidad, success: true, ref: dataWhatsapp?.messages?.[0]?.id, telefono: telefonoClean, imageUrl: finalImageUrl, metaContacto: dataWhatsapp?.contacts?.[0]?.wa_id })

          // Registrar en la tabla cobros en Supabase
          try {
            const totalSuma = Number(montoCuota) + cargos.reduce((acc, c) => acc + (Number(c.monto) || 0), 0)
            await supabase.from("cobros").insert([{
              unidad: u.unidad,
              propietario: u.propietario || "",
              telefono: u.telefono || "",
              periodo: `${mesVigente} ${anoVigente}`,
              total: `$ ${totalSuma.toLocaleString("es-CO")}`,
              fecha: `${hoyColombia.getFullYear()}-${String(hoyColombia.getMonth() + 1).padStart(2, "0")}-${String(hoyColombia.getDate()).padStart(2, "0")}`
            }])
          } catch (cErr) {
            console.log("Aviso: no se insertó en la tabla cobros:", cErr)
          }
        } else {
          resultados.push({ unidad: u.unidad, success: false, error: dataWhatsapp?.error?.message || dataWhatsapp?.error || JSON.stringify(dataWhatsapp) || "Error al enviar WhatsApp", telefono: telefonoClean, imageUrl: finalImageUrl })
        }
      } catch (err: any) {
        resultados.push({ unidad: u.unidad, success: false, error: err.message || "Error inesperado" })
      }
    }

    // Registrar fecha del último envío masivo
    if (!isManual && !singleUnidad && resultados.some(r => r.success)) {
      const fechaHoyString = `${hoyColombia.getFullYear()}-${hoyColombia.getMonth() + 1}-${hoyColombia.getDate()}`
      await supabase
        .from("configuracion_automatico")
        .update({ fecha_ultimo_aviso: fechaHoyString })
        .eq("id", autoConfig.id)
    }

    return NextResponse.json({ success: true, periodo: periodoTexto, total_procesado: unidades.length, resultados })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
