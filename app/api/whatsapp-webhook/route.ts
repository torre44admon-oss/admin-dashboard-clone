import { NextResponse, after } from "next/server"
import { supabase } from "@/lib/supabase"

// Token de verificación que ingresarás en la consola de Facebook Developers
const VERIFY_TOKEN = "torre44_verify_token"

// Endpoint GET para verificación de Facebook (Subscribe)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook de WhatsApp verificado con éxito.")
      return new Response(challenge, { status: 200 })
    }
    return new Response("Forbidden", { status: 403 })
  } catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}

// Endpoint POST para recibir mensajes entrantes de WhatsApp
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar que sea un evento de mensaje de WhatsApp
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Invalid webhook object" }, { status: 400 })
    }

    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    // Si no es un mensaje entrante (ej. estados de entrega como read, delivered), ignorar
    if (!message) {
      return NextResponse.json({ success: true, message: "No user message in event" })
    }

    const isTestRequest = message.from === "16315551181"
    let senderPhone = message.from // Ej: '573014130109'
    
    // Si es el número de prueba predeterminado de Facebook, redirigir a tu número real para que te llegue el mensaje
    if (isTestRequest) {
      senderPhone = "573014130109"
    }

    const messageText = String(message.text?.body || "").toLowerCase().trim()

    // 1. Obtener los teléfonos de administradores (adm, tesorera) para validación de comandos
    const { data: autoData } = await supabase
      .from("configuracion_automatico")
      .select("telefono_reportes")
      .order("id", { ascending: false })
      .limit(1)
    const adminPhoneConfig = autoData?.[0]?.telefono_reportes || ""
    const adminPhones = adminPhoneConfig.split(/[,;]+/).map((p: string) => {
      let clean = p.replace(/[^0-9]/g, "")
      if (clean.length === 10 && !clean.startsWith("57")) {
        clean = "57" + clean
      }
      return clean
    }).filter(Boolean)
    const isAdmin = adminPhones.includes(senderPhone) || senderPhone === "573014130109"

    // 2. Verificar palabras clave o comandos de administrador
    const palabrasClave = ["hola", "saldo", "deuda", "cobro", "pago", "buenos dias", "buenas tardes", "buenas noches"]
    const coincidePalabra = palabrasClave.some(p => messageText.includes(p))
    const isAdminCommand = messageText === "reporte" || messageText === "informe" || /^(enviar|aviso|cobro)\s+([0-9a-zA-Z-]+)$/.test(messageText)

    const coincide = isTestRequest || coincidePalabra || (isAdmin && isAdminCommand)

    if (!coincide) {
      return NextResponse.json({ success: true, message: "Message ignored (not a key phrase)" })
    }

    // Programar el procesamiento y envío de WhatsApp en segundo plano (para no hacer esperar a Facebook)
    after(async () => {
      try {
        const origin = new URL(request.url).origin

        // Procesar comandos de Administrador
        if (isAdmin && isAdminCommand) {
          // Comando de Reporte Completo
          if (messageText === "reporte" || messageText === "informe") {
            try {
              await enviarTextoWhatsApp(senderPhone, "⏳ Generando y enviando informe completo de deudores...")
              const res = await fetch(`${origin}/api/cron-report?manual=true`)
              const data = await res.json()
              if (data.success) {
                await enviarTextoWhatsApp(senderPhone, `✅ Informe generado con éxito. Se encontraron ${data.deudores} deudores en mora.`)
              } else {
                await enviarTextoWhatsApp(senderPhone, `❌ Error al generar el reporte: ${data.error || "Error de API"}`)
              }
            } catch (err: any) {
              await enviarTextoWhatsApp(senderPhone, `❌ Error de conexión al generar reporte: ${err.message}`)
            }
            return
          }

          // Comando de Envío Individual: "enviar 101" / "aviso 101" / "cobro 101"
          const match = messageText.match(/^(enviar|aviso|cobro)\s+([0-9a-zA-Z-]+)$/)
          if (match) {
            const unidadId = match[2].toUpperCase()
            try {
              await enviarTextoWhatsApp(senderPhone, `⏳ Procesando y enviando aviso de cobro al Apto. ${unidadId}...`)
              const res = await fetch(`${origin}/api/cron-aviso?unidad=${unidadId}&manual=true`)
              const data = await res.json()
              const resultado = data.resultados?.[0]
              if (data.success && resultado && resultado.success) {
                await enviarTextoWhatsApp(senderPhone, `✅ ¡Enviado con éxito! El aviso de cobro del Apto. ${unidadId} se envió a su teléfono registrado (${resultado.telefono}).`)
              } else {
                const errorMsg = resultado?.error || data.error || "El apartamento no existe o no tiene un teléfono válido registrado."
                await enviarTextoWhatsApp(senderPhone, `❌ Error al enviar aviso al Apto. ${unidadId}: ${errorMsg}`)
              }
            } catch (err: any) {
              await enviarTextoWhatsApp(senderPhone, `❌ Error de conexión al enviar el aviso: ${err.message}`)
            }
            return
          }
        }

        // Flujo estándar para propietarios (consultar saldo individual)
        // 1. Buscar TODOS los apartamentos asociados al número del remitente
        const phoneNoCountry = senderPhone.startsWith("57") ? senderPhone.substring(2) : senderPhone
        const { data: unidades, error: errUnidades } = await supabase
          .from("unidades")
          .select("*")
          .or(`telefono.ilike.%${phoneNoCountry}%,telefono.ilike.%${senderPhone}%`)

        if (errUnidades || !unidades || unidades.length === 0) {
          await enviarTextoWhatsApp(
            senderPhone,
            `👋 ¡Hola! Te has comunicado con la administración de Alto de Santa Elena.\n\n⚠️ No encontramos ningún apartamento registrado con tu número de teléfono (${senderPhone}). Por favor comunícate con la administración para registrar tus datos.`
          )
          return
        }

        // 2. Obtener datos de la torre y configuración (una sola vez para todas las unidades)
        const { data: torreData } = await supabase.from("configuracion_torre").select("*").order("id", { ascending: false }).limit(1)
        const torreConfig = torreData?.[0] || {}
        const nombreTorre = torreConfig.nombre_torre || "Torre 44"
        const montoFijoBase = parseFloat(torreConfig.monto_fijo || "20000")

        const { data: configAviso } = await supabase.from("configuracion_aviso").select("*").order("id", { ascending: false }).limit(1)
        const mensajeAviso = configAviso?.[0]?.mensaje_aviso || configAviso?.[0]?.mensaje || "Por favor realizar el pago a tiempo."

        const { data: configMoraData } = await supabase.from("configuracion_tasas_mora").select("*").order("id", { ascending: false }).limit(1)
        const configMora = configMoraData?.[0] || {}

        const { data: tasasData } = await supabase.from("tasas_mora_mensual").select("*")
        const mapaTasas: Record<string, any> = {}
        if (tasasData) {
          tasasData.forEach((t: any) => {
            const mesStr = String(t.mes).toLowerCase()
            mapaTasas[`${mesStr}_${t.anio}`] = t
          })
        }

        const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
        const hoyColombia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
        const fechaCiclo = hoyColombia.getDate() > 20
          ? new Date(hoyColombia.getFullYear(), hoyColombia.getMonth() + 1, 1)
          : hoyColombia
        const mesVigente = mesesNombres[fechaCiclo.getMonth()]
        const anoVigente = fechaCiclo.getFullYear()
        const periodoTexto = `${mesVigente} de ${anoVigente}`

        // 3. Enviar un mensaje por cada apartamento vinculado al número
        for (const u of unidades) {
          const { data: mensualidades } = await supabase.from("mensualidades").select("*").eq("unidad", u.unidad).eq("estado", "Pendiente")
          const { data: multas } = await supabase.from("multas_asignadas").select("*").eq("unidad", u.unidad).in("estado", ["Pendiente", "Vencida"])
          const { data: proyectos } = await supabase.from("proyectos_asignados").select("*").eq("unidad", u.unidad).eq("estado", "Pendiente")
          const { data: cartera } = await supabase.from("cartera").select("deuda").eq("unidad", u.unidad).single()
          const deudaCartera = Number(cartera?.deuda) || 0

          let interesMoraAcumulado = 0
          const startOfToday = new Date(hoyColombia)
          startOfToday.setHours(0, 0, 0, 0)

          const mensualidadVigente = mensualidades?.find(
            (m: any) => String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
          )
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
          if (mensualidades) {
            mensualidades.forEach((m: any) => {
              const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
              const indiceMesMensualidad = mesesNombres.findIndex(mn => mn.toLowerCase() === String(m.mes).toLowerCase())
              const fechaMensualidad = new Date(Number(m.anio), indiceMesMensualidad)
              const fechaVigente = new Date(anoVigente, mesesNombres.findIndex(mn => mn.toLowerCase() === mesVigente.toLowerCase()))
              const esMesPasado = fechaMensualidad < fechaVigente
              if (!esMesActual && esMesPasado) cargos.push({ concepto: `Membresía ${m.mes} ${m.anio}`, monto: Number(m.valor) })
            })
          }
          if (multas) multas.forEach((m: any) => cargos.push({ concepto: `Multa: ${m.tipo_multa || "General"}`, monto: Number(m.valor) }))
          if (proyectos) proyectos.forEach((p: any) => cargos.push({ concepto: `Proyecto: ${p.proyecto || "General"}`, monto: Number(p.valor) }))
          if (interesMoraAcumulado > 0) cargos.push({ concepto: "Intereses de Mora (Ley 675)", monto: interesMoraAcumulado })
          if (deudaCartera > 0) cargos.push({ concepto: "Cartera Anterior Pendiente", monto: deudaCartera })

          const total = montoCuota + cargos.reduce((acc, c) => acc + (parseFloat(c.monto) || 0), 0)

          let msgText = `👋 *Hola ${u.propietario}* (Apto. ${u.unidad})\n`
          msgText += `Estado de cuenta para *${periodoTexto}*:\n\n`
          msgText += `• *Cuota Administrativa:* $ ${montoCuota.toLocaleString("es-CO")}\n`

          if (cargos.length > 0) {
            msgText += `\n*Cargos adicionales:*\n`
            cargos.forEach((c: any) => {
              msgText += `• ${c.concepto}: $ ${Number(c.monto).toLocaleString("es-CO")}\n`
            })
          }

          msgText += `\n------------------------------------\n`
          msgText += `*TOTAL A PAGAR: $ ${total.toLocaleString("es-CO")}*\n\n`

          if (mensajeAviso) {
            msgText += `_${mensajeAviso}_`
          }

          await enviarTextoWhatsApp(senderPhone, msgText)
        }
      } catch (err) {
        console.error("Error en procesamiento diferido de WhatsApp:", err)
      }
    })

    // Responder inmediatamente a Meta para evitar timeout
    return NextResponse.json({ success: true, message: "Webhook received, processing in background" })
  } catch (error: any) {
    console.error("Error en el webhook receptor de WhatsApp:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function enviarTextoWhatsApp(to: string, text: string) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    )
    const data = await res.json()
    console.log("META TEXT MSG RESPONSE:", res.status, JSON.stringify(data))
  } catch (err) {
    console.error("Error calling Meta text API:", err)
  }
}

async function enviarImagenWhatsApp(to: string, imageUrl: string, caption: string) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "image",
          image: {
            link: imageUrl,
            caption,
          },
        }),
      }
    )
    const data = await res.json()
    console.log("META IMG MSG RESPONSE:", res.status, JSON.stringify(data))
  } catch (err) {
    console.error("Error calling Meta image API:", err)
  }
}
