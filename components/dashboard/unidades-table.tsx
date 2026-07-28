"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Unidad } from "./nueva-unidad-modal"

interface UnidadesTableProps {
  unidades: Unidad[]
  adminMode: boolean
  onDelete: (index: number) => void
  onEdit: (index: number) => void
  onAdd: () => void
}

interface DetallePago {
  tienePendiente: boolean
  valorPendiente: number
  mesesVencidos: string[]
  carteraAnterior: number
  proyectosPendientes: string[]
  multasPendientes: string[]
}

export function UnidadesTable({ unidades, adminMode, onDelete, onEdit, onAdd }: UnidadesTableProps) {
  const [datosPago, setDatosPago] = useState<Record<string, DetallePago>>({})
  const [cargando, setCargando] = useState(true)

  const cargarDatosPago = async () => {
    try {
      // 1. Mensualidades pendientes
      const { data: mensualidadesData } = await supabase
        .from("mensualidades")
        .select("unidad, valor, mes, anio, estado")
        .eq("estado", "Pendiente")

      // 2. Cartera anterior
      const { data: carteraData } = await supabase
        .from("cartera")
        .select("unidad, deuda")

      // 3. Proyectos pendientes
      const { data: proyectosData } = await supabase
        .from("portafolio_proyectos")
        .select("unidad, proyecto, valor, estado")
        .eq("estado", "Pendiente")

      // 4. Multas pendientes
      const { data: multasData } = await supabase
        .from("portafolio_multas")
        .select("unidad, tipo_multa, valor, estado")
        .in("estado", ["Pendiente", "Vencida"])

      const map: Record<string, DetallePago> = {}

      // Initialize defaults
      unidades.forEach((u) => {
        map[u.unidad] = {
          tienePendiente: false,
          valorPendiente: 0,
          mesesVencidos: [],
          carteraAnterior: 0,
          proyectosPendientes: [],
          multasPendientes: []
        }
      })

      // Apply cartera anterior
      if (carteraData) {
        carteraData.forEach((c) => {
          const deudaNum = Number(c.deuda) || 0
          if (deudaNum > 0) {
            const current = map[c.unidad] || { tienePendiente: false, valorPendiente: 0, mesesVencidos: [], carteraAnterior: 0, proyectosPendientes: [], multasPendientes: [] }
            map[c.unidad] = {
              ...current,
              tienePendiente: true,
              valorPendiente: current.valorPendiente + deudaNum,
              carteraAnterior: deudaNum
            }
          }
        })
      }

      // Apply mensualidades pendientes
      if (mensualidadesData) {
        mensualidadesData.forEach((m) => {
          const current = map[m.unidad] || { tienePendiente: false, valorPendiente: 0, mesesVencidos: [], carteraAnterior: 0, proyectosPendientes: [], multasPendientes: [] }
          const valorNum = Number(m.valor) || 20000
          map[m.unidad] = {
            ...current,
            tienePendiente: true,
            valorPendiente: current.valorPendiente + valorNum,
            mesesVencidos: [...current.mesesVencidos, `${m.mes}`]
          }
        })
      }

      // Apply proyectos pendientes
      if (proyectosData) {
        proyectosData.forEach((p) => {
          const current = map[p.unidad] || { tienePendiente: false, valorPendiente: 0, mesesVencidos: [], carteraAnterior: 0, proyectosPendientes: [], multasPendientes: [] }
          const valorNum = Number(p.valor) || 0
          map[p.unidad] = {
            ...current,
            tienePendiente: true,
            valorPendiente: current.valorPendiente + valorNum,
            proyectosPendientes: [...current.proyectosPendientes, p.proyecto]
          }
        })
      }

      // Apply multas pendientes
      if (multasData) {
        multasData.forEach((m) => {
          const current = map[m.unidad] || { tienePendiente: false, valorPendiente: 0, mesesVencidos: [], carteraAnterior: 0, proyectosPendientes: [], multasPendientes: [] }
          const valorNum = Number(m.valor) || 0
          map[m.unidad] = {
            ...current,
            tienePendiente: true,
            valorPendiente: current.valorPendiente + valorNum,
            multasPendientes: [...current.multasPendientes, m.tipo_multa]
          }
        })
      }

      setDatosPago(map)
    } catch (err) {
      console.error("Error al cargar estados de pago:", err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatosPago()

    // Realtime listeners to update card status automatically when payment is recorded!
    const channelMensualidades = supabase
      .channel("realtime-unidades-mensualidades")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensualidades" },
        () => cargarDatosPago()
      )
      .subscribe()

    const channelCartera = supabase
      .channel("realtime-unidades-cartera")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cartera" },
        () => cargarDatosPago()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelMensualidades)
      supabase.removeChannel(channelCartera)
    }
  }, [unidades])

  // Group by Piso (Floor)
  const pisosGrouped = unidades.reduce((acc: any, curr: any) => {
    const p = curr.piso || 1
    if (!acc[p]) acc[p] = []
    acc[p].push(curr)
    return acc
  }, {})

  // Sort floors ascending
  const sortedPisos = Object.keys(pisosGrouped).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white animate-[fadeIn_0.5s_ease-out]">
      
      {/* FLOORS GRID */}
      <div className="space-y-8">
        {unidades.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-12 border border-dashed border-[#1E293B]/40 rounded-2xl">
            No hay unidades registradas
          </div>
        ) : (
          sortedPisos.map((piso) => (
            <div key={piso} className="space-y-4">
              {/* Piso Title */}
              <div className="border-l-2 border-indigo-500 pl-3 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-200 tracking-wider">
                  Piso {piso}
                </span>
              </div>

              {/* Apartments Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pisosGrouped[piso].map((unidad: any) => {
                  const idx = unidades.findIndex((u) => u.unidad === unidad.unidad)
                  const infoPago = datosPago[unidad.unidad] || { tienePendiente: false, valorPendiente: 0 }

                  return (
                    <div
                      key={unidad.unidad}
                      onClick={() => {
                        if (!adminMode) {
                          onEdit(idx)
                        }
                      }}
                      className="bg-[#0B0F19]/90 border border-[#1E293B]/30 hover:border-[#1E293B] rounded-2xl p-5 relative hover:bg-[#1E293B]/25 hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between min-h-[140px] cursor-pointer"
                    >
                      {/* CARD HEADER */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-extrabold text-white leading-none">
                            {unidad.unidad}
                          </h3>
                        </div>

                        {/* Top Right Status Dot or Admin Actions */}
                        {adminMode ? (
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onEdit(idx)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(idx)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                infoPago.tienePendiente
                                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                                  : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* CARD MIDDLE */}
                      <div className="mt-3 space-y-1.5">
                        <div className="text-xs text-slate-400 truncate">
                          Propietario: <span className="text-slate-200 capitalize font-medium">{unidad.propietario}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Tel: <span className="text-slate-400 font-medium">{unidad.telefono || "Sin teléfono"}</span>
                        </div>

                        {/* CONCEPT BADGES */}
                        {infoPago.tienePendiente && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {infoPago.mesesVencidos.length > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Cuotas ({infoPago.mesesVencidos.join(", ")})
                              </span>
                            )}
                            {infoPago.carteraAnterior > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Cartera (${infoPago.carteraAnterior.toLocaleString("es-CO")})
                              </span>
                            )}
                            {infoPago.proyectosPendientes.length > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Proy ({infoPago.proyectosPendientes.join(", ")})
                              </span>
                            )}
                            {infoPago.multasPendientes.length > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Multa ({infoPago.multasPendientes.join(", ")})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* CARD FOOTER */}
                      <div className="mt-4 pt-3 border-t border-[#1E293B]/20 flex justify-between items-center text-xs">
                        <span
                          className={`font-semibold ${
                            infoPago.tienePendiente ? "text-amber-500" : "text-emerald-400"
                          }`}
                        >
                          {infoPago.tienePendiente ? "Deuda Pendiente" : "Al día"}
                        </span>
                        <span className={`font-extrabold text-[12px] ${infoPago.tienePendiente ? "text-rose-400" : "text-emerald-400"}`}>
                          $ {infoPago.valorPendiente.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
