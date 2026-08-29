"use client"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  apartamentos: { unidad: string; propietario: string }[]
}

export function AgregarCarteraModal({ isOpen, onClose, apartamentos }: Props) {
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("")
  const [montoDeuda, setMontoDeuda] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setUnidadSeleccionada("")
      setMontoDeuda("")
      setDescripcion("")
    }
  }, [isOpen])

  const handleSuccessClose = () => {
    window.dispatchEvent(new Event("datosActualizados"))
    onClose()
  }

  const guardarDeuda = async () => {
    if (!unidadSeleccionada) {
      toast.warning("Seleccione un apartamento")
      return
    }
    const monto = Number(montoDeuda)
    if (!monto || monto <= 0) {
      toast.warning("Ingrese un monto válido mayor a $0")
      return
    }

    setGuardando(true)
    try {
      // Verificar si ya existe un registro en cartera para esta unidad
      const { data: carteraExistente } = await supabase
        .from("cartera")
        .select("*")
        .eq("unidad", unidadSeleccionada)
        .maybeSingle()

      const deudaActual = Number(carteraExistente?.deuda) || 0
      const nuevaDeuda = deudaActual + monto

      if (carteraExistente) {
        // Actualizar deuda existente
        const { error } = await supabase
          .from("cartera")
          .update({ deuda: nuevaDeuda })
          .eq("unidad", unidadSeleccionada)
        if (error) throw error
      } else {
        // Crear nuevo registro
        const { error } = await supabase
          .from("cartera")
          .insert({ unidad: unidadSeleccionada, deuda: nuevaDeuda })
        if (error) throw error
      }

      // Registrar en historial
      await supabase.from("historial_cartera").insert({
        unidad: unidadSeleccionada,
        tipo: "deuda",
        monto: monto,
        fecha: new Date().toISOString().split("T")[0],
        saldoResultante: nuevaDeuda
      })

      const propietario = apartamentos.find(a => a.unidad === unidadSeleccionada)?.propietario || unidadSeleccionada
      toast.success(`Deuda de $${monto.toLocaleString("es-CO")} agregada al Apto. ${unidadSeleccionada} (${propietario})`)
      handleSuccessClose()
    } catch (err: any) {
      console.error(err)
      toast.error(`Error al agregar deuda: ${err.message || "Error desconocido"}`)
    } finally {
      setGuardando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#131926] border border-[#1E293B]/60 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Agregar Deuda a Cartera</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Registrar deuda de administración anterior u otros conceptos</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Apartamento */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Apartamento
            </label>
            <select
              value={unidadSeleccionada}
              onChange={(e) => setUnidadSeleccionada(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Seleccione un apartamento</option>
              {apartamentos.map((a) => (
                <option key={a.unidad} value={a.unidad}>
                  Apto. {a.unidad} — {a.propietario || "Sin nombre"}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Monto de la Deuda ($)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 150000"
              value={montoDeuda}
              onChange={(e) => setMontoDeuda(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Descripción (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Deuda administración anterior 2024"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Preview */}
          {unidadSeleccionada && Number(montoDeuda) > 0 && (
            <div className="bg-[#0D121F] border border-[#1E293B]/30 rounded-xl p-3.5 text-xs">
              <p className="text-slate-400">
                Se agregará una deuda de{" "}
                <span className="text-red-400 font-bold">
                  ${Number(montoDeuda).toLocaleString("es-CO")}
                </span>{" "}
                al Apto. <span className="text-white font-semibold">{unidadSeleccionada}</span>
                {apartamentos.find(a => a.unidad === unidadSeleccionada)?.propietario && (
                  <span className="text-slate-500"> ({apartamentos.find(a => a.unidad === unidadSeleccionada)?.propietario})</span>
                )}
              </p>
            </div>
          )}

          {/* Botón Guardar */}
          <button
            type="button"
            onClick={guardarDeuda}
            disabled={guardando}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 disabled:opacity-50 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full flex items-center justify-center gap-2"
          >
            {guardando ? "Guardando..." : "Agregar Deuda a Cartera"}
          </button>
        </div>
      </div>
    </div>
  )
}
