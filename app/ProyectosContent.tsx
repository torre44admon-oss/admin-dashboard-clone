"use client"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { NuevoProyectoModal } from "./NuevoProyectoModal"

interface Proyecto {
  id?: number
  t: string
  p: string
  d: string
  s: string
}
interface RegistroPortafolio {
  fecha: string
  unidad: string
  propietario: string
  proyecto: string
  valor: number
  estado: string
}

export function ProyectosContent() {
  const [activeProjTab, setActiveProjTab] = useState<
  "proyectos" | "asignados" | "portafolio"
>("proyectos")
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [registrosPortafolio, setRegistrosPortafolio] = useState<RegistroPortafolio[]>([])
  const [proyectosAsignados, setProyectosAsignados] = useState<any[]>([])
  const [buscarTexto, setBuscarTexto] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apartamentoAbierto, setApartamentoAbierto] =
  useState<string | null>(null)
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [totalApartamentos, setTotalApartamentos] = useState(0)
  const [todosLosAsignados, setTodosLosAsignados] = useState<any[]>([])
const cargarTodosLosAsignados = async () => {

  const { data } = await supabase
    .from("proyectos_asignados")
    .select("*")

  setTodosLosAsignados(data || [])
}
const cargarProyectos = async () => {

  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .order("id")

  if (error) {
    console.error(error)
    return
  }

  setProyectos(data || [])
}
const cargarProyectosAsignados = async () => {

  const { data, error } = await supabase
  .from("proyectos_asignados")
  .select("*")
  .eq("estado", "Pendiente")
  .order("id", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setProyectosAsignados(data || [])
}
const cargarTotalApartamentos = async () => {
  const { count, error } = await supabase
    .from("unidades")
    .select("*", {
      count: "exact",
      head: true,
    })

  if (error) {
    console.error(error)
    return
  }

  setTotalApartamentos(count || 0)
}
const cargarPortafolioProyectos = async () => {

  const { data, error } = await supabase
    .from("portafolio_proyectos")
    .select("*")
    .order("id", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setRegistrosPortafolio(data || [])
}
useEffect(() => {

  cargarProyectos()
  cargarPortafolioProyectos()
  cargarProyectosAsignados()
  cargarTotalApartamentos()
cargarTodosLosAsignados()
}, [activeProjTab])

  const saveProyectos = (n: Proyecto[]) => {
    setProyectos(n)
    localStorage.setItem("proyectos_db", JSON.stringify(n))
  }

  const savePortafolioH = (
  n: RegistroPortafolio[]
) => {
  setRegistrosPortafolio(n)
}

  const handleGuardarNuevoProyecto = async (
  nuevo: Proyecto
) => {

  const { error } = await supabase
    .from("proyectos")
    .insert([nuevo])

  if (error) {
    console.error(error)
    return
  }

  cargarProyectos()
}

  const registrosFiltrados = registrosPortafolio.filter((item) => {
  const busqueda = buscarTexto.toLowerCase()

  return (
    item.unidad.toLowerCase().includes(busqueda) ||
    item.propietario.toLowerCase().includes(busqueda)
  )
})
const agrupados = registrosFiltrados.reduce(
  (acc: any, item: any) => {

    if (!acc[item.unidad]) {
      acc[item.unidad] = []
    }

    acc[item.unidad].push(item)

    return acc
  },
  {}
)
  return (
    
    <div className="font-sans text-[#1e293b]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden !important; }
          .tabla-proyectos-print, .tabla-proyectos-print * { visibility: visible !important; }
          .tabla-proyectos-print { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print-buscador-proyectos, .no-imprimir-buscador { display: none !important; }
        }
      `}} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Proyectos</h1>
          <p className="text-slate-400 text-sm mt-1">Mantenimiento y mejoras del edificio</p>
        </div>
        <div className="flex items-center gap-3">
          {activeProjTab === "portafolio" && (
            <button 
              type="button" 
              onClick={() => window.print()} 
              className="flex items-center gap-2 border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-4 h-[42px] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir PDF</span>
            </button>
          )}
          {activeProjTab === "proyectos" && (
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold h-[42px] px-5 rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          )}
        </div>
      </div>

      {/* Selectores de Pestañas */}
      <div className="flex gap-1.5 mb-6 bg-[#131926]/90 p-1.5 rounded-xl border border-[#1E293B]/50 w-fit">
        <button 
          type="button" 
          onClick={() => setActiveProjTab("proyectos")} 
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeProjTab === "proyectos" 
              ? "bg-[#1B2336] text-white shadow-sm border border-[#1E293B]/80" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          Proyectos
        </button>
        <button
          type="button"
          onClick={() => setActiveProjTab("asignados")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeProjTab === "asignados"
              ? "bg-[#1B2336] text-white shadow-sm border border-[#1E293B]/80"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Asignados
        </button>
        <button 
          type="button" 
          onClick={() => setActiveProjTab("portafolio")} 
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeProjTab === "portafolio" 
              ? "bg-[#1B2336] text-white shadow-sm border border-[#1E293B]/80" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          Portafolio
        </button>
      </div>

      {activeProjTab === "proyectos" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((p, idx) => {
            const asignadosProyecto = todosLosAsignados.filter((a) => a.proyecto === p.t)
            const pendientes = asignadosProyecto.filter((a) => a.estado === "Pendiente").length
            const totalAsignados = asignadosProyecto.length
            
            let estadoMostrar = "PLANIFICADO"
            if (totalAsignados > 0) {
              estadoMostrar = "EN PROGRESO"
            }
            if (totalAsignados > 0 && pendientes === 0) {
              estadoMostrar = "COMPLETADO"
            }

            return (
              <div 
                key={idx} 
                className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-2xl shadow-xl p-5 flex flex-col justify-between min-h-[170px] hover:border-[#1E293B] transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-white tracking-tight">{p.t}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      estadoMostrar === "COMPLETADO" 
                        ? "text-emerald-400" 
                        : estadoMostrar === "EN PROGRESO" 
                        ? "text-amber-400" 
                        : "text-slate-400"
                    }`}>
                      {estadoMostrar}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 font-bold mb-1.5">
                    Por apartamento: <span className="text-white">${Number(String(p.p).replace(/[^0-9]/g, "")).toLocaleString("es-CO")}</span>
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {p.d}
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-[#1E293B]/20 pt-3 text-[11px] text-slate-400">
                    <p>Total apartamentos: <span className="font-semibold text-slate-200">{totalApartamentos}</span></p>
                    <p>Apartamentos pendientes: <span className="font-semibold text-slate-200">{pendientes}</span></p>
                    
                    <p className="font-bold text-emerald-400 text-xs mt-1">
                      Valor total: $
                      {(
                        Number(String(p.p).replace(/[^0-9]/g, "")) * totalApartamentos
                      ).toLocaleString("es-CO")}
                    </p>
                    <p className="font-bold text-amber-500 text-xs">
                      Valor pendiente: $
                      {(
                        Number(String(p.p).replace(/[^0-9]/g, "")) * pendientes
                      ).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end items-center border-t border-[#1E293B]/20 pt-3 mt-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("proyectos")
                        .delete()
                        .eq("id", (p as any).id)

                      if (error) {
                        console.error(error)
                        return
                      }
                      cargarProyectos()
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : activeProjTab === "asignados" ? (
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl overflow-hidden text-white animate-[fadeIn_0.3s_ease-out]">
          <div className="p-4 border-b border-[#1E293B]/40 bg-[#0B0F19]/40">
            <h2 className="text-base font-bold text-white">
              Proyectos Asignados
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0B0F19]/40 border-b border-[#1E293B]/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5 text-left">Fecha</th>
                  <th className="px-6 py-3.5 text-left">Unidad</th>
                  <th className="px-6 py-3.5 text-left">Propietario</th>
                  <th className="px-6 py-3.5 text-left">Proyecto</th>
                  <th className="px-6 py-3.5 text-left">Valor</th>
                  <th className="px-6 py-3.5 text-left">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1E293B]/20">
                {proyectosAsignados.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-slate-300">
                      {item.fecha}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {item.unidad}
                    </td>
                    <td className="px-6 py-4 text-slate-300 capitalize">
                      {item.propietario}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.proyecto}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-400">
                      ${Number(item.valor || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.estado === "Pagado"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl overflow-hidden text-white animate-[fadeIn_0.3s_ease-out] tabla-proyectos-print">
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
          
          <div className="p-6 space-y-4">
            {Object.entries(agrupados).map(([unidad, proyectos]: any) => {
              const propietario = proyectos[0]?.propietario || ""
              const abierto = apartamentoAbierto === unidad

              return (
                <div
                  key={unidad}
                  className="border border-[#1E293B]/30 rounded-2xl overflow-hidden bg-[#0B0F19]/60 hover:border-[#1E293B]/50 transition-all duration-200"
                >
                  <button
                    onClick={() =>
                      setApartamentoAbierto(abierto ? null : unidad)
                    }
                    className="w-full bg-[#0B0F19]/40 hover:bg-[#1E293B]/20 transition-all px-5 py-4.5 flex justify-between items-center text-white cursor-pointer"
                  >
                    <div className="text-left">
                      <h3 className="font-extrabold text-base text-white">
                        Apto. {unidad}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Propietario: <span className="text-slate-200 capitalize font-medium">{propietario}</span>
                      </p>
                    </div>
                  </button>

                  {abierto && (
                    <div className="border-t border-[#1E293B]/20 p-4 bg-[#0B0F19]/20 space-y-4">
                      {proyectos.map((proyecto: any) => (
                        <div
                          key={proyecto.id}
                          className="flex items-center justify-between border border-[#1E293B]/30 rounded-2xl p-4 bg-[#131926]/90"
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={seleccionados.includes(proyecto.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSeleccionados([...seleccionados, proyecto.id])
                                } else {
                                  setSeleccionados(seleccionados.filter(id => id !== proyecto.id))
                                }
                              }}
                              className="w-4 h-4 accent-indigo-500 rounded bg-[#1B2336] border-[#1E293B]/80 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />

                            <div>
                              <h4 className="font-bold text-white text-sm">
                                {proyecto.proyecto}
                              </h4>
                              <div className="mt-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  proyecto.estado === "Pagado"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                  {proyecto.estado === "Pagado" ? "PAGADO" : "PENDIENTE"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {proyecto.fecha}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-extrabold text-emerald-400 text-lg">
                              ${Number(proyecto.valor || 0).toLocaleString("es-CO")}
                            </span>
                            <button
                              onClick={() => {
                                const nombreTorre = localStorage.getItem("nombre_torre") || "Torre Admin"
                                const contenido = `
                                  <!DOCTYPE html>
                                  <html>
                                  <head>
                                    <meta charset="utf-8">
                                    <style>
                                      body{ font-family: Arial, sans-serif; padding:40px; }
                                      .header{ border-bottom:3px solid #2563eb; padding-bottom:15px; margin-bottom:20px; }
                                      .titulo{ font-size:28px; font-weight:bold; color:#2563eb; }
                                      .tabla{ width:100%; border-collapse:collapse; }
                                      .tabla th{ background:#2563eb; color:white; padding:10px; text-align:left; }
                                      .tabla td{ border:1px solid #ddd; padding:10px; }
                                      .pagado{ color:green; font-weight:bold; }
                                      .pendiente{ color:red; font-weight:bold; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="header">
                                      <div class="titulo">${nombreTorre}</div>
                                      <p>Estado de Proyecto</p>
                                    </div>
                                    <table class="tabla">
                                      <tr>
                                        <th>Proyecto</th>
                                        <th>Unidad</th>
                                        <th>Propietario</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                      </tr>
                                      <tr>
                                        <td>${proyecto.proyecto}</td>
                                        <td>${proyecto.unidad}</td>
                                        <td>${proyecto.propietario}</td>
                                        <td>${proyecto.fecha}</td>
                                        <td class="${proyecto.estado === "Pagado" ? "pagado" : "pendiente"}">${proyecto.estado}</td>
                                      </tr>
                                    </table>
                                    <h2 style="margin-top:20px">Valor: $${Number(proyecto.valor).toLocaleString("es-CO")}</h2>
                                  </body>
                                  </html>
                                `
                                const iframe = document.createElement("iframe")
                                iframe.style.display = "none"
                                document.body.appendChild(iframe)
                                iframe.contentDocument?.write(contenido)
                                iframe.contentDocument?.close()
                                iframe.contentWindow?.print()
                              }}
                              className="flex items-center gap-1.5 border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-400" />
                              Imprimir
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const nombreTorre = localStorage.getItem("nombre_torre") || "Torre Admin"
                            const proyectosImprimir = proyectos.filter((p: any) => seleccionados.includes(p.id))
                            const filas = proyectosImprimir.map((p: any) => `
                              <tr>
                                <td>${p.proyecto}</td>
                                <td>${p.unidad}</td>
                                <td>${p.propietario}</td>
                                <td>${p.fecha}</td>
                                <td>$${Number(p.valor).toLocaleString("es-CO")}</td>
                                <td style="color:${p.estado === "Pagado" ? "green" : "red"}; font-weight:bold;">${p.estado}</td>
                              </tr>
                            `).join("")

                            const contenido = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <meta charset="utf-8">
                                <style>
                                  body{ font-family:Arial,sans-serif; padding:40px; }
                                  .header{ border-bottom:3px solid #2563eb; margin-bottom:20px; padding-bottom:15px; }
                                  .titulo{ font-size:28px; font-weight:bold; color:#2563eb; }
                                  table{ width:100%; border-collapse:collapse; }
                                  th{ background:#2563eb; color:white; padding:10px; text-align:left; }
                                  td{ border:1px solid #ddd; padding:10px; }
                                  .total{ margin-top:20px; text-align:right; font-size:20px; font-weight:bold; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="titulo">${nombreTorre}</div>
                                  <p>Estado de proyectos seleccionados</p>
                                </div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Proyecto</th>
                                      <th>Unidad</th>
                                      <th>Propietario</th>
                                      <th>Fecha</th>
                                      <th>Valor</th>
                                      <th>Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${filas}
                                  </tbody>
                                </table>
                                <div class="total">Total: $${proyectosImprimir.reduce((acc: number, p: any) => acc + Number(p.valor || 0), 0).toLocaleString("es-CO")}</div>
                              </body>
                              </html>
                            `
                            const iframe = document.createElement("iframe")
                            iframe.style.display = "none"
                            document.body.appendChild(iframe)
                            iframe.contentDocument?.write(contenido)
                            iframe.contentDocument?.close()
                            iframe.contentWindow?.print()
                          }}
                          className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                        >
                          <Printer className="w-4 h-4" />
                          Imprimir seleccionados
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <NuevoProyectoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleGuardarNuevoProyecto} 
      />
    </div>
  )
}
