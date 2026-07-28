"use client";
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import { X, DollarSign, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner"

interface ApartamentoProp { unidad: string; propietario: string; }
interface CarteraContentProps { apartamentos: ApartamentoProp[]; }
interface HistorialMovimiento { 
  id: string; 
  unidad: string; 
  tipo: "deuda" | "pago"; 
  monto: number; 
  fecha: string; 
  saldoResultante: number; 
}

export function CarteraContent({ apartamentos }: CarteraContentProps) {
  const [vistaActual, setVistaActual] = useState<"tabla" | "portafolio">("tabla");
  const [tarjetasAbiertas, setTarjetasAbiertas] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [monto, setMonto] = useState("");
  const [deudas, setDeudas] = useState<Record<string, number>>({});
  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [movimientosAImprimir, setMovimientosAImprimir] = useState<HistorialMovimiento[]>([]);

 useEffect(() => {
  cargarCartera();
}, []);

async function cargarCartera() {
  const { data: carteraData, error: carteraError } =
    await supabase
      .from("cartera")
      .select("*");

  if (carteraError) {
    console.error(carteraError);
    return;
  }
  // REVISAR MULTAS VENCIDAS
const hoy = new Date()

const { data: multasVencidas } = await supabase
  .from("multas_asignadas")
  .select("*")
  .eq("estado", "Vencida")

for (const multa of multasVencidas || []) {

  if (!multa.fecha_vencimiento) continue

  const fechaVence = new Date(
    multa.fecha_vencimiento
  )

  if (hoy > fechaVence) {

    // BUSCAR DEUDA ACTUAL
    const { data: carteraActual } = await supabase
      .from("cartera")
      .select("*")
      .eq("unidad", multa.unidad)
      .maybeSingle()

    const deudaActual =
      carteraActual?.deuda || 0

    const valorMulta =
      Number(
        String(multa.valor)
          .replace(/[^0-9]/g, "")
      ) || 0

    // SUMAR MULTA A CARTERA
    if (carteraActual) {

      await supabase
        .from("cartera")
        .update({
          deuda: deudaActual + valorMulta
        })
        .eq("unidad", multa.unidad)

    } else {

      await supabase
        .from("cartera")
        .insert({
          unidad: multa.unidad,
          deuda: valorMulta
        })
    }

    // REGISTRAR MOVIMIENTO EN HISTORIAL CARTERA
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    await supabase
      .from("historial_cartera")
      .insert({
        unidad: multa.unidad,
        tipo: "deuda",
        monto: valorMulta,
        fecha: hoyStr,
        saldoResultante: deudaActual + valorMulta
      })

    // MARCAR MULTA COMO CARGADA EN CARTERA
    await supabase
      .from("multas_asignadas")
      .update({ estado: "Cargada" })
      .eq("id", multa.id)

    await supabase
      .from("portafolio_multas")
      .update({ estado: "Cargada" })
      .eq("unidad", multa.unidad)
      .eq("multa_id", multa.multa_id)
      .eq("fecha_asignacion", multa.fecha_asignacion)
  }
}

  const mapaDeudas: Record<string, number> = {};

  (carteraData || []).forEach((item) => {
  mapaDeudas[item.unidad] = item.deuda;
});

  setDeudas(mapaDeudas);

  const { data: historialData, error: historialError } =
    await supabase
      .from("historial_cartera")
      .select("*")
      .order("id", { ascending: false });

  if (historialError) {
    console.error(historialError);
    return;
  }

  setHistorial(historialData || []);
}

  const cerrarModal = () => { setIsModalOpen(false); setUnidadSeleccionada(""); setMonto(""); };
  const handleRegistrarMovimiento = async (
  tipo: "deuda" | "pago"
) => {
    if (!unidadSeleccionada || !monto || Number(monto) <= 0) return;
    const montoNum = Number(monto);
    const saldoActual = deudas[unidadSeleccionada] || 0;
    let nuevaDeuda =
  tipo === "deuda"
    ? saldoActual + montoNum
    : saldoActual - montoNum;

if (nuevaDeuda < 0) nuevaDeuda = 0;

const existe = await supabase
  .from("cartera")
  .select("id")
  .eq("unidad", unidadSeleccionada)
  .maybeSingle();

if (existe.data) {
  await supabase
    .from("cartera")
    .update({
      deuda: nuevaDeuda
    })
    .eq("unidad", unidadSeleccionada);
} else {
  await supabase
    .from("cartera")
    .insert({
      unidad: unidadSeleccionada,
      deuda: nuevaDeuda
    });
}

    const copiaDeudas = { ...deudas, [unidadSeleccionada]: nuevaDeuda };
    setDeudas(copiaDeudas);
    
    const hoy = new Date();
    const nuevoMov = {
      id: Date.now().toString(),
      unidad: unidadSeleccionada,
      tipo,
      monto: montoNum,
      fecha: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`,
      saldoResultante: nuevaDeuda
    };
    const { error } = await supabase
  .from("historial_cartera")
  .insert({
    unidad: unidadSeleccionada,
    tipo,
    monto: montoNum,
    fecha: nuevoMov.fecha,
    saldoResultante: nuevaDeuda
  });

if (error) {
  console.error(error);
  toast.error("Error guardando historial");
  return;
}

await cargarCartera();
cerrarModal();
  };

  const handleCheckboxChange = (id: string) => {
    setSeleccionados(seleccionados.includes(id) ? seleccionados.filter((sId) => sId !== id) : [...seleccionados, id]);
  };

  const toggleTarjeta = (unidad: string) => {
    setTarjetasAbiertas(tarjetasAbiertas.includes(unidad) ? tarjetasAbiertas.filter(u => u !== unidad) : [...tarjetasAbiertas, unidad]);
  };

  const obtenerPropietario = (unidad: string) => {
    const apto = apartamentos?.find((a) => a.unidad === unidad);
    return apto ? apto.propietario : "N/A";
  };

  const ejecutarImpresion = (lista: HistorialMovimiento[]) => {
    setMovimientosAImprimir(lista);
    setTimeout(() => { window.print(); }, 150);
  };
  return (
    <div className="font-sans text-slate-200 animate-[fadeIn_0.4s_ease-out] w-full">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #recibo-oficial-impresion, #recibo-oficial-impresion * { visibility: visible !important; }
          #recibo-oficial-impresion { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
        }
      `}</style>

      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-3">
          {vistaActual === "portafolio" && (
            <button 
              onClick={() => setVistaActual("tabla")} 
              className="p-2 hover:bg-[#1E293B]/40 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {vistaActual === "tabla" ? "Cartera" : "Portafolio de Cartera"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {vistaActual === "tabla" ? "Gestión de saldos pendientes" : "Historial por apartamento"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setVistaActual(vistaActual === "tabla" ? "portafolio" : "tabla")} 
            className="border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-5 h-[42px] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <span>{vistaActual === "tabla" ? "Ver Portafolio" : "Ver Tabla"}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold h-[42px] px-5 rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-[0.98]"
          >
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {vistaActual === "tabla" ? (
        <div className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-3xl shadow-2xl overflow-x-auto p-1 print:hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0F19]/40 border-b border-[#1E293B]/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6 w-[15%]">APTO</th>
                <th className="p-4 w-[35%]">PROPIETARIO</th>
                <th className="p-4 text-center w-[25%]">ESTADO ACTUAL</th>
                <th className="p-4 text-right pr-6 w-[25%]">DEUDA TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/20">
              {apartamentos?.map((apto) => {
                const deudaApto = deudas[apto.unidad] || 0;
                return (
                  <tr key={apto.unidad} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 text-sm font-bold text-white">Apto. {apto.unidad}</td>
                    <td className="p-4 text-sm text-slate-300 capitalize">{apto.propietario}</td>
                    <td className="p-4 text-sm text-center">
                      <span className={`inline-flex items-center justify-center text-[10px] font-extrabold px-3.5 py-1 rounded-xl uppercase tracking-wider w-[120px] border ${
                        deudaApto > 0 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {deudaApto > 0 ? "Con deuda" : "Al día"}
                      </span>
                    </td>
                    <td className={`p-4 text-base font-extrabold text-right pr-6 ${deudaApto > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      $ {deudaApto.toLocaleString("es-CO")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4 print:hidden">
          {apartamentos?.map((apto) => {
            const isOpen = tarjetasAbiertas.includes(apto.unidad);
            const movs = historial.filter((m) => m.unidad === apto.unidad);
            const deudaApto = deudas[apto.unidad] || 0;

            return (
              <div 
                key={apto.unidad} 
                className="bg-[#131926]/90 border border-[#1E293B]/50 rounded-2xl shadow-xl overflow-hidden p-5"
              >
                <div 
                  onClick={() => toggleTarjeta(apto.unidad)} 
                  className="flex justify-between items-center cursor-pointer select-none"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">Apto. {apto.unidad}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Propietario: <span className="text-slate-200 capitalize font-medium">{apto.propietario}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-extrabold px-3 py-1 rounded-xl border ${
                      deudaApto > 0 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {deudaApto > 0 ? `$ ${deudaApto.toLocaleString("es-CO")}` : "Al día"}
                    </span>
                    <div className="text-slate-400 p-1">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-[#1E293B]/20 space-y-3">
                    {movs.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 italic bg-[#1B2336]/40 rounded-xl">
                        No hay registros de caja para esta unidad.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {movs.map((m) => {
                            const saldoSeguro = m.saldoResultante || 0;
                            const montoSeguro = m.monto || 0;
                            const isChecked = seleccionados.includes(m.id);
                            return (
                              <div 
                                key={m.id} 
                                className="flex justify-between items-center bg-[#0B0F19]/60 border border-[#1E293B]/30 rounded-xl p-4 shadow-xs"
                              >
                                <div className="flex items-center gap-4">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked} 
                                    onChange={() => handleCheckboxChange(m.id)} 
                                    className="w-4 h-4 accent-indigo-500 rounded bg-[#1B2336] border-[#1E293B]/80 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                                    onClick={(e) => e.stopPropagation()} 
                                  />
                                  <div className="space-y-1">
                                    <span className="text-sm font-bold text-white block">
                                      {m.tipo === "deuda" 
                                        ? `Deuda registrada $ ${montoSeguro.toLocaleString("es-CO")}` 
                                        : `Pago registrado $ ${montoSeguro.toLocaleString("es-CO")}`
                                      }
                                    </span>
                                    <div className="text-xs text-slate-400 flex items-center gap-4 font-medium">
                                      <span>{m.fecha}</span>
                                      <span className={saldoSeguro > 0 ? "text-red-400 font-semibold" : "text-emerald-400 font-bold"}>
                                        Monto restante a pagar: {saldoSeguro > 0 ? `$ ${saldoSeguro.toLocaleString("es-CO")}` : "AL DÍA"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); ejecutarImpresion([m]); }} 
                                  className="flex items-center gap-1.5 border border-[#1E293B]/80 bg-[#1B2336] hover:bg-[#1B2336]/80 text-slate-300 hover:text-white px-3.5 h-[36px] rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"/>
                                  </svg>
                                  Imprimir
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              const filtrados = movs.filter(m => seleccionados.includes(m.id));
                              if (filtrados.length === 0) {
                                toast.warning("Marca al menos un cuadrito.");
                                return;
                              }
                              ejecutarImpresion(filtrados);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"/>
                            </svg>
                            Imprimir seleccionados
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* COMPROBANTE DE IMPRESIÓN OFICIAL CON TEXTO DE SALDO ACTUALIZADO */}
      <div id="recibo-oficial-impresion" className="hidden print:block text-[#0f172a]">
        {movimientosAImprimir.length > 0 && (() => {
          const primerMov = movimientosAImprimir[0];
          const ultimoMov = movimientosAImprimir[movimientosAImprimir.length - 1];
          const saldoFinalSeguro = ultimoMov.saldoResultante || 0;
          
          return (
            <div style={{ border: "1px solid #dfe5ec", padding: "24px", maxWidth: "420px", margin: "20px auto", borderRadius: "16px", backgroundColor: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.025em" }}>TORRE 44</h2>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", display: "block", marginTop: "2px", textTransform: "uppercase" }}>
                    {movimientosAImprimir.length === 1 && primerMov.tipo === "deuda" ? "Aviso de cobro" : "Comprobante de caja"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", display: "block" }}>{primerMov.fecha}</span>
                  <div style={{ display: "inline-block", width: "6px", height: "6px", backgroundColor: "#ef4444", borderRadius: "50%", marginTop: "6px" }}></div>
                </div>
              </div>

              {/* Bloque de datos de vivienda pegados en distancia corta */}
              <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", display: "block", textTransform: "uppercase" }}>Apartamento</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", display: "block", marginTop: "2px" }}>Apto. {primerMov.unidad}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", display: "block", textTransform: "uppercase" }}>Propietario</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", display: "block", marginTop: "2px" }}>{obtenerPropietario(primerMov.unidad)}</span>
                </div>
              </div>

              {/* Renglones Contables Detallados en Números con el Estado Inteligente */}
              <div style={{ padding: "4px 0", marginBottom: "16px" }} className="space-y-2">
                {movimientosAImprimir.map((m) => {
                  const montoSeguro = m.monto || 0;
                  const saldoSeguro = m.saldoResultante || 0;
                  return (
                    <div key={m.id} style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "6px", lineHeight: "1.5" }}>
                      {m.fecha} {m.tipo === "deuda" ? "Deuda registrada" : "Pago registrado"} $ {montoSeguro.toLocaleString("es-CO")} • 
                      <span style={{ color: saldoSeguro > 0 ? "#b91c1c" : "#16a34a", marginLeft: "6px" }}>
                        Monto restante a pagar: {saldoSeguro > 0 ? `$ ${saldoSeguro.toLocaleString("es-CO")}` : "AL DÍA"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "14px" }}>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  {saldoFinalSeguro > 0 ? "COMPROBANTE DE MORA" : "COMPROBANTE DE PAGO"}
                </p>
                <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", margin: "3px 0 0 0", letterSpacing: "0.05em" }}>ADMINISTRACIÓN</p>
              </div>
            </div>
          );
        })()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0" onClick={cerrarModal} />
          <div className="bg-[#131926] rounded-3xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#1E293B]/80 text-white">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                Registrar Movimiento de Caja
              </h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-white p-1 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Seleccionar Apartamento
                </label>
                <select 
                  value={unidadSeleccionada} 
                  onChange={(e) => setUnidadSeleccionada(e.target.value)} 
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white h-[42px] px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="">-- Elige una unidad --</option>
                  {apartamentos?.map((apto) => ( 
                    <option key={apto.unidad} value={apto.unidad}>
                      Apto. {apto.unidad} - {apto.propietario}
                    </option> 
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Monto ($)
                </label>
                <input 
                  type="number" 
                  placeholder="Ej. 120000" 
                  value={monto} 
                  onChange={(e) => setMonto(e.target.value)} 
                  className="w-full bg-[#1B2336] border border-[#1E293B]/80 text-white h-[42px] px-3 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1E293B]/20">
                <button 
                  type="button" 
                  onClick={() => handleRegistrarMovimiento("deuda")} 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-[42px] rounded-lg border border-red-600 hover:border-red-700 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Registrar Deuda
                </button>
                <button 
                  type="button" 
                  onClick={() => handleRegistrarMovimiento("pago")} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider h-[42px] rounded-lg border border-emerald-600 hover:border-emerald-700 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
