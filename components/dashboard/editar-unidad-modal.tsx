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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Editar Unidad</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-4">
            {/* Número / Apartamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Número / Apartamento
              </label>
              <input
                type="text"
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Piso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Piso
              </label>
              <input
                type="number"
                name="piso"
                value={formData.piso || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Propietario / Residente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Propietario / Residente
              </label>
              <input
                type="text"
                name="propietario"
                value={formData.propietario}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Correo electrónico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-[#2a4365] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#1e3a5f] transition-colors"
          >
            Actualizar
          </button>
        </form>
      </div>
    </div>
  )
}
