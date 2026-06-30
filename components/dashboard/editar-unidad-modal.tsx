"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Unidad } from "./nueva-unidad-modal"

interface EditarUnidadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (unidad: Unidad) => void
  unidad: Unidad | null
}

export function EditarUnidadModal({ isOpen, onClose, onSave, unidad }: EditarUnidadModalProps) {
  const [formData, setFormData] = useState<Unidad>({
    unidad: "",
    piso: 0,
    propietario: "",
    telefono: "",
    email: "",
  })

  useEffect(() => {
    if (unidad) {
      setFormData(unidad)
    }
  }, [unidad])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "piso" ? (value === "" ? 0 : parseInt(value)) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#131926] border border-[#1E293B]/60 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Editar Unidad</h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número / Apartamento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Número / Apartamento
            </label>
            <input
              type="text"
              name="unidad"
              value={formData.unidad}
              onChange={handleChange}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          {/* Piso */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Piso
            </label>
            <input
              type="number"
              name="piso"
              value={formData.piso || ""}
              onChange={handleChange}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Propietario / Residente */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Propietario / Residente
            </label>
            <input
              type="text"
              name="propietario"
              value={formData.propietario}
              onChange={handleChange}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] mt-6 cursor-pointer"
          >
            Actualizar Unidad
          </button>
        </form>
      </div>
    </div>
  )
}
