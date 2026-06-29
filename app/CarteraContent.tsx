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

    // MARCAR MULTA COMO VENCIDA
    await supabase
      .from("multas_asignadas")
      .update({
        estado: "Vencida"
      })
      .eq("id", multa.id)
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
    <div className="font-sans max-w-5xl">
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
            <button onClick={() => setVistaActual("tabla")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
          )}
          <div>
            <h1 className="text-[28px] font-bold text-[#06122B] tracking-tight">{vistaActual === "tabla" ? "Cartera" : "Portafolio de Cartera"}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{vistaActual === "tabla" ? "Gestión de saldos pendientes" : "Historial por apartamento"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setVistaActual(vistaActual === "tabla" ? "portafolio" : "tabla")} className="bg-[#06122B] text-white px-5 h-[42px] rounded-lg text-sm font-medium cursor-pointer shadow-sm hover:opacity-95">
            <span>{vistaActual === "tabla" ? "Portafolio" : "Ver Tabla"}</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#06122B] text-white px-5 h-[42px] rounded-lg text-sm font-medium cursor-pointer shadow-sm hover:opacity-95">
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {vistaActual === "tabla" ? (
        <div className="bg-white rounded-2xl border border-[#dfe5ec] shadow-sm overflow-hidden p-1 print:hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#dfe5ec]">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">APTO</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">PROPIETARIO</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%] text-center">ESTADO ACTUAL</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%] text-right pr-6">DEUDA TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apartamentos?.map((apto) => {
                const deudaApto = deudas[apto.unidad] || 0;
                return (
                  <tr key={apto.unidad} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-[#1d4ed8]">Apto. {apto.unidad}</td>
                    <td className="p-4 text-sm font-semibold text-black">{apto.propietario}</td>
                    <td className="p-4 text-sm text-center">
                      <span style={{ backgroundColor: deudaApto > 0 ? "#ef4444" : "#22c55e", color: "#ffffff" }} className="inline-flex items-center justify-center text-xs font-extrabold px-4 py-2 rounded-xl uppercase tracking-wider w-[130px] shadow-sm">
                        {deudaApto > 0 ? "Con deuda" : "Al día"}
                      </span>
                    </td>
                    <td className={`p-4 text-base font-bold text-right pr-6 ${deudaApto > 0 ? "text-red-600" : "text-emerald-600"}`}>$ {deudaApto.toLocaleString("es-CO")}</td>
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
            return (
              <div key={apto.unidad} className="bg-white rounded-2xl border border-[#dfe5ec] shadow-sm overflow-hidden p-5">
                <div onClick={() => toggleTarjeta(apto.unidad)} className="flex justify-between items-center cursor-pointer select-none">
                  <div>
                    <h3 className="text-base font-bold text-[#06122B]">Apto. {apto.unidad}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Propietario: <span className="text-gray-600 font-medium">{apto.propietario}</span></p>
                  </div>
                  <div className="text-gray-500 p-1">{isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
                </div>
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-[#f1f5f9] space-y-3">
                    {movs.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400 italic bg-[#f8fafc] rounded-xl">No hay registros de caja para esta unidad.</div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {movs.map((m) => {
                            const saldoSeguro = m.saldoResultante || 0;
                            const montoSeguro = m.monto || 0;
                            const isChecked = seleccionados.includes(m.id);
                            return (
                              <div key={m.id} className="flex justify-between items-center bg-white border border-gray-100 rounded-xl p-4 shadow-xs">
                                <div className="flex items-center gap-4">
                                  <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(m.id)} className="w-4 h-4 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer" onClick={(e) => e.stopPropagation()} />
                                  <div className="space-y-1">
                                    <span className="text-sm font-bold text-[#06122B] block">
                                      {m.tipo === "deuda" ? `Deuda registrada $ ${montoSeguro.toLocaleString("es-CO")}` : `Pago registrado $ ${montoSeguro.toLocaleString("es-CO")}`}
                                    </span>
                                    <div className="text-xs text-gray-400 flex items-center gap-4 font-medium">
                                      <span>{m.fecha}</span>
                                      <span className={saldoSeguro > 0 ? "text-red-500" : "text-emerald-600 font-bold"}>
                                        Monto restante a pagar: {saldoSeguro > 0 ? `$ ${saldoSeguro.toLocaleString("es-CO")}` : "AL DÍA"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); ejecutarImpresion([m]); }} className="flex items-center gap-1.5 border border-[#dfe5ec] text-gray-700 bg-white px-3.5 h-[36px] rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer">
                                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"/></svg>Imprimir
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-end pt-4">
                          <button
  type="button"
  onClick={() => {
    const filtrados = movs.filter(
      m => seleccionados.includes(m.id)
    )

    if (filtrados.length === 0) {
      toast.warning(
        "Marca al menos un cuadrito."
      )
      return
    }

    ejecutarImpresion(filtrados)
  }}
  style={{
    backgroundColor: "#10b981",
    color: "#ffffff"
  }}
  className="flex flex-col items-center justify-center h-[64px] w-[160px] rounded-xl shadow-md hover:opacity-95 text-center p-2 cursor-pointer"
>
                            <svg className="w-4 h-4 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-wider block">Imprimir</span><span className="text-[9px] font-bold uppercase tracking-wider opacity-90 block">seleccionados</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0" onClick={cerrarModal} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative z-10 border border-[#dfe5ec]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-[#06122B] flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#1d4ed8]" />Registrar Movimiento de Caja</h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seleccionar Apartamento</label>
                <select value={unidadSeleccionada} onChange={(e) => setUnidadSeleccionada(e.target.value)} className="w-full border border-[#dfe5ec] h-[42px] px-3 rounded-lg text-sm bg-white focus:outline-none">
                  <option value="">-- Elige una unidad --</option>
                  {apartamentos?.map((apto) => ( <option key={apto.unidad} value={apto.unidad}>Apto. {apto.unidad} - {apto.propietario}</option> ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto ($)</label>
                <input type="number" placeholder="Ej. 120000" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full border border-[#dfe5ec] h-[42px] px-3 rounded-lg text-sm font-semibold text-[#06122B] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => handleRegistrarMovimiento("deuda")} style={{ backgroundColor: "#ef4444", color: "#ffffff" }} className="font-bold text-xs uppercase tracking-wider h-[42px] rounded-lg border border-red-600 hover:opacity-90 text-center cursor-pointer">Registrar Deuda</button>
                <button type="button" onClick={() => handleRegistrarMovimiento("pago")} style={{ backgroundColor: "#22c55e", color: "#ffffff" }} className="font-bold text-xs uppercase tracking-wider h-[42px] rounded-lg border border-green-600 hover:opacity-90 text-center cursor-pointer">Registrar Pago</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
