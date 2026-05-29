"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function TranslatePopup() {
  const [isVisible, setIsVisible] = useState(true)
  const [activeTab, setActiveTab] = useState<"english" | "spanish">("spanish")

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#1a1a1a]/95 rounded-lg px-4 py-2 flex items-center gap-4 shadow-lg">
        <button
          onClick={() => setActiveTab("english")}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            activeTab === "english"
              ? "text-white border-green-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
          }`}
        >
          ingles
        </button>
        <button
          onClick={() => setActiveTab("spanish")}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            activeTab === "spanish"
              ? "text-white border-green-500"
              : "text-gray-400 border-transparent hover:text-gray-300"
          }`}
        >
          espanol
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white ml-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
