"use client"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Plus, FileText, Send, Trash2 } from "lucide-react"
import { AgregarLineaModal } from "./AgregarLineaModal"
import { PlantillaPropietario } from "../components/dashboard/PlantillaPropietario"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"

interface Apartamento {
  unidad: string
  piso: number
  propietario: string
  telefono: string
  email: string
}

interface Props {
  apartamentos: Apartamento[]
}

interface LineaAviso {
  tipo: string
  concepto: string
  monto: number
}

export function AvisosCobroContent({ apartamentos }: Props) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const hoy = new Date()

  let siguienteMes = hoy.getMonth() + 1
  let siguienteAnio = hoy.getFullYear()

  if (siguienteMes > 11) {
    siguienteMes = 0
    siguienteAnio += 1
  }

  const [mesAviso, setMesAviso] = useState(
    meses[siguienteMes]
  )

  const [anioAviso, setAnioAviso] = useState(
    siguienteAnio.toString()
  )
  const [idAptoSeleccionado, setIdAptoSeleccionado] = useState("")
  const [isLineaModalOpen, setIsLineaModalOpen] = useState(false)

  const [cuotaBase, setCuotaBase] = useState<LineaAviso | null>(null)
  const [cargosAdicionales, setCargosAdicionales] = useState<LineaAviso[]>([])
  const [mensajeConfigurado, setMensajeConfigurado] = useState("")
  const [saldoMoraCalculado, setSaldoMoraCalculado] = useState<number>(0)

  // JALA LA MORA DE LA CARTERA EN TIEMPO REAL SIN AFECTAR CARGOS ADICIONALES
  useEffect(() => {
    const mensajeGuardado =
      localStorage.getItem("mensaje_aviso") || ""

    const nombreCuotaGuardado =
      localStorage.getItem("nombre_cuota") || "Cuota Administrativa"

    const montoGuardado =
      localStorage.getItem("monto_fijo") || "20000"

    setMensajeConfigurado(mensajeGuardado)

    if (idAptoSeleccionado) {
      const aptoActual = apartamentos.find(
        (_, idx) => idx.toString() === idAptoSeleccionado
      )

      setCuotaBase({
        tipo: "Concepto",
        concepto: nombreCuotaGuardado,
        monto: Number(montoGuardado)
      })

      // Conexión máster con torre_cartera_db
      const carteraGuardada = localStorage.getItem("torre_cartera_db")
      if (carteraGuardada && aptoActual) {
        const baseDeCartera = JSON.parse(carteraGuardada)
        setSaldoMoraCalculado(baseDeCartera[aptoActual.unidad] || 0)
      } else {
        setSaldoMoraCalculado(0)
      }

    } else {
      setCuotaBase(null)
      setSaldoMoraCalculado(0)
    }
    setCargosAdicionales([])
  }, [idAptoSeleccionado, mesAviso, anioAviso, apartamentos])
  // SUMA REAL COMPLETA: Incluye la Mora de Cartera dentro del gran total
  const totalSumaNumerica =
    (cuotaBase ? cuotaBase.monto : 0) +
    saldoMoraCalculado +
    cargosAdicionales.reduce((acc, l) => acc + l.monto, 0)

  const handleAgregarNuevaLineaFactura = (nueva: any) => {
    const montoNumerico =
      typeof nueva.monto === "string"
        ? parseInt(nueva.monto.replace(/[^0-9]/g, ""), 10) || 0
        : Number(nueva.monto) || 0

    setCargosAdicionales([
      ...cargosAdicionales,
      { ...nueva, monto: montoNumerico }
    ])
  }

  const handleEliminarCargo = (indexParaBorrar: number) => {
    setCargosAdicionales(
      cargosAdicionales.filter((_, idx) => idx !== indexParaBorrar)
    )
  }

  const aptoActual = apartamentos.find(
    (_, idx) => idx.toString() === idAptoSeleccionado
  )

  const formatPhoneForWhatsApp = (raw?: string) => {
    if (!raw) return ""

    let digits = raw.replace(/\D/g, "")
    digits = digits.replace(/^0+/, "")

    if (digits.startsWith("57")) return digits

    if (digits.length === 10 || digits.length === 9) {
      return `57${digits}`
    }

    return digits
  }

  async function generatePngBlobFromElement(el: HTMLElement) {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    })

    const dataUrl = canvas.toDataURL("image/png")
    const res = await fetch(dataUrl)
    const blob = await res.blob()

    return blob
  }

  async function generatePdfBlobFromElement(el: HTMLElement) {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    })

    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      unit: "px",
      format: [canvas.width, canvas.height]
    })

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)

    const blob = pdf.output("blob")

    return blob
  }
  async function copyImageBlobToClipboard(blob: Blob) {
    // @ts-ignore
    if (
      !navigator.clipboard ||
      typeof (window as any).ClipboardItem === "undefined"
    ) {
      return false
    }

    try {
      // @ts-ignore
      const item = new ClipboardItem({ [blob.type]: blob })

      // @ts-ignore
      await navigator.clipboard.write([item])

      return true
    } catch (err) {
      console.error("No se pudo copiar al portapapeles:", err)
      return false
    }
  }

  function downloadBlob(blob: Blob, filename = "aviso.pdf") {
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename

    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  }

  const handleGuardarYEnviarFactura = async () => {
    if (!aptoActual) {
      alert("Selecciona un apartamento antes de guardar.")
      return
    }

    const periodoTexto =
      mesAviso === "Todo el año"
        ? `Año ${anioAviso}`
        : `${mesAviso} de ${anioAviso}`

    const nuevoCobro = {
  fecha: new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }),

  unidad: aptoActual.unidad,

  propietario: aptoActual.propietario,

  telefono: aptoActual.telefono,

  correo: aptoActual.email,

  periodo: periodoTexto,

  mes: mesAviso,

  anio: anioAviso,

  cuotaAdministrativa:
    `$ ${(
      cuotaBase?.monto || 0
    ).toLocaleString("es-CO")}`,

  cargosAdicionales: [
    ...(saldoMoraCalculado > 0
      ? [{
          concepto: "Deuda de Mora",
          valor: `$ ${saldoMoraCalculado.toLocaleString("es-CO")}`
        }]
      : []),

    ...cargosAdicionales.map(c => ({
      concepto: c.concepto,
      valor: `$ ${c.monto.toLocaleString("es-CO")}`
    }))
  ],

  total:
    `$ ${totalSumaNumerica.toLocaleString("es-CO")}`,

  estado: "Pendiente"
}

