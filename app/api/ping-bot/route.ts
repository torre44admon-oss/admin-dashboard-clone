import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Obtener URL del bot desde Supabase
    const { data: botConfig } = await supabase
      .from("configuracion_bot")
      .select("railway_bot_url")
      .order("id", { ascending: false })
      .limit(1)

    const botUrl = botConfig?.[0]?.railway_bot_url

    if (!botUrl) {
      return NextResponse.json({ success: true, message: "Bot no configurado, ping omitido." })
    }

    // Hacer ping al bot para mantenerlo despierto
    const res = await fetch(`${botUrl}/status`, { signal: AbortSignal.timeout(10000) })
    const data = await res.json()

    return NextResponse.json({
      success: true,
      botConnected: data.connected,
      botStatus: data.status,
      message: `Ping al bot exitoso. Estado: ${data.status || "desconocido"}`
    })
  } catch (error: any) {
    // Si el bot no responde, no es un error crítico
    return NextResponse.json({
      success: false,
      message: `Ping fallido: ${error.message}`
    })
  }
}
