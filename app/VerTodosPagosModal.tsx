"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"

interface Pago {
  unidad: string
  monto: number
  fecha: string
  concepto: string
}

interface Unidad {
  unidad: string
  propietario: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  pagos: Pago[]
  apartamentos: Unidad[]
}

export function VerTodosPagosModal({
  isOpen,
  onClose,
  pagos,
  apartamentos,
}: Props) {
  const [buscarTexto, setBuscarTexto] = useState("")

  if (!isOpen) return null

  const formatearFecha = (rawDate?: string) => {
    if (!rawDate) return ""
    const parts = rawDate.split("-")
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return rawDate
  }

  const pagosFiltrados = pagos.filter((pago) => {
    const apto = apartamentos.find((a) => a.unidad === pago.unidad)
    const residente = apto ? apto.propietario : "Desconocido"
    const busqueda = buscarTexto.toLowerCase()

    return (
      pago.unidad.toLowerCase().includes(busqueda) ||
      residente.toLowerCase().includes(busqueda) ||
      pago.concepto.toLowerCase().includes(busqueda)
    )
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out] p-4">
      <div className="bg-[#131926] border border-[#1E293B]/60 w-full max-w-2xl rounded-2xl shadow-2xl p-6 text-white flex flex-col max-h-[85vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Todos los Pagos Registrados
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historial completo de pagos recibidos
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por departamento, residente o concepto..."
            value={buscarTexto}
            onChange={(e) => setBuscarTexto(e.target.value)}
            className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* TABLE CONTAINER */}
        <div className="overflow-x-auto -mx-6 px-6 flex-1 min-h-0 flex flex-col">
          <div className="min-w-[550px] flex-1 flex flex-col min-h-0">
            {/* TABLE HEADERS */}
            <div className="bg-[#1E293B]/30 rounded-xl text-slate-400 text-xs font-semibold px-4 py-3 grid grid-cols-5 text-center mb-2">
              <div>Depto</div>
              <div>Residente</div>
              <div>Concepto</div>
              <div>Monto</div>
              <div>Fecha</div>
            </div>

            {/* TABLE BODY (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0 divide-y divide-[#1E293B]/30">
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((pago, index) => {
                  const apto = apartamentos.find((a) => a.unidad === pago.unidad)
                  const residente = apto ? apto.propietario : "Desconocido"

                  let badgeColor = "text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20"
                  if (pago.concepto.startsWith("Multa:")) {
                    badgeColor = "text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20"
                  } else if (pago.concepto.startsWith("Proyecto:")) {
                    badgeColor = "text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20"
                  }

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-5 text-center text-xs py-3 px-2 hover:bg-[#1E293B]/20 transition-all items-center text-slate-200"
                    >
                      <div className="font-semibold text-white">Apto. {pago.unidad}</div>
                      <div className="truncate capitalize text-slate-300">{residente}</div>
                      <div className="flex justify-center">
                        <span className={`text-[10px] font-bold ${badgeColor} max-w-[125px] truncate`}>
                          {pago.concepto}
                        </span>
                      </div>
                      <div className="font-bold text-emerald-400">
                        $ {Number(pago.monto).toLocaleString("es-CO")}
                      </div>
                      <div className="text-slate-400">{formatearFecha(pago.fecha)}</div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-slate-500 text-sm py-12">
                  No se encontraron pagos registrados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-4 border-t border-[#1E293B]/40 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1E293B]/60 border border-[#1E293B]/80 text-slate-300 hover:text-white hover:bg-[#1E293B] rounded-xl text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  )
}
