import { NextResponse, after } from "next/server"
import { supabase } from "@/lib/supabase"

// Token de verificación
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

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Invalid webhook object" }, { status: 400 })
    }

    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    // Si no es un mensaje entrante (estados de entrega: read, delivered), ignorar
    if (!message) {
      return NextResponse.json({ success: true, message: "No user message in event" })
    }

    const isTestRequest = message.from === "16315551181"
    let senderPhone = message.from

    if (isTestRequest) {
      senderPhone = "573014130109"
    }

    // Normalizar: quitar tildes/acentos y pasar a minúsculas
    // Así "Envía 303", "Avíso", "Enviá" etc. funcionan igual que "envia"
    const normalize = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

    const messageText = normalize(String(message.text?.body || ""))

    // Determinar si es un mensaje que debe procesarse
    const palabrasClave = [
      "hola", "saldo", "deuda", "cobro", "pago",
      "buenos dias", "buenas tardes", "buenas noches",
      "enviar", "envia", "envie", "aviso",
      "reporte", "informe"
    ]
    const coincidePalabra = palabrasClave.some(p => messageText.includes(p))

    // Verificar si es admin (necesitamos saberlo antes del after())
    const { data: autoData } = await supabase
      .from("configuracion_automatico")
      .select("telefono_reportes")
      .order("id", { ascending: false })
      .limit(1)
    const adminPhoneConfig = autoData?.[0]?.telefono_reportes || ""

    let commandPhones: string[] = []
    try {
      if (adminPhoneConfig.startsWith("[")) {
        const parsed = JSON.parse(adminPhoneConfig) as { phone: string; commands: boolean }[]
        parsed.forEach(item => {
          let clean = String(item.phone || "").replace(/[^0-9]/g, "")
          if (clean.length === 10 && !clean.startsWith("57")) clean = "57" + clean
          if (clean && item.commands) commandPhones.push(clean)
        })
      } else {
        adminPhoneConfig.split(/[,;]+/).forEach((p: string) => {
          let clean = p.replace(/[^0-9]/g, "")
          if (clean.length === 10 && !clean.startsWith("57")) clean = "57" + clean
          if (clean) commandPhones.push(clean)
        })
      }
    } catch (e) {
      console.error("Error al parsear teléfonos:", e)
    }

    const isAdmin = commandPhones.includes(senderPhone) || senderPhone === "573014130109"

    const esComandoReporte = messageText === "reporte" || messageText === "informe"
    // Acepta: "envia 303", "envía 303", "aviso 101", "enviar 501" etc.
    const matchApto = messageText.match(/^(enviar|envia|envie|aviso|cobro)\s+([0-9a-zA-Z-]+)$/)
    const esEnvioSolo = ["enviar", "envia", "envie", "aviso"].includes(messageText)

    const coincide = isTestRequest || coincidePalabra || (isAdmin && (esComandoReporte || !!matchApto))

    if (!coincide) {
      return NextResponse.json({ success: true, message: "Message ignored (not a key phrase)" })
    }

    const origin = new URL(request.url).origin

    // Responder a Meta INMEDIATAMENTE para evitar timeout (20s de Meta)
    // Todo el procesamiento ocurre dentro de after() en segundo plano
    after(async () => {
      try {

        // ── ADMIN: "reporte" o "informe" ─────────────────────────────
        if (isAdmin && esComandoReporte) {
          await enviarTextoWhatsApp(senderPhone, "⏳ Generando informe completo de deudores...")
          try {
            const res = await fetch(`${origin}/api/cron-report?manual=true&telefono=${senderPhone}`)
            const data = await res.json()
            if (data.success) {
              await enviarTextoWhatsApp(senderPhone, `✅ Informe enviado. ${data.deudores} deudores encontrados.`)
            } else {
              await enviarTextoWhatsApp(senderPhone, `❌ Error al generar el reporte: ${data.error || "Error de API"}`)
            }
          } catch (err: any) {
            await enviarTextoWhatsApp(senderPhone, `❌ Error: ${err.message}`)
          }
          return
        }

        // ── ADMIN: "enviar 303" / "aviso 501" → aviso de ese apto ────
        if (isAdmin && matchApto) {
          const unidadId = matchApto[2].toUpperCase()
          await enviarTextoWhatsApp(senderPhone, `⏳ Generando aviso del Apto. ${unidadId}...`)
          try {
            const res = await fetch(`${origin}/api/cron-aviso?unidad=${unidadId}&manual=true&telefono=${senderPhone}`)
            const data = await res.json()
            const resultado = data.resultados?.[0]
            if (data.success && resultado?.success) {
              await enviarTextoWhatsApp(senderPhone, `✅ Aviso del Apto. ${unidadId} enviado a tu número.`)
            } else {
              const errorMsg = resultado?.error || data.error || "El apartamento no existe."
              await enviarTextoWhatsApp(senderPhone, `❌ Error Apto. ${unidadId}: ${errorMsg}`)
            }
          } catch (err: any) {
            await enviarTextoWhatsApp(senderPhone, `❌ Error: ${err.message}`)
          }
          return
        }

        // ── ADMIN escribe solo "envia" / "aviso" → recibe su propia imagen ──
        // Busca su apto por número y envía el aviso de cobro como imagen
        if (isAdmin && esEnvioSolo) {
          const phoneNoCountry = senderPhone.startsWith("57") ? senderPhone.substring(2) : senderPhone
          const { data: unidadesAdmin } = await supabase
            .from("unidades")
            .select("unidad")
            .or(`telefono.ilike.%${phoneNoCountry}%,telefono.ilike.%${senderPhone}%`)
            .limit(1)

          if (unidadesAdmin && unidadesAdmin.length > 0) {
            const unidadAdmin = unidadesAdmin[0].unidad
            await enviarTextoWhatsApp(senderPhone, `⏳ Generando tu aviso del Apto. ${unidadAdmin}...`)
            try {
              const res = await fetch(`${origin}/api/cron-aviso?unidad=${unidadAdmin}&manual=true&telefono=${senderPhone}`)
              const data = await res.json()
              const resultado = data.resultados?.[0]
              if (data.success && resultado?.success) {
                await enviarTextoWhatsApp(senderPhone, `✅ Tu aviso del Apto. ${unidadAdmin} fue enviado.`)
              } else {
                await enviarTextoWhatsApp(senderPhone, `❌ Error al generar el aviso: ${resultado?.error || data.error || "Error desconocido"}`)
              }
            } catch (err: any) {
              await enviarTextoWhatsApp(senderPhone, `❌ Error: ${err.message}`)
            }
          } else {
            // Si el admin no tiene apto registrado, avisar cómo usarlo
            await enviarTextoWhatsApp(senderPhone,
              `📋 *Comandos disponibles como administrador:*\n\n` +
              `• *envia 303* → Aviso del Apto. 303\n` +
              `• *envia 101* → Aviso del Apto. 101\n` +
              `• *reporte* → Informe general de deudores\n` +
              `• *informe* → Igual que reporte`
            )
          }
          return
        }

        // ── FLUJO NORMAL: PROPIETARIO escribe al bot ──────────────────

        const { data: torreDataPrev } = await supabase
          .from("configuracion_torre")
          .select("nombre_torre")
          .order("id", { ascending: false })
          .limit(1)
        const nombreTorrePrev = torreDataPrev?.[0]?.nombre_torre || "la administración"

        const phoneNoCountry = senderPhone.startsWith("57") ? senderPhone.substring(2) : senderPhone
        const { data: unidades, error: errUnidades } = await supabase
          .from("unidades")
          .select("*")
          .or(`telefono.ilike.%${phoneNoCountry}%,telefono.ilike.%${senderPhone}%`)

        if (errUnidades || !unidades || unidades.length === 0) {
          await enviarTextoWhatsApp(
            senderPhone,
            `👋 ¡Hola! Te has comunicado con la administración de ${nombreTorrePrev}.\n\n⚠️ No encontramos ningún apartamento con tu número (${senderPhone}). Comunícate con la administración.`
          )
          return
        }

        const { data: torreData } = await supabase.from("configuracion_torre").select("*").order("id", { ascending: false }).limit(1)
        const torreConfig = torreData?.[0] || {}
        const nombreTorre = torreConfig.nombre_torre || "Torre 44"
        const montoFijoBase = parseFloat(torreConfig.monto_fijo || "20000")

        const { data: configAviso } = await supabase.from("configuracion_aviso").select("*").order("id", { ascending: false }).limit(1)
        const mensajeAviso = configAviso?.[0]?.mensaje_aviso || configAviso?.[0]?.mensaje || "Por favor realizar el pago a tiempo."

        const { data: configMoraData } = await supabase.from("configuracion_tasas_mora").select("*").order("id", { ascending: false }).limit(1)
        const configMora = configMoraData?.[0] || {}

        const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
        const hoyColombia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
        const mesVigente = mesesNombres[hoyColombia.getMonth()]
        const anoVigente = hoyColombia.getFullYear()
        const periodoTexto = `${mesVigente} de ${anoVigente}`

        // Propietario escribe "envia" → imagen del aviso
        if (esEnvioSolo) {
          for (const u of unidades) {
            await enviarTextoWhatsApp(senderPhone, `⏳ Generando tu aviso del Apto. ${u.unidad}...`)
            try {
              const res = await fetch(`${origin}/api/cron-aviso?unidad=${u.unidad}&manual=true&telefono=${senderPhone}`)
              const data = await res.json()
              const resultado = data.resultados?.[0]
              if (!data.success || !resultado?.success) {
                await enviarTextoWhatsApp(senderPhone, `❌ No se pudo generar el aviso: ${resultado?.error || data.error || "Error desconocido"}`)
              }
            } catch (err: any) {
              await enviarTextoWhatsApp(senderPhone, `❌ Error: ${err.message}`)
            }
          }
          return
        }

        // Otras palabras clave → resumen de texto del estado de cuenta
        for (const u of unidades) {
          const { data: mensualidades } = await supabase.from("mensualidades").select("*").eq("unidad", u.unidad).eq("estado", "Pendiente")
          const { data: multas } = await supabase.from("multas_asignadas").select("*").eq("unidad", u.unidad).in("estado", ["Pendiente", "Vencida"])
          const { data: proyectos } = await supabase.from("proyectos_asignados").select("*").eq("unidad", u.unidad).eq("estado", "Pendiente")
          const { data: cartera } = await supabase.from("cartera").select("deuda").eq("unidad", u.unidad).single()
          const deudaCartera = Number(cartera?.deuda) || 0

          const startOfToday = new Date(hoyColombia)
          startOfToday.setHours(0, 0, 0, 0)

          const mensualidadVigente = mensualidades?.find(
            (m: any) => String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
          )
          const montoCuota = mensualidadVigente ? parseFloat(mensualidadVigente.valor) : (montoFijoBase || 120000)

          let interesMoraAcumulado = 0
          const tasaBase = (2.4 / 100) / 30

          if (mensualidades) {
            mensualidades.forEach((m: any) => {
              const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
              if (esMesActual) return
              const fechaLimite = new Date(m.fecha_limite)
              fechaLimite.setHours(0, 0, 0, 0)
              const dias = Math.max(0, Math.floor((startOfToday.getTime() - fechaLimite.getTime()) / 86400000))
              if (dias > 0) interesMoraAcumulado += Math.round((Number(m.valor) || 0) * tasaBase * dias)
            })
          }

          const graciaMultas = configMora.dias_gracia_multas || 15
          if (multas) {
            multas.forEach((m: any) => {
              const fechaAsig = new Date(m.fecha_asignacion || m.created_at)
              fechaAsig.setHours(0, 0, 0, 0)
              const dias = Math.max(0, Math.floor((startOfToday.getTime() - fechaAsig.getTime()) / 86400000))
              if (dias > graciaMultas) interesMoraAcumulado += Math.round((Number(m.valor) || 0) * tasaBase * (dias - graciaMultas))
            })
          }

          const graciaProyectos = configMora.dias_gracia_proyectos || 60
          if (proyectos) {
            proyectos.forEach((p: any) => {
              const fechaAsig = new Date(p.fecha || p.created_at)
              fechaAsig.setHours(0, 0, 0, 0)
              const dias = Math.max(0, Math.floor((startOfToday.getTime() - fechaAsig.getTime()) / 86400000))
              if (dias > graciaProyectos) interesMoraAcumulado += Math.round((Number(p.valor) || 0) * tasaBase * (dias - graciaProyectos))
            })
          }

          const cargos: any[] = []
          if (mensualidades) {
            mensualidades.forEach((m: any) => {
              const esMesActual = String(m.mes).toLowerCase() === mesVigente.toLowerCase() && Number(m.anio) === anoVigente
              const idxMes = mesesNombres.findIndex(mn => mn.toLowerCase() === String(m.mes).toLowerCase())
              const fechaMens = new Date(Number(m.anio), idxMes)
              const idxVig = mesesNombres.findIndex(mn => mn.toLowerCase() === mesVigente.toLowerCase())
              const fechaVig = new Date(anoVigente, idxVig)
              if (!esMesActual && fechaMens < fechaVig) cargos.push({ concepto: `Membresía ${m.mes} ${m.anio}`, monto: Number(m.valor) })
            })
          }
          if (multas) multas.forEach((m: any) => cargos.push({ concepto: `Multa: ${m.tipo_multa || "General"}`, monto: Number(m.valor) }))
          if (proyectos) proyectos.forEach((p: any) => cargos.push({ concepto: `Proyecto: ${p.proyecto || "General"}`, monto: Number(p.valor) }))
          if (interesMoraAcumulado > 0) cargos.push({ concepto: "Intereses de Mora (Ley 675)", monto: interesMoraAcumulado })
          if (deudaCartera > 0) cargos.push({ concepto: "Cartera Anterior Pendiente", monto: deudaCartera })

          const total = montoCuota + cargos.reduce((acc, c) => acc + (Number(c.monto) || 0), 0)

          let msgText = `🏢 *${nombreTorre}*\n`
          msgText += `👋 *Hola ${u.propietario}* (Apto. ${u.unidad})\n`
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
          if (mensajeAviso) msgText += `_${mensajeAviso}_`

          await enviarTextoWhatsApp(senderPhone, msgText)
        }

      } catch (err) {
        console.error("Error en procesamiento diferido de WhatsApp:", err)
      }
    })

    // Responder inmediatamente a Meta para evitar reenvíos por timeout
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
