"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { 
  Download, 
  Upload, 
  ShieldCheck, 
  CalendarCheck, 
  Image as ImageIcon, 
  Trash2, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Folder, 
  Key,
  Database
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ConfiguracionContent() {
  const [nombreTorre, setNombreTorre] = useState("Torre 44")
  const [nombreCuota, setNombreCuota] = useState("Cuota Administrativa")
  const [montoFijo, setMontoFijo] = useState("20000")
  const [moneda, setMoneda] = useState("Peso Colombiano (COP)")
  const [logoUrl, setLogoUrl] = useState("")
  const [direccion, setDireccion] = useState("")
  
  // REGLES DE MORA Y VENCIMIENTOS
  const [tasaMora, setTasaMora] = useState("2")
  const [ibcAnual, setIbcAnual] = useState("19.19")
  const [multiplicadorMora, setMultiplicadorMora] = useState("1.5")
  const [diaPagoCuota, setDiaPagoCuota] = useState("5")
  const [diasVencimientoMulta, setDiasVencimientoMulta] = useState("15")
  const [diasVencimientoProyecto, setDiasVencimientoProyecto] = useState("30")
  const [telefonoReportes, setTelefonoReportes] = useState("")
  const [admins, setAdmins] = useState<{ phone: string; reports: boolean; commands: boolean }[]>([
    { phone: "", reports: true, commands: true }
  ])
  const [diaReporteAutomatico, setDiaReporteAutomatico] = useState("28")
  
  // States para el Time Picker del Informe
  const [horaRep, setHoraRep] = useState("08")
  const [minutoRep, setMinutoRep] = useState("00")
  const [periodoRep, setPeriodoRep] = useState("AM")

  const [envioAutomaticoAvisos, setEnvioAutomaticoAvisos] = useState(false)
  const [diaEnvioAvisos, setDiaEnvioAvisos] = useState("1")
  
  // States para el Time Picker de los Avisos
  const [horaAvi, setHoraAvi] = useState("08")
  const [minutoAvi, setMinutoAvi] = useState("00")
  const [periodoAvi, setPeriodoAvi] = useState("AM")

  const convertirA24h = (h: string, m: string, p: string) => {
    let hh = parseInt(h)
    if (p === "PM" && hh < 12) hh += 12
    if (p === "AM" && hh === 12) hh = 0
    const hhStr = hh < 10 ? `0${hh}` : `${hh}`
    return `${hhStr}:${m}`
  }

  const convertirDesde24h = (time24: string) => {
    const [hhStr, mmStr] = (time24 || "08:00").split(":")
    let hh = parseInt(hhStr)
    let mm = mmStr || "00"
    let p = "AM"
    if (hh >= 12) {
      p = "PM"
      if (hh > 12) hh -= 12
    }
    if (hh === 0) hh = 12
    const hStr = hh < 10 ? `0${hh}` : `${hh}`
    return { h: hStr, m: mm, p }
  }

  const [mensajeAviso, setMensajeAviso] = useState(
    "Ej: El pago debe realizarse a mas tardar el dia 5 de cada mes.\nNro. de cuenta: 123-456-789\nPor favor indicar numero de apartamento en la referencia."
  )
  const [rutaCarpeta, setRutaCarpeta] = useState(
    "C:\\Users\\Perdomo G\\OneDrive\\Escritorio\\ADMINISTRACION TORRE 44"
  )

  // LOGIN
  const [loginActivo, setLoginActivo] = useState(true)
  const [claveActual, setClaveActual] = useState("")
  const [nuevaClave, setNuevaClave] = useState("")

  // RESET
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [claveAutorizacion, setClaveAutorizacion] = useState("")

  const [enviandoReporte, setEnviandoReporte] = useState(false)
  const [enviandoAvisos, setEnviandoAvisos] = useState(false)

  const enviarAvisosAhora = async () => {
    setEnviandoAvisos(true)
    try {
      const res = await fetch("/api/cron-aviso?manual=true")
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`¡Se enviaron avisos de cobro a ${data.total_procesado} unidades!`)
      } else {
        toast.error(`Error al enviar: ${data.error || "Error desconocido"}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al conectar con la API de envío de avisos.")
    } finally {
      setEnviandoAvisos(false)
    }
  }

  // SECCIONES EXPANDIBLES
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTorreInfo, setShowTorreInfo] = useState(true)
  const [showCuotaInfo, setShowCuotaInfo] = useState(true)
  const [showMoraRules, setShowMoraRules] = useState(true)
  const [showSecurity, setShowSecurity] = useState(true)
  const [showAvisoMsg, setShowAvisoMsg] = useState(true)
  const [showDbBackup, setShowDbBackup] = useState(true)
  const [showReportConfig, setShowReportConfig] = useState(true)
  const [showAvisoConfig, setShowAvisoConfig] = useState(true)

  // CARGAR DATOS GUARDADOS
  useEffect(() => {
    const nombreGuardado = localStorage.getItem("nombre_torre")
    const cuotaGuardada = localStorage.getItem("nombre_cuota")
    const montoGuardado = localStorage.getItem("monto_fijo")
    const monedaGuardada = localStorage.getItem("moneda")
    const logoGuardado = localStorage.getItem("logo_url")
    const direccionGuardada = localStorage.getItem("direccion_torre")
    const mensajeGuardado = localStorage.getItem("mensaje_aviso")
    const rutaGuardada = localStorage.getItem("ruta_carpeta")
    const loginGuardado = localStorage.getItem("login_activo")

    // Reglas de Mora
    const tasaMoraGuardada = localStorage.getItem("tasa_mora")
    const diaPagoGuardado = localStorage.getItem("dia_pago_cuota")
    const diasMultaGuardado = localStorage.getItem("dias_vencimiento_multa")
    const diasProyectoGuardado = localStorage.getItem("dias_vencimiento_proyecto")
    const ibcGuardado = localStorage.getItem("ibc_anual")
    const multiplicadorGuardado = localStorage.getItem("multiplicador_mora")
    const telReportesGuardado = localStorage.getItem("telefono_reportes")
    const diaReporteGuardado = localStorage.getItem("dia_reporte_automatico")
    const horaReporteGuardado = localStorage.getItem("hora_reporte_automatico")
    const autoAvisosGuardado = localStorage.getItem("envio_automatico_avisos")
    const diaAvisosGuardado = localStorage.getItem("dia_envio_avisos")
    const horaAvisosGuardado = localStorage.getItem("hora_envio_avisos")

    if (nombreGuardado) setNombreTorre(nombreGuardado)
    if (cuotaGuardada) setNombreCuota(cuotaGuardada)
    if (montoGuardado) setMontoFijo(montoGuardado)
    if (monedaGuardada) setMoneda(monedaGuardada)
    if (logoGuardado) setLogoUrl(logoGuardado)
    if (direccionGuardada) setDireccion(direccionGuardada)
    if (mensajeGuardado) setMensajeAviso(mensajeGuardado)
    if (rutaGuardada) setRutaCarpeta(rutaGuardada)
    if (loginGuardado !== null) setLoginActivo(loginGuardado === "true")

    if (tasaMoraGuardada) setTasaMora(tasaMoraGuardada)
    if (diaPagoGuardado) setDiaPagoCuota(diaPagoGuardado)
    if (diasMultaGuardado) setDiasVencimientoMulta(diasMultaGuardado)
    if (diasProyectoGuardado) setDiasVencimientoProyecto(diasProyectoGuardado)
    if (ibcGuardado) setIbcAnual(ibcGuardado)
    if (multiplicadorGuardado) setMultiplicadorMora(multiplicadorGuardado)
    if (telReportesGuardado) {
      setTelefonoReportes(telReportesGuardado)
      try {
        if (telReportesGuardado.startsWith("[")) {
          setAdmins(JSON.parse(telReportesGuardado))
        } else {
          setAdmins([{ phone: telReportesGuardado, reports: true, commands: true }])
        }
      } catch (e) {
        setAdmins([{ phone: telReportesGuardado, reports: true, commands: true }])
      }
    }
    if (diaReporteGuardado) setDiaReporteAutomatico(diaReporteGuardado)
    if (horaReporteGuardado) {
      const parsed = convertirDesde24h(horaReporteGuardado)
      setHoraRep(parsed.h)
      setMinutoRep(parsed.m)
      setPeriodoRep(parsed.p)
    }
    if (autoAvisosGuardado !== null) setEnvioAutomaticoAvisos(autoAvisosGuardado === "true")
    if (diaAvisosGuardado) setDiaEnvioAvisos(diaAvisosGuardado)
    if (horaAvisosGuardado) {
      const parsed = convertirDesde24h(horaAvisosGuardado)
      setHoraAvi(parsed.h)
      setMinutoAvi(parsed.m)
      setPeriodoAvi(parsed.p)
    }

    // Carga de la base de datos Supabase
    const cargarDesdeSupabase = async () => {
      try {
        // Tasas de mora
        const { data: moraDatos } = await supabase
          .from("configuracion_tasas_mora")
          .select("*")
          .order("id", { ascending: false })
          .limit(1)
        if (moraDatos && moraDatos.length > 0) {
          const r = moraDatos[0]
          setIbcAnual(String(r.ibc_banco_anual))
          setMultiplicadorMora(String(r.multiplicador_ley))
          const usura = parseFloat(r.ibc_banco_anual) * parseFloat(r.multiplicador_ley)
          setTasaMora(usura > 0 ? (usura / 12).toFixed(2) : "0")
          if (r.dia_limite_pago != null) { setDiaPagoCuota(String(r.dia_limite_pago)); localStorage.setItem("dia_pago_cuota", String(r.dia_limite_pago)) }
          if (r.dias_gracia_multas != null) { setDiasVencimientoMulta(String(r.dias_gracia_multas)); localStorage.setItem("dias_vencimiento_multa", String(r.dias_gracia_multas)) }
          if (r.dias_gracia_proyectos != null) { setDiasVencimientoProyecto(String(r.dias_gracia_proyectos)); localStorage.setItem("dias_vencimiento_proyecto", String(r.dias_gracia_proyectos)) }
        }

        // Configuración torre
        const { data: torreDatos } = await supabase
          .from("configuracion_torre")
          .select("*")
          .order("id", { ascending: false })
          .limit(1)
        if (torreDatos && torreDatos.length > 0) {
          const r = torreDatos[0]
          if (r.nombre_torre) { setNombreTorre(r.nombre_torre); localStorage.setItem("nombre_torre", r.nombre_torre) }
          if (r.logo_url) { setLogoUrl(r.logo_url); localStorage.setItem("logo_url", r.logo_url) }
          if (r.direccion_torre) { setDireccion(r.direccion_torre); localStorage.setItem("direccion_torre", r.direccion_torre) }
          if (r.monto_fijo) { setMontoFijo(r.monto_fijo); localStorage.setItem("monto_fijo", r.monto_fijo) }
          if (r.nombre_cuota) { setNombreCuota(r.nombre_cuota); localStorage.setItem("nombre_cuota", r.nombre_cuota) }
          if (r.moneda) { setMoneda(r.moneda); localStorage.setItem("moneda", r.moneda) }
        }

        // Mensaje aviso
        const { data: avisoDatos } = await supabase
          .from("configuracion_aviso")
          .select("mensaje_aviso")
          .order("id", { ascending: false })
          .limit(1)
        if (avisoDatos && avisoDatos.length > 0 && avisoDatos[0].mensaje_aviso) {
          setMensajeAviso(avisoDatos[0].mensaje_aviso)
          localStorage.setItem("mensaje_aviso", avisoDatos[0].mensaje_aviso)
        }

        // Configuración automático
        const { data: autoDatos } = await supabase
          .from("configuracion_automatico")
          .select("*")
          .order("id", { ascending: false })
          .limit(1)
        if (autoDatos && autoDatos.length > 0) {
          const r = autoDatos[0]
          if (r.telefono_reportes != null) { 
            const rawTel = String(r.telefono_reportes)
            setTelefonoReportes(rawTel)
            localStorage.setItem("telefono_reportes", rawTel)
            try {
              if (rawTel.startsWith("[")) {
                setAdmins(JSON.parse(rawTel))
              } else {
                setAdmins([{ phone: rawTel, reports: true, commands: true }])
              }
            } catch (e) {
              setAdmins([{ phone: rawTel, reports: true, commands: true }])
            }
          }
          if (r.dia_reporte_automatico != null) { setDiaReporteAutomatico(String(r.dia_reporte_automatico)); localStorage.setItem("dia_reporte_automatico", String(r.dia_reporte_automatico)) }
          if (r.hora_reporte_automatico != null) { const p = convertirDesde24h(String(r.hora_reporte_automatico)); setHoraRep(p.h); setMinutoRep(p.m); setPeriodoRep(p.p); localStorage.setItem("hora_reporte_automatico", String(r.hora_reporte_automatico)) }
          if (r.envio_automatico_avisos != null) { setEnvioAutomaticoAvisos(Boolean(r.envio_automatico_avisos)); localStorage.setItem("envio_automatico_avisos", String(r.envio_automatico_avisos)) }
          if (r.dia_envio_avisos != null) { setDiaEnvioAvisos(String(r.dia_envio_avisos)); localStorage.setItem("dia_envio_avisos", String(r.dia_envio_avisos)) }
          if (r.hora_envio_avisos != null) { const p = convertirDesde24h(String(r.hora_envio_avisos)); setHoraAvi(p.h); setMinutoAvi(p.m); setPeriodoAvi(p.p); localStorage.setItem("hora_envio_avisos", String(r.hora_envio_avisos)) }
        }

        // Clave de acceso
        const { data: accesoDatos } = await supabase
          .from("configuracion_acceso")
          .select("*")
          .order("id", { ascending: false })
          .limit(1)
        if (accesoDatos && accesoDatos.length > 0) {
          const r = accesoDatos[0]
          if (r.clave_acceso) localStorage.setItem("torre_admin_password", r.clave_acceso)
          if (r.login_activo != null) { setLoginActivo(Boolean(r.login_activo)); localStorage.setItem("login_activo", String(r.login_activo)) }
        }

      } catch (err) {
        console.log("No se pudo cargar configuración desde Supabase. Usando caché local...", err)
      }
    }
    cargarDesdeSupabase()
  }, [])

  // ACTUALIZAR TASAS DE INTERÉS
  const actualizarTasas = async () => {
    const parsedIbc = parseFloat(String(ibcAnual).replace(",", ".")) || 0
    const parsedMult = parseFloat(String(multiplicadorMora).replace(",", ".")) || 0
    const usuraCalculada = parsedIbc * parsedMult

    // Calcular tasa de mora equivalente nominal mensual (Usura / 12)
    const tasaMoraCalculada = usuraCalculada > 0 ? usuraCalculada / 12 : 0
    const tasaMoraCalculadaString = tasaMoraCalculada.toFixed(2)

    setTasaMora(tasaMoraCalculadaString)

    localStorage.setItem("ibc_anual", String(ibcAnual))
    localStorage.setItem("multiplicador_mora", String(multiplicadorMora))
    localStorage.setItem("tasa_mora", tasaMoraCalculadaString)

    // Guardar en Supabase
    try {
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ]
      const hoy = new Date()
      const mesVigente = meses[hoy.getMonth()]
      const anoVigente = hoy.getFullYear()

      const { error: dbError } = await supabase
        .from("configuracion_tasas_mora")
        .upsert({
          ibc_banco_anual: parsedIbc,
          multiplicador_ley: parsedMult,
          mes_vigencia: mesVigente,
          ano_vigencia: anoVigente,
          dia_limite_pago: parseInt(diaPagoCuota) || 5,
          dias_gracia_multas: parseInt(diasVencimientoMulta) || 15,
          dias_gracia_proyectos: parseInt(diasVencimientoProyecto) || 60,
          telefono_reportes: telefonoReportes,
          dia_reporte_automatico: parseInt(diaReporteAutomatico) || 28,
          hora_reporte_automatico: convertirA24h(horaRep, minutoRep, periodoRep),
          envio_automatico_avisos: envioAutomaticoAvisos,
          dia_envio_avisos: parseInt(diaEnvioAvisos) || 1,
          hora_envio_avisos: convertirA24h(horaAvi, minutoAvi, periodoAvi)
        }, { onConflict: "mes_vigencia,ano_vigencia" })

      if (dbError) throw dbError
      toast.success(`Tasas sincronizadas con base de datos para ${mesVigente} ${anoVigente}.`)
    } catch (err) {
      console.log("No se pudo guardar la configuración de tasas en Supabase. Se mantendrán localmente.", err)
    }

    toast.success(`Tasas actualizadas localmente. Tasa de mora establecida en ${tasaMoraCalculadaString}% mensual.`)
  }

  // GUARDAR CONFIGURACIÓN DE LA TORRE
  const guardarConfiguracionTorre = async () => {
    localStorage.setItem("nombre_torre", nombreTorre)
    localStorage.setItem("monto_fijo", montoFijo)
    localStorage.setItem("logo_url", logoUrl)
    localStorage.setItem("direccion_torre", direccion)
    
    // Guardar también por si se editan en avanzadas
    localStorage.setItem("nombre_cuota", nombreCuota)
    localStorage.setItem("moneda", moneda)

    // Reglas de Mora
    localStorage.setItem("tasa_mora", tasaMora)
    localStorage.setItem("dia_pago_cuota", diaPagoCuota)
    localStorage.setItem("dias_vencimiento_multa", diasVencimientoMulta)
    localStorage.setItem("dias_vencimiento_proyecto", diasVencimientoProyecto)
    localStorage.setItem("ibc_anual", ibcAnual)
    localStorage.setItem("multiplicador_mora", multiplicadorMora)
    localStorage.setItem("telefono_reportes", telefonoReportes)
    localStorage.setItem("dia_reporte_automatico", diaReporteAutomatico)
    localStorage.setItem("hora_reporte_automatico", convertirA24h(horaRep, minutoRep, periodoRep))
    localStorage.setItem("envio_automatico_avisos", String(envioAutomaticoAvisos))
    localStorage.setItem("dia_envio_avisos", diaEnvioAvisos)
    localStorage.setItem("hora_envio_avisos", convertirA24h(horaAvi, minutoAvi, periodoAvi))

    // Sincronizar en base de datos Supabase - tabla configuracion_tasas_mora (solo tasas y gracia)
    try {
      let finalLogoUrl = logoUrl
      if (logoUrl && logoUrl.startsWith("data:")) {
        try {
          const resLogo = await fetch(logoUrl)
          const blob = await resLogo.blob()
          const mimeType = blob.type
          const ext = mimeType.includes("webp") ? "webp" : mimeType.includes("jpeg") ? "jpg" : "png"
          const fileName = `logo-torre-${Date.now()}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from("avisos")
            .upload(fileName, blob, {
              contentType: mimeType,
              upsert: true
            })
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("avisos").getPublicUrl(fileName)
            finalLogoUrl = urlData.publicUrl
            setLogoUrl(finalLogoUrl)
            localStorage.setItem("logo_url", finalLogoUrl)
          }
        } catch (uploadErr) {
          console.error("Error al subir logo a storage:", uploadErr)
        }
      }

      const parsedIbc = parseFloat(String(ibcAnual).replace(",", ".")) || 0
      const parsedMult = parseFloat(String(multiplicadorMora).replace(",", ".")) || 0
      const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
      const hoy = new Date()
      const mesVigente = meses[hoy.getMonth()]
      const anoVigente = hoy.getFullYear()

      await supabase.from("configuracion_tasas_mora").upsert({
        ibc_banco_anual: parsedIbc,
        multiplicador_ley: parsedMult,
        mes_vigencia: mesVigente,
        ano_vigencia: anoVigente,
        dia_limite_pago: parseInt(diaPagoCuota) || 5,
        dias_gracia_multas: parseInt(diasVencimientoMulta) || 15,
        dias_gracia_proyectos: parseInt(diasVencimientoProyecto) || 60
      }, { onConflict: "mes_vigencia,ano_vigencia" })

      // configuracion_torre
      const { data: torreExist } = await supabase.from("configuracion_torre").select("id").order("id", { ascending: false }).limit(1)
      if (torreExist && torreExist.length > 0) {
        await supabase.from("configuracion_torre").update({ nombre_torre: nombreTorre, logo_url: finalLogoUrl, direccion_torre: direccion, monto_fijo: montoFijo, nombre_cuota: nombreCuota, moneda }).eq("id", torreExist[0].id)
      } else {
        await supabase.from("configuracion_torre").insert({ nombre_torre: nombreTorre, logo_url: finalLogoUrl, direccion_torre: direccion, monto_fijo: montoFijo, nombre_cuota: nombreCuota, moneda })
      }

      // configuracion_automatico
      const { data: autoExist } = await supabase.from("configuracion_automatico").select("id").order("id", { ascending: false }).limit(1)
      const adminsJson = JSON.stringify(admins)
      if (autoExist && autoExist.length > 0) {
        await supabase.from("configuracion_automatico").update({
          telefono_reportes: adminsJson,
          dia_reporte_automatico: parseInt(diaReporteAutomatico) || 28,
          hora_reporte_automatico: convertirA24h(horaRep, minutoRep, periodoRep),
          envio_automatico_avisos: envioAutomaticoAvisos,
          dia_envio_avisos: parseInt(diaEnvioAvisos) || 1,
          hora_envio_avisos: convertirA24h(horaAvi, minutoAvi, periodoAvi)
        }).eq("id", autoExist[0].id)
      } else {
        await supabase.from("configuracion_automatico").insert({
          telefono_reportes: adminsJson,
          dia_reporte_automatico: parseInt(diaReporteAutomatico) || 28,
          hora_reporte_automatico: convertirA24h(horaRep, minutoRep, periodoRep),
          envio_automatico_avisos: envioAutomaticoAvisos,
          dia_envio_avisos: parseInt(diaEnvioAvisos) || 1,
          hora_envio_avisos: convertirA24h(horaAvi, minutoAvi, periodoAvi)
        })
      }
      setTelefonoReportes(adminsJson)
      localStorage.setItem("telefono_reportes", adminsJson)

      toast.success("Configuración guardada y sincronizada con Supabase.")
    } catch (err) {
      console.log("No se pudo sincronizar en Supabase:", err)
    }

    // Notificar al sidebar y cabecera
    window.dispatchEvent(new Event("nombreTorreChanged"))

    toast.success("Configuración guardada correctamente")
  }

  // ENVIAR REPORTE DE DEUDORES POR WHATSAPP AHORA
  const enviarReporteDeudoresAhora = async () => {
    const reportAdmin = admins.find(a => a.reports && a.phone) || admins.find(a => a.phone)
    if (!reportAdmin || !reportAdmin.phone) {
      toast.error("Por favor, configure primero un teléfono del administrador.")
      return
    }
    setEnviandoReporte(true)
    try {
      const res = await fetch(`/api/cron-report?manual=true&telefono=${reportAdmin.phone}`)
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`¡Informe de deudores enviado con éxito por WhatsApp a ${data.destinatario}!`)
      } else {
        toast.error(`Error al enviar: ${data.error || "Error desconocido"}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al conectar con la API de reportes.")
    } finally {
      setEnviandoReporte(false)
    }
  }

  // EXPORTAR RESPALDO JSON
  const exportarDatos = () => {
    const keys = [
      "nombre_torre",
      "logo_url",
      "direccion_torre",
      "monto_fijo",
      "moneda",
      "nombre_cuota",
      "mensaje_aviso",
      "ruta_carpeta",
      "login_activo",
      "torre_admin_password",
      "apartamentos",
      "unidades",
      "multas",
      "portafolio_multas",
      "historial_multas",
      "proyectos",
      "proyectos_asignados",
      "cobros",
      "cartera",
      "historial_cartera",
      "tasa_mora",
      "dia_pago_cuota",
      "dias_vencimiento_multa",
      "dias_vencimiento_proyecto",
      "ibc_anual",
      "multiplicador_mora"
    ]
    const data: Record<string, string | null> = {}
    keys.forEach(k => {
      data[k] = localStorage.getItem(k)
    })
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `respaldo-${nombreTorre.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Respaldo exportado correctamente")
  }

  // IMPORTAR RESPALDO JSON
  const handleImportarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null) {
            localStorage.setItem(key, value as string)
          }
        })
        toast.success("¡Respaldo importado con éxito! Reiniciando panel...")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } catch (err) {
        toast.error("El archivo no es un respaldo válido")
      }
    }
    reader.readAsText(file)
  }

  // LOGO UPLOAD (BASE64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("El logo no debe pesar más de 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            const pngDataUrl = canvas.toDataURL("image/png")
            setLogoUrl(pngDataUrl)
            toast.success("Logo cargado y convertido a PNG (presiona Guardar para confirmar)")
            return
          }
        } catch (err) {
          console.error("Error al convertir logo a PNG:", err)
        }
        setLogoUrl(event.target?.result as string)
        toast.success("Logo cargado (presiona Guardar para confirmar)")
      }
      img.onerror = () => {
        setLogoUrl(event.target?.result as string)
        toast.success("Logo cargado (presiona Guardar para confirmar)")
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleEliminarLogo = () => {
    setLogoUrl("")
    toast.success("Logo quitado (presiona Guardar para confirmar)")
  }

  // GUARDAR MENSAJE
  const guardarMensajeAviso = async () => {
    localStorage.setItem("mensaje_aviso", mensajeAviso)
    try {
      const { data: avisoExist } = await supabase.from("configuracion_aviso").select("id").order("id", { ascending: false }).limit(1)
      if (avisoExist && avisoExist.length > 0) {
        await supabase.from("configuracion_aviso").update({ mensaje_aviso: mensajeAviso }).eq("id", avisoExist[0].id)
      } else {
        await supabase.from("configuracion_aviso").insert({ mensaje_aviso: mensajeAviso })
      }
    } catch (e) {
      console.log("No se pudo sincronizar el mensaje en Supabase", e)
    }
    toast.success("Mensaje guardado correctamente")
  }

  // GUARDAR RUTA
  const guardarRuta = () => {
    localStorage.setItem("ruta_carpeta", rutaCarpeta)
    toast.success("Ruta guardada correctamente")
  }

  // GUARDAR LOGIN / ACCESO
  const guardarConfiguracionAcceso = () => {
    localStorage.setItem("login_activo", String(loginActivo))
    toast.success("Configuración de acceso actualizada")
  }

  const handleDesactivarAcceso = () => {
    setLoginActivo(false)
    localStorage.setItem("login_activo", "false")
    toast.success("Inicio de sesión desactivado correctamente")
  }

  // CAMBIAR CLAVE
  const cambiarClave = () => {
    const claveGuardada = localStorage.getItem("torre_admin_password") || "12345"
    const claveActualLimpia = claveActual.trim()
    const nuevaClaveLimpia = nuevaClave.trim()

    if (claveActualLimpia !== claveGuardada.trim()) {
      toast.error("La contraseña actual no coincide")
      return
    }

    if (!nuevaClaveLimpia) {
      toast.warning("Ingrese una nueva contraseña")
      return
    }

    localStorage.setItem("torre_admin_password", nuevaClaveLimpia)
    setClaveActual("")
    setNuevaClave("")
    setLoginActivo(true)
    localStorage.setItem("login_activo", "true")

    toast.success("Contraseña actualizada correctamente")
  }

  // RESET GENERAL
  const handleEjecutarLimpiezaConClave = (e: React.FormEvent) => {
    e.preventDefault()
    const claveGuardada = localStorage.getItem("torre_admin_password") || "12345"

    if (claveAutorizacion.trim() !== claveGuardada.trim()) {
      toast.error("Contraseña de autorización incorrecta", {
        description: "No se puede restablecer el sistema."
      })
      return
    }

    localStorage.clear()
    localStorage.setItem("torre_admin_password", claveGuardada)

    // Valores iniciales por defecto
    localStorage.setItem("apartamentos_db", "[]")
    localStorage.setItem("apartamentos", "[]")
    localStorage.setItem("unidades_db", "[]")
    localStorage.setItem("unidades", "[]")
    localStorage.setItem("multas_db", "[]")
    localStorage.setItem("multas", "[]")
    localStorage.setItem("portafolio_multas_db", "[]")
    localStorage.setItem("historial_multas_db", "[]")
    localStorage.setItem("proyectos_db", "[]")
    localStorage.setItem("proyectos", "[]")
    localStorage.setItem("portafolio_proyectos_db", "[]")
    localStorage.setItem("cobros_db", "[]")
    localStorage.setItem("cobros", "[]")
    localStorage.setItem("torre_cartera_db", "{}")
    localStorage.setItem("torre_historial_db", "[]")
    localStorage.setItem("sistema_master_limpio", "true")

    toast.success("¡Formateo Exitoso!", {
      description: "Las unidades, multas, proyectos y cobros se han vaciado. Reiniciando panel..."
    })

    setIsResetModalOpen(false)
    setClaveAutorizacion("")

    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  const getFechaHoyFormateada = () => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    const hoy = new Date()
    return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`
  }

  return (
    <div className="font-sans text-slate-200 space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out] w-full">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-3xl mx-auto w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Configuración del Edificio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra el consorcio, departamentos y copias de seguridad.
          </p>
        </div>
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 px-4 py-2 rounded-xl text-[11px] text-slate-400 font-medium self-start md:self-auto uppercase tracking-wider">
          {getFechaHoyFormateada()}
        </div>
      </div>

      {/* GRID DE CONFIGURACIÓN - UNIFICADO VERTICAL */}
      <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto w-full items-start">
        
        {/* COLUMNA 1: Información de la Torre */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowTorreInfo(!showTorreInfo)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Información de la Torre
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Personaliza el nombre y datos generales del edificio
              </p>
            </div>
            {showTorreInfo ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showTorreInfo && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  NOMBRE DE LA TORRE / CONSORCIO
                </label>
                <input
                  type="text"
                  value={nombreTorre}
                  onChange={(e) => setNombreTorre(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  DIRECCIÓN DEL EDIFICIO
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calle 44 # 15-20"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                  LOGO DEL CONSORCIO (IMAGEN)
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#1B2336] border border-[#1E293B]/80 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="subir-logo"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("subir-logo")?.click()}
                      className="border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-white rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 font-bold cursor-pointer transition-all shadow-sm active:scale-[0.98]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Seleccionar Logo
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleEliminarLogo}
                        className="text-red-400 hover:text-red-300 text-xs font-bold text-left pl-1 cursor-pointer transition-all"
                      >
                        Eliminar Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={guardarConfiguracionTorre}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full mt-4 flex items-center justify-center"
              >
                Guardar Configuración
              </button>
            </div>
          )}
        </div>

        {/* COLUMNA 2: Configuración de Cuotas */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowCuotaInfo(!showCuotaInfo)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Configuración de Cuotas
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Moneda, cuota base y montos del consorcio
              </p>
            </div>
            {showCuotaInfo ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showCuotaInfo && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  NOMBRE CONCEPTO PRINCIPAL (CUOTA)
                </label>
                <input
                  type="text"
                  value={nombreCuota}
                  onChange={(e) => setNombreCuota(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  MONTO ADMINISTRATIVO FIJO ($)
                </label>
                <input
                  type="text"
                  value={montoFijo}
                  onChange={(e) => setMontoFijo(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  MONEDA DEL CONSORCIO
                </label>
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option>Peso Colombiano (COP)</option>
                  <option>Dólar Estadounidense (USD)</option>
                  <option>Euro (EUR)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={guardarConfiguracionTorre}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full mt-4 flex items-center justify-center"
              >
                Guardar Configuración
              </button>
            </div>
          )}
        </div>

        {/* COLUMNA 3: Reglas de Mora */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowMoraRules(!showMoraRules)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Reglas de Mora
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Intereses, plazos y días de gracia por mora
              </p>
            </div>
            {showMoraRules ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showMoraRules && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              {/* TASAS E INTERESES DE MORA CARD LAYOUT */}
              <div className="bg-[#0D121F] border border-[#1E293B]/30 rounded-2xl p-5 mb-4 text-white">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Tasas e Intereses de Mora
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 mb-4">
                  Configura las tasas de interés y usura vigentes del mes
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Interés Bancario Corriente (IBC % Anual)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 19,19"
                      value={ibcAnual}
                      onChange={(e) => setIbcAnual(e.target.value)}
                      className="w-full bg-[#131926] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Multiplicador de Ley (Administración)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 1,5"
                      value={multiplicadorMora}
                      onChange={(e) => setMultiplicadorMora(e.target.value)}
                      className="w-full bg-[#131926] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {(() => {
                    const parsedIbc = parseFloat(String(ibcAnual).replace(",", ".")) || 0
                    const parsedMult = parseFloat(String(multiplicadorMora).replace(",", ".")) || 0
                    const usuraCalculada = parsedIbc * parsedMult
                    return (
                      <div className="space-y-1.5 pt-1.5">
                        <div className="text-xs text-indigo-400 font-semibold leading-relaxed">
                          Tasa de Usura máxima legal calculada: {usuraCalculada.toFixed(2)}% Efectivo Anual.
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          Tasa de mora equivalente mensual configurada: {tasaMora}%
                        </div>
                      </div>
                    )
                  })()}

                  <button
                    type="button"
                    onClick={actualizarTasas}
                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full flex items-center justify-center"
                  >
                    Actualizar Tasas
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  DÍA LÍMITE DE PAGO MENSUAL
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej: 5"
                  value={diaPagoCuota}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (isNaN(val)) {
                      setDiaPagoCuota("")
                    } else if (val >= 1 && val <= 31) {
                      setDiaPagoCuota(String(val))
                    } else if (val > 31) {
                      setDiaPagoCuota("31")
                    } else if (val < 1) {
                      setDiaPagoCuota("1")
                    }
                  }}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  DÍAS DE GRACIA PARA MULTAS
                </label>
                <input
                  type="text"
                  placeholder="Ej: 15"
                  value={diasVencimientoMulta}
                  onChange={(e) => setDiasVencimientoMulta(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  DÍAS DE GRACIA PARA PROYECTOS
                </label>
                <input
                  type="text"
                  placeholder="Ej: 30"
                  value={diasVencimientoProyecto}
                  onChange={(e) => setDiasVencimientoProyecto(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <button
                type="button"
                onClick={guardarConfiguracionTorre}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full mt-4 flex items-center justify-center"
              >
                Guardar Configuración
              </button>
            </div>
          )}
        </div>

        {/* COLUMNA 4: Reportes de Deudores por WhatsApp */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowReportConfig(!showReportConfig)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Reportes por WhatsApp
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configuración y envío de informes automáticos
              </p>
            </div>
            {showReportConfig ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showReportConfig && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                  Números de Teléfono Autorizados (WhatsApp)
                </label>
                <div className="space-y-3">
                  {admins.map((adm, index) => (
                    <div 
                      key={index} 
                      className="bg-[#182030] border border-[#2E3A52]/40 rounded-2xl p-4 space-y-3 animate-[fadeIn_0.2s_ease-out]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Ej: 573000000000"
                            value={adm.phone}
                            onChange={(e) => {
                              const newAdmins = [...admins]
                              newAdmins[index].phone = e.target.value
                              setAdmins(newAdmins)
                            }}
                            className="w-full bg-[#111622] border border-[#1E293B]/80 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                          />
                        </div>
                        {admins.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newAdmins = admins.filter((_, i) => i !== index)
                              setAdmins(newAdmins)
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl border border-red-500/20 transition-all cursor-pointer flex items-center justify-center shrink-0"
                            title="Eliminar número"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-[#1E293B]/30">
                        <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={adm.reports}
                            onChange={(e) => {
                              const newAdmins = [...admins]
                              newAdmins[index].reports = e.target.checked
                              setAdmins(newAdmins)
                            }}
                            className="rounded border-[#1E293B]/80 bg-[#111622] text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          Recibir Reporte Automático
                        </label>

                        <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={adm.commands}
                            onChange={(e) => {
                              const newAdmins = [...admins]
                              newAdmins[index].commands = e.target.checked
                              setAdmins(newAdmins)
                            }}
                            className="rounded border-[#1E293B]/80 bg-[#111622] text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          Permitir Comandos WhatsApp
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAdmins([...admins, { phone: "", reports: false, commands: true }])
                  }}
                  className="w-full border border-dashed border-[#2E3A52]/60 hover:border-blue-500/50 text-[#94A3B8] hover:text-blue-400 font-semibold py-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-3 bg-blue-500/5"
                >
                  ➕ Agregar número autorizado
                </button>
                <span className="text-[10px] text-slate-500 block mt-2 text-center">
                  Código de país sin el signo + (Ej: 57 para Colombia)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Día del Envío Mensual
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej: 28"
                  value={diaReporteAutomatico}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (isNaN(val)) setDiaReporteAutomatico("")
                    else if (val >= 1 && val <= 31) setDiaReporteAutomatico(String(val))
                  }}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Hora del Envío Mensual (Hora Col.)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Hora</span>
                    <select
                      value={horaRep}
                      onChange={(e) => setHoraRep(e.target.value)}
                      className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-2.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const hStr = (i + 1) < 10 ? `0${i + 1}` : `${i + 1}`
                        return <option key={hStr} value={hStr} className="bg-[#131926]">{hStr}</option>
                      })}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Minuto</span>
                    <select
                      value={minutoRep}
                      onChange={(e) => setMinutoRep(e.target.value)}
                      className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-2.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {Array.from({ length: 60 }).map((_, i) => {
                        const mStr = i < 10 ? `0${i}` : `${i}`
                        return <option key={mStr} value={mStr} className="bg-[#131926]">{mStr}</option>
                      })}
                    </select>
                  </div>

                  <div className="w-[80px]">
                    <span className="text-[10px] text-slate-400 block mb-1">Periodo</span>
                    <select
                      value={periodoRep}
                      onChange={(e) => setPeriodoRep(e.target.value)}
                      className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-2.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="AM" className="bg-[#131926]">AM</option>
                      <option value="PM" className="bg-[#131926]">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={enviandoReporte}
                onClick={enviarReporteDeudoresAhora}
                className="w-full bg-[#1e293b] hover:bg-[#2e3e56] text-slate-200 border border-slate-700/60 font-semibold h-[40px] rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {enviandoReporte ? "Enviando..." : "⚡ Enviar Informe de Deudores Ahora"}
              </button>

              <button
                type="button"
                onClick={guardarConfiguracionTorre}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full mt-4 flex items-center justify-center"
              >
                Guardar Configuración
              </button>
            </div>
          )}
        </div>


        {/* COLUMNA 5: Envío Automático de Avisos */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowAvisoConfig(!showAvisoConfig)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Envío Automático de Avisos
                {envioAutomaticoAvisos ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Activo</span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 border border-slate-700/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Inactivo</span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Programar el envío automático mensual de avisos de cobro
              </p>
            </div>
            {showAvisoConfig ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showAvisoConfig && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Toggle Switch */}
              <div className="flex items-center justify-between bg-[#1B2336]/30 border border-[#1E293B]/40 p-3 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">Activar Envío Automático</span>
                  <span className="text-[10px] text-slate-400">Envía los avisos el día y hora configurados</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={envioAutomaticoAvisos}
                    onChange={(e) => setEnvioAutomaticoAvisos(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </label>
              </div>

              {/* Día de Envío */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Día del Mes para Envío</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={diaEnvioAvisos}
                  onChange={(e) => setDiaEnvioAvisos(e.target.value)}
                  className="bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl h-[40px] px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: 1"
                />
                <span className="text-[10px] text-slate-400">Recomendado: Día 1 al 5 del mes.</span>
              </div>

              {/* Hora de Envío */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hora de Envío</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Hora</span>
                    <select
                      value={horaAvi}
                      onChange={(e) => setHoraAvi(e.target.value)}
                      className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const hStr = (i + 1) < 10 ? `0${i + 1}` : `${i + 1}`
                        return <option key={hStr} value={hStr} className="bg-[#131926]">{hStr}</option>
                      })}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Minuto</span>
                    <select
                      value={minutoAvi}
                      onChange={(e) => setMinutoAvi(e.target.value)}
                      className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {Array.from({ length: 60 }).map((_, i) => {
                        const mStr = i < 10 ? `0${i}` : `${i}`
                        return <option key={mStr} value={mStr} className="bg-[#131926]">{mStr}</option>
                      })}
                    </select>
                  </div>

                  <div className="w-[80px]">
                    <span className="text-[10px] text-slate-400 block mb-1">Periodo</span>
                    <select
                      value={periodoAvi}
                      onChange={(e) => setPeriodoAvi(e.target.value)}
                      className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="AM" className="bg-[#131926]">AM</option>
                      <option value="PM" className="bg-[#131926]">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botón de Pruebas / Envío Masivo Manual */}
              <button
                type="button"
                disabled={enviandoAvisos}
                onClick={enviarAvisosAhora}
                className="w-full bg-[#1e293b] hover:bg-[#2e3e56] text-slate-200 border border-slate-700/60 font-semibold h-[40px] rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {enviandoAvisos ? "Enviando Avisos..." : "⚡ Enviar Avisos a Todos Ahora (Manual)"}
              </button>

              <button
                type="button"
                onClick={guardarConfiguracionTorre}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] w-full mt-4 flex items-center justify-center"
              >
                Guardar Configuración
              </button>
            </div>
          )}
        </div>


        {/* COLUMNA 6: Mensaje del Aviso */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowAvisoMsg(!showAvisoMsg)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Instrucciones del Aviso
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Mensaje al pie de las facturas impresas e imágenes
              </p>
            </div>
            {showAvisoMsg ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showAvisoMsg && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              <p className="text-xs text-slate-400">
                Este mensaje se renderizará automáticamente al pie de las facturas impresas e imágenes compartidas por WhatsApp.
              </p>
              <textarea
                rows={4}
                value={mensajeAviso}
                onChange={(e) => setMensajeAviso(e.target.value)}
                className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={guardarMensajeAviso}
                  className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold h-[44px] rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-[0.98] w-full"
                >
                  Guardar Mensaje de Pie
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA 4: Seguridad y Acceso */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowSecurity(!showSecurity)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Seguridad y Acceso
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Controla el acceso al panel con clave de administrador
              </p>
            </div>
            {showSecurity ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showSecurity && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              <div className={`border rounded-xl px-4 py-3 text-xs flex items-center gap-2 font-semibold transition-all ${
                loginActivo
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-500/20 bg-slate-500/10 text-slate-400"
              }`}>
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>{loginActivo ? "Acceso Activo (Usuario: admin)" : "Acceso Libre (Sin Contraseña)"}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Clave Actual
                </label>
                <input
                  type="password"
                  placeholder="Ingresa clave actual para cambiar/quitar"
                  value={claveActual}
                  onChange={(e) => setClaveActual(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-semibold"
                />
              </div>

              {loginActivo && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Nueva Clave
                  </label>
                  <input
                    type="password"
                    placeholder="Introduce la nueva clave administrativa"
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-semibold"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDesactivarAcceso}
                  className="bg-[#1B2336] border border-[#1E293B]/80 hover:bg-[#1E293B]/40 hover:text-white text-red-400 hover:border-red-500/40 font-bold h-[44px] rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all w-[35%] active:scale-[0.98]"
                >
                  Desactivar
                </button>
                
                <button
                  type="button"
                  onClick={cambiarClave}
                  className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold h-[44px] rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-[0.98] w-[65%]"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA 6: Base de Datos y Respaldos */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl p-6 text-white">
          <button
            type="button"
            onClick={() => setShowDbBackup(!showDbBackup)}
            className="w-full flex items-center justify-between text-left cursor-pointer select-none"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Base de Datos y Respaldos
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Exporta o importa tus datos para no perderlos
              </p>
            </div>
            {showDbBackup ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />}
          </button>

          {showDbBackup && (
            <div className="space-y-4 pt-5 border-t border-[#1E293B]/20 mt-5 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={exportarDatos}
                  className="flex-1 bg-[#1B2336] border border-[#1E293B]/80 hover:bg-[#1E293B]/40 hover:text-white text-slate-300 font-bold h-[44px] rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  Exportar
                </button>
                
                <input
                  type="file"
                  id="importar-db"
                  accept=".json"
                  onChange={handleImportarArchivo}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("importar-db")?.click()}
                  className="flex-1 bg-[#1B2336] border border-[#1E293B]/80 hover:bg-[#1E293B]/40 hover:text-white text-slate-300 font-bold h-[44px] rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Importar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="w-full bg-[#1B2336]/40 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold h-[44px] rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all mt-4 active:scale-[0.98]"
              >
                Restablecer Datos de Fábrica
              </button>
            </div>
          )}
        </div>

      </div>



      {/* DIÁLOGO FLOTANTE DE AUTORIZACIÓN CON CONTRASEÑA MÁSTER */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0" onClick={() => { setIsResetModalOpen(false); setClaveAutorizacion(""); }} />
          
          <div className="bg-[#131926] rounded-3xl shadow-2xl w-full max-w-[460px] border border-[#1E293B]/80 overflow-hidden relative z-10 p-6 text-white">
            <h3 className="text-lg font-bold text-white tracking-tight mb-1">Requiere Autorización Máster</h3>
            <p className="text-xs text-slate-400 mb-4">Introduce tu contraseña de administrador para proceder con el formateo.</p>
            
            <form onSubmit={handleEjecutarLimpiezaConClave} className="flex flex-col gap-4">
              <input 
                type="password" 
                placeholder="Contraseña actual" 
                value={claveAutorizacion} 
                onChange={(e) => setClaveAutorizacion(e.target.value)} 
                className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600" 
                required 
              />
              <div className="flex gap-3 justify-end pt-2 border-t border-[#1E293B]/20">
                <button 
                  type="button" 
                  onClick={() => { setIsResetModalOpen(false); setClaveAutorizacion(""); }} 
                  className="border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-4 h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 h-[38px] rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Confirmar Borrado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
