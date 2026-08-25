"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Building2, 
  AlertTriangle, 
  Briefcase, 
  Plus, 
  DollarSign, 
  AlertCircle, 
  FolderPlus,
  Users,
  CalendarCheck,
  Bell,
  RotateCw
} from "lucide-react"
import { AsignarMultaModal } from "./AsignarMultaModal"
import { RegistrarPagoModal } from "./RegistrarPagoModal"
import { AsignarProyectoModal } from "./AsignarProyectoModal"
import { VerTodosPagosModal } from "./VerTodosPagosModal"
import { toast } from "sonner"

interface Props {
  totalUnidades: number
  totalMultas: number
  totalProyectos: number

  apartamentos: {
    unidad: string
    propietario: string
  }[]
}

export function ResumenContent({
  totalUnidades,
  totalMultas,
  totalProyectos,
  apartamentos,
}: Props) {

  const [isAsignarMultaOpen, setIsAsignarMultaOpen] = useState(false)
  const [isRegistrarPagoOpen, setIsRegistrarPagoOpen] = useState(false)
  const [isAsignarProyectoOpen, setIsAsignarProyectoOpen] = useState(false)
  const [isVerTodosOpen, setIsVerTodosOpen] = useState(false)

  const [todosLosPagos, setTodosLosPagos] = useState<any[]>([])
  const [ultimosPagos, setUltimosPagos] = useState<any[]>([])

  const [pagosDelMesCount, setPagosDelMesCount] = useState(0)
  const [recaudacionMensualSum, setRecaudacionMensualSum] = useState(0)
  const [activeMesName, setActiveMesName] = useState("")

  const [recAdminSum, setRecAdminSum] = useState(0)
  const [recCarteraSum, setRecCarteraSum] = useState(0)
  const [recMultasSum, setRecMultasSum] = useState(0)
  const [recProyectosSum, setRecProyectosSum] = useState(0)
  const [deudaCarteraTotal, setDeudaCarteraTotal] = useState(0)

  // Breakdown state for Deuda en Cartera card
  const [carteraAntSum, setCarteraAntSum] = useState(0)
  const [carteraAntCount, setCarteraAntCount] = useState(0)
  const [mensualidadesDebSum, setMensualidadesDebSum] = useState(0)
  const [mensualidadesDebCount, setMensualidadesDebCount] = useState(0)
  const [multasDebSum, setMultasDebSum] = useState(0)
  const [multasDebCount, setMultasDebCount] = useState(0)
  const [proyectosDebSum, setProyectosDebSum] = useState(0)
  const [proyectosDebCount, setProyectosDebCount] = useState(0)

  const cargarUltimosPagos = async () => {
    // 1. Fetch from mensualidades (All of them to find the latest billing period)
    const { data: todasMensualidades } = await supabase
      .from("mensualidades")
      .select("*")

    const pagosMensualidades = todasMensualidades ? todasMensualidades.filter(
      (m: any) => m.estado === "Pagado"
    ) : []

    // 2. Fetch from historial_cartera (pago)
    const { data: pagosCartera } = await supabase
      .from("historial_cartera")
      .select("*")
      .eq("tipo", "pago")

    // 3. Fetch from portafolio_multas (Pagado)
    const { data: pagosMultas } = await supabase
      .from("portafolio_multas")
      .select("*")
      .eq("estado", "Pagado")

    // 4. Fetch from portafolio_proyectos (Pagado)
    const { data: pagosProyectos } = await supabase
      .from("portafolio_proyectos")
      .select("*")
      .eq("estado", "Pagado")

    // Combine them into a single array
    const combined: any[] = []

    if (pagosMensualidades) {
      pagosMensualidades.forEach((m: any) => {
        combined.push({
          unidad: m.unidad,
          monto: m.valor,
          fecha: m.fecha_pago || m.created_at?.split("T")[0] || "",
          concepto: `Admin. ${m.mes}`,
          timestamp: new Date(m.fecha_pago || m.created_at).getTime() || 0
        })
      })
    }

    if (pagosCartera) {
      pagosCartera.forEach((p: any) => {
        combined.push({
          unidad: p.unidad,
          monto: p.monto,
          fecha: p.fecha,
          concepto: "Abono de Cartera",
          timestamp: new Date(p.fecha).getTime() || 0
        })
      })
    }

    if (pagosMultas) {
      pagosMultas.forEach((m: any) => {
        combined.push({
          unidad: m.unidad,
          monto: m.valor,
          fecha: m.fecha_asignacion || m.created_at?.split("T")[0] || "",
          concepto: `Multa: ${m.tipo_multa || "General"}`,
          timestamp: new Date(m.fecha_asignacion || m.created_at).getTime() || 0
        })
      })
    }

    if (pagosProyectos) {
      pagosProyectos.forEach((p: any) => {
        combined.push({
          unidad: p.unidad,
          monto: p.valor,
          fecha: p.fecha || p.created_at?.split("T")[0] || "",
          concepto: `Proyecto: ${p.proyecto || "General"}`,
          timestamp: new Date(p.fecha || p.created_at).getTime() || 0
        })
      })
    }

    // Sort by timestamp descending
    combined.sort((a, b) => b.timestamp - a.timestamp)

    // El mes activo de control de pagos debe ser el MES CALENDARIO ACTUAL (Agosto de 2026)
    let activeMes = getMesActual()
    let activeAnio = new Date().getFullYear().toString()

    setActiveMesName(activeMes)

    // Calculate Pagos del Mes (Unique paid apartments for the active month/year)
    const pagosDeEsteMes = todasMensualidades ? todasMensualidades.filter(
      (m: any) => m.mes === activeMes && m.anio === activeAnio && m.estado === "Pagado"
    ) : []

    const uniqueApartmentsPaid = new Set(
      pagosDeEsteMes.map((m: any) => m.unidad)
    )
    setPagosDelMesCount(uniqueApartmentsPaid.size)

    // Calculate Recaudacion Mensual (All payments made in the current calendar month)
    let totalRecaudado = 0
    let tempAdmin = 0
    let tempCartera = 0
    let tempMultas = 0
    let tempProyectos = 0

    const hoy = new Date()
    const currentYear = hoy.getFullYear()
    const currentMonth = hoy.getMonth() // 0-11

    combined.forEach((pago: any) => {
      if (pago.fecha) {
        const parts = pago.fecha.split("-")
        if (parts.length === 3) {
          const y = Number(parts[0])
          const m = Number(parts[1]) - 1 // 0-indexed
          if (y === currentYear && m === currentMonth) {
            const montoNum = Number(pago.monto) || 0
            totalRecaudado += montoNum

            if (pago.concepto.startsWith("Admin.")) {
              tempAdmin += montoNum
            } else if (pago.concepto === "Abono de Cartera") {
              tempCartera += montoNum
            } else if (pago.concepto.startsWith("Multa:")) {
              tempMultas += montoNum
            } else if (pago.concepto.startsWith("Proyecto:")) {
              tempProyectos += montoNum
            }
          }
        }
      }
    })
    setRecaudacionMensualSum(totalRecaudado)
    setRecAdminSum(tempAdmin)
    setRecCarteraSum(tempCartera)
    setRecMultasSum(tempMultas)
    setRecProyectosSum(tempProyectos)

    // Calculate Total Deuda Copropiedad (Unificado con Desglose por Categoria y Conteo de Aptos)
    const cargarDeudaTotal = async () => {
      let totalDeuda = 0

      // 1. Cartera Anterior
      const { data: carteraRows } = await supabase.from("cartera").select("unidad, deuda")
      let sumCart = 0
      const setCart = new Set<string>()
      if (carteraRows) {
        carteraRows.forEach((row: any) => {
          const v = Number(row.deuda) || 0
          if (v > 0) {
            sumCart += v
            setCart.add(row.unidad)
          }
        })
      }
      setCarteraAntSum(sumCart)
      setCarteraAntCount(setCart.size)
      totalDeuda += sumCart

      // 2. Mensualidades Pendientes
      const { data: mensRows } = await supabase.from("mensualidades").select("unidad, valor").eq("estado", "Pendiente")
      let sumMens = 0
      const setMens = new Set<string>()
      if (mensRows) {
        mensRows.forEach((row: any) => {
          const v = Number(row.valor) || 0
          sumMens += v
          setMens.add(row.unidad)
        })
      }
      setMensualidadesDebSum(sumMens)
      setMensualidadesDebCount(setMens.size)
      totalDeuda += sumMens

      // 3. Multas Pendientes
      const { data: multasRows } = await supabase.from("portafolio_multas").select("unidad, valor").in("estado", ["Pendiente", "Vencida"])
      let sumMult = 0
      const setMult = new Set<string>()
      if (multasRows) {
        multasRows.forEach((row: any) => {
          const v = Number(row.valor) || 0
          sumMult += v
          setMult.add(row.unidad)
        })
      }
      setMultasDebSum(sumMult)
      setMultasDebCount(setMult.size)
      totalDeuda += sumMult

      // 4. Proyectos Pendientes
      const { data: proyectosRows } = await supabase.from("portafolio_proyectos").select("unidad, valor").eq("estado", "Pendiente")
      let sumProy = 0
      const setProy = new Set<string>()
      if (proyectosRows) {
        proyectosRows.forEach((row: any) => {
          const v = Number(row.valor) || 0
          sumProy += v
          setProy.add(row.unidad)
        })
      }
      setProyectosDebSum(sumProy)
      setProyectosDebCount(setProy.size)
      totalDeuda += sumProy

      setDeudaCarteraTotal(totalDeuda)
    }
    cargarDeudaTotal()

    setTodosLosPagos(combined)
    setUltimosPagos(combined.slice(0, 15))
  }

  useEffect(() => {
    cargarUltimosPagos()

    const channelCartera = supabase
      .channel("realtime-cartera")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "historial_cartera" },
        () => cargarUltimosPagos()
      )
      .subscribe()

    const channelMultas = supabase
      .channel("realtime-multas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portafolio_multas" },
        () => cargarUltimosPagos()
      )
      .subscribe()

    const channelProyectos = supabase
      .channel("realtime-proyectos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portafolio_proyectos" },
        () => cargarUltimosPagos()
      )
      .subscribe()

    const channelMensualidades = supabase
      .channel("realtime-mensualidades")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensualidades" },
        () => cargarUltimosPagos()
      )
      .subscribe()

    const handleDatosActualizados = () => {
      cargarUltimosPagos()
    }
    window.addEventListener("datosActualizados", handleDatosActualizados)

    return () => {
      supabase.removeChannel(channelCartera)
      supabase.removeChannel(channelMultas)
      supabase.removeChannel(channelProyectos)
      supabase.removeChannel(channelMensualidades)
      window.removeEventListener("datosActualizados", handleDatosActualizados)
    }
  }, [])

  const formatearFecha = (rawDate?: string) => {
    if (!rawDate) return ""
    const parts = rawDate.split("-")
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return rawDate
  }

  const getMesActual = () => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    return meses[new Date().getMonth()]
  }

  const getFechaHoyFormateada = () => {
    const dias = [
      "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
    ]
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    const hoy = new Date()
    const diaSemana = dias[hoy.getDay()]
    const diaMes = hoy.getDate()
    const mes = meses[hoy.getMonth()]
    const anio = hoy.getFullYear()
    return `${diaSemana}, ${diaMes} de ${mes} de ${anio}`
  }
  
  return (
    <div className="font-sans max-w-7xl mx-auto text-slate-200">

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-[fadeIn_0.4s_ease-out]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Panel Principal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Resumen general del estado de cuenta de la copropiedad
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              cargarUltimosPagos()
              toast.success("Datos sincronizados con Supabase")
            }}
            className="bg-[#131926]/90 border border-[#1E293B]/50 hover:bg-[#1E293B]/40 hover:text-white px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs text-slate-300 font-medium transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
            Sincronizar
          </button>
          <div className="bg-[#131926]/90 border border-[#1E293B]/50 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-medium">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <span>{getFechaHoyFormateada()}</span>
          </div>
        </div>
      </div>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Card 1: Ocupación de Unidades */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-indigo-500 p-5 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ocupación de Unidades</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {totalUnidades}/{totalUnidades}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-slate-400 text-xs mt-3 flex items-center gap-1.5 border-t border-[#1E293B]/20 pt-2">
            <span className="text-[11px] font-medium">100% de ocupación actual</span>
          </div>
        </div>

        {/* Card 2: Pagos del Mes */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-emerald-500 p-5 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagos del Mes</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {pagosDelMesCount}/{totalUnidades}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-slate-400 text-xs mt-3 flex items-center gap-1.5 border-t border-[#1E293B]/20 pt-2">
            <span className="text-[11px] font-medium">Pagos recibidos de {activeMesName || getMesActual()}</span>
          </div>
        </div>

        {/* Card 3: Recaudación Mensual */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-sky-500 p-5 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudación Mensual</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                $ {recaudacionMensualSum.toLocaleString("es-CO")}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          
          {/* Breakdown grid */}
          <div className="text-[10px] text-slate-400 mt-2 grid grid-cols-2 gap-y-1 gap-x-2 border-t border-[#1E293B]/20 pt-2">
            <div>Admin: <span className="text-emerald-400 font-bold">${recAdminSum.toLocaleString("es-CO")}</span></div>
            <div>Cartera: <span className="text-indigo-400 font-bold">${recCarteraSum.toLocaleString("es-CO")}</span></div>
            <div>Multas: <span className="text-amber-400 font-bold">${recMultasSum.toLocaleString("es-CO")}</span></div>
            <div>Proy: <span className="text-blue-400 font-bold">${recProyectosSum.toLocaleString("es-CO")}</span></div>
          </div>
        </div>

        {/* Card 4: Deuda en Cartera */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-rose-500 p-5 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deuda en Cartera</p>
              <h3 className="text-3xl font-extrabold text-rose-400 mt-2">
                $ {deudaCarteraTotal.toLocaleString("es-CO")}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          
          {/* Breakdown grid per category with apartment count */}
          <div className="text-[10px] text-slate-400 mt-2 grid grid-cols-2 gap-y-1 gap-x-2 border-t border-[#1E293B]/20 pt-2">
            <div>Cartera ({carteraAntCount} apts): <span className="text-indigo-400 font-bold">${carteraAntSum.toLocaleString("es-CO")}</span></div>
            <div>Cuotas ({mensualidadesDebCount} apts): <span className="text-emerald-400 font-bold">${mensualidadesDebSum.toLocaleString("es-CO")}</span></div>
            <div>Proyectos ({proyectosDebCount} apts): <span className="text-blue-400 font-bold">${proyectosDebSum.toLocaleString("es-CO")}</span></div>
            <div>Multas ({multasDebCount} apts): <span className="text-amber-400 font-bold">${multasDebSum.toLocaleString("es-CO")}</span></div>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.6s_ease-out]">
        
        {/* LEFT COLUMN: Últimos Pagos Registrados */}
        <div className="lg:col-span-2 bg-[#131926]/90 border border-[#1E293B]/50 rounded-2xl p-6 flex flex-col min-h-[380px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-base md:text-lg font-bold text-white">Últimos Pagos Registrados</h4>
              <p className="text-slate-400 text-[11px] md:text-xs mt-0.5">Historial reciente de pagos administrativos</p>
            </div>
            <button 
              type="button"
              onClick={() => setIsVerTodosOpen(true)}
              className="bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.98] cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="min-w-[550px]">
              {/* Table Header */}
              <div className="bg-[#1E293B]/30 rounded-xl text-slate-400 text-xs font-semibold px-4 py-3 grid grid-cols-5 text-center mb-4">
                <div>Depto</div>
                <div>Residente</div>
                <div>Concepto</div>
                <div>Monto</div>
                <div>Fecha</div>
              </div>

              {/* Table Content */}
              {ultimosPagos.length > 0 ? (
                <div className="flex-1 flex flex-col justify-start mt-2 divide-y divide-[#1E293B]/30 max-h-[360px] overflow-y-auto pr-1">
                  {ultimosPagos.map((pago, index) => {
                    const apto = apartamentos.find((a) => a.unidad === pago.unidad)
                    const residente = apto ? apto.propietario : "Desconocido"
                    
                    let badgeColor = "text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20"
                    if (pago.concepto.startsWith("Multa:")) {
                      badgeColor = "text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20"
                    } else if (pago.concepto.startsWith("Proyecto:")) {
                      badgeColor = "text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20"
                    }

                    return (
                      <div 
                        key={index} 
                        className="grid grid-cols-5 text-center text-xs py-3.5 px-2 hover:bg-[#1E293B]/20 transition-all items-center text-slate-200"
                      >
                        <div className="font-semibold text-white">Apto. {pago.unidad}</div>
                        <div className="truncate capitalize text-slate-300">{residente}</div>
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-bold ${badgeColor} max-w-[125px] truncate`}>
                            {pago.concepto}
                          </span>
                        </div>
                        <div className="font-bold text-emerald-400">
                          $ {Number(pago.monto).toLocaleString("es-CO")}
                        </div>
                        <div className="text-slate-400">{formatearFecha(pago.fecha)}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm py-12 border border-dashed border-[#1E293B]/40 rounded-xl">
                  Sin pagos registrados recientemente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Acciones Rápidas & Último Comunicado */}
        <div className="flex flex-col gap-6">
          
          {/* Card: Acciones Rápidas */}
          <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-2xl p-6">
            <div className="mb-5">
              <h4 className="text-base md:text-lg font-bold text-white">Acciones Rápidas</h4>
              <p className="text-slate-400 text-[11px] md:text-xs mt-0.5">Herramientas del administrador</p>
            </div>

            <div className="space-y-4">
              
              {/* Action 1: Registrar Pago */}
              <div className="flex justify-between items-center py-2.5 border-b border-[#1E293B]/20 last:border-0">
                <div>
                  <h5 className="text-sm font-semibold text-white">Registrar Pago</h5>
                  <p className="text-[11px] text-slate-400">Cobro administrativo mensual</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegistrarPagoOpen(true)}
                  className="bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Registrar
                </button>
              </div>

              {/* Action 2: Registrar Multa */}
              <div className="flex justify-between items-center py-2.5 border-b border-[#1E293B]/20 last:border-0">
                <div>
                  <h5 className="text-sm font-semibold text-white">Registrar Multa</h5>
                  <p className="text-[11px] text-slate-400">Aplicar una sanción a unidad</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAsignarMultaOpen(true)}
                  className="bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Multar
                </button>
              </div>

              {/* Action 3: Asignar Proyecto */}
              <div className="flex justify-between items-center py-2.5 border-b border-[#1E293B]/20 last:border-0">
                <div>
                  <h5 className="text-sm font-semibold text-white">Asignar Proyecto</h5>
                  <p className="text-[11px] text-slate-400">Vincular cuota de obra a departamentos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAsignarProyectoOpen(true)}
                  className="bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Asignar
                </button>
              </div>

            </div>
          </div>

          {/* Card: Último Comunicado */}
          <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base md:text-lg font-bold text-white">Último Comunicado</h4>
                <p className="text-slate-400 text-[11px] md:text-xs mt-0.5">Circular vigente en la cartelera</p>
              </div>
              <button 
                type="button"
                onClick={() => toast("Cargando cartelera de comunicados")}
                className="bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.98] cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="text-slate-500 text-xs py-4 text-center">
              No hay circulares activas en la cartelera.
            </div>
          </div>

        </div>

      </div>

      {/* MODALS */}
      <RegistrarPagoModal
        isOpen={isRegistrarPagoOpen}
        onClose={() => setIsRegistrarPagoOpen(false)}
        apartamentos={apartamentos}
      />
      
      <AsignarMultaModal
        isOpen={isAsignarMultaOpen}
        onClose={() => setIsAsignarMultaOpen(false)}
      />
      
      <AsignarProyectoModal
        isOpen={isAsignarProyectoOpen}
        onClose={() => setIsAsignarProyectoOpen(false)}
      />

      <VerTodosPagosModal
        isOpen={isVerTodosOpen}
        onClose={() => setIsVerTodosOpen(false)}
        pagos={todosLosPagos}
        apartamentos={apartamentos}
      />

    </div>
  )
}