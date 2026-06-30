"use client"

import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { X } from "lucide-react"

export interface Unidad {
  unidad: string
  piso: number | string
  propietario: string
  telefono: string
  email: string
}

interface NuevaUnidadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (unidad: Unidad) => void
}

export function NuevaUnidadModal({
  isOpen,
  onClose,
  onSave,
}: NuevaUnidadModalProps) {

  const [formData, setFormData] = useState({
    unidad: "",
    piso: "",
    propietario: "",
    telefono: "",
    email: "",
  })

  if (!isOpen) return null

  const handleSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault()

  await supabase
    .from("unidades")
    .insert([
      {
        unidad: formData.unidad,
        piso: formData.piso || "-",
        propietario: formData.propietario,
        telefono: formData.telefono,
        email: formData.email || "",
      },
    ])

  onSave({
    unidad: formData.unidad,
    piso: formData.piso || "-",
    propietario: formData.propietario,
    telefono: formData.telefono,
    email: formData.email || "",
  })

  // LIMPIAR

  setFormData({
    unidad: "",
    piso: "",
    propietario: "",
    telefono: "",
    email: "",
  })

  onClose()
}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-[#131926] border border-[#1E293B]/60 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white">
        {/* BOTON CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TITULO */}
        <h2 className="text-xl font-bold text-white mb-6">
          Registrar Nueva Unidad
        </h2>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* APARTAMENTO */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Número / Apartamento
            </label>
            <input
              type="text"
              placeholder="Ej: 4A"
              value={formData.unidad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unidad: e.target.value
                })
              }
              required
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* PISO */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Piso (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: 1"
              value={formData.piso}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  piso: e.target.value
                })
              }
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* PROPIETARIO */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Propietario / Residente
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.propietario}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  propietario: e.target.value
                })
              }
              required
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* TELEFONO */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              placeholder="Ej: 3014130109"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telefono: e.target.value
                })
              }
              required
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* EMAIL OPCIONAL */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Correo electrónico (opcional)
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
              }
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* BOTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] mt-4 cursor-pointer"
          >
            Guardar Unidad
          </button>
        </form>
      </div>
    </div>
  )
}