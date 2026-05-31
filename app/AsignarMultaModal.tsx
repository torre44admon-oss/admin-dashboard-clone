"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface Unidad {
  unidad: string
  propietario: string
}

interface Multa {
  id: number
  t: string
  m: string
}

export function AsignarMultaModal({
  isOpen,
  onClose,
}: Props) {
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [multas, setMultas] = useState<Multa[]>([])
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("")
  const [multaSeleccionada, setMultaSeleccionada] = useState("")

  useEffect(() => {
    if (isOpen) {
      cargarUnidades()
      cargarMultas()
    }
  }, [isOpen])

  const cargarUnidades = async () => {
    const { data, error } = await supabase
      .from("unidades")
      .select("unidad, propietario")
      .order("unidad")

    if (error) {
      console.error(error)
      return
    }

    setUnidades(data || [])
  }

  const cargarMultas = async () => {
    const { data, error } = await supabase
      .from("multas")
      .select("id, t, m")
      .order("t")

    if (error) {
      console.error(error)
      return
    }

    setMultas(data || [])
  }
const asignarMulta = async () => {
  if (!unidadSeleccionada || !multaSeleccionada) {
    alert("Seleccione apartamento y multa")
    return
  }

  const unidad = unidades.find(
    (u) => u.unidad === unidadSeleccionada
  )

  const multa = multas.find(
    (m) => String(m.id) === multaSeleccionada
  )

  if (!unidad || !multa) return

  const { error } = await supabase
    .from("multas_asignadas")
    .insert([
      {
        unidad: unidad.unidad,
        propietario: unidad.propietario,
        multa_id: multa.id,
        tipo_multa: multa.t,
        valor: multa.m,
        fecha: new Date().toISOString().split("T")[0],
        estado: "Pendiente",
      },
    ])

  if (error) {
    console.error(error)
    alert("Error al asignar multa")
    return
  }

  alert("Multa asignada correctamente")
  onClose()
}
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-6">
          Asignar Multa
        </h2>

        <div className="space-y-4">

          {/* Apartamento */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Apartamento / Propietario
            </label>

            <select
  value={unidadSeleccionada}
  onChange={(e) => setUnidadSeleccionada(e.target.value)}
  className="w-full border rounded-lg px-3 py-2"
>
              <option value="">
                Seleccionar
              </option>

              {unidades.map((u) => (
                <option
                  key={u.unidad}
                  value={u.unidad}
                >
                  {u.unidad} - {u.propietario}
                </option>
              ))}
            </select>
          </div>

          {/* Multa */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Multa
            </label>

            <select
  value={multaSeleccionada}
  onChange={(e) => setMultaSeleccionada(e.target.value)}
  className="w-full border rounded-lg px-3 py-2"
>
              <option value="">
                Seleccionar
              </option>

              {multas.map((multa) => (
                <option
                  key={multa.id}
                  value={multa.id}
                >
                  {multa.t} - {multa.m}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={asignarMulta}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  )
}