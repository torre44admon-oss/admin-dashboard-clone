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
  Bell
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

  const cargarUltimosPagos = async () => {
    // 1. Fetch from mensualidades (Pagado)
    const { data: pagosMensualidades } = await supabase
      .from("mensualidades")
      .select("*")
      .eq("estado", "Pagado")

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
          concepto: `Administración - ${m.mes}`,
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

    setTodosLosPagos(combined)
    setUltimosPagos(combined.slice(0, 5))
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

    return () => {
      supabase.removeChannel(channelCartera)
      supabase.removeChannel(channelMultas)
      supabase.removeChannel(channelProyectos)
      supabase.removeChannel(channelMensualidades)
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
  
  return (
    <div className="font-sans max-w-7xl mx-auto text-slate-200">
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Card 1: Ocupación de Unidades */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-indigo-500 p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
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
          <div className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
            <span className="text-[11px] font-medium">100% de ocupación actual</span>
          </div>
        </div>

        {/* Card 2: Pagos del Mes */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-emerald-500 p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagos del Mes</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                0/{totalUnidades}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
            <span className="text-[11px] font-medium">Pagos recibidos de {getMesActual()}</span>
          </div>
        </div>

        {/* Card 3: Recaudación Mensual */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-sky-500 p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudación Mensual</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                $0
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
            <span className="text-[11px] font-medium">Total acumulado en el mes actual</span>
          </div>
        </div>

        {/* Card 4: Mantenimiento Activo */}
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 border-l-4 border-l-amber-500 p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mantenimiento Activo</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                0
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
            <span className="text-[11px] font-medium">Reportes de daños pendientes</span>
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
            <div className="flex-1 flex flex-col justify-start mt-2 divide-y divide-[#1E293B]/30">
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