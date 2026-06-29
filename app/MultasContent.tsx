"use client"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search, Printer } from "lucide-react"
import { NuevaMultaModal } from "./NuevaMultaModal"

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
  const [activeTab, setActiveTab] = useState<
  "multas" | "asignacion" | "portafolio"
>("multas")
  const [isMultaModalOpen, setIsMultaModalOpen] = useState(false)
  const [multas, setMultas] = useState<Multa[]>([])
  const [registrosPortafolio, setRegistrosPortafolio] = useState<RegistroPortafolio[]>([])
  const [multasAsignadas, setMultasAsignadas] = useState<any[]>([])
  const [portafolioMultas, setPortafolioMultas] = useState<any[]>([])
  const [buscarTexto, setBuscarTexto] = useState("")
const [apartamentoAbierto, setApartamentoAbierto] =

  useState<string | null>(null)
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
  const { data, error } = await supabase
    .from("multas")
    .select("*")
    .order("id")

  if (error) {
    console.error(error)
    return
  }

  setMultas(data || [])
}
const cargarMultasAsignadas = async () => {
  const { data, error } = await supabase
    .from("multas_asignadas")
    .select("*")
    .order("fecha", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setMultasAsignadas(data || [])
}
const cargarPortafolioMultas = async () => {
  const { data, error } = await supabase
    .from("portafolio_multas")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setPortafolioMultas(data || [])
}
const verificarMultasVencidas = async () => {

  const hoy = new Date()
    .toISOString()
    .split("T")[0]

  await supabase
    .from("multas_asignadas")
    .update({
      estado: "Vencida"
    })
    .lt("fecha_vencimiento", hoy)
    .eq("estado", "Pendiente")

  await supabase
    .from("portafolio_multas")
    .update({
      estado: "Vencida"
    })
    .lt("fecha_vencimiento", hoy)
    .eq("estado", "Pendiente")
}
  const saveM = (n: Multa[]) => { setMultas(n); localStorage.setItem("multas_db", JSON.stringify(n)) }
  const savePortafolioH = (n: RegistroPortafolio[]) => { setRegistrosPortafolio(n); localStorage.setItem("portafolio_db", JSON.stringify(n)) }

  const registrosFiltrados = multasAsignadas.filter((item) => {
  const busqueda = buscarTexto.toLowerCase()

  const coincideBusqueda =
    item.unidad?.toLowerCase().includes(busqueda) ||
    item.propietario?.toLowerCase().includes(busqueda)

  return (
    coincideBusqueda &&
    item.estado === "Pendiente"
  )
})

const portafolioFiltrado = portafolioMultas.filter((item) => {
  const busqueda = buscarTexto.toLowerCase()

  return (
    item.unidad?.toLowerCase().includes(busqueda) ||
    item.propietario?.toLowerCase().includes(busqueda)
  )
})

const agrupados = portafolioFiltrado.reduce(
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
      <div
        key={idx}
        className="bg-white p-6 rounded-2xl border border-[#dfe5ec] shadow-sm flex flex-col justify-between min-h-[170px]"
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[17px] font-bold text-[#1e293b]">
              {m.t}
            </h3>

            <span className="font-bold text-[16px] text-red-500">
              {m.m}
            </span>
          </div>

          <p className="text-[14px] text-[#64748b] mb-4">
            {m.d}
          </p>
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
          <button className="flex items-center gap-1.5 text-[#334155] border border-[#dfe5ec] bg-white px-4 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer">
            <Pencil className="w-3.5 h-3.5 text-gray-400" />
            Editor
          </button>

          <button
            onClick={() =>
              saveM(multas.filter((_, i) => i !== idx))
            }
            className="text-[#ef4444] cursor-pointer p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>

) : activeTab === "asignacion" ? (

  <div className="bg-white border border-[#dfe5ec] rounded-xl shadow-sm overflow-hidden bg-white animate-fade-in seccion-tabla-imprimir">

    <div className="p-4 border-b border-[#dfe5ec] flex items-center gap-3 no-imprimir-buscador">
      <span className="text-sm font-bold text-gray-500 uppercase select-none">
        Buscar:
      </span>

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
          <tr className="bg-gray-50 border-b border-[#dfe5ec] text-xs font-bold text-gray-400 uppercase">
            <th className="px-6 py-3.5">Fecha Asignación</th>
            <th className="px-6 py-3.5">Fecha Vencimiento</th>
            <th className="px-6 py-3.5">Unidad</th>
            <th className="px-6 py-3.5">Propietario</th>
            <th className="px-6 py-3.5">Estado</th>
            <th className="px-6 py-3.5">Tipo Multa</th>
            <th className="px-6 py-3.5">Valor</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#dfe5ec]">
          {registrosFiltrados.map((item, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                {item.fecha_asignacion}
              </td>

              <td className="px-6 py-4">
                {item.fecha_vencimiento}
              </td>

              <td className="px-6 py-4 font-bold">
                {item.unidad}
              </td>

              <td className="px-6 py-4">
                {item.propietario}
              </td>

              <td className="px-6 py-4">
                {item.estado}
              </td>

              <td className="px-6 py-4">
                {item.tipo_multa}
              </td>

              <td className="px-6 py-4 font-extrabold text-[#1d4ed8]">
                {item.valor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

) : (

  <div className="bg-white border border-[#dfe5ec] rounded-xl shadow-sm overflow-hidden animate-fade-in">

  <div className="p-4 border-b border-[#dfe5ec]">
    <h2 className="text-xl font-bold">
      Portafolio de Multas
    </h2>
  </div>
<div className="p-4 border-b border-[#dfe5ec] flex items-center gap-3">
  <span className="text-sm font-bold text-gray-500 uppercase">
    Buscar:
  </span>

  <div className="relative flex-1 max-w-sm">
    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />

    <input
      type="text"
      placeholder="Buscar apartamento o propietario..."
      value={buscarTexto}
      onChange={(e) => setBuscarTexto(e.target.value)}
      className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-sm"
    />
  </div>
</div>
  <div className="p-6 space-y-4">

  {Object.entries(agrupados).map(
    ([unidad, multas]: any) => {

      const propietario =
        multas[0]?.propietario || ""

      return (

        <div
          key={unidad}
          className="
            bg-gray-50
            border
            border-gray-100
            rounded-3xl
            overflow-hidden
            shadow-sm
          "
        >

          <button
            onClick={() =>
              setApartamentoAbierto(
                apartamentoAbierto === unidad
                  ? null
                  : unidad
              )
            }
            className="
              w-full
              px-4
              py-4
              flex
              justify-between
              items-center
            "
          >

            <div className="text-left">

              <h3 className="font-bold text-xl">
                Apto. {unidad}
              </h3>

              <p className="text-gray-500">
                Propietario: {propietario}
              </p>

            </div>

          </button>

          {apartamentoAbierto === unidad && (

  <div className="border-t p-4 overflow-x-auto">

    <table className="w-full text-sm">

      <thead>
        <tr className="border-b border-[#dfe5ec] bg-gray-50">

          <th className="px-4 py-3 text-left">
            Fecha Asignación
          </th>

          <th className="px-4 py-3 text-left">
            Fecha Vencimiento
          </th>

          <th className="px-4 py-3 text-left">
            Unidad
          </th>

          <th className="px-4 py-3 text-left">
            Propietario
          </th>

          <th className="px-4 py-3 text-left">
            Tipo Multa
          </th>

          <th className="px-4 py-3 text-left">
            Estado
          </th>

          <th className="px-4 py-3 text-left">
            Valor
          </th>

        </tr>
      </thead>

      <tbody>

        {multas.map((multa: any) => (

          <tr
            key={multa.id}
            className="border-b border-[#dfe5ec]"
          >

            <td className="px-4 py-4">
              {multa.fecha_asignacion}
            </td>

            <td className="px-4 py-4">
              {multa.fecha_vencimiento}
            </td>

            <td className="px-4 py-4 font-bold">
              {multa.unidad}
            </td>

            <td className="px-4 py-4">
              {multa.propietario}
            </td>

            <td className="px-4 py-4">
              {multa.tipo_multa}
            </td>

            <td className="px-4 py-4">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  multa.estado === "Pagado"
                    ? "bg-green-100 text-green-700"
                    : multa.estado === "Vencida"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {multa.estado}
              </span>

            </td>

            <td className="px-4 py-4 font-bold text-blue-600">
              $
              {Number(
                multa.valor || 0
              ).toLocaleString("es-CO")}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

)}
        </div>

      )
    }
  )}

</div>

</div>

)}
      <NuevaMultaModal
  isOpen={isMultaModalOpen}
  onClose={() => setIsMultaModalOpen(false)}
  onSave={(nM) => {
    saveM([...multas, nM])
    setIsMultaModalOpen(false)
  }}
/>
    </div>
  )
}
