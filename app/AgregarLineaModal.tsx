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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-bold text-[#0f172a]">Agregar línea al aviso</h2>
          <button type="button" onClick={onClose} className="text-gray-400 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de cargo</label>
            <div className="grid grid-cols-2 gap-2">
              {["Concepto", "Multa", "Proyecto", "Linea libre"].map((item) => (
                <label key={item} className="flex items-center gap-2 border rounded-lg p-2 text-xs bg-white cursor-pointer select-none">
                  <input type="radio" name="tipoCargo" checked={tipoCargo === item} onChange={() => { setTipoCargo(item); setConcepto(""); setMonto(0); }} className="w-3.5 h-3.5 text-[#2d4486]" />
                  <span className="text-[#334155] font-semibold">{item}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{tipoCargo === "Proyecto" ? "PROYECTO" : tipoCargo === "Multa" ? "MULTA" : tipoCargo}</label>
            {tipoCargo === "Linea libre" ? (
              <input type="text" placeholder="Ej: exeso" onChange={(e) => setConcepto(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-xs outline-none" required />
            ) : (
              <select value={concepto} onChange={(e) => handleSelectChange(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-xs bg-white outline-none cursor-pointer" required>
                <option value="">Seleccione un {tipoCargo.toLowerCase()}...</option>
                {tipoCargo === "Concepto" && (
                  <>
                    <option value="Cuota Administrativa — Mayo 2026">Cuota Administrativa — Mayo 2026</option>
                    <option value="Fondo de emergencia común">Fondo de emergencia común</option>
                  </>
                )}
                {tipoCargo === "Multa" && listaMultas.map((m, idx) => <option key={idx} value={m.t}>{m.t} ({m.m})</option>)}
                {tipoCargo === "Proyecto" && listaProyectos.map((p, idx) => <option key={idx} value={p.t}>{p.t}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto</label>
            <input type="text" value={monto > 0 ? `$ ${(monto / 1000).toFixed(3)}` : "$ 0.000"} readOnly className="w-full border rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-gray-500 outline-none" required />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3 mt-1">
            <button type="button" onClick={onClose} className="border px-4 py-1.5 rounded-lg text-xs font-bold text-[#334155] cursor-pointer">Cancelar</button>
            <button type="submit" className="bg-[#2d4486] text-white px-5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
