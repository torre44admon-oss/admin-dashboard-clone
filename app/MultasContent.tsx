"use client"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { NuevaMultaModal } from "./NuevaMultaModal"
import { toast } from "sonner"

interface Multa {
  id?: number
  t: string
  m: string
  d: string
}

interface RegistroPortafolio {
  fecha: string
  unidad: string
  propietario: string
  Estado: string
  cargo: string
  total: string
}

export function MultasContent() {
  const [activeTab, setActiveTab] = useState<"multas" | "asignacion" | "portafolio">("multas")
  const [isMultaModalOpen, setIsMultaModalOpen] = useState(false)
  const [multas, setMultas] = useState<Multa[]>([])
  const [registrosPortafolio, setRegistrosPortafolio] = useState<RegistroPortafolio[]>([])
  const [multasAsignadas, setMultasAsignadas] = useState<any[]>([])
  const [portafolioMultas, setPortafolioMultas] = useState<any[]>([])
  const [buscarTexto, setBuscarTexto] = useState("")
  const [apartamentoAbierto, setApartamentoAbierto] = useState<string | null>(null)

  useEffect(() => {
    const iniciar = async () => {
      await verificarMultasVencidas()
      await cargarMultas()
      await cargarMultasAsignadas()
      await cargarPortafolioMultas()
    }
    iniciar()
  }, [])

  const cargarMultas = async () => {
    const { data, error } = await supabase.from("multas").select("*").order("id")
    if (error) { console.error(error); return }
    setMultas(data || [])
  }

  const cargarMultasAsignadas = async () => {
    const { data, error } = await supabase
      .from("multas_asignadas")
      .select("*")
      .order("fecha_asignacion", { ascending: false })
    if (error) { console.error(error); return }
    setMultasAsignadas(data || [])
  }

  const cargarPortafolioMultas = async () => {
    const { data, error } = await supabase
      .from("portafolio_multas")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) { console.error(error); return }
    setPortafolioMultas(data || [])
  }

  const verificarMultasVencidas = async () => {
    const hoy = new Date().toISOString().split("T")[0]
    await supabase.from("multas_asignadas").update({ estado: "Vencida" }).lt("fecha_vencimiento", hoy).eq("estado", "Pendiente")
    await supabase.from("portafolio_multas").update({ estado: "Vencida" }).lt("fecha_vencimiento", hoy).eq("estado", "Pendiente")
  }

  const registrosFiltrados = multasAsignadas.filter((item) => {
    const busqueda = buscarTexto.toLowerCase()
    const coincideBusqueda =
      item.unidad?.toLowerCase().includes(busqueda) ||
      item.propietario?.toLowerCase().includes(busqueda)
    return coincideBusqueda && item.estado === "Pendiente"
  })

  const portafolioFiltrado = portafolioMultas.filter((item) => {
    const busqueda = buscarTexto.toLowerCase()
    return (
      item.unidad?.toLowerCase().includes(busqueda) ||
      item.propietario?.toLowerCase().includes(busqueda)
    )
  })

  const agrupados = portafolioFiltrado.reduce((acc: any, item: any) => {
    if (!acc[item.unidad]) acc[item.unidad] = []
    acc[item.unidad].push(item)
    return acc
  }, {})

  return (
    <div className="font-sans text-slate-200 animate-[fadeIn_0.4s_ease-out]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .seccion-tabla-imprimir, .seccion-tabla-imprimir * { visibility: visible; }
          .seccion-tabla-imprimir { position: absolute; left: 0; top: 0; width: 100%; border: none !important; shadow: none !important; }
          .no-imprimir-buscador { display: none !important; }
        }
      `}} />

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 clase-cabecera-ocultar-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Multas</h1>
          <p className="text-slate-400 text-sm mt-1">Catálogo de infracciones y recargos</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "portafolio" && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-4 h-[42px] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir PDF</span>
            </button>
          )}
          {activeTab === "multas" && (
            <button
              onClick={() => setIsMultaModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold h-[42px] px-5 rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> <span>Registrar Multa</span>
            </button>
          )}
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-1.5 mb-6 bg-[#131926]/90 p-1.5 rounded-xl border border-[#1E293B]/50 w-fit">
        {(["multas", "asignacion", "portafolio"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-[#1B2336] text-white shadow-sm border border-[#1E293B]/80"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "multas" ? "Multas" : tab === "asignacion" ? "Asignación" : "Portafolio"}
          </button>
        ))}
      </div>

      {activeTab === "multas" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {multas.map((m, idx) => (
            <div
              key={idx}
              className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-2xl shadow-xl p-5 flex flex-col justify-between min-h-[170px] hover:border-[#1E293B] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-white">{m.t}</h3>
                  <span className="font-extrabold text-red-400 text-sm">{m.m}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{m.d}</p>
              </div>
              <div className="flex justify-between items-center border-t border-[#1E293B]/20 pt-4 mt-3">
                <button className="flex items-center gap-1.5 border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  Editor
                </button>
                <button
                  onClick={async () => {
                    const multa = multas[idx] as any
                    if (!confirm("¿Eliminar esta multa del catálogo?")) return
                    if (multa.id) {
                      const { error } = await supabase.from("multas").delete().eq("id", multa.id)
                      if (error) { toast.error("Error al eliminar multa"); return }
                    }
                    await cargarMultas()
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "asignacion" ? (
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl overflow-hidden text-white animate-[fadeIn_0.3s_ease-out] seccion-tabla-imprimir">
          <div className="p-4 border-b border-[#1E293B]/40 flex items-center gap-3 bg-[#0B0F19]/40 no-imprimir-buscador">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Buscar:</span>
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por apartamento o nombre..."
                value={buscarTexto}
                onChange={(e) => setBuscarTexto(e.target.value)}
                className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#0B0F19]/40 border-b border-[#1E293B]/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Fecha Asignación</th>
                  <th className="px-6 py-3.5">Fecha Vencimiento</th>
                  <th className="px-6 py-3.5">Unidad</th>
                  <th className="px-6 py-3.5">Propietario</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5">Tipo Multa</th>
                  <th className="px-6 py-3.5">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/20">
                {registrosFiltrados.map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-slate-300">{item.fecha_asignacion}</td>
                    <td className="px-6 py-4 text-slate-300">{item.fecha_vencimiento}</td>
                    <td className="px-6 py-4 font-bold text-white">{item.unidad}</td>
                    <td className="px-6 py-4 text-slate-300 capitalize">{item.propietario}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.estado === "Pagado"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : (item.estado === "Vencida" || item.estado === "Cargada")
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {item.estado === "Cargada" ? "Vencida (Cartera)" : item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.tipo_multa}</td>
                    <td className="px-6 py-4 font-extrabold text-emerald-400">{item.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl overflow-hidden text-white animate-[fadeIn_0.3s_ease-out]">
          <div className="p-5 border-b border-[#1E293B]/40 bg-[#0B0F19]/40">
            <h2 className="text-lg font-bold text-white">Portafolio de Multas</h2>
          </div>
          <div className="p-4 border-b border-[#1E293B]/40 flex items-center gap-3 bg-[#0B0F19]/40">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Buscar:</span>
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar apartamento o propietario..."
                value={buscarTexto}
                onChange={(e) => setBuscarTexto(e.target.value)}
                className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(agrupados).map(([unidad, multasGrupo]: any) => {
              const propietario = multasGrupo[0]?.propietario || ""
              const abierto = apartamentoAbierto === unidad
              return (
                <div key={unidad} className="border border-[#1E293B]/30 rounded-2xl overflow-hidden bg-[#0B0F19]/60 hover:border-[#1E293B]/50 transition-all duration-200">
                  <button
                    onClick={() => setApartamentoAbierto(abierto ? null : unidad)}
                    className="w-full bg-[#0B0F19]/40 hover:bg-[#1E293B]/20 transition-all px-5 py-4 flex justify-between items-center text-white cursor-pointer"
                  >
                    <div className="text-left">
                      <h3 className="font-extrabold text-base text-white">Apto. {unidad}</h3>
                      <p className="text-xs text-slate-400 mt-1">Propietario: <span className="text-slate-200 capitalize font-medium">{propietario}</span></p>
                    </div>
                    {abierto ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {abierto && (
                    <div className="border-t border-[#1E293B]/20 p-4 bg-[#0B0F19]/20 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#1E293B]/40 bg-[#0B0F19]/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">Fecha Asignación</th>
                            <th className="px-4 py-3 text-left">Fecha Vencimiento</th>
                            <th className="px-4 py-3 text-left">Unidad</th>
                            <th className="px-4 py-3 text-left">Propietario</th>
                            <th className="px-4 py-3 text-left">Tipo Multa</th>
                            <th className="px-4 py-3 text-left">Estado</th>
                            <th className="px-4 py-3 text-left">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]/20">
                          {multasGrupo.map((multa: any) => (
                            <tr key={multa.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4 text-slate-300">{multa.fecha_asignacion}</td>
                              <td className="px-4 py-4 text-slate-300">{multa.fecha_vencimiento}</td>
                              <td className="px-4 py-4 font-bold text-white">{multa.unidad}</td>
                              <td className="px-4 py-4 text-slate-300 capitalize">{multa.propietario}</td>
                              <td className="px-4 py-4 text-slate-300">{multa.tipo_multa}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  multa.estado === "Pagado"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : (multa.estado === "Vencida" || multa.estado === "Cargada")
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                  {multa.estado === "Cargada" ? "Vencida (Cartera)" : multa.estado}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-extrabold text-emerald-400">
                                $ {Number(multa.valor).toLocaleString("es-CO")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <NuevaMultaModal
        isOpen={isMultaModalOpen}
        onClose={() => setIsMultaModalOpen(false)}
        onSave={async (nM) => {
          const { error } = await supabase.from("multas").insert([{ t: nM.t, d: nM.d, m: nM.m }])
          if (error) { toast.error("Error al guardar multa"); return }
          await cargarMultas()
          setIsMultaModalOpen(false)
        }}
      />
    </div>
  )
}
