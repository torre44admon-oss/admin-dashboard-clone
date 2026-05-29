"use client"

import { useState } from "react"
import { FileText, Layers, Search, Clock, Trash2 } from "lucide-react"

interface Unidad {
  id: number
  unidad: string
  piso: string
  propietario: string
  telefono: string
  email: string
}

interface Cobro {
  id: number
  unidadId: number
  monto: number
  estado: "pendiente" | "pagado"
  mes: string
  año: string
}

interface CobrosContentProps {
  unidades: Unidad[]
}

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function CobrosContent({ unidades }: CobrosContentProps) {
  const mesActual = new Date().getMonth()
  const añoActual = new Date().getFullYear().toString()
  
  const [mesSeleccionado, setMesSeleccionado] = useState(meses[mesActual])
  const [añoSeleccionado, setAñoSeleccionado] = useState(añoActual)
  const [busqueda, setBusqueda] = useState("")
  
  const [cobros, setCobros] = useState<Cobro[]>(() => 
    unidades.map((unidad, index) => ({
      id: index + 1,
      unidadId: unidad.id,
      monto: 20000,
      estado: "pendiente" as const,
      mes: meses[mesActual],
      año: añoActual
    }))
  )

  const formatearMonto = (monto: number) => {
    return monto.toLocaleString("es-CO")
  }

  const handleMarcarPagado = (cobroId: number) => {
    setCobros(cobros.map(cobro => 
      cobro.id === cobroId ? { ...cobro, estado: "pagado" as const } : cobro
    ))
  }

  const handleEliminar = (cobroId: number) => {
    setCobros(cobros.filter(cobro => cobro.id !== cobroId))
  }

  const cobrosDelMes = cobros.filter(
    cobro => cobro.mes === mesSeleccionado && cobro.año === añoSeleccionado
  )

  const cobrosFiltrados = cobrosDelMes.filter(cobro => {
    const unidad = unidades.find(u => u.id === cobro.unidadId)
    if (!unidad) return false
    const termino = busqueda.toLowerCase()
    return (
      unidad.unidad.toLowerCase().includes(termino) ||
      unidad.propietario.toLowerCase().includes(termino)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cobros</h1>
          <p className="text-gray-500 mt-1">Gestión de cuotas de mantenimiento</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
            <FileText className="w-4 h-4" />
            Imprimir PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#15293f]">
            <Layers className="w-4 h-4" />
            Generar Masivo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">Filtros:</span>
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {meses.map(mes => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>
          <input
            type="text"
            value={añoSeleccionado}
            onChange={(e) => setAñoSeleccionado(e.target.value)}
            className="w-24 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar apartamento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Unidad</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Propietario</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Monto</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cobrosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay cobros registrados para este período
                </td>
              </tr>
            ) : (
              cobrosFiltrados.map(cobro => {
                const unidad = unidades.find(u => u.id === cobro.unidadId)
                if (!unidad) return null
                return (
                  <tr key={cobro.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">Apto. {unidad.unidad}</td>
                    <td className="px-6 py-4 text-gray-600">{unidad.propietario}</td>
                    <td className="px-6 py-4 text-gray-800">$ {formatearMonto(cobro.monto)}</td>
                    <td className="px-6 py-4">
                      {cobro.estado === "pendiente" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          Pagado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {cobro.estado === "pendiente" && (
                          <button
                            onClick={() => handleMarcarPagado(cobro.id)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Marcar Pagado
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminar(cobro.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
