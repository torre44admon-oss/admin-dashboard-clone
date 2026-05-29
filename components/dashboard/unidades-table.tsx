"use client"

import { Pencil, Trash2 } from "lucide-react"
import type { Unidad } from "./nueva-unidad-modal"

interface UnidadesTableProps {
  unidades: Unidad[]
  onDelete: (index: number) => void
  onEdit: (index: number) => void
}

export function UnidadesTable({ unidades, onDelete, onEdit }: UnidadesTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              Unidad
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              Piso
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              Propietario
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              Contacto
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {unidades.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                No hay unidades registradas
              </td>
            </tr>
          ) : (
            unidades.map((unidad, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-b-0">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {unidad.unidad}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {unidad.piso}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {unidad.propietario}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{unidad.telefono}</div>
                  <div className="text-sm text-gray-400">{unidad.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onEdit(index)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => onDelete(index)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
