"use client"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"

interface Unidad {
  unidad: string
  propietario: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  apartamentos: Unidad[]
}

export function RegistrarPagoModal({
  isOpen,
  onClose,
  apartamentos,
}: Props) {

  const [unidadSeleccionada, setUnidadSeleccionada] = useState("")
  const [concepto, setConcepto] = useState("Administración")
  const [multaSeleccionada, setMultaSeleccionada] = useState("")
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("")
  const [mensualidadSeleccionada, setMensualidadSeleccionada] = useState("")
  
  const [multasPendientes, setMultasPendientes] = useState<any[]>([])
  const [proyectosPendientes, setProyectosPendientes] = useState<any[]>([])
  const [mensualidadesPendientes, setMensualidadesPendientes] = useState<any[]>([])
  
  const [valorPago, setValorPago] = useState("")
  const [fechaPago, setFechaPago] = useState(
    new Date().toISOString().split("T")[0]
  )

  const handleSuccessClose = () => {
    window.dispatchEvent(new Event("datosActualizados"))
    onClose()
  }

  useEffect(() => {
    if (!unidadSeleccionada) {
      setMultasPendientes([])
      setProyectosPendientes([])
      setMensualidadesPendientes([])
      return
    }

    const cargarMultasPendientes = async () => {
      const { data, error } = await supabase
        .from("portafolio_multas")
        .select("*")
        .eq("unidad", unidadSeleccionada)
        .in("estado", ["Pendiente", "Vencida"])

      if (!error && data) {
        setMultasPendientes(data)
      }
    }

    const cargarProyectosPendientes = async () => {
      const { data, error } = await supabase
        .from("portafolio_proyectos")
        .select("*")
        .eq("unidad", unidadSeleccionada)
        .eq("estado", "Pendiente")

      if (!error && data) {
        setProyectosPendientes(data)
      }
    }

    const cargarMensualidadesPendientes = async () => {
      const { data, error } = await supabase
        .from("mensualidades")
        .select("*")
        .eq("unidad", unidadSeleccionada)
        .eq("estado", "Pendiente")

      if (!error && data) {
        setMensualidadesPendientes(data)
      }
    }

    cargarMultasPendientes()
    cargarProyectosPendientes()
    cargarMensualidadesPendientes()
  }, [unidadSeleccionada])

  useEffect(() => {
    const proyecto = proyectosPendientes.find(
      (p) => String(p.id) === proyectoSeleccionado
    )
    if (proyecto) {
      setValorPago(String(proyecto.valor))
    }
  }, [proyectoSeleccionado, proyectosPendientes])

  useEffect(() => {
    const multa = multasPendientes.find(
      (m) => String(m.id) === multaSeleccionada
    )
    if (multa) {
      setValorPago(String(multa.valor))
    }
  }, [multaSeleccionada, multasPendientes])

  useEffect(() => {
    const mensualidad = mensualidadesPendientes.find(
      (m) => String(m.id) === mensualidadSeleccionada
    )
    if (mensualidad) {
      setValorPago(String(mensualidad.valor))
    }
  }, [mensualidadSeleccionada, mensualidadesPendientes])
  
  const registrarPago = async () => {
    if (!unidadSeleccionada) {
      toast.warning("Seleccione un departamento")
      return
    }

    const montoNum = Number(valorPago) || 0

    if (concepto === "Administración") {
      if (!mensualidadSeleccionada) {
        toast.warning("Seleccione la mensualidad a pagar")
        return
      }
      if (!valorPago) {
        toast.warning("Ingrese el valor pagado")
        return
      }

      // Update mensualidades table
      const { error: errorMensualidad } = await supabase
        .from("mensualidades")
        .update({
          estado: "Pagado",
          fecha_pago: fechaPago
        })
        .eq("id", Number(mensualidadSeleccionada))

      if (errorMensualidad) {
        console.error(errorMensualidad)
        toast.error("Error al registrar el pago de mensualidad")
        return
      }

      toast.success("Pago de administración registrado correctamente")
      setUnidadSeleccionada("")
      setValorPago("")
      setMensualidadSeleccionada("")
      handleSuccessClose()
      return
    }

    if (concepto === "Abono de Cartera") {
      if (!valorPago) {
        toast.warning("Ingrese el valor del abono")
        return
      }

      // Get current debt in cartera
      const { data: carteraActual } = await supabase
        .from("cartera")
        .select("*")
        .eq("unidad", unidadSeleccionada)
        .maybeSingle()

      const deudaActual = carteraActual?.deuda || 0
      const nuevaDeuda = Math.max(0, deudaActual - montoNum)

      if (carteraActual) {
        await supabase
          .from("cartera")
          .update({ deuda: nuevaDeuda })
          .eq("unidad", unidadSeleccionada)
      } else {
        await supabase
          .from("cartera")
          .insert({ unidad: unidadSeleccionada, deuda: 0 })
      }

      await supabase
        .from("historial_cartera")
        .insert({
          unidad: unidadSeleccionada,
          tipo: "pago",
          monto: montoNum,
          fecha: fechaPago,
          saldoResultante: nuevaDeuda
        })

      toast.success("Abono a cartera registrado correctamente")
      setUnidadSeleccionada("")
      setValorPago("")
      handleSuccessClose()
      return
    }

    if (concepto === "Proyecto" && !proyectoSeleccionado) {
      toast.warning("Seleccione un proyecto")
      return
    }

    if (concepto === "Multa" && !multaSeleccionada) {
      toast.warning("Seleccione una multa")
      return
    }

    if (concepto === "Proyecto") {
      const { error } = await supabase
        .from("portafolio_proyectos")
        .update({
          estado: "Pagado"
        })
        .eq("id", proyectoSeleccionado)

      if (error) {
        console.error(error)
        toast.error("Error al registrar el pago de proyecto")
        return
      }

      const proyectoPortafolio = proyectosPendientes.find(
        (p) => String(p.id) === proyectoSeleccionado
      )

      if (proyectoPortafolio) {
        await supabase
          .from("proyectos_asignados")
          .update({
            estado: "Pagado"
          })
          .eq("unidad", proyectoPortafolio.unidad)
          .eq("proyecto", proyectoPortafolio.proyecto)
          .eq("fecha", proyectoPortafolio.fecha)
      }

      toast.success("Pago de proyecto registrado correctamente")
      setUnidadSeleccionada("")
      setValorPago("")
      handleSuccessClose()
      return
    }

    // Default: Multa
    const { error } = await supabase
      .from("portafolio_multas")
      .update({
        estado: "Pagado"
      })
      .eq("id", multaSeleccionada)

    const multaPortafolio = multasPendientes.find(
      (m) => String(m.id) === multaSeleccionada
    )

    if (multaPortafolio) {
      await supabase
        .from("multas_asignadas")
        .update({ estado: "Pagado" })
        .eq("unidad", multaPortafolio.unidad)
        .eq("multa_id", multaPortafolio.multa_id)
        .eq("fecha_asignacion", multaPortafolio.fecha_asignacion)
    }

    if (error) {
      console.error(error)
      toast.error("Error al registrar el pago de multa")
      return
    }

    toast.success("Pago de multa registrado correctamente")
    setUnidadSeleccionada("")
    setConcepto("Administración")
    setMultaSeleccionada("")
    setValorPago("")
    setMultasPendientes([])
    handleSuccessClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out] p-4">
      <div className="bg-[#131926] border border-[#1E293B]/60 w-full max-w-[550px] rounded-2xl shadow-2xl p-6 text-white">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Registrar Pago Administrativo
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Departamento
            </label>

            <select
              value={unidadSeleccionada}
              onChange={(e) => setUnidadSeleccionada(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="" className="bg-[#131926] text-white">
                Selecciona un depto...
              </option>

              {apartamentos.map((apto) => (
                <option
                  key={apto.unidad}
                  value={apto.unidad}
                  className="bg-[#131926] text-white"
                >
                  {apto.unidad} - {apto.propietario}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Concepto
            </label>

            <select
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option className="bg-[#131926] text-white">
                Administración
              </option>
              <option className="bg-[#131926] text-white">
                Abono de Cartera
              </option>
              <option className="bg-[#131926] text-white">
                Multa
              </option>
              <option className="bg-[#131926] text-white">
                Proyecto
              </option>
            </select>
          </div>

          {/* Dinámico para Administración */}
          {concepto === "Administración" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Mensualidades Pendientes
                </label>
                <select
                  value={mensualidadSeleccionada}
                  onChange={(e) => setMensualidadSeleccionada(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="" className="bg-[#131926] text-white">
                    Selecciona una mensualidad pendiente...
                  </option>
                  {mensualidadesPendientes.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#131926] text-white">
                      {m.mes} {m.anio} - ${Number(m.valor).toLocaleString("es-CO")}
                    </option>
                  ))}
                </select>
                {unidadSeleccionada && mensualidadesPendientes.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    Este apartamento no tiene mensualidades pendientes registradas.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Monto Recibido ($)
                  </label>
                  <input
                    type="number"
                    value={valorPago}
                    onChange={(e) => setValorPago(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="20000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Dinámico para Abono de Cartera */}
          {concepto === "Abono de Cartera" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Monto Recibido ($)
                </label>
                <input
                  type="number"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </>
          )}

          {/* Dinámico para Multa */}
          {concepto === "Multa" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Multas Pendientes
                </label>
                <select
                  value={multaSeleccionada}
                  onChange={(e) => setMultaSeleccionada(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="" className="bg-[#131926] text-white">
                    Seleccione una multa pendiente
                  </option>
                  {multasPendientes.map((multa) => (
                    <option
                      key={multa.id}
                      value={multa.id}
                      className="bg-[#131926] text-white"
                    >
                      {multa.tipo_multa} - ${multa.valor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Monto Recibido ($)
                  </label>
                  <input
                    type="number"
                    value={valorPago}
                    onChange={(e) => setValorPago(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Dinámico para Proyecto */}
          {concepto === "Proyecto" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Proyectos Pendientes
                </label>
                <select
                  value={proyectoSeleccionado}
                  onChange={(e) => setProyectoSeleccionado(e.target.value)}
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="" className="bg-[#131926] text-white">
                    Seleccione un proyecto pendiente
                  </option>
                  {proyectosPendientes.map((proyecto) => (
                    <option
                      key={proyecto.id}
                      value={proyecto.id}
                      className="bg-[#131926] text-white"
                    >
                      {proyecto.proyecto} - ${Number(proyecto.valor).toLocaleString("es-CO")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Monto Recibido ($)
                  </label>
                  <input
                    type="number"
                    value={valorPago}
                    onChange={(e) => setValorPago(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setUnidadSeleccionada("")
              setConcepto("Administración")
              setMultaSeleccionada("")
              setValorPago("")
              setMultasPendientes([])
              setMensualidadesPendientes([])
              setMensualidadSeleccionada("")
              onClose()
            }}
            className="px-5 py-2.5 bg-[#1E293B]/60 border border-[#1E293B]/80 text-slate-300 hover:text-white hover:bg-[#1E293B] rounded-xl text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={registrarPago}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5046e6] to-[#0ea5e9] text-white rounded-xl text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Registrar Pago
          </button>
        </div>

      </div>
    </div>
  )
}