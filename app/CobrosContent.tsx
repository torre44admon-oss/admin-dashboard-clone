"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Printer,
  Search,
} from "lucide-react"

interface CargoAdicional {
  concepto: string
  valor: string
}

interface RegistroCobro {
  fecha: string
  unidad: string
  propietario: string
  telefono: string
  correo: string

  periodo: string
  mes: string
  anio: string

  cuotaAdministrativa: string

  cargosAdicionales?: CargoAdicional[]

  total: string
}

export function CobrosContent() {
  const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
]

const hoy = new Date()

let siguienteMes =
  hoy.getMonth() + 1

let siguienteAnio =
  hoy.getFullYear()

if (siguienteMes > 11) {
  siguienteMes = 0
  siguienteAnio += 1
}

const [filtroMes, setFiltroMes] =
  useState(meses[siguienteMes])

const [filtroAnio, setFiltroAnio] =
  useState(
    siguienteAnio.toString()
  )

  const [busqueda, setBusqueda] =
    useState("")

  const [cobros, setCobros] =
    useState<RegistroCobro[]>([])

  const [
    apartamentosAbiertos,
    setApartamentosAbiertos,
  ] = useState<string[]>([])

  const [seleccionados, setSeleccionados] =
    useState<string[]>([])

  useEffect(() => {

  async function cargarCobros() {

    const { data, error } = await supabase
      .from("cobros")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    if (data) {

      const datosCorregidos =
        data.map((item: any) => ({

          fecha:
            item.fecha || "",

          unidad:
            item.unidad || "",

          propietario:
            item.propietario || "",

          telefono:
            item.telefono || "",

          correo:
            item.correo || "",

          periodo:
            item.periodo || "",

          mes:
            item.mes || "",

          anio:
            item.anio || "",

          cuotaAdministrativa:
            item.cuotaAdministrativa ||
            "$0",

          cargosAdicionales:
            Array.isArray(
              item.cargosAdicionales
            )
              ? item.cargosAdicionales
              : [],

          total:
            item.total || "$0",

        }))

      setCobros(datosCorregidos)
    }
  }

  cargarCobros()

}, [])

  const cobrosFiltrados =
    cobros.filter((item) => {
      const coincideMes =
        filtroMes ===
          "Todo el año" ||
        item.mes === filtroMes

      const coincideAnio =
        item.anio === filtroAnio

      if (
        !coincideMes ||
        !coincideAnio
      )
        return false

      const texto = busqueda
        .trim()
        .toLowerCase()

      if (!texto) return true

      return (
        item.unidad
          .toLowerCase()
          .includes(texto) ||
        item.propietario
          .toLowerCase()
          .includes(texto)
      )
    })

  const agrupados = useMemo(() => {
    return cobrosFiltrados.reduce(
      (acc: any, item) => {
        if (!acc[item.unidad]) {
          acc[item.unidad] = {
            propietario:
              item.propietario,

            recibos: [],
          }
        }

        acc[item.unidad].recibos.push(
          item
        )

        return acc
      },
      {}
    )
  }, [cobrosFiltrados])

  const toggleApartamento = (
    unidad: string
  ) => {
    setApartamentosAbiertos((prev) =>
      prev.includes(unidad)
        ? prev.filter(
            (u) => u !== unidad
          )
        : [...prev, unidad]
    )
  }

  const toggleSeleccionado = (
    id: string
  ) => {
    setSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const imprimirRecibos = (
    recibos: RegistroCobro[]
  ) => {
    if (!recibos.length) return

    const styles = `
      <style>

        html,body{
          margin:0;
          padding:0;
          background:white;
          font-family:Arial, Helvetica, sans-serif;
          color:#111827;
        }

        .wrapper{
          width:100%;
          font-size:0;
          padding:10px;
          box-sizing:border-box;
        }

        .page{
          width:50%;
          display:inline-block;
          vertical-align:top;
          padding:10px;
          box-sizing:border-box;
          page-break-inside:avoid;
        }

        .container{
          width:100%;
          border:1px solid #dbe3eb;
          border-radius:14px;
          padding:18px;
          box-sizing:border-box;
          min-height:500px;
        }

        .header{
          display:flex;
          justify-content:space-between;
          gap:10px;
          margin-bottom:20px;
        }

        .logo{
          width:55px;
          height:55px;
          background:#294bb6;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-size:24px;
          font-weight:bold;
        }

        .title{
          font-size:24px;
          font-weight:800;
          color:#0f172a;
        }

        .subtitle{
          font-size:14px;
          color:#64748b;
          margin-top:4px;
        }

        .fechaBox{
          background:#f1f5f9;
          border-radius:12px;
          padding:10px;
          min-width:120px;
          box-sizing:border-box;
        }

        .fechaLabel{
          font-size:11px;
          color:#94a3b8;
          font-weight:bold;
        }

        .fechaValor{
          margin-top:6px;
          font-size:14px;
          font-weight:700;
        }

        .infoBox{
          background:#f8fafc;
          border-radius:14px;
          padding:16px;
          margin-bottom:20px;
        }

        .infoGrid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        }

        .infoLabel{
          font-size:12px;
          color:#64748b;
          margin-bottom:4px;
        }

        .infoValue{
          font-size:14px;
          font-weight:600;
        }

        .sectionTitle{
          font-size:12px;
          color:#94a3b8;
          font-weight:800;
          margin-bottom:10px;
          margin-top:20px;
        }

        .card{
          border:1px solid #e2e8f0;
          border-radius:12px;
          padding:16px;
          margin-bottom:12px;
        }

        .row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:10px;
          font-size:14px;
        }

        .totalBox{
          background:#2952cc;
          color:white;
          border-radius:14px;
          padding:22px;
          margin-top:20px;
        }

        .totalLabel{
          font-size:13px;
          opacity:0.9;
        }

        .totalValor{
          font-size:42px;
          font-weight:800;
          margin-top:8px;
        }

        .footer{
          background:#eff6ff;
          border:1px solid #dbeafe;
          border-radius:12px;
          padding:16px;
          margin-top:20px;
          font-size:12px;
          color:#475569;
          line-height:1.7;
        }

        @media print{
          body{
            -webkit-print-color-adjust:exact;
            print-color-adjust:exact;
          }
        }

        @page{
          margin:8mm;
        }

      </style>
    `

    const recibosHtml = `
      <div class="wrapper">

        ${recibos
          .map(
            (recibo) => `
          <div class="page">

            <div class="container">

              <div class="header">

                <div style="display:flex;gap:12px">

                  <div class="logo">
                    🧾
                  </div>

                  <div>

                    <div class="title">
                      TORRE 44
                    </div>

                    <div style="font-weight:700;color:#294bb6;margin-top:4px">
                      AVISO DE COBRO
                    </div>

                    <div class="subtitle">
                      ${recibo.periodo}
                    </div>

                  </div>

                </div>

                <div class="fechaBox">

                  <div class="fechaLabel">
                    FECHA
                  </div>

                  <div class="fechaValor">
                    ${recibo.fecha}
                  </div>

                </div>

              </div>

              <div class="infoBox">

                <div class="infoGrid">

                  <div>
                    <div class="infoLabel">
                      Apartamento:
                    </div>

                    <div class="infoValue">
                      ${recibo.unidad}
                    </div>
                  </div>

                  <div>
                    <div class="infoLabel">
                      Propietario:
                    </div>

                    <div class="infoValue">
                      ${recibo.propietario}
                    </div>
                  </div>

                  <div>
                    <div class="infoLabel">
                      Teléfono:
                    </div>

                    <div class="infoValue">
                      ${recibo.telefono}
                    </div>
                  </div>

                  <div>
                    <div class="infoLabel">
                      Correo:
                    </div>

                    <div class="infoValue">
                      ${recibo.correo}
                    </div>
                  </div>

                </div>

              </div>

              <div class="sectionTitle">
                CUOTA ADMINISTRATIVA
              </div>

              <div class="card">

                <div class="row">
                  <span>
                    Cuota Administrativa —
                    ${recibo.periodo}
                  </span>

                  <strong>
                    ${recibo.cuotaAdministrativa}
                  </strong>
                </div>

              </div>

              ${
                Array.isArray(
                  recibo.cargosAdicionales
                ) &&
                recibo
                  .cargosAdicionales
                  .length > 0
                  ? `
                    <div class="sectionTitle">
                      CARGOS ADICIONALES
                    </div>

                    <div class="card">

                      ${recibo.cargosAdicionales
                        .map(
                          (
                            cargo
                          ) => `
                            <div class="row">

                              <span>
                                ${cargo?.concepto || ""}
                              </span>

                              <strong>
                                ${cargo?.valor || ""}
                              </strong>

                            </div>
                          `
                        )
                        .join("")}

                    </div>
                  `
                  : ""
              }

              <div class="totalBox">

                <div class="totalLabel">
                  TOTAL A PAGAR
                </div>

                <div class="totalValor">
                  ${recibo.total}
                </div>

                <div style="margin-top:4px">
                  COP
                </div>

              </div>

              <div class="footer">
                Por favor realizar el pago
                a más tardar el último día
                del mes.
                <br/>
                Para cualquier consulta
                contacte a la administración.
              </div>

            </div>

          </div>
        `
          )
          .join("")}

      </div>
    `

    const html = `
      <html>
        <head>
          <title>
            Imprimir recibos
          </title>

          ${styles}
        </head>

        <body>
          ${recibosHtml}
        </body>
      </html>
    `

    const iframe =
      document.createElement("iframe")

    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"

    document.body.appendChild(iframe)

    const doc =
      iframe.contentWindow?.document

    if (!doc) return

    doc.open()
    doc.write(html)
    doc.close()

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()

        setTimeout(() => {
          document.body.removeChild(
            iframe
          )
        }, 1000)
      }, 300)
    }
  }

  return (
    <div className="font-sans text-slate-200 animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Cobros
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gestión de cuotas de mantenimiento
        </p>
      </div>

      <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400 whitespace-nowrap">
              Filtros:
            </span>
            <select
              value={filtroMes}
              onChange={(e) =>
                setFiltroMes(e.target.value)
              }
              className="bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="Enero">Enero</option>
              <option value="Febrero">Febrero</option>
              <option value="Marzo">Marzo</option>
              <option value="Abril">Abril</option>
              <option value="Mayo">Mayo</option>
              <option value="Junio">Junio</option>
              <option value="Julio">Julio</option>
              <option value="Agosto">Agosto</option>
              <option value="Septiembre">Septiembre</option>
              <option value="Octubre">Octubre</option>
              <option value="Noviembre">Noviembre</option>
              <option value="Diciembre">Diciembre</option>
              <option value="Todo el año">Todo el año</option>
            </select>

            <input
              type="number"
              value={filtroAnio}
              onChange={(e) =>
                setFiltroAnio(e.target.value)
              }
              className="bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="relative flex-1 w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar apartamento o propietario..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(agrupados).map(([unidad, data]: any) => {
            const abierto = apartamentosAbiertos.includes(unidad)

            return (
              <div
                key={unidad}
                className="border border-[#1E293B]/30 rounded-2xl overflow-hidden bg-[#0B0F19]/60 hover:border-[#1E293B]/50 transition-all duration-200"
              >
                <button
                  onClick={() => toggleApartamento(unidad)}
                  className="w-full bg-[#0B0F19]/40 hover:bg-[#1E293B]/20 transition-all px-5 py-4.5 flex items-center justify-between text-white cursor-pointer"
                >
                  <div className="text-left">
                    <h2 className="font-extrabold text-base text-white">
                      Apto. {unidad}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Propietario: <span className="text-slate-200 capitalize font-medium">{data.propietario}</span>
                    </p>
                  </div>
                  {abierto ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {abierto && (
                  <div className="p-5 bg-[#0B0F19]/20 border-t border-[#1E293B]/20 space-y-4">
                    <div className="space-y-3">
                      {data.recibos.map((recibo: RegistroCobro, index: number) => {
                        const id = `${recibo.unidad}-${recibo.periodo}-${index}`

                        return (
                          <div
                            key={id}
                            className="border border-[#1E293B]/30 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[#131926]/90"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={seleccionados.includes(id)}
                                onChange={() => toggleSeleccionado(id)}
                                className="w-4 h-4 accent-indigo-500 rounded bg-[#1B2336] border-[#1E293B]/80 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <div>
                                <p className="font-bold text-white text-sm">
                                  {recibo.periodo}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {recibo.fecha}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between lg:justify-end">
                              <span className="font-extrabold text-emerald-400 text-lg">
                                {recibo.total}
                              </span>
                              <button
                                onClick={() => imprimirRecibos([recibo])}
                                className="flex items-center gap-1.5 border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Imprimir
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => {
                          const recibosSeleccionados = data.recibos.filter(
                            (recibo: RegistroCobro, index: number) => {
                              const id = `${recibo.unidad}-${recibo.periodo}-${index}`
                              return seleccionados.includes(id)
                            }
                          )
                          imprimirRecibos(recibosSeleccionados)
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
    </div>
  )
}