const cobrosGuardados = JSON.parse(
  localStorage.getItem("cobros_db") || "[]"
)

cobrosGuardados.push(nuevoCobro)

localStorage.setItem(
  "cobros_db",
  JSON.stringify(cobrosGuardados)
)

const { data, error } = await supabase
  .from("cobros")
  .insert([nuevoCobro])

console.log("DATA:", data)
console.log("ERROR:", error)

    const plantillaElementId = "plantilla-to-export"

    const plantillaEl =
      document.getElementById(plantillaElementId)

    if (!plantillaEl) {
      alert("No se encontró la plantilla para exportar.")
      return
    }

    try {
      const phoneIntl = formatPhoneForWhatsApp(
        aptoActual.telefono
      )

      if (!phoneIntl) {
        alert("El apartamento no tiene un número válido.")
        return
      }

      const mensajeTexto =
        `Hola ${aptoActual.propietario}, le envío su aviso de cobro para ${periodoTexto}.`

      const mensaje = encodeURIComponent(mensajeTexto)

      const pngBlob =
        await generatePngBlobFromElement(
          plantillaEl as HTMLElement
        )

      const copied =
        await copyImageBlobToClipboard(pngBlob)

      if (copied) {
        setIdAptoSeleccionado("")
        setCargosAdicionales([])
        setCuotaBase(null)

        alert(
          "La imagen del aviso se copió al portapapeles."
        )

        window.location.href =
          `whatsapp://send?phone=${phoneIntl}&text=${mensaje}`

        return
      }

      const pdfBlob =
        await generatePdfBlobFromElement(
          plantillaEl as HTMLElement
        )

      downloadBlob(
        pdfBlob,
        `aviso_${aptoActual.unidad}.pdf`
      )

      const waUrl =
        `https://wa.me/${encodeURIComponent(phoneIntl)}?text=${mensaje}`

      window.open(waUrl, "_blank")

      alert(
        "Se descargó el PDF y se abrió WhatsApp."
      )

      setIdAptoSeleccionado("")
      setCargosAdicionales([])
      setCuotaBase(null)

    } catch (err) {
      console.error(err)

      alert(
        "Ocurrió un error al generar la plantilla."
      )
    }
  }

  return (
    <div className="font-sans text-[#1e293b]">

      <div className="mb-6">
        <h1 className="text-[26px] font-bold tracking-tight">
          Avisos de Cobro
        </h1>

        <p className="text-[#64748b] text-sm">
          Genera el estado de cuenta mensual por apartamento
        </p>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-4 mb-6">
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
          APARTAMENTO
        </label>

        <select
          value={idAptoSeleccionado}
          onChange={(e) =>
            setIdAptoSeleccionado(e.target.value)
          }
          className="w-full border border-[#cbd5e1] rounded-lg px-3 py-1.5 text-sm bg-white outline-none text-[#334155] cursor-pointer"
        >
          <option value="">
            Seleccione un apartamento...
          </option>
          {apartamentos.map((u, idx) => (
            <option
              key={idx}
              value={idx.toString()}
            >
              Apto. {u.unidad} — {u.propietario}
            </option>
          ))}
        </select>
      </div>

      {!aptoActual ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] text-center pt-8">
          <div className="bg-gray-100 p-4 rounded-xl text-gray-400 mb-3">
            <FileText className="w-8 h-8 stroke-[1.5]" />
          </div>
          <p className="text-[14px] font-medium text-[#64748b]">
            Seleccione un apartamento para generar el aviso de cobro
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-6 max-w-[800px] mx-auto animate-fade-in">
          
          {/* HEADER */}
          <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">
                Aviso de Cobro
              </h2>
              <p className="text-sm text-[#64748b]">
                {mesAviso === "Todo el año"
                  ? `Año ${anioAviso}`
                  : `${mesAviso} de ${anioAviso}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGuardarYEnviarFactura}
              className="bg-[#2d4486] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#22366d] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Guardar y Enviar
            </button>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50/50 p-4 rounded-xl border">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">APARTAMENTO</p>
              <p className="font-bold text-base mt-0.5">{aptoActual.unidad}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-3">TELÉFONO</p>
              <p className="text-[#334155] mt-0.5">{aptoActual.telefono}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PROPIETARIO</p>
              <p className="text-[#334155] capitalize font-bold mt-0.5">{aptoActual.propietario}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-3">CORREO ELECTRÓNICO</p>
              <p className="text-[#334155] mt-0.5">{aptoActual.email}</p>
            </div>
          </div>

          {/* CUOTA ADMINISTRATIVA CON LA MORA DEBAJO (OPCIÓN B) */}
          {cuotaBase && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                CUOTA ADMINISTRATIVA
              </h3>
              <div className="border rounded-xl overflow-hidden bg-white shadow-sm divide-y divide-gray-100">
                
                {/* Renglón de la Cuota del Mes */}
                <div className="grid grid-cols-2 px-4 py-3.5 items-center text-sm">
                  <div className="font-medium text-[#0f172a]">{cuotaBase.concepto}</div>
                  <div className="text-right font-bold text-[#0f172a]">
                    $ {cuotaBase.monto.toLocaleString("es-CO")}
                  </div>
                </div>

                {/* Renglón Quirúrgico de la Mora Traída del Portafolio */}
                {saldoMoraCalculado > 0 && (
                  <div className="grid grid-cols-2 px-4 py-3.5 items-center text-sm bg-red-50/20">
                    <div className="font-bold text-red-600">Deuda de Mora (Cartera)</div>
                    <div className="text-right font-black text-red-600">
                      $ {saldoMoraCalculado.toLocaleString("es-CO")}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* CARGOS ADICIONALES ORIGINALES (MANTENIENDO TU DISEÑO) */}
          {cargosAdicionales.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                CARGOS ADICIONALES
              </h3>
              <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                {cargosAdicionales.map((linea, i) => (
                  <div key={i} className="grid grid-cols-2 px-4 py-3.5 border-b last:border-0 items-center text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-extrabold ${linea.tipo === "Multa" ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-purple-50 text-purple-600 border border-purple-200"}`}>
                          {linea.tipo}
                        </span>
                        <span className="font-bold text-[#0f172a]">{linea.concepto}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 ml-14">
                        {linea.tipo === "Multa" ? "exceso" : "zona comun"}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-5">
                      <span className="font-bold text-[#0f172a] text-sm">
                        $ {linea.monto.toLocaleString("es-CO")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEliminarCargo(i)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* BOTONES ADICIONALES ORIGINALES */}
          <button
            type="button"
            onClick={() => setIsLineaModalOpen(true)}
            className="flex items-center gap-1 text-sm font-semibold text-[#2d4486] hover:underline cursor-pointer mb-6"
          >
            <Plus className="w-4 h-4" />
            Agregar línea
          </button>

          {/* TOTAL */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3 px-4 flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[17px] font-bold text-[#0f172a]">
                Total a Pagar
              </h3>
              <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                {mesAviso === "Todo el año"
                  ? `Año ${anioAviso}`
                  : `${mesAviso} de ${anioAviso}`}
              </p>
            </div>
            <div className="text-[24px] font-bold text-[#1d4ed8]">
              $ {totalSumaNumerica.toLocaleString("es-CO")}
            </div>
          </div>

          {/* MENSAJE */}
          <p className="text-center text-[12px] text-gray-400 leading-relaxed max-w-[650px] mx-auto">
            {mensajeConfigurado}
          </p>

          <AgregarLineaModal
            isOpen={isLineaModalOpen}
            onClose={() => setIsLineaModalOpen(false)}
            onAgregar={handleAgregarNuevaLineaFactura}
          />
        </div>
      )}

      {/* TU COMPONENTE ORIGINAL INTACTO SIN ALTERACIONES DE DISEÑO */}
      <div
        id="plantilla-to-export"
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          width: 800
        }}
      >
        <PlantillaPropietario
          nombreTorre={localStorage.getItem("nombre_torre") || "TORRE 44"}
          logoUrl={localStorage.getItem("logo_url") || ""}
          moneda={localStorage.getItem("moneda") || "COP"}
          periodoMesAnio={mesAviso === "Todo el año" ? `Año ${anioAviso}` : `${mesAviso} de ${anioAviso}`}
          numeroUnidad={aptoActual?.unidad ?? ""}
          nombrePropietario={aptoActual?.propietario ?? ""}
          telefonoPropietario={aptoActual?.telefono ?? ""}
          correoPropietario={aptoActual?.email ?? ""}
          nombreCuotaMantenimiento={cuotaBase?.concepto ?? "Cuota Administrativa"}
          montoCuotaMantenimiento={cuotaBase?.monto ?? 0}
          cargosAdicionales={[
            // Inyectamos de forma limpia la mora también en tu plantilla original para el PDF
            ...(saldoMoraCalculado > 0 ? [{ tipo: "Mora", concepto: "Deuda de Mora", monto: saldoMoraCalculado }] : []),
            ...cargosAdicionales.map(c => ({ tipo: c.tipo, concepto: c.concepto, monto: c.monto }))
          ]}
          mensajePiePagina={mensajeConfigurado}
        />
      </div>
    </div>
  )
}
