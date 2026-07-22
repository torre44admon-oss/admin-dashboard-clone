"use client"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { FileText, Send, Trash2 } from "lucide-react"
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
  descripcion?: string
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
  const [cuotaBase, setCuotaBase] = useState<LineaAviso | null>(null)
  const [cargosAdicionales, setCargosAdicionales] = useState<LineaAviso[]>([])
  const [mensajeConfigurado, setMensajeConfigurado] = useState("")
  const [saldoMoraCalculado, setSaldoMoraCalculado] = useState<number>(0)
  const [mesesVencidos, setMesesVencidos] = useState<string[]>([])
  const [interesMoraCalculado, setInteresMoraCalculado] = useState<number>(0)
  const [enviandoAvisos, setEnviandoAvisos] = useState(false)

  const enviarAvisosMasivos = async () => {
    setEnviandoAvisos(true)
    try {
      const res = await fetch("/api/cron-aviso?manual=true")
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`¡Envío masivo completado! Se despacharon avisos a ${data.total_procesado} unidades.`)
      } else {
        toast.error(`Error en el envío masivo: ${data.error || "Error desconocido"}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error de comunicación con el servidor de avisos.")
    } finally {
      setEnviandoAvisos(false)
    }
  }

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
      if (aptoActual) {
        const cargarDatos = async () => {

          // DEUDA
          const { data: carteraData } = await supabase
            .from("cartera")
            .select("deuda")
            .eq("unidad", aptoActual.unidad)
            .single()

          setSaldoMoraCalculado(carteraData?.deuda || 0)

          // MESES VENCIDOS Y CÁLCULO DE MORA DIARIA
          let mensualidadesData: any[] | null = null
          try {
            const { data } = await supabase
              .from("mensualidades")
              .select("mes, anio, valor, fecha_limite")
              .eq("unidad", aptoActual.unidad)
              .eq("estado", "Pendiente")
            mensualidadesData = data
          } catch (err) {
            console.log("Error al consultar mensualidades en Supabase:", err)
          }

          let tasasHistoricas: any[] | null = null
          try {
            const { data } = await supabase
              .from("configuracion_tasas_mora")
              .select("*")
            tasasHistoricas = data
          } catch (err) {
            console.log("Error al consultar configuracion_tasas_mora en Supabase:", err)
          }

          const mapaTasas: Record<string, { ibc: number, mult: number }> = {}
          let dbGraciaMulta = 15
          let dbGraciaProyecto = 60

          if (tasasHistoricas) {
            tasasHistoricas.forEach((t: any) => {
              mapaTasas[`${String(t.mes_vigencia).toLowerCase()}_${t.ano_vigencia}`] = {
                ibc: parseFloat(t.ibc_banco_anual),
                mult: parseFloat(t.multiplicador_ley)
              }
            })
            // Extraer del último registro de configuración de la base de datos
            const ultimoRegistro = [...tasasHistoricas].sort((a, b) => Number(b.id) - Number(a.id))[0]
            if (ultimoRegistro) {
              if (ultimoRegistro.dias_gracia_multas !== undefined && ultimoRegistro.dias_gracia_multas !== null) {
                dbGraciaMulta = ultimoRegistro.dias_gracia_multas
              }
              if (ultimoRegistro.dias_gracia_proyectos !== undefined && ultimoRegistro.dias_gracia_proyectos !== null) {
                dbGraciaProyecto = ultimoRegistro.dias_gracia_proyectos
              }
            }
          }

          // MULTAS ASIGNADAS
          let multasData: any[] | null = null
          try {
            const { data } = await supabase
              .from("multas_asignadas")
              .select("*")
              .eq("unidad", aptoActual.unidad)
              .in("estado", ["Pendiente", "Vencida"])
            multasData = data
          } catch (err) {
            console.log("Error al consultar multas_asignadas en Supabase:", err)
          }

          // PROYECTOS ASIGNADOS
          let proyectosData: any[] | null = null
          try {
            const { data } = await supabase
              .from("proyectos_asignados")
              .select("*")
              .eq("unidad", aptoActual.unidad)
              .eq("estado", "Pendiente")
            proyectosData = data
          } catch (err) {
            console.log("Error al consultar proyectos_asignados en Supabase:", err)
          }

          // CALCULAR INTERÉS DE MORA SIMPLE DIARIO (LEY 675 DE 2001)
          let interesAcumuladoTotal = 0
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)

          const localTasaRef = typeof window !== "undefined" ? parseFloat(localStorage.getItem("tasa_mora") || "2.4") : 2.4

          // 1. Intereses de Mensualidades (Cuotas Ordinarias) - Sin Gracia (Empieza inmediatamente)
          if (mensualidadesData) {
            const filtrados = mensualidadesData
              .filter((m: any) => {
                const esMesActual = String(m.mes).toLowerCase() === String(mesAviso).toLowerCase() && String(m.anio) === String(anioAviso)
                return !esMesActual
              })
              .map((m: any) => `${m.mes} ${m.anio}`)
            setMesesVencidos(filtrados)

            mensualidadesData.forEach((m: any) => {
              const esMesActual = String(m.mes).toLowerCase() === String(mesAviso).toLowerCase() && String(m.anio) === String(anioAviso)
              if (esMesActual) return

              const fechaLimite = new Date(m.fecha_limite)
              fechaLimite.setHours(0, 0, 0, 0)
              const diffTime = hoy.getTime() - fechaLimite.getTime()
              const diasRetraso = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0

              if (diasRetraso > 0) {
                const claveMes = `${String(m.mes).toLowerCase()}_${m.anio}`
                const tasaInfo = mapaTasas[claveMes]
                
                let tasaDiaria = 0
                if (tasaInfo) {
                  let ibcVal = parseFloat(String(tasaInfo.ibc))
                  if (ibcVal < 1) ibcVal = ibcVal * 100 // Normalizar decimales a porcentaje (ej: 0.1919 -> 19.19)
                  const multVal = parseFloat(String(tasaInfo.mult || 1.5))
                  const usuraAnual = ibcVal * multVal
                  tasaDiaria = Math.pow(1 + usuraAnual / 100, 1 / 365) - 1
                } else {
                  tasaDiaria = (localTasaRef / 100) / 30
                }

                const valorCuotaNeto = Number(m.valor) || 0
                const interesMora = Math.round(valorCuotaNeto * tasaDiaria * diasRetraso)
                interesAcumuladoTotal += interesMora
              }
            })
          } else {
            setMesesVencidos([])
          }

          // 2. Intereses de Multas con Días de Gracia de la Configuración Sincronizada
          const diasGraciaMulta = dbGraciaMulta
          if (multasData) {
            multasData.forEach((m: any) => {
              const fechaAsig = new Date(m.fecha_asignacion || m.created_at)
              fechaAsig.setHours(0, 0, 0, 0)
              const diffTime = hoy.getTime() - fechaAsig.getTime()
              const diasRetraso = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0

              if (diasRetraso > diasGraciaMulta) {
                const mesesNombres = [
                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ]
                const mesNombre = mesesNombres[fechaAsig.getMonth()]
                const claveMes = `${String(mesNombre).toLowerCase()}_${fechaAsig.getFullYear()}`
                const tasaInfo = mapaTasas[claveMes]

                let tasaDiaria = 0
                if (tasaInfo) {
                  let ibcVal = parseFloat(String(tasaInfo.ibc))
                  if (ibcVal < 1) ibcVal = ibcVal * 100
                  const multVal = parseFloat(String(tasaInfo.mult || 1.5))
                  const usuraAnual = ibcVal * multVal
                  tasaDiaria = Math.pow(1 + usuraAnual / 100, 1 / 365) - 1
                } else {
                  tasaDiaria = (localTasaRef / 100) / 30
                }

                const valorMultaNeto = Number(m.valor) || 0
                const interesMora = Math.round(valorMultaNeto * tasaDiaria * (diasRetraso - diasGraciaMulta))
                interesAcumuladoTotal += interesMora
              }
            })
          }

          // 3. Intereses de Proyectos con Días de Gracia de la Configuración Sincronizada
          const diasGraciaProyecto = dbGraciaProyecto
          if (proyectosData) {
            proyectosData.forEach((p: any) => {
              const fechaAsig = new Date(p.fecha || p.created_at)
              fechaAsig.setHours(0, 0, 0, 0)
              const diffTime = hoy.getTime() - fechaAsig.getTime()
              const diasRetraso = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0

              if (diasRetraso > diasGraciaProyecto) {
                const mesesNombres = [
                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ]
                const mesNombre = mesesNombres[fechaAsig.getMonth()]
                const claveMes = `${String(mesNombre).toLowerCase()}_${fechaAsig.getFullYear()}`
                const tasaInfo = mapaTasas[claveMes]

                let tasaDiaria = 0
                if (tasaInfo) {
                  let ibcVal = parseFloat(String(tasaInfo.ibc))
                  if (ibcVal < 1) ibcVal = ibcVal * 100
                  const multVal = parseFloat(String(tasaInfo.mult || 1.5))
                  const usuraAnual = ibcVal * multVal
                  tasaDiaria = Math.pow(1 + usuraAnual / 100, 1 / 365) - 1
                } else {
                  tasaDiaria = (localTasaRef / 100) / 30
                }

                const valorProyectoNeto = Number(p.valor) || 0
                const interesMora = Math.round(valorProyectoNeto * tasaDiaria * (diasRetraso - diasGraciaProyecto))
                interesAcumuladoTotal += interesMora
              }
            })
          }

          setInteresMoraCalculado(interesAcumuladoTotal)

          // CONVERTIR MULTAS Y PROYECTOS PENDIENTES PARA EL RECIBO DE COBRO
          const multasConvertidas = (multasData || []).map((m: any) => ({
            tipo: "Multa",
            concepto: m.tipo_multa,
            descripcion: m.descripcion,
            monto: Number(String(m.valor).replace(/[^0-9]/g, "")) || 0
          }))

          const proyectosConvertidos = (proyectosData || []).map((p: any) => ({
            tipo: "Proyecto",
            concepto: p.proyecto,
            monto: Number(p.valor) || 0
          }))

          setCargosAdicionales([...multasConvertidas, ...proyectosConvertidos])
        }

        cargarDatos()
      }

    } else {
      setCuotaBase(null)
      setSaldoMoraCalculado(0)
      setMesesVencidos([])
      setInteresMoraCalculado(0)
    }
    
  }, [idAptoSeleccionado, mesAviso, anioAviso, apartamentos])
  // SUMA REAL COMPLETA: Incluye la Mora de Cartera e Intereses dentro del gran total
  const tasaMoraRef = typeof window !== "undefined" ? parseFloat(localStorage.getItem("tasa_mora") || "0") : 0

  const totalSumaNumerica =
    (cuotaBase ? cuotaBase.monto : 0) +
    saldoMoraCalculado +
    interesMoraCalculado +
    cargosAdicionales.reduce((acc, l) => acc + l.monto, 0)

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
      backgroundColor: "#0b0f19"
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
      backgroundColor: "#0b0f19"
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
async function uploadAvisoImage(blob: Blob) {
  const fileName = `aviso-${Date.now()}.png`

  const { error } = await supabase.storage
    .from("avisos")
    .upload(fileName, blob, {
      contentType: "image/png",
      upsert: true,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from("avisos")
    .getPublicUrl(fileName)

  return data.publicUrl
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
      toast.warning("Selecciona un apartamento antes de guardar.")
      return
    }

const { data: multasPendientes } = await supabase
  .from("multas_asignadas")
  .select("*")
  .eq("unidad", aptoActual.unidad)
  .in("estado", ["Pendiente", "Vencida"])
for (const multa of multasPendientes || []) {

  if (!multa.fecha_asignacion) {

    const hoy = new Date()

    const vencimiento = new Date()

    vencimiento.setDate(
      vencimiento.getDate() + 15
    )

    await supabase
      .from("multas_asignadas")
      .update({
        fecha_asignacion:
          hoy.toISOString().split("T")[0],

        fecha_vencimiento:
          vencimiento
            .toISOString()
            .split("T")[0]
      })
      .eq("id", multa.id)
  }
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

    ...(interesMoraCalculado > 0
      ? [{
          concepto: `Interés de Mora (${tasaMoraRef}%)`,
          valor: `$ ${interesMoraCalculado.toLocaleString("es-CO")}`
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

const mesesMap: Record<string, string> = {
  "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
  "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
  "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"
}

let diaConfig = 5
try {
  const { data: configData } = await supabase
    .from("configuracion_tasas_mora")
    .select("dia_limite_pago")
    .order("id", { ascending: false })
    .limit(1)
  if (configData && configData.length > 0 && configData[0].dia_limite_pago !== undefined && configData[0].dia_limite_pago !== null) {
    diaConfig = configData[0].dia_limite_pago
  } else {
    diaConfig = parseInt(typeof window !== "undefined" ? localStorage.getItem("dia_pago_cuota") || "5" : "5")
  }
} catch (err) {
  diaConfig = parseInt(typeof window !== "undefined" ? localStorage.getItem("dia_pago_cuota") || "5" : "5")
}

const diaString = diaConfig < 10 ? `0${diaConfig}` : `${diaConfig}`
const mesNum = mesesMap[String(mesAviso).toLowerCase()] || "10"
const fechaLimiteString = mesAviso !== "Todo el año"
  ? `${anioAviso}-${mesNum}-${diaString}`
  : (() => {
      const hoyDate = new Date()
      hoyDate.setDate(hoyDate.getDate() + 10)
      return hoyDate.toISOString().split("T")[0]
    })()

// Verificar si ya existe mensualidad para este mes/año/unidad antes de insertar
const { data: mensExistente } = await supabase
  .from("mensualidades")
  .select("id")
  .eq("unidad", aptoActual.unidad)
  .eq("mes", mesAviso)
  .eq("anio", anioAviso)
  .maybeSingle()

if (!mensExistente) {
  await supabase
    .from("mensualidades")
    .insert([{
      unidad: aptoActual.unidad,
      mes: mesAviso,
      anio: anioAviso,
      valor: cuotaBase ? cuotaBase.monto : 20000,
      estado: "Pendiente",
      fecha_limite: fechaLimiteString
    }])
}

    const plantillaElementId = "plantilla-to-export"

    const plantillaEl =
      document.getElementById(plantillaElementId)

    if (!plantillaEl) {
      toast.error("No se encontró la plantilla para exportar.")
      return
    }

    try {
      const phoneIntl = formatPhoneForWhatsApp(
        aptoActual.telefono
      )
      if (!phoneIntl) {
        toast.error("El apartamento no tiene un número válido.")
        return
      }

      const mensajeTexto =
        `Hola ${aptoActual.propietario}, le envío su aviso de cobro para ${periodoTexto}.`

      const nombreTorre = localStorage.getItem("nombre_torre") || "TORRE 44"
      const logoUrl = localStorage.getItem("logo_url") || ""
      const direccion = localStorage.getItem("direccion_torre") || ""
      const montoCuota = cuotaBase?.monto ?? 20000

      const cargos = [
        ...(saldoMoraCalculado > 0 ? [{ concepto: "Deuda de Mora", monto: saldoMoraCalculado }] : []),
        ...(interesMoraCalculado > 0 ? [{ concepto: `Interés de Mora (${tasaMoraRef}%)`, monto: interesMoraCalculado }] : []),
        ...cargosAdicionales.map(c => ({ concepto: c.concepto, monto: c.monto }))
      ]

      const queryParams = new URLSearchParams({
        nombreTorre,
        logoUrl,
        periodo: periodoTexto,
        unidad: aptoActual.unidad,
        propietario: aptoActual.propietario,
        montoCuota: String(montoCuota),
        cargos: JSON.stringify(cargos),
        mensajePie: mensajeConfigurado,
        direccion
      })

      const origin = window.location.origin
      const avisoImageUrl = `${origin}/api/aviso-image?${queryParams.toString()}&t=${Date.now()}`

      const imgRes = await fetch(avisoImageUrl)
      const pngBlob = await imgRes.blob()

      const imageUrl = await uploadAvisoImage(pngBlob)

const respuestaWhatsapp = await fetch(
  "/api/whatsapp",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      telefono: phoneIntl,
      mensaje: mensajeTexto,
      imageUrl,
    }),
  }
)

const resultadoWhatsapp =
  await respuestaWhatsapp.json()
  console.log("URL IMAGEN:", imageUrl)

console.log(
  "WHATSAPP RESPONSE:",
  JSON.stringify(data, null, 2)
)

      const pdfBlob =
        await generatePdfBlobFromElement(
          plantillaEl as HTMLElement
        )

      downloadBlob(
        pdfBlob,
        `aviso_${aptoActual.unidad}.pdf`
      )


      toast.success(
  "Se descargó el PDF y se abrió WhatsApp."
)

      setIdAptoSeleccionado("")
      setCargosAdicionales([])
      setCuotaBase(null)

    } catch (err) {
      console.error(err)

      toast.error(
  "Ocurrió un error al generar la plantilla."
)
    }
  }

  return (
    <div className="font-sans text-slate-200 animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Avisos de Cobro
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Genera el estado de cuenta mensual por apartamento
          </p>
        </div>
        <button
          type="button"
          disabled={enviandoAvisos}
          onClick={enviarAvisosMasivos}
          className="bg-[#131926]/90 border border-[#1E293B]/50 hover:bg-[#1E293B]/40 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-bold transition-all active:scale-[0.98] self-start md:self-auto cursor-pointer shadow-md disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-indigo-400" />
          {enviandoAvisos ? "Enviando Avisos..." : "⚡ Enviar Avisos de Cobro a Todos"}
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 mb-6">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          APARTAMENTO
        </label>
        <select
          value={idAptoSeleccionado}
          onChange={(e) =>
            setIdAptoSeleccionado(e.target.value)
          }
          className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
        >
          <option value="">
            Seleccione un apartamento...
          </option>
          {apartamentos.map((u, idx) => (
            <option
              key={idx}
              value={idx.toString()}
              className="bg-[#131926] text-white"
            >
              Apto. {u.unidad} — {u.propietario}
            </option>
          ))}
        </select>
      </div>

      {!aptoActual ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] text-center pt-8 border border-dashed border-[#1E293B]/40 rounded-3xl bg-[#131926]/20">
          <div className="bg-[#1E293B]/60 p-4 rounded-xl text-slate-400 mb-3 border border-[#1E293B]/30">
            <FileText className="w-8 h-8 stroke-[1.5]" />
          </div>
          <p className="text-[14px] font-medium text-slate-400">
            Seleccione un apartamento para generar el aviso de cobro
          </p>
        </div>
      ) : (
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 max-w-[800px] mx-auto animate-[fadeIn_0.3s_ease-out]">
          
          {/* HEADER */}
          <div className="flex justify-between items-start border-b border-[#1E293B]/40 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Aviso de Cobro
              </h2>
              <p className="text-sm text-slate-400">
                {mesAviso === "Todo el año"
                  ? `Año ${anioAviso}`
                  : `${mesAviso} de ${anioAviso}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGuardarYEnviarFactura}
              className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              Guardar y Enviar
            </button>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-[#0B0F19]/90 p-4 rounded-2xl border border-[#1E293B]/30">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">APARTAMENTO</p>
              <p className="font-extrabold text-white text-lg mt-0.5">{aptoActual.unidad}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3">TELÉFONO</p>
              <p className="text-slate-300 mt-0.5 font-medium">{aptoActual.telefono}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PROPIETARIO</p>
              <p className="text-slate-200 capitalize font-bold text-base mt-0.5">{aptoActual.propietario}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3">CORREO ELECTRÓNICO</p>
              <p className="text-slate-300 mt-0.5 font-medium truncate">{aptoActual.email || "Sin correo electrónico"}</p>
            </div>
          </div>

          {/* CUOTA ADMINISTRATIVA CON LA MORA DEBAJO (OPCIÓN B) */}
          {cuotaBase && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                CUOTA ADMINISTRATIVA
              </h3>
              <div className="border border-[#1E293B]/30 rounded-2xl overflow-hidden bg-[#0B0F19]/90 divide-y divide-[#1E293B]/20">
                {/* Renglón de la Cuota del Mes */}
                <div className="grid grid-cols-2 px-4 py-3.5 items-center text-sm">
                  <div className="font-medium text-slate-200">{cuotaBase.concepto}</div>
                  <div className="text-right font-bold text-white">
                    $ {cuotaBase.monto.toLocaleString("es-CO")}
                  </div>
                </div>

                {/* Meses Vencidos */}
                {mesesVencidos.length > 0 && (
                  <div className="px-4 py-2.5 text-xs text-amber-400 bg-amber-500/5 border-t border-[#1E293B]/20 font-medium">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-500/80 mr-1.5">Meses Vencidos:</span>
                    {mesesVencidos.join(", ")}
                  </div>
                )}

                {/* Renglón de la Mora */}
                {saldoMoraCalculado > 0 && (
                  <div className="grid grid-cols-2 px-4 py-3.5 items-center text-sm bg-red-500/5">
                    <div className="font-bold text-red-400">Deuda de Mora (Cartera)</div>
                    <div className="text-right font-black text-red-400">
                      $ {saldoMoraCalculado.toLocaleString("es-CO")}
                    </div>
                  </div>
                )}

                {/* Renglón del Interés de Mora */}
                {interesMoraCalculado > 0 && (
                  <div className="grid grid-cols-2 px-4 py-3.5 items-center text-sm bg-red-500/10 border-t border-red-500/10 animate-[fadeIn_0.3s_ease-out]">
                    <div className="font-bold text-red-300">Interés de Mora ({tasaMoraRef}%)</div>
                    <div className="text-right font-black text-red-300">
                      $ {interesMoraCalculado.toLocaleString("es-CO")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CARGOS ADICIONALES ORIGINALES */}
          {cargosAdicionales.length > 0 && (
            <div className="mb-6 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                CARGOS ADICIONALES
              </h3>
              <div className="border border-[#1E293B]/30 rounded-2xl overflow-hidden bg-[#0B0F19]/90 divide-y divide-[#1E293B]/20">
                {cargosAdicionales.map((linea, i) => (
                  <div key={i} className="grid grid-cols-2 px-4 py-3.5 items-center text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-extrabold border ${
                          linea.tipo === "Multa" 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          {linea.tipo}
                        </span>
                        <span className="font-bold text-slate-200">{linea.concepto}</span>
                      </div>
                      {linea.descripcion && (
                        <p className="text-[11px] text-slate-500 mt-0.5 ml-14">
                          {linea.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-4">
                      <span className="font-bold text-white text-sm">
                        $ {linea.monto.toLocaleString("es-CO")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEliminarCargo(i)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* TOTAL */}
          <div className="bg-[#0B0F19]/90 border border-[#1E293B]/30 rounded-2xl py-4 px-5 flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">
                Total a Pagar
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {mesAviso === "Todo el año"
                  ? `Año ${anioAviso}`
                  : `${mesAviso} de ${anioAviso}`}
              </p>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              $ {totalSumaNumerica.toLocaleString("es-CO")}
            </div>
          </div>

          {/* MENSAJE */}
          <p className="text-center text-[12px] text-slate-400 leading-relaxed max-w-[650px] mx-auto bg-white/5 p-3.5 rounded-xl border border-white/5">
            {mensajeConfigurado}
          </p>
        </div>
      )}

      {/* COMPONENTE ORIGINAL PARA EL PDF */}
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
          direccionTorre={localStorage.getItem("direccion_torre") || ""}
          periodoMesAnio={mesAviso === "Todo el año" ? `Año ${anioAviso}` : `${mesAviso} de ${anioAviso}`}
          numeroUnidad={aptoActual?.unidad ?? ""}
          nombrePropietario={aptoActual?.propietario ?? ""}
          telefonoPropietario={aptoActual?.telefono ?? ""}
          correoPropietario={aptoActual?.email ?? ""}
          nombreCuotaMantenimiento={cuotaBase?.concepto ?? "Cuota Administrativa"}
          montoCuotaMantenimiento={cuotaBase?.monto ?? 0}
          cargosAdicionales={[
            ...(saldoMoraCalculado > 0 ? [{ tipo: "Mora", concepto: "Deuda de Mora", monto: saldoMoraCalculado }] : []),
            ...(interesMoraCalculado > 0 ? [{ tipo: "Interés", concepto: `Interés de Mora (${tasaMoraRef}%)`, monto: interesMoraCalculado }] : []),
            ...cargosAdicionales.map(c => ({ tipo: c.tipo, concepto: c.concepto, monto: c.monto }))
          ]}
          mensajePiePagina={mensajeConfigurado}
          mesesVencidos={mesesVencidos}
        />
      </div>
    </div>
  )
}