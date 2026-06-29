"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onAgregar: (linea: { tipo: string; concepto: string; monto: number }) => void
}

export function AgregarLineaModal({ isOpen, onClose, onAgregar }: Props) {
  const [tipoCargo, setTipoCargo] = useState("Concepto")
  const [concepto, setConcepto] = useState("")
  const [monto, setMonto] = useState(0)

  const [listaMultas, setListaMultas] = useState<{ t: string; m: string }[]>([])
  const [listaProyectos, setListaProyectos] = useState<{ t: string; p: string }[]>([])

  useEffect(() => {
    if (isOpen) {
      const mG = localStorage.getItem("multas_db")
      if (mG) setListaMultas(JSON.parse(mG))
      else setListaMultas([{ t: "ruido", m: "$ 35.000" }])

      const pG = localStorage.getItem("proyectos_db") || localStorage.getItem("proyectos")
      if (pG) {
        const parsed = JSON.parse(pG)
        setListaProyectos(parsed.map((p: any) => ({
          t: p.t || p.titulo || "Proyecto",
          p: p.p || p.presupuesto || "75.000"
        })))
      } else {
        setListaProyectos([{ t: "pintura", p: "75.000" }])
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectChange = (val: string) => {
    setConcepto(val)
    if (tipoCargo === "Concepto") {
      if (val === "Cuota Administrativa — Mayo 2026") setMonto(20000)
      else if (val === "Fondo de emergencia común") setMonto(15000)
      else setMonto(0)
    } else if (tipoCargo === "Multa") {
      const encontrada = listaMultas.find((m) => m.t === val)
      if (encontrada) {
        const numClean = encontrada.m.replace(/[^0-9]/g, "")
        setMonto(parseInt(numClean, 10) || 0)
      } else {
        setMonto(0)
      }
    } else if (tipoCargo === "Proyecto") {
      const encontrado = listaProyectos.find((p) => p.t === val)
      if (encontrado) {
        const numClean = encontrado.p.replace(/[^0-9]/g, "")
        setMonto(parseInt(numClean, 10) || 0)
      } else {
        setMonto(0)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!concepto.trim()) return
    // Enviamos el número entero puro (ej: 35000)
    onAgregar({ tipo: tipoCargo, concepto, monto: Number(monto) })
    setConcepto("")
    setMonto(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[480px] border border-slate-100 overflow-hidden animate-[scaleUp_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Agregar línea al aviso</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Tipo de cargo</label>
            <div className="grid grid-cols-2 gap-2">
              {["Concepto", "Multa", "Proyecto", "Linea libre"].map((item) => (
                <label key={item} className="flex items-center gap-2 border border-slate-200/80 rounded-xl p-3 text-xs bg-white hover:bg-slate-50 transition-colors cursor-pointer select-none">
                  <input 
                    type="radio" 
                    name="tipoCargo" 
                    checked={tipoCargo === item} 
                    onChange={() => { setTipoCargo(item); setConcepto(""); setMonto(0); }} 
                    className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-slate-600 font-semibold">{item}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {tipoCargo === "Proyecto" ? "PROYECTO" : tipoCargo === "Multa" ? "MULTA" : tipoCargo}
            </label>
            {tipoCargo === "Linea libre" ? (
              <input 
                type="text" 
                placeholder="Ej. Exceso" 
                onChange={(e) => setConcepto(e.target.value)} 
                className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200" 
                required 
              />
            ) : (
              <select 
                value={concepto} 
                onChange={(e) => handleSelectChange(e.target.value)} 
                className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer text-slate-700 font-medium" 
                required
              >
                <option value="" className="text-slate-400">Seleccione un {tipoCargo.toLowerCase()}...</option>
                {tipoCargo === "Concepto" && (
                  <>
                    <option value="Cuota Administrativa — Mayo 2026">Cuota Administrativa — Mayo 2026</option>
                    <option value="Fondo de emergencia común">Fondo de emergencia común</option>
                  </>
                )}
                {tipoCargo === "Multa" && listaMultas.map((m, idx) => (
                  <option key={idx} value={m.t}>{m.t} ({m.m})</option>
                ))}
                {tipoCargo === "Proyecto" && listaProyectos.map((p, idx) => (
                  <option key={idx} value={p.t}>{p.t}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monto</label>
            <input 
              type="text" 
              value={monto > 0 ? `$ ${(monto / 1000).toFixed(3)}` : "$ 0.000"} 
              readOnly 
              className="w-full border border-slate-100 rounded-xl px-3.5 py-2 text-xs bg-slate-50 text-slate-400 font-semibold outline-none cursor-not-allowed" 
              required 
            />
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-500/10 transition-all cursor-pointer"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
