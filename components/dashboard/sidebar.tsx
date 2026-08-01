"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  Building2,
  LayoutDashboard,
  Home,
  FileText,
  Settings2,
  Wrench,
  ChevronDown,
  Receipt,
  AlertTriangle,
  FolderKanban,
  Wallet,
  LogOut,
  Megaphone,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

export type PageType =
  | "resumen"
  | "unidades"
  | "avisos-cobro"
  | "gestion-cobros"
  | "gestion-multas"
  | "gestion-proyectos"
  | "configuracion"
  | "gestion-cartera"
  | "comunicados"
  | "notificaciones-personales"

interface SidebarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  isOpen?: boolean
  onClose?: () => void
}

const mainMenuItems: {
  icon: typeof LayoutDashboard
  label: string
  page: PageType
}[] = [
  {
    icon: LayoutDashboard,
    label: "Panel Principal",
    page: "resumen"
  },

  {
    icon: Home,
    label: "Unidades",
    page: "unidades"
  },

  {
    icon: FileText,
    label: "Avisos de Cobro",
    page: "avisos-cobro"
  },

  {
    icon: Megaphone,
    label: "Comunicados Grupo",
    page: "comunicados"
  },

  {
    icon: MessageSquare,
    label: "Notificaciones Privadas",
    page: "notificaciones-personales"
  },
]

const gestionSubItems: {
  icon: typeof Receipt
  label: string
  page: PageType
}[] = [
  {
    icon: Receipt,
    label: "Cobros",
    page: "gestion-cobros"
  },

  {
    icon: AlertTriangle,
    label: "Multas",
    page: "gestion-multas"
  },

  {
    icon: FolderKanban,
    label: "Proyectos",
    page: "gestion-proyectos"
  },

  {
    icon: Wallet,
    label: "Cartera",
    page: "gestion-cartera"
  },

]

export function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose
}: SidebarProps) {

  const router = useRouter()
  const [nombreTorre, setNombreTorre] = useState("Torre Admin")
  const [logoUrl, setLogoUrl] = useState("")

  useEffect(() => {
    const handleStorageChange = () => {
      const name = localStorage.getItem("nombre_torre") || "Torre Admin"
      const logo = localStorage.getItem("logo_url") || ""
      setNombreTorre(name)
      setLogoUrl(logo)
    }
    handleStorageChange()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("nombreTorreChanged", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("nombreTorreChanged", handleStorageChange)
    }
  }, [])

  const [gestionOpen, setGestionOpen] =
    useState(
      currentPage.startsWith("gestion-")
    )

  const isGestionActive =
    currentPage.startsWith("gestion-")

  const cerrarSesion = () => {

    localStorage.removeItem(
      "torre_admin_session"
    )

    router.push("/login")
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[250px] bg-[#06122B] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >

      {/* LOGO */}

      <div className="px-6 py-6">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-lg border-2 border-white/30 flex items-center justify-center overflow-hidden bg-slate-900/50">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-white/80" />
            )}
          </div>

          <span className="text-white font-semibold text-lg">
            {nombreTorre}
          </span>

        </div>

      </div>

      {/* MENU */}

      <nav className="flex-1 px-3 py-4">

        <ul className="space-y-1">

          {mainMenuItems.map((item) => (

            <li key={item.label}>

              <button
                onClick={() =>
                  onNavigate(item.page)
                }
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",

                  currentPage === item.page
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/80"
                )}
              >

                <item.icon className="w-5 h-5" />

                <span>
                  {item.label}
                </span>

              </button>

            </li>

          ))}

          {/* GESTION */}

          <li>

            <button
              onClick={() =>
                setGestionOpen(
                  !gestionOpen
                )
              }
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",

                isGestionActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              )}
            >

              <div className="flex items-center gap-3">

                <Wrench className="w-5 h-5" />

                <span>
                  Gestión
                </span>

              </div>

              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  gestionOpen
                    ? "rotate-180"
                    : ""
                )}
              />

            </button>

            {gestionOpen && (

              <ul className="mt-1 ml-4 space-y-1">

                {gestionSubItems.map(
                  (subItem) => (

                    <li key={subItem.label}>

                      <button
                        onClick={() =>
                          onNavigate(
                            subItem.page
                          )
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",

                          currentPage ===
                            subItem.page
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        )}
                      >

                        <subItem.icon className="w-4 h-4" />

                        <span>
                          {subItem.label}
                        </span>

                      </button>

                    </li>

                  )
                )}

              </ul>

            )}

          </li>

          {/* CONFIGURACION */}

          <li>

            <button
              onClick={() =>
                onNavigate(
                  "configuracion"
                )
              }
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",

                currentPage ===
                  "configuracion"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              )}
            >

              <Settings2 className="w-5 h-5" />

              <span>
                Configuración
              </span>

            </button>

          </li>

        </ul>

      </nav>

      {/* USUARIO */}

      <div className="px-4 py-6 border-t border-white/10">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">

            AD

          </div>

          <div className="flex-1">

            <p className="text-white font-medium text-sm">
              Administrador
            </p>

            <p className="text-white/50 text-xs">
              Admin General
            </p>

          </div>

        </div>

        {/* ONLINE */}

        <div className="mt-4 flex items-center gap-2">

          <div className="w-2 h-2 rounded-full bg-green-500"></div>

          <span className="text-white/50 text-xs">
            Sistema en línea
          </span>

        </div>

        {/* BOTON CERRAR SESION */}

        <button
          onClick={cerrarSesion}
          className="
            mt-5
            w-full
            flex
            items-center
            justify-center
            gap-2
            bg-red-500/10
            hover:bg-red-500/20
            text-red-400
            py-3
            rounded-xl
            transition
            text-sm
            font-medium
          "
        >

          <LogOut className="w-4 h-4" />

          Cerrar sesión

        </button>

    </div>

  </aside>
  </>

)
}