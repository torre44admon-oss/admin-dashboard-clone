"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Printer } from "lucide-react"
import { NuevoProyectoModal } from "./NuevoProyectoModal"

interface Proyecto { t: string; p: string; d: string; s: string }
interface RegistroPortafolio {
  fecha: string
  unidad: string
  propietario: string
  periodo: string
  cargo: string
  total: string
}

export function ProyectosContent() {
  const [activeProjTab, setActiveProjTab] = useState<"proyectos" | "portafolio">("proyectos")
  const [proyectos, setProyectos] = useState<Proyecto[]>([
    { t: "pintura", p: "75.000", d: "zona comun", s: "pl" }
  ])
  const [registrosPortafolio, setRegistrosPortafolio] = useState<RegistroPortafolio[]>([])
  const [buscarTexto, setBuscarTexto] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const pG = localStorage.getItem("proyectos_db")
    if (pG) setProyectos(JSON.parse(pG))

    const pProj = localStorage.getItem("portafolio_proyectos_db")
    if (pProj) {
      setRegistrosPortafolio(JSON.parse(pProj))
    } else {
      const basePortafolio = [
        { fecha: "23 de mayo de 2026", unidad: "Apto. 303", propietario: "Sandra Perdomo", periodo: "Mayo de 2026", cargo: "pintura", total: "$ 95.000" }
      ]
      setRegistrosPortafolio(basePortafolio)
      localStorage.setItem("portafolio_proyectos_db", JSON.stringify(basePortafolio))
    }
  }, [activeProjTab])

  const saveProyectos = (n: Proyecto[]) => {
    setProyectos(n)
    localStorage.setItem("proyectos_db", JSON.stringify(n))
  }

  const savePortafolioH = (n: RegistroPortafolio[]) => {
    setRegistrosPortafolio(n)
    localStorage.setItem("portafolio_proyectos_db", JSON.stringify(n))
  }

  const handleGuardarNuevoProyecto = (nuevo: Proyecto) => {
    saveProyectos([...proyectos, nuevo])
  }

  const registrosFiltrados = registrosPortafolio.filter((item) => {
    const busqueda = buscarTexto.toLowerCase()
    return item.unidad.toLowerCase().includes(busqueda) || item.propietario.toLowerCase().includes(busqueda)
  })
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">Proyectos</h1>
          <p className="text-[#64748b] text-[15px] mt-0.5">Mantenimiento y mejoras del edificio</p>
        </div>
        <div className="flex items-center gap-3">
          {activeProjTab === "portafolio" && (
            <button type="button" onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-[#dfe5ec] text-[#334155] px-4 h-[42px] rounded-lg text-[13px] font-medium shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"><Printer className="w-4 h-4 text-gray-500" /><span>Imprimir PDF</span></button>
          )}
          {activeProjTab === "proyectos" && (
            <button type="button" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#2d4486] text-white px-5 h-[42px] rounded-lg font-medium text-[14px] hover:bg-[#22366d] transition-colors cursor-pointer shadow-sm"><Plus className="w-4 h-4" /><span>Nuevo Proyecto</span></button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-gray-100/50 p-1 rounded-xl max-w-[210px] border border-[#e2e8f0]">
        <button type="button" onClick={() => setActiveProjTab("proyectos")} className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${activeProjTab === "proyectos" ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]" : "text-[#64748b]"}`}>Proyectos</button>
        <button type="button" onClick={() => setActiveProjTab("portafolio")} className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${activeProjTab === "portafolio" ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]" : "text-[#64748b]"}`}>Portafolio</button>
      </div>

      {activeProjTab === "proyectos" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((p, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#dfe5ec] shadow-sm flex flex-col justify-between min-h-[150px]">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[17px] font-bold text-[#1e293b] tracking-tight">{p.t}</h3>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Planificado</span>
                </div>
                <p className="text-[14px] font-medium text-[#1e293b] mb-1">Por apartamento: $ {p.p}</p>
                <p className="text-[14px] text-[#64748b]">{p.d}</p>
              </div>
              <div className="flex justify-end items-center border-t border-gray-100 pt-3 mt-3">
                <button type="button" onClick={() => saveProyectos(proyectos.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 transition-colors cursor-pointer p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#dfe5ec] rounded-xl shadow-sm overflow-hidden animate-fade-in tabla-proyectos-print">
          <div className="p-4 border-b border-[#dfe5ec] flex items-center gap-3 no-imprimir-buscador">
            <span className="text-sm font-bold text-gray-500 uppercase select-none">Buscar:</span>
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Buscar por apartamento o nombre..." value={buscarTexto} onChange={(e) => setBuscarTexto(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-sm bg-white outline-none focus:border-[#cbd5e1] text-[#334155]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-[#334155]">
              <thead>
                <tr className="bg-gray-50 border-b border-[#dfe5ec] text-xs font-bold text-gray-400 uppercase select-none">
                  <th className="px-6 py-3.5 font-bold">Fecha</th>
                  <th className="px-6 py-3.5 font-bold">Unidad</th>
                  <th className="px-6 py-3.5 font-bold">Propietario</th>
                  <th className="px-6 py-3.5 font-bold">Período</th>
                  <th className="px-6 py-3.5 font-bold">Cargos adicionales</th>
                  <th className="px-6 py-3.5 font-bold">Total</th>
                  <th className="px-6 py-3.5 font-bold text-center no-print-buscador-proyectos">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe5ec]">
                {registrosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400 font-medium bg-gray-50/10">No se encontraron registros</td></tr>
                ) : (
                  registrosFiltrados.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-400 whitespace-nowrap">{item.fecha}</td>
                      <td className="px-6 py-4 font-bold text-[#1e293b]">{item.unidad}</td>
                      <td className="px-6 py-4 font-bold text-gray-700 capitalize">{item.propietario}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500">{item.periodo}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded">{item.cargo}</span></td>
                      <td className="px-6 py-4 font-extrabold text-[#1d4ed8]">{item.total}</td>
                      <td className="px-6 py-4 text-center no-print-buscador-proyectos">
                        <button type="button" onClick={() => savePortafolioH(registrosPortafolio.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
