"use client"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search, Printer } from "lucide-react"
import { NuevaMultaModal } from "./NuevaMultaModal"

interface Multa { t: string; m: string; d: string }
interface RegistroPortafolio {
  fecha: string
  unidad: string
  propietario: string
  periodo: string
  cargo: string
  total: string
}

export function MultasContent() {
  const [activeTab, setActiveTab] = useState<
  "multas" | "asignacion" | "portafolio"
>("multas")
  const [isMultaModalOpen, setIsMultaModalOpen] = useState(false)
  const [multas, setMultas] = useState<Multa[]>([{ t: "ruido", m: "$ 35.000", d: "exeso" }])
  const [registrosPortafolio, setRegistrosPortafolio] = useState<RegistroPortafolio[]>([])
  const [buscarTexto, setBuscarTexto] = useState("")

  useEffect(() => {
    const m = localStorage.getItem("multas_db")
    if (m) setMultas(JSON.parse(m))
    
    const p = localStorage.getItem("portafolio_db")
    if (p) {
      setRegistrosPortafolio(JSON.parse(p))
    
    }
  }, [activeTab])

  const saveM = (n: Multa[]) => { setMultas(n); localStorage.setItem("multas_db", JSON.stringify(n)) }
  const savePortafolioH = (n: RegistroPortafolio[]) => { setRegistrosPortafolio(n); localStorage.setItem("portafolio_db", JSON.stringify(n)) }

  const registrosFiltrados = registrosPortafolio.filter((item) => {
    const busqueda = buscarTexto.toLowerCase()
    const porUnidad = item.unidad.toLowerCase().includes(busqueda)
    const porPropietario = item.propietario.toLowerCase().includes(busqueda)
    return porUnidad || porPropietario
  })

  return (
    <div className="font-sans text-[#1e293b]">
      {/* ESTILOS DE IMPRESIÓN EXCLUSIVOS EN LÍNEA: Esconde el resto de la web en la hoja */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .seccion-tabla-imprimir, .seccion-tabla-imprimir * { visibility: visible; }
          .seccion-tabla-imprimir { position: absolute; left: 0; top: 0; width: 100%; border: none !important; shadow: none !important; }
          .no-imprimir-buscador { display: none !important; }
        }
      `}} />

      {/* CABECERA (Se ocultará automáticamente al imprimir) */}
      <div className="flex items-center justify-between mb-6 clase-cabecera-ocultar-print">
        <div>
          <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">Multas</h1>
          <p className="text-[#64748b] text-[15px] mt-0.5">Catálogo de infracciones y recargos</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "portafolio" && (
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white border border-[#dfe5ec] text-[#334155] px-4 h-[42px] rounded-lg text-[13px] font-medium shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>Imprimir PDF</span>
            </button>
          )}
          {activeTab === "multas" && (
            <button onClick={() => setIsMultaModalOpen(true)} className="flex items-center gap-2 bg-[#ef4444] text-white px-5 h-[42px] rounded-lg font-medium text-sm hover:bg-[#dc2626] transition-colors cursor-pointer shadow-sm">
              <Plus className="w-4 h-4" /> <span>Registrar Multa</span>
            </button>
          )}
        </div>
      </div>

      {/* Selectores de Pestañas (Se ocultará automáticamente al imprimir) */}
      <div className="flex gap-2 mb-6 bg-gray-100/50 p-1 rounded-xl border border-[#e2e8f0] w-fit">

  <button
    onClick={() => setActiveTab("multas")}
    className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${
      activeTab === "multas"
        ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]"
        : "text-[#64748b]"
    }`}
  >
    Multas
  </button>

  <button
    onClick={() => setActiveTab("asignacion")}
    className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${
      activeTab === "asignacion"
        ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]"
        : "text-[#64748b]"
    }`}
  >
    Asignación
  </button>

  <button
    onClick={() => setActiveTab("portafolio")}
    className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${
      activeTab === "portafolio"
        ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]"
        : "text-[#64748b]"
    }`}
  >
    Portafolio
  </button>

</div>

      {activeTab === "multas" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {multas.map((m, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#dfe5ec] shadow-sm flex flex-col justify-between min-h-[170px]">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[17px] font-bold text-[#1e293b]">{m.t}</h3>
                  <span className="font-bold text-[16px] text-red-500">{m.m}</span>
                </div>
                <p className="text-[14px] text-[#64748b] mb-4">{m.d}</p>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                <button className="flex items-center gap-1.5 text-[#334155] border border-[#dfe5ec] bg-white px-4 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer"><Pencil className="w-3.5 h-3.5 text-gray-400" /> Editor</button>
                <button onClick={() => saveM(multas.filter((_, i) => i !== idx))} className="text-[#ef4444] cursor-pointer p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ENVOLVEMOS LA TABLA EN LA CLASE SECCIONAL DE EXTRACCIÓN: seccion-tabla-imprimir */
        <div className="bg-white border border-[#dfe5ec] rounded-xl shadow-sm overflow-hidden bg-white animate-fade-in seccion-tabla-imprimir">
          {/* Barra de Búsqueda (Oculta estrictamente en la hoja con no-imprimir-buscador) */}
          <div className="p-4 border-b border-[#dfe5ec] flex items-center gap-3 no-imprimir-buscador">
            <span className="text-sm font-bold text-gray-500 uppercase select-none">Buscar:</span>
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Buscar por apartamento o nombre..." 
                value={buscarTexto}
                onChange={(e) => setBuscarTexto(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-sm bg-white outline-none focus:border-[#cbd5e1] text-[#334155]"
              />
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
                  <th className="px-6 py-3.5 font-bold text-center no-imprimir-buscador">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe5ec]">
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400 font-medium bg-gray-50/10">No se encontraron registros que coincidan</td>
                  </tr>
                ) : (
                  registrosFiltrados.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-400 whitespace-nowrap">{item.fecha}</td>
                      <td className="px-6 py-4 font-bold text-[#1e293b]">{item.unidad}</td>
                      <td className="px-6 py-4 font-bold text-gray-700 capitalize">{item.propietario}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500">{item.periodo}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 rounded">
                          {item.cargo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#1d4ed8]">{item.total}</td>
                      <td className="px-6 py-4 text-center no-imprimir-buscador">
                        <button onClick={() => savePortafolioH(registrosPortafolio.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NuevaMultaModal isOpen={isMultaModalOpen} onClose={() => setIsMultaModalOpen(false)} onSave={(nM) => { saveM([...multas, nM]); setIsMultaModalOpen(false) }} />
    </div>
  )
}
