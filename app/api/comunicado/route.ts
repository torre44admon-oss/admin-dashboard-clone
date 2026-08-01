import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { mensaje, imageUrl } = await request.json()

    if ((!mensaje || !mensaje.trim()) && !imageUrl) {
      return NextResponse.json({ error: "El mensaje o la imagen no puede estar vacío" }, { status: 400 })
    }

    // Obtener configuración del bot
    const { data: botConfig } = await supabase
      .from("configuracion_bot")
      .select("grupo_whatsapp_id, railway_bot_url, bot_api_key")
      .order("id", { ascending: false })
      .limit(1)

    const bot = botConfig?.[0]

    if (!bot?.grupo_whatsapp_id || !bot?.railway_bot_url || !bot?.bot_api_key) {
      return NextResponse.json({
        success: false,
        error: "El bot del grupo no está configurado. Ve a Configuración → Bot Grupo WhatsApp."
      }, { status: 503 })
    }

    // Obtener nombre de la torre para el encabezado
    const { data: torreData } = await supabase
      .from("configuracion_torre")
      .select("nombre_torre")
      .order("id", { ascending: false })
      .limit(1)
    const nombreTorre = torreData?.[0]?.nombre_torre || "Administración"

    const mensajeFormateado = `📢 *COMUNICADO*\n*${nombreTorre}*\n\n${(mensaje || "").trim()}`

    // Enviar al grupo vía bot de Baileys (con imagen si aplica)
    const payload: any = {
      groupId: bot.grupo_whatsapp_id,
      message: mensajeFormateado
    }
    if (imageUrl) {
      payload.imageUrl = imageUrl
    }

    const res = await fetch(`${bot.railway_bot_url}/send-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": bot.bot_api_key
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.error || "Error al enviar al grupo" }, { status: 500 })
    }

    // Guardar historial del comunicado en Supabase de forma garantizada
    const comunicadoRecord: any = {
      mensaje: (mensaje || "").trim() || "Foto adjunta",
      enviado_en: new Date().toISOString()
    }
    if (imageUrl) {
      comunicadoRecord.image_url = imageUrl
    }

    const { error: insertErr } = await supabase.from("comunicados").insert([comunicadoRecord])

    if (insertErr) {
      // Si falló por falta de la columna image_url, reintentar sin ese campo
      console.log("Reintentando inserción sin campo image_url:", insertErr.message)
      await supabase.from("comunicados").insert([{
        mensaje: (mensaje || "").trim() || "Foto adjunta",
        enviado_en: new Date().toISOString()
      }])
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
