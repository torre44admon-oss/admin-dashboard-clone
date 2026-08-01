"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, Megaphone, Clock, Trash2, Image as ImageIcon, X } from "lucide-react"

interface Comunicado {
  id: number
  mensaje: string
  image_url?: string
  enviado_en: string
}

interface UnidadOption {
  unidad: string
  propietario: string
  telefono: string
}

export function ComunicadosContent() {
  const [mensaje, setMensaje] = useState("")
  const [imagenUrl, setImagenUrl] = useState("")
  const [destinatario, setDestinatario] = useState("grupo") // "grupo" or "unidad_XXX"
  const [unidades, setUnidades] = useState<UnidadOption[]>([])
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [historial, setHistorial] = useState<Comunicado[]>([])
  const [cargando, setCargando] = useState(true)
  const [desplegados, setDesplegados] = useState<number[]>([])

  const toggleDesplegar = (id: number) => {
    setDesplegados(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    cargarHistorial()
    cargarUnidades()
  }, [])

  async function cargarUnidades() {
    const { data } = await supabase
      .from("unidades")
      .select("unidad, propietario, telefono")
      .order("unidad", { ascending: true })
    setUnidades(data || [])
  }

  async function cargarHistorial() {
    setCargando(true)
    try {
      const { data, error } = await supabase
        .from("comunicados")
        .select("*")
        .order("enviado_en", { ascending: false })
        .limit(30)

      if (!error && data) {
        setHistorial(data)
      } else {
        setHistorial([])
      }
    } catch {
      setHistorial([])
    } finally {
      setCargando(false)
    }
  }

  async function handleSubirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendoImagen(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `comunicado_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avisos")
        .upload(`comunicados/${fileName}`, file, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from("avisos").getPublicUrl(`comunicados/${fileName}`)
        setImagenUrl(data.publicUrl)
        toast.success("Foto subida a Supabase.")
      } else {
        toast.error("Error al subir imagen a Supabase.")
      }
    } catch {
      toast.error("Error al procesar la imagen.")
    } finally {
      setSubiendoImagen(false)
    }
  }

  async function handleEnviar() {
    if (!mensaje.trim() && !imagenUrl) {
      toast.error("Escribe un mensaje o adjunta una foto antes de enviar.")
      return
    }
    setEnviando(true)

    let unidadDestino: string | undefined = undefined
    let telefonoDestino: string | undefined = undefined

    if (destinatario.startsWith("unidad_")) {
      const uId = destinatario.replace("unidad_", "")
      const uObj = unidades.find(u => u.unidad === uId)
      if (uObj) {
        unidadDestino = uObj.unidad
        telefonoDestino = uObj.telefono
      }
    }

    try {
      const res = await fetch("/api/comunicado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: mensaje.trim(),
          imageUrl: imagenUrl || undefined,
          unidadDestino,
          telefonoDestino
        })
      })
      const data = await res.json()

      if (data.success) {
        const destTexto = unidadDestino ? `al privado del Apto. ${unidadDestino}` : "al Grupo de WhatsApp"
        toast.success(`✅ Comunicado enviado ${destTexto} y guardado en Supabase.`)
        setMensaje("")
        setImagenUrl("")
      } else {
        toast.error(data.error || "Error al procesar el comunicado.")
      }
    } catch {
      toast.error("Error al guardar en Supabase.")
    } finally {
      setEnviando(false)
      cargarHistorial()
    }
  }

  async function handleEliminar(id: number) {
    const { error } = await supabase.from("comunicados").delete().eq("id", id)
    if (!error) {
      toast.success("Comunicado eliminado de Supabase.")
      cargarHistorial()
    } else {
      toast.error("Error al eliminar de Supabase.")
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Nuevo Comunicado</h2>
          </div>

          {/* Selector de Destinatario */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Enviar a:</span>
            <select
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              className="bg-[#0b0f19] border border-[#2d3748] focus:border-indigo-500 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="grupo">👥 Toda la Copropiedad (Grupo de WhatsApp)</option>
              <optgroup label="👤 Enviar mensaje privado por WhatsApp:">
                {unidades.map(u => (
                  <option key={u.unidad} value={`unidad_${u.unidad}`}>
                    Apto. {u.unidad} — {u.propietario} ({u.telefono || 'Sin tel'})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4 mb-4 text-sm text-slate-300 min-h-[56px]">
          <p className="text-indigo-400 font-bold text-xs mb-1">📢 COMUNICADO · Vista previa en el grupo</p>
          <p className="text-slate-400 text-xs mb-2 font-semibold">
            {localStorage?.getItem?.("nombre_torre") || "Nombre del Condominio"}
          </p>
          {imagenUrl && (
            <div className="relative mb-3 inline-block max-w-[240px]">
              <img src={imagenUrl} alt="Adjunto" className="w-full max-h-48 object-cover rounded-lg border border-[#2d3748]" />
              <button
                type="button"
                onClick={() => setImagenUrl("")}
                className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                title="Quitar foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="whitespace-pre-wrap">{mensaje || (!imagenUrl && <span className="text-slate-600 italic">El comunicado aparecerá aquí...</span>)}</p>
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
              onClick={() => setMensaje(`CONVOCATORIA A ASAMBLEA GENERAL DE COPROPIETARIOS\n\nCordial saludo a todos los propietarios.\n\nPor medio del presente, se convoca a la próxima Asamblea General de la Copropiedad, que se llevará a cabo el próximo sábado a las 6:30 p.m. en el área común de zonas verdes del conjunto.\n\nSu asistencia y puntualidad son fundamentales para tratar los temas de interés de la comunidad y tomar decisiones importantes para la copropiedad.\n\nSe recuerda que la no asistencia sin causa justificada dará lugar a una multa de $35.000 COP, de acuerdo con lo established en el reglamento de la copropiedad.\n\nAgradecemos su compromiso y participación.\nAdministración – Torre 44`)}
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
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-[#0b0f19] border border-[#2d3748] hover:border-indigo-500 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>{subiendoImagen ? "Cargando..." : imagenUrl ? "Cambiar Foto" : "Adjuntar Foto"}</span>
              <input type="file" accept="image/*" onChange={handleSubirImagen} className="hidden" disabled={subiendoImagen} />
            </label>
            <span className="text-slate-500 text-xs">{mensaje.length} caracteres</span>
          </div>

          <button
            onClick={handleEnviar}
            disabled={enviando || (!mensaje.trim() && !imagenUrl)}
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
            {historial.map(c => {
              const estaAbierto = desplegados.includes(c.id)
              const esLargo = (c.mensaje && c.mensaje.length > 180) || c.mensaje.includes("\n\n")

              return (
                <div
                  key={c.id}
                  className="bg-[#0b0f19] border border-[#2d3748] hover:border-indigo-500/50 transition-all rounded-xl p-4 flex flex-col md:flex-row md:items-start gap-4"
                >
                  {c.image_url && (
                    <img src={c.image_url} alt="Foto" className={`${estaAbierto ? "w-full md:w-36 h-36" : "w-16 h-16"} object-cover rounded-lg border border-[#2d3748] flex-shrink-0 transition-all duration-300`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {formatFecha(c.enviado_en)}
                      </p>

                      {esLargo && (
                        <button
                          type="button"
                          onClick={() => toggleDesplegar(c.id)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          {estaAbierto ? "Ver menos ▲" : "Ver comunicado completo ▼"}
                        </button>
                      )}
                    </div>

                    <p className={`text-slate-300 text-sm whitespace-pre-wrap break-words ${!estaAbierto && esLargo ? "line-clamp-2" : ""}`}>
                      {c.mensaje}
                    </p>

                    {esLargo && !estaAbierto && (
                      <button
                        type="button"
                        onClick={() => toggleDesplegar(c.id)}
                        className="mt-2 text-xs font-bold text-indigo-400 hover:underline cursor-pointer block"
                      >
                        Leer completo...
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleEliminar(c.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 self-start mt-0.5 cursor-pointer"
                    title="Eliminar del historial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
