"use client"
// Trigger Build 2026-07-11

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Sidebar, type PageType } from "@/components/dashboard/sidebar"
import { UnidadesTable } from "@/components/dashboard/unidades-table"
import { ReplitBadge } from "@/components/dashboard/replit-badge"
import {
  NuevaUnidadModal,
  type Unidad
} from "@/components/dashboard/nueva-unidad-modal"

import { EditarUnidadModal } from "@/components/dashboard/editar-unidad-modal"

import { Plus, Menu, Building2, CalendarCheck, Settings } from "lucide-react"

// VISTAS
import { AvisosCobroContent } from "./AvisosCobroContent"
import { ResumenContent } from "./ResumenContent"
import { CobrosContent } from "./CobrosContent"
import { MultasContent } from "./MultasContent"
import { ProyectosContent } from "./ProyectosContent"
import { ConfiguracionContent } from "./ConfiguracionContent"
import { CarteraContent } from "./CarteraContent"
import { ComunicadosContent } from "@/app/ComunicadosContent"
import { NotificacionesPersonalesContent } from "@/app/NotificacionesPersonalesContent"

export default function Dashboard() {

  const router = useRouter()

  const [currentPage, setCurrentPage] =
    useState<PageType>("resumen")

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false)

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false)

  const [selectedUnidad, setSelectedUnidad] =
    useState<Unidad | null>(null)

  const [adminMode, setAdminMode] =
    useState(false)

  const [unidades, setUnidades] =
    useState<Unidad[]>([])

  const [mounted, setMounted] =
    useState(false)

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

  // LOGIN

  useEffect(() => {

    const session =
      localStorage.getItem(
        "torre_admin_session"
      )

    if (!session) {
      window.location.href = "/login"
      return
    }

    setMounted(true)

    const cargarUnidades = async () => {
      const { data, error } = await supabase
        .from("unidades")
        .select("*")

      if (!error && data) {
        setUnidades(data)
      }
    }

    cargarUnidades()

    const handleDatosActualizados = () => {
      cargarUnidades()
    }
    window.addEventListener("datosActualizados", handleDatosActualizados)

    return () => {
      window.removeEventListener("datosActualizados", handleDatosActualizados)
    }
  }, [])

  // LOADING

  if (!mounted) {

    return (

      <div
        className="
          min-h-screen
          bg-[#f4f5f7]
          flex
          items-center
          justify-center
          text-gray-500
          font-medium
        "
      >
        Cargando Torre Admin...
      </div>

    )
  }

  const isDarkTheme = true;

  const getFechaHoyFormateada = () => {
    const dias = [
      "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
    ]
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    const hoy = new Date()
    const diaSemana = dias[hoy.getDay()].toLowerCase()
    const diaMes = hoy.getDate()
    const mes = meses[hoy.getMonth()].toLowerCase()
    const anio = hoy.getFullYear()
    return `${diaSemana}, ${diaMes} de ${mes} de ${anio}`
  }

  return (

    <div className={`min-h-screen ${isDarkTheme ? "bg-[#0B0F19] text-white" : "bg-[#f4f5f7]"}`}>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#06122B] text-white flex items-center justify-between px-4 z-30 border-b border-[#1E293B]/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-lg">{nombreTorre}</span>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/20 overflow-hidden bg-slate-900/50">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-5 h-5 text-white/80" />
          )}
        </div>
      </header>

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page)
          setIsSidebarOpen(false)
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="ml-0 lg:ml-[250px] p-4 md:p-8 pt-20 lg:pt-8">

        {/* RESUMEN */}

        {currentPage === "resumen" && (

          <ResumenContent
            totalUnidades={unidades.length}
            totalMultas={1}
            totalProyectos={1}
            apartamentos={unidades.map((u) => ({
              unidad: u.unidad || "",
              propietario: u.propietario || "",
            }))}
          />

        )}

        {/* UNIDADES */}

        {currentPage === "unidades" && (

          <div className="font-sans text-slate-200">

            <div className="flex justify-between items-center mb-8 gap-4 flex-col md:flex-row animate-[fadeIn_0.4s_ease-out]">

              <div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Unidades
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  Gestión de apartamentos
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                <div className="bg-[#131926]/90 border border-[#1E293B]/50 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-medium h-[42px]">
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  <span>{getFechaHoyFormateada()}</span>
                </div>

                <button
                  onClick={() => setAdminMode(!adminMode)}
                  className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold px-4 h-[42px] rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                >
                  <Settings className="w-4 h-4" />
                  {adminMode ? "Ver Modo Normal" : "Administrar Unidades"}
                </button>

                {adminMode && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#06122B] text-white px-5 h-[42px] rounded-xl text-xs cursor-pointer shadow-sm border border-white/10 hover:bg-[#06122B]/80 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Unidad
                  </button>
                )}
              </div>

            </div>

            <UnidadesTable
              unidades={unidades}
              adminMode={adminMode}
              onDelete={async (idx) => {
                const unidadAEliminar = unidades[idx]
                if (!confirm(`¿Eliminar la unidad ${unidadAEliminar.unidad}? Esta acción no se puede deshacer.`)) return
                const { error } = await supabase
                  .from("unidades")
                  .delete()
                  .eq("unidad", unidadAEliminar.unidad)
                if (error) {
                  alert("Error al eliminar: " + error.message)
                } else {
                  setUnidades(unidades.filter((_, i) => i !== idx))
                }
              }}
              onEdit={(idx) => {
                setSelectedUnidad(unidades[idx])
                setIsEditModalOpen(true)
              }}
              onAdd={() => setIsModalOpen(true)}
            />

          </div>

        )}

        {/* AVISOS */}

        {currentPage === "avisos-cobro" && (

          <AvisosCobroContent
            apartamentos={unidades.map((u) => ({

              unidad:
                u.unidad || "101",

              piso:
                Number(u.piso) || 1,

              propietario:
                u.propietario || "Sin nombre",

              telefono:
                u.telefono || "",

              email:
                u.email || ""

            }))}
          />

        )}

        {/* COBROS */}

        {currentPage === "gestion-cobros" && (

          <CobrosContent />

        )}


        {/* MULTAS */}

        {currentPage === "gestion-multas" && (

          <MultasContent />

        )}

        {currentPage === "gestion-cartera" && (

  <CarteraContent
    apartamentos={unidades.map((u) => ({

      unidad:
        u.unidad || "",

      propietario:
        u.propietario || ""

    }))}
  />

)}

        {/* PROYECTOS */}

        {currentPage === "gestion-proyectos" && (

          <ProyectosContent />

        )}

        {/* CONFIG */}

        {currentPage === "configuracion" && (

          <ConfiguracionContent />

        )}

        {/* COMUNICADOS */}

        {currentPage === "comunicados" && (

          <ComunicadosContent />

        )}

        {/* NOTIFICACIONES PERSONALES */}

        {currentPage === "notificaciones-personales" && (

          <NotificacionesPersonalesContent />

        )}

      </main>

      <ReplitBadge />

      {/* MODAL NUEVA */}

      <NuevaUnidadModal

        isOpen={isModalOpen}

        onClose={() =>
          setIsModalOpen(false)
        }

        onSave={async () => {
          // Recargar desde Supabase para garantizar sincronización
          const { data } = await supabase.from("unidades").select("*")
          if (data) setUnidades(data)
          setIsModalOpen(false)
        }}
      />

      {/* MODAL EDITAR */}

      <EditarUnidadModal

        isOpen={isEditModalOpen}

        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUnidad(null)
        }}

        onSave={async (unidadActualizada) => {
          const { error } = await supabase
            .from("unidades")
            .update({
              propietario: unidadActualizada.propietario,
              telefono: unidadActualizada.telefono,
              email: unidadActualizada.email,
              piso: unidadActualizada.piso,
            })
            .eq("unidad", unidadActualizada.unidad)

          if (error) {
            alert("Error al actualizar la unidad: " + error.message)
          } else {
            // Recargar desde Supabase para garantizar sincronización
            const { data } = await supabase.from("unidades").select("*")
            if (data) setUnidades(data)
            setIsEditModalOpen(false)
            setSelectedUnidad(null)
          }
        }}

        unidad={selectedUnidad}

      />

    </div>
  )
}