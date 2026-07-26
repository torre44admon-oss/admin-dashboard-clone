"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { X } from "lucide-react"
interface Props {
  isOpen: boolean
  onClose: () => void
}

interface Proyecto {
  id: number
  t: string
  p: string
}
interface Unidad {
  unidad: string
  propietario: string
}

export function AsignarProyectoModal({
  isOpen,
  onClose,
}: Props) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("")
  const [unidades, setUnidades] = useState<Unidad[]>([])
const [tipo, setTipo] = useState("todos")
const [unidadSeleccionada, setUnidadSeleccionada] = useState("")

  const cargarProyectos = async () => {
    const { data, error } = await supabase
      .from("proyectos")
      .select("id, t, p")
      .order("t")

    if (error) {
      console.error(error)
      return
    }

    setProyectos(data || [])
  }
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
const asignarProyecto = async () => {
  if (!proyectoSeleccionado) {
    toast.warning("Seleccione un proyecto")
    return
  }

  const proyecto = proyectos.find(
    (p) => String(p.id) === proyectoSeleccionado
  )

  if (!proyecto) return

  const fecha = new Date()
    .toISOString()
    .split("T")[0]

  const valor = Number(
    String(proyecto.p).replace(/[^0-9]/g, "")
  )

  if (tipo === "todos") {

    const registros = unidades.map((u) => ({
      fecha,
      unidad: u.unidad,
      propietario: u.propietario,
      proyecto: proyecto.t,
      valor,
      estado: "Pendiente",
    }))

    const { error } = await supabase
      .from("proyectos_asignados")
      .insert(registros)

    if (error) {
      console.error(error)
      toast.error("Error al asignar proyecto")
      return
    }

    const { error: errorPortafolio } =
      await supabase
        .from("portafolio_proyectos")
        .insert(registros)

    if (errorPortafolio) {
      console.error(errorPortafolio)
    }

    toast.success("Proyecto asignado a todos")
    window.dispatchEvent(new Event("datosActualizados"))
    onClose()
    return
  }

  if (!unidadSeleccionada) {
    toast.warning("Seleccione una unidad")
    return
  }

  const unidad = unidades.find(
    (u) => u.unidad === unidadSeleccionada
  )

  if (!unidad) return

  // VERIFICAR DUPLICADOS
  const { data: existente } = await supabase
    .from("portafolio_proyectos")
    .select("id")
    .eq("unidad", unidad.unidad)
    .eq("proyecto", proyecto.t)
    .limit(1)

  if (existente && existente.length > 0) {
    toast.error(`La unidad Apt. ${unidad.unidad} ya tiene asignado el proyecto "${proyecto.t}".`)
    return
  }

  const registro = {
    fecha,
    unidad: unidad.unidad,
    propietario: unidad.propietario,
    proyecto: proyecto.t,
    valor,
    estado: "Pendiente",
  }

  const { error } = await supabase
    .from("proyectos_asignados")
    .insert([registro])

  if (error) {
    console.error(error)
    toast.error("Error al asignar proyecto")
    return
  }

  const { error: errorPortafolio } =
    await supabase
      .from("portafolio_proyectos")
      .insert([registro])

  if (errorPortafolio) {
    console.error(errorPortafolio)
  }

  toast.success("Proyecto asignado correctamente")
  window.dispatchEvent(new Event("datosActualizados"))
  onClose()
}
  useEffect(() => {
    if (isOpen) {
  cargarProyectos()
  cargarUnidades()
}
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out] p-4">
      <div className="bg-[#131926] border border-[#1E293B]/60 w-full max-w-[500px] rounded-2xl shadow-2xl p-6 text-white">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Asignar Proyecto
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Proyecto
            </label>

            <select
              value={proyectoSeleccionado}
              onChange={(e) =>
                setProyectoSeleccionado(e.target.value)
              }
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="" className="bg-[#131926] text-white">
                Seleccionar
              </option>

              {proyectos.map((proyecto) => (
                <option
                  key={proyecto.id}
                  value={proyecto.id}
                  className="bg-[#131926] text-white"
                >
                  {proyecto.t} - {proyecto.p}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Tipo de asignación
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  checked={tipo === "todos"}
                  onChange={() => setTipo("todos")}
                  className="accent-[#5046e6]"
                />
                Todos los propietarios
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  checked={tipo === "uno"}
                  onChange={() => setTipo("uno")}
                  className="accent-[#5046e6]"
                />
                Propietario específico
              </label>
            </div>
          </div>

          {tipo === "uno" && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Apartamento / Propietario
              </label>

              <select
                value={unidadSeleccionada}
                onChange={(e) =>
                  setUnidadSeleccionada(e.target.value)
                }
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
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1E293B]/60 border border-[#1E293B]/80 text-slate-300 hover:text-white hover:bg-[#1E293B] rounded-xl text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={asignarProyecto}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5046e6] to-[#0ea5e9] text-white rounded-xl text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  )
}