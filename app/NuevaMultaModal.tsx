"use client"
import { useState } from "react"
import { X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (multa: { t: string; d: string; m: string }) => void
}

export function NuevaMultaModal({ isOpen, onClose, onSave }: Props) {
  const [t, setT] = useState("")
  const [d, setD] = useState("")
  const [m, setM] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!t.trim() || !m.trim()) return
    
    // Formatear el monto automáticamente con puntos como en tu imagen ($ 35.000)
    const montoFormateado = `$ ${Number(m).toLocaleString("es-DO")}`
    
    onSave({ t, d: d || "Sin descripción", m: montoFormateado })
    setT(""); setD(""); setM("")
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] border overflow-hidden font-sans">
        {/* Header exacto a tu imagen */}
        <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[18px] font-bold text-[#0f172a]">Registrar Nueva Multa</h2>
            <p className="text-[14px] text-[#64748b] mt-0.5">Agrega una nueva infracción al catálogo.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Formulario e Inputs idénticos */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-semibold text-[#334155] mb-1">Nombre de la multa</label>
            <input type="text" placeholder="Ej: ruido" value={t} onChange={(e) => setT(e.target.value)} className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#2d4486]" required />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-[#334155] mb-1">Descripción</label>
            <textarea placeholder="Ej: exeso" value={d} onChange={(e) => setD(e.target.value)} className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-[14px] h-20 resize-none outline-none focus:border-[#2d4486]" />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-[#334155] mb-1">Monto</label>
            <input type="number" placeholder="Ej: 35000" value={m} onChange={(e) => setM(e.target.value)} className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#2d4486]" required min="0" />
          </div>
          <button type="submit" className="w-full bg-[#2d4486] text-white py-2.5 rounded-lg font-medium text-[15px] mt-2 hover:bg-[#22366d] transition-colors cursor-pointer">
            Guardar
          </button>
        </form>
      </div>
    </div>
  )
}
