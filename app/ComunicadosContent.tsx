"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, Megaphone, Clock, Trash2 } from "lucide-react"

interface Comunicado {
  id: number
  mensaje: string
  enviado_en: string
}

export function ComunicadosContent() {
  const [mensaje, setMensaje] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [historial, setHistorial] = useState<Comunicado[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarHistorial()
  }, [])

  function getLocalHistorial(): Comunicado[] {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("historial_comunicados")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  function saveLocalHistorial(items: Comunicado[]) {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("historial_comunicados", JSON.stringify(items))
    } catch (e) {
      console.error("Error saving local comunicados:", e)
    }
  }

  async function cargarHistorial() {
    setCargando(true)
    const local = getLocalHistorial()
    
    try {
      const { data, error } = await supabase
        .from("comunicados")
        .select("*")
        .order("enviado_en", { ascending: false })
        .limit(20)

      if (!error && data && data.length > 0) {
        // Merge with local if any missing
        const mapa = new Map<string, Comunicado>()
        data.forEach((item: any) => mapa.set(String(item.id || item.enviado_en), { id: item.id || Date.now(), mensaje: item.mensaje, enviado_en: item.enviado_en }))
        local.forEach(item => {
          const key = String(item.id || item.enviado_en)
          if (!mapa.has(key)) mapa.set(key, item)
        })
        const combinado = Array.from(mapa.values()).sort((a, b) => new Date(b.enviado_en).getTime() - new Date(a.enviado_en).getTime())
        setHistorial(combinado)
        saveLocalHistorial(combinado)
      } else {
        setHistorial(local)
      }
    } catch {
      setHistorial(local)
    } finally {
      setCargando(false)
    }
  }

  async function handleEnviar() {
    if (!mensaje.trim()) {
      toast.error("Escribe un mensaje antes de enviar.")
      return
    }
    setEnviando(true)

    const nuevoComunicado: Comunicado = {
      id: Date.now(),
      mensaje: mensaje.trim(),
      enviado_en: new Date().toISOString()
    }

    // 1. Guardar localmente de inmediato para garantizar que jamás se pierda
    const actualLocal = getLocalHistorial()
    const actualizado = [nuevoComunicado, ...actualLocal]
    setHistorial(actualizado)
    saveLocalHistorial(actualizado)

    try {
      const res = await fetch("/api/comunicado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: mensaje.trim() })
      })
      const data = await res.json()

      if (data.success) {
        toast.success("✅ Comunicado enviado y guardado con éxito.")
        setMensaje("")
      } else {
        toast.warning(data.error || "Guardado en la aplicación, pero hubo un detalle al publicar en el grupo de WhatsApp.")
        setMensaje("")
      }
    } catch {
      toast.info("Comunicado guardado localmente en la aplicación.")
      setMensaje("")
    } finally {
      setEnviando(false)
      cargarHistorial()
    }
  }

  async function handleEliminar(id: number) {
    try {
      await supabase.from("comunicados").delete().eq("id", id)
    } catch (e) {
      console.log("Eliminando localmente:", e)
    }
    const nuevoHistorial = historial.filter(c => c.id !== id)
    setHistorial(nuevoHistorial)
    saveLocalHistorial(nuevoHistorial)
    toast.success("Comunicado eliminado del historial.")
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <div className="font-sans text-slate-200 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Comunicados
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Envía mensajes al grupo de WhatsApp del condominio
        </p>
      </div>

      {/* Redactor */}
      <div className="bg-[#151c2c] border border-[#1e293b] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Nuevo Comunicado</h2>
        </div>

        {/* Preview */}
        <div className="bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4 mb-4 text-sm text-slate-300 min-h-[56px]">
          <p className="text-indigo-400 font-bold text-xs mb-1">📢 COMUNICADO · Vista previa en el grupo</p>
          <p className="text-slate-400 text-xs mb-2 font-semibold">
            {localStorage?.getItem?.("nombre_torre") || "Nombre del Condominio"}
          </p>
          <p className="whitespace-pre-wrap">{mensaje || <span className="text-slate-600 italic">El comunicado aparecerá aquí...</span>}</p>
        </div>

        {/* Plantillas Rápidas */}
        <div className="mb-4">
          <p className="text-slate-400 text-xs font-semibold mb-2">Plantillas Rápidas:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMensaje("Se informa a todos los copropietarios que el próximo sábado habrá mantenimiento y suspensión del servicio de agua de 8:00 AM a 12:00 PM. Por favor tomar las precauciones necesarias.")}
              className="bg-[#0b0f19] border border-[#2d3748] hover:border-indigo-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              🛠️ Corte de Agua / Mantenimiento
            </button>
            <button
              type="button"
              onClick={() => setMensaje(`CONVOCATORIA A ASAMBLEA GENERAL DE COPROPIETARIOS\n\nCordial saludo a todos los propietarios.\n\nPor medio del presente, se convoca a la próxima Asamblea General de la Copropiedad, que se llevará a cabo el próximo sábado a las 6:30 p.m. en el área común de zonas verdes del conjunto.\n\nSu asistencia y puntualidad son fundamentales para tratar los temas de interés de la comunidad y tomar decisiones importantes para la copropiedad.\n\nSe recuerda que la no asistencia sin causa justificada dará lugar a una multa de $35.000 COP, de acuerdo con lo establecido en el reglamento de la copropiedad.\n\nAgradecemos su compromiso y participación.\nAdministración – Torre 44`)}
              className="bg-[#0b0f19] border border-[#2d3748] hover:border-indigo-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              🏛️ Convocatoria a Asamblea ($35k Multa)
            </button>
            <button
              type="button"
              onClick={() => setMensaje("Recordatorio cordial de convivencia: Se solicita mantener la basura en bolsas bien cerradas en los horarios estipulados, así como moderar el volumen del sonido y mantener a las mascotas con correa en áreas comunes.")}
              className="bg-[#0b0f19] border border-[#2d3748] hover:border-indigo-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              🚨 Normas de Convivencia
            </button>
            <button
              type="button"
              onClick={() => setMensaje("Se les recuerda a los residentes con obligaciones pendientes realizar sus abonos o ponerse al día con la administración para garantizar el mantenimiento continuo del condominio.")}
              className="bg-[#0b0f19] border border-[#2d3748] hover:border-indigo-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              💰 Recordatorio de Pago
            </button>
          </div>
        </div>

        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          placeholder="Escribe el comunicado aquí... (ejemplo: Se informa a todos los copropietarios que el próximo sábado habrá corte de agua de 8am a 12pm por mantenimiento.)"
          rows={5}
          className="w-full bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4 text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-slate-500 text-xs">{mensaje.length} caracteres</span>
          <button
            onClick={handleEnviar}
            disabled={enviando || !mensaje.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {enviando ? "Enviando..." : "Enviar al Grupo"}
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-[#151c2c] border border-[#1e293b] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Historial de Comunicados</h2>
        </div>

        {cargando ? (
          <p className="text-slate-500 text-sm text-center py-8">Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No hay comunicados enviados aún.
          </p>
        ) : (
          <div className="space-y-3">
            {historial.map(c => (
              <div
                key={c.id}
                className="bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatFecha(c.enviado_en)}
                  </p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap break-words">{c.mensaje}</p>
                </div>
                <button
                  onClick={() => handleEliminar(c.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5 cursor-pointer"
                  title="Eliminar del historial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
