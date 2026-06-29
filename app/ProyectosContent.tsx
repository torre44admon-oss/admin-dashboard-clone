"use client"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Printer } from "lucide-react"
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

      <div className="flex gap-2 mb-6 bg-gray-100/50 p-1 rounded-xl max-w-[320px] border border-[#e2e8f0]">
        <button type="button" onClick={() => setActiveProjTab("proyectos")} className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${activeProjTab === "proyectos" ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]" : "text-[#64748b]"}`}>Proyectos</button>
        <button
  type="button"
  onClick={() => setActiveProjTab("asignados")}
  className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${
    activeProjTab === "asignados"
      ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]"
      : "text-[#64748b]"
  }`}
>
  Asignados
</button>
        <button type="button" onClick={() => setActiveProjTab("portafolio")} className={`px-4 py-1.5 font-medium rounded-lg text-sm cursor-pointer transition-all ${activeProjTab === "portafolio" ? "bg-white text-[#1e293b] shadow-sm border border-[#dfe5ec]" : "text-[#64748b]"}`}>Portafolio</button>
      </div>

      {activeProjTab === "proyectos" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((p, idx) => {

  const asignadosProyecto = todosLosAsignados.filter(
  (a) => a.proyecto === p.t
)

const pendientes = asignadosProyecto.filter(
  (a) => a.estado === "Pendiente"
).length

const totalAsignados = asignadosProyecto.length

let estadoMostrar = "PLANIFICADO"

if (totalAsignados > 0) {
  estadoMostrar = "EN PROGRESO"
}

if (totalAsignados > 0 && pendientes === 0) {
  estadoMostrar = "COMPLETADO"
}
  return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#dfe5ec] shadow-sm flex flex-col justify-between min-h-[150px]">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[17px] font-bold text-[#1e293b] tracking-tight">{p.t}</h3>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
  {estadoMostrar}
</span>
                </div>
                <p className="text-[14px] font-medium text-[#1e293b] mb-1">
  Por apartamento: {p.p}
</p>

<p className="text-[14px] text-[#64748b]">
  {p.d}
</p>

<div className="mt-3 space-y-1">

  <p className="text-[13px] text-[#64748b]">
    Total apartamentos: {totalApartamentos}
  </p>

  <p className="text-[13px] text-[#64748b]">
    Apartamentos pendientes: {pendientes}
  </p>

  <p className="text-[14px] font-bold text-blue-600">
    Valor total: $
    {(
      Number(String(p.p).replace(/[^0-9]/g, "")) *
      totalApartamentos
    ).toLocaleString("es-CO")}
  </p>
  <p className="text-[14px] font-bold text-blue-600">
  Valor pendiente: $
  {(
    Number(String(p.p).replace(/[^0-9]/g, "")) *
    pendientes
  ).toLocaleString("es-CO")}
</p>

</div>
              </div>
              <div className="flex justify-end items-center border-t border-gray-100 pt-3 mt-3">
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
    className="text-red-500 hover:text-red-700 transition-colors cursor-pointer p-1"
  >
    <Trash2 className="w-4 h-4" />
  </button>
              </div>
            </div>
          )
})}

</div>
) : activeProjTab === "asignados" ? (

<div className="bg-white border border-[#dfe5ec] rounded-xl shadow-sm overflow-hidden">

  <div className="p-4 border-b border-[#dfe5ec]">
    <h2 className="text-lg font-bold text-[#1e293b']">
      Proyectos Asignados
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
  <tr className="bg-gray-50 border-b border-[#dfe5ec]">
    <th className="px-4 py-3 text-left">Fecha</th>
    <th className="px-4 py-3 text-left">Unidad</th>
    <th className="px-4 py-3 text-left">Propietario</th>
    <th className="px-4 py-3 text-left">Proyecto</th>
    <th className="px-4 py-3 text-left">Valor</th>
    <th className="px-4 py-3 text-left">Estado</th>
  </tr>
</thead>

      <tbody>
  {proyectosAsignados.map((item) => (
    <tr key={item.id} className="border-b">
      <td className="px-4 py-3">
        {item.fecha}
      </td>

      <td className="px-4 py-3">
        {item.unidad}
      </td>

      <td className="px-4 py-3">
        {item.propietario}
      </td>

      <td className="px-4 py-3">
        {item.proyecto}
      </td>

      <td className="px-4 py-3 font-semibold text-blue-600">
        ${Number(item.valor || 0).toLocaleString("es-CO")}
      </td>

      <td className="px-4 py-3">
        {item.estado}
      </td>
    </tr>
  ))}
</tbody>
    </table>
  </div>

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
          
              <div className="p-6 space-y-4">

  {Object.entries(agrupados).map(
    ([unidad, proyectos]: any) => {

      const propietario =
        proyectos[0]?.propietario || ""

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
    px-3
    py-3
    flex
    justify-between
    items-center
    hover:bg-gray-50
    transition-colors
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

            <span className="text-xl">
              {apartamentoAbierto === unidad
                ? ""
                : ""}
            </span>

          </button>

          {apartamentoAbierto === unidad && (

            <div className="border-t p-4 space-y-4">

  {proyectos.map((proyecto: any) => (

    <div
      key={proyecto.id}
      className="
        flex
        items-center
        justify-between
        border
        rounded-2xl
        p-4
        bg-white
      "
    >

      <div className="flex items-center gap-4">

        <input
  type="checkbox"
  checked={seleccionados.includes(proyecto.id)}
  onChange={(e) => {

    if (e.target.checked) {

      setSeleccionados([
        ...seleccionados,
        proyecto.id
      ])

    } else {

      setSeleccionados(
        seleccionados.filter(
          id => id !== proyecto.id
        )
      )

    }

  }}
  className="w-5 h-5"
/>

        <div>

          <h4 className="font-bold text-lg">
            {proyecto.proyecto}
          </h4>
          <div className="mt-1">
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      proyecto.estado === "Pagado"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {proyecto.estado === "Pagado"
      ? "PAGADO"
      : "PENDIENTE"}
  </span>
</div>

          <p className="text-gray-500">
            {proyecto.fecha}
          </p>

        </div>

      </div>

      <div className="flex items-center gap-4">

        <span className="font-bold text-blue-600 text-xl">
          $
          {Number(
            proyecto.valor || 0
          ).toLocaleString("es-CO")}
        </span>

        <button
  onClick={() => {
const nombreTorre =
  localStorage.getItem("nombre_torre") ||
  "Torre Admin"
    const contenido = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>
body{
  font-family: Arial, sans-serif;
  padding:40px;
}

.header{
  border-bottom:3px solid #2563eb;
  padding-bottom:15px;
  margin-bottom:20px;
}

.titulo{
  font-size:28px;
  font-weight:bold;
  color:#2563eb;
}

.tabla{
  width:100%;
  border-collapse:collapse;
}

.tabla th{
  background:#2563eb;
  color:white;
  padding:10px;
  text-align:left;
}

.tabla td{
  border:1px solid #ddd;
  padding:10px;
}

.pagado{
  color:green;
  font-weight:bold;
}

.pendiente{
  color:red;
  font-weight:bold;
}
</style>
</head>

<body>

<div class="header">
  <div class="titulo">
  ${nombreTorre}
</div>
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
  <td class="${
    proyecto.estado === "Pagado"
      ? "pagado"
      : "pendiente"
  }">
    ${proyecto.estado}
  </td>
</tr>

</table>

<h2 style="margin-top:20px">
Valor: $${Number(proyecto.valor).toLocaleString("es-CO")}
</h2>

</body>
</html>
`

    const iframe = document.createElement("iframe");
