"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, MessageSquare, Clock, Trash2, Image as ImageIcon, X, User } from "lucide-react"

interface NotificacionPersonal {
  id: number
  unidad: string
  propietario?: string
  mensaje: string
  image_url?: string
  enviado_en: string
}

interface UnidadOption {
  unidad: string
  propietario: string
  telefono: string
}

export function NotificacionesPersonalesContent() {
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [imagenUrl, setImagenUrl] = useState("")
  const [unidades, setUnidades] = useState<UnidadOption[]>([])
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [historial, setHistorial] = useState<NotificacionPersonal[]>([])
  const [cargando, setCargando] = useState(true)
  const [desplegados, setDesplegados] = useState<number[]>([])

  const toggleDesplegar = (id: number) => {
    setDesplegados(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    cargarUnidades()
    cargarHistorial()
  }, [])

  async function cargarUnidades() {
    const { data } = await supabase
      .from("unidades")
      .select("unidad, propietario, telefono")
      .order("unidad", { ascending: true })
    
    if (data && data.length > 0) {
      setUnidades(data)
      setUnidadSeleccionada(data[0].unidad)
    }
  }

  async function cargarHistorial() {
    setCargando(true)
    try {
      const { data, error } = await supabase
        .from("notificaciones_personales")
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
      const fileName = `notif_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avisos")
        .upload(`notificaciones/${fileName}`, file, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from("avisos").getPublicUrl(`notificaciones/${fileName}`)
        setImagenUrl(data.publicUrl)
        toast.success("Foto subida a Supabase.")
      } else {
        toast.error("Error al subir imagen.")
      }
    } catch {
      toast.error("Error al procesar la imagen.")
    } finally {
      setSubiendoImagen(false)
    }
  }

  async function handleEnviar() {
    if (!unidadSeleccionada) {
      toast.error("Selecciona un apartamento o propietario.")
      return
    }
    if (!mensaje.trim() && !imagenUrl) {
      toast.error("Escribe un mensaje o adjunta una foto antes de enviar.")
      return
    }
    setEnviando(true)

    const objU = unidades.find(u => u.unidad === unidadSeleccionada)
    const tel = objU?.telefono || ""
    const prop = objU?.propietario || "Residente"

    try {
      const res = await fetch("/api/comunicado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: mensaje.trim(),
          imageUrl: imagenUrl || undefined,
          unidadDestino: unidadSeleccionada,
          telefonoDestino: tel
        })
      })
      
      let data: any = {}
      const resText = await res.text()
      try {
        data = JSON.parse(resText)
      } catch {
        data = { error: "Respuesta no válida del servidor" }
      }

      // Guardar también en la tabla notificaciones_personales en Supabase
      try {
        await supabase.from("notificaciones_personales").insert([{
          unidad: unidadSeleccionada,
          propietario: prop,
          mensaje: mensaje.trim(),
          image_url: imagenUrl || null,
          enviado_en: new Date().toISOString()
        }])
      } catch (dbErr) {
        console.log("Aviso guardado:", dbErr)
      }

      if (res.ok && data.success !== false) {
        toast.success(`✅ Notificación registrada para el Apto. ${unidadSeleccionada}.`)
        setMensaje("")
        setImagenUrl("")
      } else {
        toast.warning(data.error || "Notificación guardada en la aplicación. Revisa la configuración del bot.")
        setMensaje("")
        setImagenUrl("")
      }
    } catch {
      toast.error("Error de red al enviar la notificación.")
    } finally {
      setEnviando(false)
      cargarHistorial()
    }
  }

  async function handleEliminar(id: number) {
    const { error } = await supabase.from("notificaciones_personales").delete().eq("id", id)
    if (!error) {
      toast.success("Notificación eliminada.")
      cargarHistorial()
    } else {
      toast.error("Error al eliminar.")
    }
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const aptoActual = unidades.find(u => u.unidad === unidadSeleccionada)

  return (
    <div className="font-sans text-slate-200 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-indigo-400" />
          Notificaciones Privadas a Propietarios
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Envía avisos y notificaciones directas al WhatsApp privado de cada residente
        </p>
      </div>

      {/* Redactor */}
      <div className="bg-[#151c2c] border border-[#1e293b] rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Nueva Notificación Personal</h2>
          </div>

          {/* Selector de Residente */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Seleccionar Residente:</span>
            <select
              value={unidadSeleccionada}
              onChange={(e) => setUnidadSeleccionada(e.target.value)}
              className="bg-[#0b0f19] border border-[#2d3748] focus:border-indigo-500 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              {unidades.map(u => (
                <option key={u.unidad} value={u.unidad}>
                  Apto. {u.unidad} — {u.propietario} ({u.telefono || 'Sin teléfono'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4 mb-4 text-sm text-slate-300 min-h-[56px]">
          <p className="text-emerald-400 font-bold text-xs mb-1">📩 MENSAJE PRIVADO DE WHATSAPP</p>
          <p className="text-slate-400 text-xs mb-2 font-semibold">
            Para: <span className="text-white font-bold">{aptoActual?.propietario || "Residente"} (Apto. {unidadSeleccionada})</span>
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
          <p className="whitespace-pre-wrap">{mensaje || (!imagenUrl && <span className="text-slate-600 italic">Escribe el mensaje personal aquí...</span>)}</p>
        </div>

        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          placeholder={`Escribe la notificación privada para ${aptoActual?.propietario || "el residente"}...`}
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
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {enviando ? "Enviando..." : `Enviar Privado a Apto. ${unidadSeleccionada}`}
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-[#151c2c] border border-[#1e293b] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Historial de Notificaciones Privadas</h2>
        </div>

        {cargando ? (
          <p className="text-slate-500 text-sm text-center py-8">Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No hay notificaciones privadas enviadas aún.
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Apto. {c.unidad}
                        </span>
                        {c.propietario && (
                          <span className="text-xs text-slate-300 font-semibold">
                            {c.propietario}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {formatFecha(c.enviado_en)}
                      </p>
                    </div>

                    <p className={`text-slate-300 text-sm whitespace-pre-wrap break-words mt-1 ${!estaAbierto && esLargo ? "line-clamp-2" : ""}`}>
                      {c.mensaje}
                    </p>

                    {esLargo && (
                      <button
                        type="button"
                        onClick={() => toggleDesplegar(c.id)}
                        className="mt-2 text-xs font-bold text-indigo-400 hover:underline cursor-pointer block"
                      >
                        {estaAbierto ? "Ver menos ▲" : "Leer completo... ▼"}
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
