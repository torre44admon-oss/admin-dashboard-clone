"use client"

import { useState } from "react"
import { Building2, AlertTriangle, Briefcase } from "lucide-react"
import { AsignarMultaModal } from "./AsignarMultaModal"

interface Props {
  totalUnidades: number
  totalMultas: number
  totalProyectos: number
}

export function ResumenContent({ totalUnidades, totalMultas, totalProyectos }: Props) {
  const [isAsignarMultaOpen, setIsAsignarMultaOpen] = useState(false)
  return (
    <div className="font-sans">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-red-500 tracking-tight">
  RESUMEN
</h1>
        <p className="text-[#64748b] text-[15px] mt-0.5">Estado actual del edificio y pendientes</p>
      </div>

      <div className="flex gap-4 mt-10 mb-8">
        <button
  type="button"
  onClick={() => setIsAsignarMultaOpen(true)}
  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm cursor-pointer"
>
  Asignar Multa
</button>

        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm cursor-pointer"
        >
          Asignar Proyecto
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tarjeta 1: Unidades */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#1e293b]">Unidades Totales</p>
              <h3 className="text-[28px] font-bold text-[#1e293b] mt-1">{totalUnidades}</h3>
            </div>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-[12px] text-[#64748b]">Apartamentos registrados</p>
        </div>

        {/* Tarjeta 2: Multas */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#1e293b]">Multas Pendientes</p>
              <h3 className="text-[28px] font-bold text-[#1e293b] mt-1">{totalMultas}</h3>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-[12px] text-[#64748b]">Catálogo activo</p>
        </div>

        {/* Tarjeta 3: Proyectos */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#1e293b]">Proyectos Activos</p>
              <h3 className="text-[28px] font-bold text-[#1e293b] mt-1">{totalProyectos}</h3>
            </div>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-[12px] text-[#64748b]">En progreso</p>
        </div>
      </div>

      <AsignarMultaModal
        isOpen={isAsignarMultaOpen}
        onClose={() => setIsAsignarMultaOpen(false)}
      />

    </div>
  )
}