iframe.style.display = "none";

document.body.appendChild(iframe);

iframe.contentDocument?.write(contenido);
iframe.contentDocument?.close();

iframe.contentWindow?.print();

  }}
  className="
    border
    rounded-xl
    px-4
    py-2
    hover:bg-gray-50
  "
>
  Imprimir
</button>

      </div>

    </div>

  ))}

  <div className="flex justify-end">

    <button
  onClick={() => {
const nombreTorre =
  localStorage.getItem("nombre_torre") ||
  "Torre Admin"
    const proyectosImprimir =
      proyectos.filter((p: any) =>
        seleccionados.includes(p.id)
      )

    const filas = proyectosImprimir.map((p: any) => `
<tr>
  <td>${p.proyecto}</td>
  <td>${p.unidad}</td>
  <td>${p.propietario}</td>
  <td>${p.fecha}</td>
  <td>$${Number(p.valor).toLocaleString("es-CO")}</td>
  <td style="
    color:${p.estado === "Pagado" ? "green" : "red"};
    font-weight:bold;
  ">
    ${p.estado}
  </td>
</tr>
`).join("")

const contenido = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>

body{
  font-family:Arial,sans-serif;
  padding:40px;
}

.header{
  border-bottom:3px solid #2563eb;
  margin-bottom:20px;
  padding-bottom:15px;
}

.titulo{
  font-size:28px;
  font-weight:bold;
  color:#2563eb;
}

table{
  width:100%;
  border-collapse:collapse;
}

th{
  background:#2563eb;
  color:white;
  padding:10px;
  text-align:left;
}

td{
  border:1px solid #ddd;
  padding:10px;
}

.total{
  margin-top:20px;
  text-align:right;
  font-size:20px;
  font-weight:bold;
}

</style>
</head>

<body>

<div class="header">
  <div class="titulo">
  ${nombreTorre}
</div>

  <p>
    Estado de proyectos seleccionados
  </p>
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

<div class="total">
Total: $${proyectosImprimir
  .reduce(
    (acc: number, p: any) =>
      acc + Number(p.valor || 0),
    0
  )
  .toLocaleString("es-CO")}
</div>

</body>
</html>
`

    const iframe = document.createElement("iframe");
iframe.style.display = "none";

document.body.appendChild(iframe);

iframe.contentDocument?.write(contenido);
iframe.contentDocument?.close();

iframe.contentWindow?.print();
  }}
  className="
    bg-blue-600
    text-white
    px-6
    py-3
    rounded-2xl
    font-semibold
  "
>
  Imprimir seleccionados
</button>

  </div>

</div>

          )}

        </div>

      )
    }
  )}

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
