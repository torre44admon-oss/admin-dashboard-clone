"use client"

import { useState } from "react"
import { FileText, Save, Send, Plus } from "lucide-react"

interface Apartamento {
  unidad: string
  piso: number
  propietario: string
  telefono: string
  email: string
}

interface LineaCobro {
  id: number
  concepto: string
  monto: number
}

interface AvisosCobroContentProps {
  apartamentos: Apartamento[]
}

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

export function AvisosCobroContent({ apartamentos }: AvisosCobroContentProps) {
  const [mesSeleccionado, setMesSeleccionado] = useState("Mayo")
  const [anioSeleccionado, setAnioSeleccionado] = useState("2026")
  const [apartamentoSeleccionado, setApartamentoSeleccionado] = useState("")
  const [lineasCobro, setLineasCobro] = useState<LineaCobro[]>([
    { id: 1, concepto: "Cuota Administrativa", monto: 20000 }
  ])

  const apartamentoActual = apartamentos.find(a => a.unidad === apartamentoSeleccionado)

  const total = lineasCobro.reduce((acc, linea) => acc + linea.monto, 0)

  const handleAgregarLinea = () => {
    const nuevoId = Math.max(...lineasCobro.map(l => l.id), 0) + 1
    setLineasCobro([...lineasCobro, { id: nuevoId, concepto: "Nueva línea", monto: 0 }])
  }

  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-CO')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-8 h-8 text-[#4a5568]" />
        <h1 className="text-3xl font-bold text-gray-900">Avisos de Cobro</h1>
      </div>
      <p className="text-gray-500 mb-8">Genera el estado de cuenta mensual por apartamento</p>

      {/* Filtros Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-6">
          {/* Periodo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Periodo
            </label>
            <div className="flex gap-2">
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[120px]"
              >
                {meses.map((mes) => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[100px]"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Apartamento */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Apartamento
            </label>
            <select
              value={apartamentoSeleccionado}
              onChange={(e) => setApartamentoSeleccionado(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Seleccione un apartamento...</option>
              {apartamentos.map((apt) => (
                <option key={apt.unidad} value={apt.unidad}>
                  Apto. {apt.unidad} — {apt.propietario}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!apartamentoSeleccionado && (
        <div className="flex flex-col items-center justify-center py-24">
          <FileText className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">
            Seleccione un apartamento para generar el aviso de cobro
          </p>
        </div>
      )}

      {/* Aviso de Cobro - cuando hay apartamento seleccionado */}
      {apartamentoSeleccionado && apartamentoActual && (
        <>
          {/* Aviso Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header del Aviso */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">TORRE 44</p>
                  <h2 className="text-xl font-bold text-gray-900">Aviso de Cobro</h2>
                  <p className="text-gray-500 text-sm">{mesSeleccionado} {anioSeleccionado}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Send className="w-4 h-4" />
                    Guardar y Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Info del Apartamento */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">APARTAMENTO</p>
                  <p className="text-lg font-semibold text-gray-900">{apartamentoActual.unidad}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">PROPIETARIO</p>
                  <p className="text-lg font-semibold text-gray-900">{apartamentoActual.propietario}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">TELÉFONO</p>
                  <p className="text-gray-700">{apartamentoActual.telefono}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">EMAIL</p>
                  <p className="text-gray-700">{apartamentoActual.email}</p>
                </div>
              </div>
            </div>

            {/* Cuota Administrativa */}
            <div className="p-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">CUOTA ADMINISTRATIVA</p>
              
              {lineasCobro.map((linea) => (
                <div key={linea.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                  <span className="text-gray-700">
                    {linea.concepto} — {mesSeleccionado} {anioSeleccionado}
                  </span>
                  <span className="font-semibold text-gray-900">$ {formatearMonto(linea.monto)}</span>
                </div>
              ))}

              <button
                onClick={handleAgregarLinea}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 mt-2"
              >
                <Plus className="w-4 h-4" />
                Agregar linea
              </button>
            </div>

            {/* Total */}
            <div className="p-6 border-b border-gray-100">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Total a Pagar</h3>
                  <p className="text-sm text-gray-500">{mesSeleccionado} {anioSeleccionado}</p>
                </div>
                <span className="text-3xl font-bold text-teal-600">$ {formatearMonto(total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">
                Por favor realizar el pago a mas tardar el ultimo dia del mes. Para cualquier consulta contacte a la administracion.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
