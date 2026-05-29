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

    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* OVERLAY */}

      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* MODAL */}

      <div
        className="
          relative
          bg-white
          rounded-xl
          shadow-xl
          w-full
          max-w-md
          mx-4
          p-6
        "
      >

        {/* BOTON CERRAR */}

        <button
          onClick={onClose}
          className="
            absolute
            top-4
            right-4
            p-1
            hover:bg-gray-100
            rounded
            transition-colors
          "
        >

          <X className="w-5 h-5 text-gray-500" />

        </button>

        {/* TITULO */}

        <h2
          className="
            text-xl
            font-semibold
            text-gray-900
            mb-6
          "
        >
          Registrar Nueva Unidad
        </h2>

        {/* FORMULARIO */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* APARTAMENTO */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
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
              className="
                w-full
                px-4
                py-2.5
                border
                border-gray-300
                rounded-lg
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
              "
            />

          </div>

          {/* PISO */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
              Piso (opcional)
            </label>

            <input
              type="text"
              value={formData.piso}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  piso: e.target.value
                })
              }
              className="
                w-full
                px-4
                py-2.5
                border
                border-gray-300
                rounded-lg
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
              "
            />

          </div>

          {/* PROPIETARIO */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
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
              className="
                w-full
                px-4
                py-2.5
                border
                border-gray-300
                rounded-lg
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
              "
            />

          </div>

          {/* TELEFONO */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
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
              className="
                w-full
                px-4
                py-2.5
                border
                border-gray-300
                rounded-lg
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
              "
            />

          </div>

          {/* EMAIL OPCIONAL */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              "
            >
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
              className="
                w-full
                px-4
                py-2.5
                border
                border-gray-300
                rounded-lg
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
              "
            />

          </div>

          {/* BOTON */}

          <button
            type="submit"
            className="
              w-full
              bg-[#06122B]
              text-white
              py-3
              rounded-lg
              font-medium
              text-sm
              hover:bg-[#0a1c3d]
              transition-colors
              mt-2
            "
          >
            Guardar
          </button>

        </form>

      </div>

    </div>
  )
}