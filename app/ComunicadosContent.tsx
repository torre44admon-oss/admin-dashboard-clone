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

  async function cargarHistorial() {
    setCargando(true)
    const { data } = await supabase
      .from("comunicados")
      .select("*")
      .order("enviado_en", { ascending: false })
      .limit(20)
    setHistorial(data || [])
    setCargando(false)
  }

  async function handleEnviar() {
    if (!mensaje.trim()) {
      toast.error("Escribe un mensaje antes de enviar.")
      return
    }
    setEnviando(true)
    try {
      const res = await fetch("/api/comunicado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("✅ Comunicado enviado al grupo de WhatsApp.")
        setMensaje("")
        cargarHistorial()
      } else {
        toast.error(data.error || "Error al enviar el comunicado.")
      }
    } catch {
      toast.error("Error de conexión al enviar el comunicado.")
    } finally {
      setEnviando(false)
    }
  }

  async function handleEliminar(id: number) {
    await supabase.from("comunicados").delete().eq("id", id)
    setHistorial(prev => prev.filter(c => c.id !== id))
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
