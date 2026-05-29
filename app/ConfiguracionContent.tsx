"use client"

import { useEffect, useState } from "react"

export function ConfiguracionContent() {

  const [nombreTorre, setNombreTorre] =
    useState("Torre 44")

  const [nombreCuota, setNombreCuota] =
    useState("Cuota Administrativa")

  const [montoFijo, setMontoFijo] =
    useState("20000")

  const [moneda, setMoneda] =
    useState("Peso Colombiano (COP)")

  const [logoUrl, setLogoUrl] =
    useState("")

  const [mensajeAviso, setMensajeAviso] =
    useState(
      "Ej: El pago debe realizarse a mas tardar el dia 5 de cada mes.\nNro. de cuenta: 123-456-789\nPor favor indicar numero de apartamento en la referencia."
    )

  const [rutaCarpeta, setRutaCarpeta] =
    useState(
      "C:\\Users\\Perdomo G\\OneDrive\\Escritorio\\ADMINISTRACION TORRE 44"
    )

  // LOGIN

  const [loginActivo, setLoginActivo] =
    useState(true)

  const [claveActual, setClaveActual] =
    useState("")

  const [nuevaClave, setNuevaClave] =
    useState("")

  // ESTADOS NUEVOS CONTROLADOS: Ventana de autorización máster
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [claveAutorizacion, setClaveAutorizacion] = useState("")

  // CARGAR DATOS GUARDADOS

  useEffect(() => {

    const nombreGuardado =
      localStorage.getItem("nombre_torre")

    const cuotaGuardada =
      localStorage.getItem("nombre_cuota")

    const montoGuardado =
      localStorage.getItem("monto_fijo")

    const monedaGuardada =
      localStorage.getItem("moneda")

    const logoGuardado =
      localStorage.getItem("logo_url")

    const mensajeGuardado =
      localStorage.getItem("mensaje_aviso")

    const rutaGuardada =
      localStorage.getItem("ruta_carpeta")

    const loginGuardado =
      localStorage.getItem("login_activo")

    if (nombreGuardado)
      setNombreTorre(nombreGuardado)

    if (cuotaGuardada)
      setNombreCuota(cuotaGuardada)

    if (montoGuardado)
      setMontoFijo(montoGuardado)
    if (monedaGuardada)
      setMoneda(monedaGuardada)

    if (logoGuardado)
      setLogoUrl(logoGuardado)

    if (mensajeGuardado)
      setMensajeAviso(mensajeGuardado)

    if (rutaGuardada)
      setRutaCarpeta(rutaGuardada)

    if (loginGuardado !== null)
      setLoginActivo(
        loginGuardado === "true"
      )

  }, [])

  // GUARDAR DATOS GENERALES

  const guardarDatosTorre = () => {

    localStorage.setItem(
      "nombre_torre",
      nombreTorre
    )

    localStorage.setItem(
      "nombre_cuota",
      nombreCuota
    )

    localStorage.setItem(
      "monto_fijo",
      montoFijo
    )

    localStorage.setItem(
      "moneda",
      moneda
    )

    localStorage.setItem(
      "logo_url",
      logoUrl
    )

    alert(
      "Datos de la torre guardados correctamente"
    )

  }

  // GUARDAR MENSAJE

  const guardarMensajeAviso = () => {

    localStorage.setItem(
      "mensaje_aviso",
      mensajeAviso
    )

    alert(
      "Mensaje guardado correctamente"
    )

  }

  // GUARDAR RUTA

  const guardarRuta = () => {

    localStorage.setItem(
      "ruta_carpeta",
      rutaCarpeta
    )

    alert(
      "Ruta guardada correctamente"
    )

  }

  // GUARDAR LOGIN

  const guardarLogin = () => {

    localStorage.setItem(
      "login_activo",
      String(loginActivo)
    )

    alert(
      "Configuración de acceso actualizada"
    )

  }

  // CAMBIAR CLAVE

  const cambiarClave = () => {

    const claveGuardada =
      localStorage.getItem(
        "torre_admin_password"
      ) || "12345"

    const claveActualLimpia =
      claveActual.trim()

    const nuevaClaveLimpia =
      nuevaClave.trim()

    if (
      claveActualLimpia !==
      claveGuardada.trim()
    ) {

      alert(
        "La contraseña actual no coincide"
      )

      return

    }

    if (!nuevaClaveLimpia) {

      alert(
        "Ingrese una nueva contraseña"
      )

      return

    }

    localStorage.setItem(
      "torre_admin_password",
      nuevaClaveLimpia
    )

    setClaveActual("")
    setNuevaClave("")

    alert(
      "Contraseña actualizada correctamente"
    )

  }

      const handleEjecutarLimpiezaConClave = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Captura la contraseña de administrador guardada en tu sistema (por defecto 12345)
    const claveGuardada = localStorage.getItem("torre_admin_password") || "12345"

    if (claveAutorizacion.trim() !== claveGuardada.trim()) {
      alert("❌ Contraseña de autorización incorrecta. No se puede restablecer el sistema.")
      return
    }

    // 1. VACIADO TOTAL DE LA MEMORIA CACHÉ DEL NAVEGADOR DE UN SOLO GOLPE
    localStorage.clear()

    // 2. PROTECCIÓN DE SEGURIDAD: Volvemos a guardar tu contraseña máster para no perderla
    localStorage.setItem("torre_admin_password", claveGuardada)

    // 3. INYECCIÓN MASIVA DE ESCUDOS VACÍOS (Fuerza a todas tus pantallas a quedar en blanco)
    // Escudos para Apartamentos y Unidades
    localStorage.setItem("apartamentos_db", "[]")
    localStorage.setItem("apartamentos", "[]")
    localStorage.setItem("unidades_db", "[]")
    localStorage.setItem("unidades", "[]")

    // Escudos para Multas y Sanciones
    localStorage.setItem("multas_db", "[]")
    localStorage.setItem("multas", "[]")
    localStorage.setItem("portafolio_multas_db", "[]")
    localStorage.setItem("historial_multas_db", "[]")

    // Escudos para Proyectos y Mantenimientos
    localStorage.setItem("proyectos_db", "[]")
    localStorage.setItem("proyectos", "[]")
    localStorage.setItem("portafolio_proyectos_db", "[]")

    // Escudos para Facturas, Cobros y Cartera de Caja
    localStorage.setItem("cobros_db", "[]")
    localStorage.setItem("cobros", "[]")
    localStorage.setItem("torre_cartera_db", "{}")
    localStorage.setItem("torre_historial_db", "[]")
    
    // Dejamos una orden global de sistema limpio
    localStorage.setItem("sistema_master_limpio", "true")

    alert("🔄 ¡Formateo Exitoso! Las unidades, multas, proyectos y cobros de prueba se han vaciado por completo de las pantallas. Tus códigos fuentes siguen 100% intactos.")
    
    setIsResetModalOpen(false)
    setClaveAutorizacion("")
    
    // Forzamos el reinicio inmediato del navegador para pintar el panel en blanco
    window.location.reload()
  }



  return (

    <div className="font-sans text-[#1e293b] space-y-6 pb-12">

      {/* TÍTULO */}

      <div>

        <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">
          Configuración
        </h1>

        <p className="text-[#64748b] text-[15px] mt-0.5">
          Administra los datos generales de la torre y los conceptos de cobro
        </p>

      </div>

      {/* TARJETA 1 */}

      <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-6 max-w-[850px]">

        <div className="mb-6">

          <h2 className="text-base font-bold text-[#0f172a]">
            Datos de la Torre
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            Nombre, logo y moneda que se muestran en los avisos de cobro
          </p>

        </div>

        <div className="space-y-5">

          <div>

            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wide mb-1.5">
              Nombre de la torre
            </label>

            <input
              type="text"
              value={nombreTorre}
              onChange={(e) =>
                setNombreTorre(
                  e.target.value
                )
              }
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white outline-none text-[#334155]"
            />

          </div>

          <div>

            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wide mb-1.5">
              Nombre de la cuota de mantenimiento
            </label>

            <input
              type="text"
              value={nombreCuota}
              onChange={(e) =>
                setNombreCuota(
                  e.target.value
                )
              }
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white outline-none text-[#334155]"
            />

          </div>

          <div>

            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wide mb-1.5">
              Monto administrativo fijo
            </label>

            <input
              type="text"
              value={montoFijo}
              onChange={(e) =>
                setMontoFijo(
                  e.target.value
                )
              }
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white outline-none text-[#334155]"
            />

          </div>

          <div>

            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wide mb-1.5">
              Moneda
            </label>

            <select
              value={moneda}
              onChange={(e) =>
                setMoneda(
                  e.target.value
                )
              }
              className="w-full sm:w-[320px] border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white text-[#334155]"
            >

              <option>
                Peso Colombiano (COP)
              </option>

              <option>
                Dólar Estadounidense (USD)
              </option>

              <option>
                Euro (EUR)
              </option>

            </select>

          </div>

          <div>

            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wide mb-1.5">
              Logo de la torre (URL)
            </label>

            <input
              type="text"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) =>
                setLogoUrl(
                  e.target.value
                )
              }
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white outline-none text-[#334155]"
            />

          </div>

          <div className="pt-1">

            <button
              type="button"
              onClick={guardarDatosTorre}
              className="bg-[#2d4486] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#22366d] shadow-sm cursor-pointer"
            >
              Guardar cambios
            </button>

          </div>

        </div>

      </div>

      {/* TARJETA 2 */}

      <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-6 max-w-[850px]">

        <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">

          <div>

            <h2 className="text-base font-bold text-[#0f172a]">
              Conceptos de Cobro
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              Estos conceptos estarán disponibles al generar un aviso.
            </p>

          </div>

          <button
            type="button"
            className="bg-[#2d4486] text-white px-4 h-[36px] rounded-lg font-medium text-xs hover:bg-[#22366d] shadow-sm cursor-pointer"
          >
            + Nuevo Concepto
          </button>

        </div>

        <div className="min-h-[120px] flex items-center justify-center rounded-xl">

          <p className="text-[14px] text-gray-400 font-medium tracking-tight">
            No hay conceptos configurados.
          </p>

        </div>

      </div>

      {/* TARJETA 3 */}

      <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-6 max-w-[850px]">

        <div className="mb-4">

          <h2 className="text-base font-bold text-[#0f172a]">
            Mensaje en el Aviso de Cobro
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            Este texto aparece al final de cada factura.
          </p>

        </div>

        <div className="space-y-4">

          <textarea
            rows={4}
            value={mensajeAviso}
            onChange={(e) =>
              setMensajeAviso(
                e.target.value
              )
            }
            className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white outline-none text-[#334155] font-mono"
          />

          <button
            type="button"
            onClick={guardarMensajeAviso}
            className="bg-[#2d4486] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#22366d] shadow-sm cursor-pointer"
          >
            Guardar cambios
          </button>

        </div>

      </div>

      {/* TARJETA 4 */}

      <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-6 max-w-[850px]">

        <div className="mb-5">

          <h2 className="text-base font-bold text-[#0f172a]">
            Carpeta de Avisos PDF
          </h2>

        </div>

        <div className="space-y-4">

          <input
            type="text"
            value={rutaCarpeta}
            onChange={(e) =>
              setRutaCarpeta(
                e.target.value
              )
            }
            className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm bg-white outline-none text-[#334155]"
          />

          <button
            type="button"
            onClick={guardarRuta}
            className="bg-[#8b9bb4] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#73849e] shadow-sm cursor-pointer"
          >
            Guardar ruta
          </button>

        </div>

      </div>
      {/* TARJETA 5 */}

      <div className="bg-white rounded-xl border border-[#dfe5ec] shadow-sm p-6 max-w-[850px]">

        <div className="mb-5">

          <h2 className="text-base font-bold text-[#0f172a]">
            Seguridad y Acceso
          </h2>

        </div>

        <div className="space-y-6">

          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>

              <h3 className="font-semibold text-sm">
                Activar inicio de sesión
              </h3>

            </div>

            <input
              type="checkbox"
              checked={loginActivo}
              onChange={(e) =>
                setLoginActivo(
                  e.target.checked
                )
              }
              className="w-5 h-5"
            />

          </div>

          <button
            type="button"
            onClick={guardarLogin}
            className="bg-[#2d4486] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#22366d] shadow-sm cursor-pointer"
          >
            Guardar configuración
          </button>

          <div className="border-t pt-6 space-y-4 pb-4">

            <h3 className="font-bold text-sm">
              Cambiar contraseña
            </h3>

            <input
              type="password"
              placeholder="Contraseña actual"
              value={claveActual}
              onChange={(e) =>
                setClaveActual(
                  e.target.value
                )
              }
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaClave}
              onChange={(e) =>
                setNuevaClave(
                  e.target.value
                )
              }
              className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={cambiarClave}
              className="bg-[#2d4486] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#22366d] shadow-sm cursor-pointer"
            >
              Actualizar contraseña
            </button>

          </div>

        </div>

      </div>

      {/* BOTÓN DE MANTENIMIENTO PROTEGIDO CON CLAVE ADMINISTRATIVA NATIVA */}
      <div className="bg-red-50/40 rounded-xl border border-red-200 p-6 max-w-[850px] mt-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-red-800">Zona de Peligro y Mantenimiento</h2>
          <p className="text-xs text-red-600/80 mt-0.5">Borra la información transaccional de prueba para arrancar de cero.</p>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">Al presionar este botón se eliminarán permanentemente los saldos, multas e historiales guardados durante las pruebas. Tus 475 líneas de plantilla y todo tu código del programa siguen estando 100% seguros en tu computador.</p>
        <button 
          type="button" 
          onClick={() => setIsResetModalOpen(true)} 
          className="bg-red-600 text-white px-5 h-[42px] rounded-lg text-xs font-extrabold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
        >
          Restablecer Sistema Completo
        </button>
      </div>

      {/* DIÁLOGO FLOTANTE DE AUTORIZACIÓN CON CONTRASEÑA MÁSTER */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={() => { setIsResetModalOpen(false); setClaveAutorizacion(""); }} />
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[460px] border border-[#dfe5ec] overflow-hidden relative z-10 p-6">
            <h3 className="text-lg font-bold text-[#0f172a] tracking-tight mb-1">Requiere Autorización Máster</h3>
            <p className="text-xs text-gray-400 mb-4">Introduce tu contraseña de administrador para proceder con el formateo.</p>
            
            <form onSubmit={handleEjecutarLimpiezaConClave} className="flex flex-col gap-4">
              <input 
                type="password" 
                placeholder="Contraseña actual" 
                value={claveAutorizacion} 
                onChange={(e) => setClaveAutorizacion(e.target.value)} 
                className="w-full border border-[#cbd5e1] rounded-xl px-3 h-[44px] text-sm bg-white outline-none focus:border-red-500" 
                required 
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setIsResetModalOpen(false); setClaveAutorizacion(""); }} className="border border-gray-200 text-gray-700 px-4 h-[38px] rounded-lg text-xs font-bold bg-white hover:bg-gray-50 cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-red-600 text-white px-4 h-[38px] rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer">Confirmar Borrado</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
