"use client"

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

import { Plus } from "lucide-react"

// VISTAS
import { AvisosCobroContent } from "./AvisosCobroContent"
import { ResumenContent } from "./ResumenContent"
import { CobrosContent } from "./CobrosContent"
import { MultasContent } from "./MultasContent"
import { ProyectosContent } from "./ProyectosContent"
import { ConfiguracionContent } from "./ConfiguracionContent"
import { CarteraContent } from "./CarteraContent"

export default function Dashboard() {

  const router = useRouter()

  const [currentPage, setCurrentPage] =
    useState<any>("avisos-cobro")

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false)

  const [unidades, setUnidades] =
    useState<Unidad[]>([])

  const [mounted, setMounted] =
    useState(false)

  // LOGIN

  useEffect(() => {

    const session =
      localStorage.getItem(
        "torre_admin_session"
      )

    if (!session) {

      router.push("/login")
      return

    }

    setMounted(true)

    const cargarUnidades = async () => {

  const { data, error } =
    await supabase
      .from("unidades")
      .select("*")

  if (!error && data) {

    setUnidades(data)

  }

}

cargarUnidades()

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

  return (

    <div className="min-h-screen bg-[#f4f5f7]">

      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <main className="ml-[250px] p-8">

        {/* RESUMEN */}

        {currentPage === "resumen" && (

          <ResumenContent
            totalUnidades={unidades.length}
            totalMultas={1}
            totalProyectos={1}
          />

        )}

        {/* UNIDADES */}

        {currentPage === "unidades" && (

          <div className="font-sans">

            <div className="flex justify-between mb-8">

              <div>

                <h1
                  className="
                    text-[28px]
                    font-bold
                    text-[#06122B]
                  "
                >
                  Unidades
                </h1>

                <p className="text-gray-500 text-sm">
                  Gestión de apartamentos
                </p>

              </div>

              <button
                onClick={() =>
                  setIsModalOpen(true)
                }
                className="
                  flex
                  items-center
                  gap-2
                  bg-[#06122B]
                  text-white
                  px-5
                  h-[42px]
                  rounded-lg
                  text-sm
                  cursor-pointer
                  shadow-sm
                "
              >

                <Plus className="w-4 h-4" />

                Nueva Unidad

              </button>

            </div>

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-[#dfe5ec]
                shadow-sm
                overflow-hidden
                p-1
              "
            >

              <UnidadesTable

                unidades={unidades}

                onDelete={(idx) => {

                  const n =
                    unidades.filter(
                      (_, i) => i !== idx
                    )

                  setUnidades(n)


                }}

                onEdit={() =>
                  setIsEditModalOpen(true)
                }

              />

            </div>

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

        {(currentPage === "gestion-cobros" ||
          currentPage === "cobros") && (

          <CobrosContent />

        )}


        {/* MULTAS */}

        {(currentPage === "gestion-multas" ||
          currentPage === "multas") && (

          <MultasContent />

        )}

        {(currentPage === "gestion-cartera" ||
  currentPage === "cartera") && (

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

        {(currentPage === "gestion-proyectos" ||
          currentPage === "proyectos") && (

          <ProyectosContent />

        )}

        {/* CONFIG */}

        {(currentPage === "Configuracion" ||
          currentPage === "configuracion") && (

          <ConfiguracionContent />

        )}

      </main>

      <ReplitBadge />

      {/* MODAL NUEVA */}

      <NuevaUnidadModal

        isOpen={isModalOpen}

        onClose={() =>
          setIsModalOpen(false)
        }

        onSave={(nueva) => {

          const listaActualizada = [
            ...unidades,
            nueva
          ]

          setUnidades(listaActualizada)


        }}
      />

      {/* MODAL EDITAR */}

      <EditarUnidadModal

        isOpen={isEditModalOpen}

        onClose={() =>
          setIsEditModalOpen(false)
        }

        onSave={() =>
          setIsEditModalOpen(false)
        }

        unidad={null}

      />

    </div>
  )
}