"use client"
import { useState } from "react"
import { X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (proyecto: { t: string; d: string; p: string; s: string }) => void
}

export function NuevoProyectoModal({ isOpen, onClose, onSave }: Props) {
  const [t, setT] = useState("")
  const [d, setD] = useState("")
  const [p, setP] = useState("0")
  const [s, setS] = useState("pl")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!t.trim()) return
    onSave({ t, d: d || "Sin descripción", p: `$ ${Number(p).toLocaleString()}`, s })
    setT(""); setD(""); setP("0"); setS("pl")
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b font-bold text-[#0f172a]">
          <h2>Registrar Proyecto</h2>
          <button type="button" onClick={onClose} className="text-gray-400 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div><label className="block text-sm font-semibold text-[#334155] mb-1">Título</label><input type="text" placeholder="Ej: Pintura exterior" value={t} onChange={(e) => setT(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" required /></div>
          <div><label className="block text-sm font-semibold text-[#334155] mb-1">Descripción</label><textarea placeholder="Detalles..." value={d} onChange={(e) => setD(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none outline-none" /></div>
          <div><label className="block text-sm font-semibold text-[#334155] mb-1">Presupuesto Estimado (DOP)</label><input type="number" value={p} onChange={(e) => setP(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" min="0" /></div>
          <div><label className="block text-sm font-semibold text-[#334155] mb-1">Estado</label><select value={s} onChange={(e) => setS(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none cursor-pointer"><option value="pl">Planificado</option><option value="p">En progreso</option><option value="c">Completado</option></select></div>
          <button type="submit" className="w-full bg-[#2d4486] text-white py-2.5 rounded-lg font-medium text-sm mt-2 hover:bg-[#22366d] cursor-pointer">Guardar</button>
        </form>
      </div>
    </div>
  )
}
