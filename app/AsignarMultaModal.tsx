"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { X } from "lucide-react"

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
  d: string
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
    .select("id, t, d, m")
    .order("t")

  if (error) {
    console.error(error)
    return
  }

  setMultas(data || [])
}

const asignarMulta = async () => {
  if (!unidadSeleccionada || !multaSeleccionada) {
    toast.warning("Seleccione apartamento y multa")
  }

  const unidad = unidades.find(
    (u) => u.unidad === unidadSeleccionada
  )

  const multa = multas.find(
    (m) => String(m.id) === multaSeleccionada
  )

  if (!unidad || !multa) return

  const fechaAsignacion = new Date()
const fechaVencimiento = new Date()

fechaVencimiento.setDate(
  fechaVencimiento.getDate() + 15
)
const valorNumerico = Number(
  String(multa.m).replace(/[^0-9]/g, "")
)

console.log("VALOR:", valorNumerico)
const registroMulta = {
  unidad: unidad.unidad,
  propietario: unidad.propietario,
  multa_id: multa.id,
  tipo_multa: multa.t,
  descripcion: multa.d,
  valor: valorNumerico,
  fecha_asignacion: fechaAsignacion
    .toISOString()
    .split("T")[0],
  fecha_vencimiento: fechaVencimiento
    .toISOString()
    .split("T")[0],
  estado: "Pendiente",
}

const { error } = await supabase
  .from("multas_asignadas")
  .insert([registroMulta])

if (error) {
  console.error(error)
  toast.error("Error al guardar en multas asignadas")
}

const { error: errorPortafolio } = await supabase
  .from("portafolio_multas")
  .insert([registroMulta])

if (errorPortafolio) {
  console.error(errorPortafolio)
  toast.error("Error al guardar en portafolio")
}

toast.success("Multa asignada correctamente")
onClose()

}
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#131926] border border-[#1E293B]/60 w-[500px] rounded-2xl shadow-2xl p-6 text-white">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Asignar Multa
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Apartamento */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Apartamento / Propietario
            </label>

            <select
              value={unidadSeleccionada}
              onChange={(e) => setUnidadSeleccionada(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="" className="bg-[#131926] text-white">
                Seleccionar
              </option>

              {unidades.map((u) => (
                <option
                  key={u.unidad}
                  value={u.unidad}
                  className="bg-[#131926] text-white"
                >
                  {u.unidad} - {u.propietario}
                </option>
              ))}
            </select>
          </div>

          {/* Multa */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Multa
            </label>

            <select
              value={multaSeleccionada}
              onChange={(e) => setMultaSeleccionada(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="" className="bg-[#131926] text-white">
                Seleccionar
              </option>

              {multas.map((multa) => (
                <option
                  key={multa.id}
                  value={multa.id}
                  className="bg-[#131926] text-white"
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
            className="px-5 py-2.5 bg-[#1E293B]/60 border border-[#1E293B]/80 text-slate-300 hover:text-white hover:bg-[#1E293B] rounded-xl text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={asignarMulta}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5046e6] to-[#0ea5e9] text-white rounded-xl text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  )
}