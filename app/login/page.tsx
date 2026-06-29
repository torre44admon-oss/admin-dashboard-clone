"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

import {
  Building2,
  User,
 Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck
} from "lucide-react"

export default function LoginPage() {

  const [usuario, setUsuario] =
    useState("")

  const [clave, setClave] =
    useState("")

  const [mostrarClave, setMostrarClave] =
    useState(false)

  useEffect(() => {

    // CREAR USUARIO SOLO SI NO EXISTE

    const usuarioGuardado =
      localStorage.getItem(
        "torre_admin_usuario"
      )

    if (
      !usuarioGuardado ||
      usuarioGuardado.trim() === ""
    ) {

      localStorage.setItem(
        "torre_admin_usuario",
        "admin"
      )

    }

    // CREAR PASSWORD SOLO SI NO EXISTE

    const passwordGuardada =
      localStorage.getItem(
        "torre_admin_password"
      )

    if (
      !passwordGuardada ||
      passwordGuardada.trim() === ""
    ) {

      localStorage.setItem(
        "torre_admin_password",
        "12345"
      )

    }

  }, [])

  const handleLogin = () => {

    // VALIDAR SI EL LOGIN ESTÁ ACTIVO

    const loginActivo =
      localStorage.getItem(
        "login_activo"
      )

    // SI LOGIN DESACTIVADO

    if (loginActivo === "false") {

      localStorage.setItem(
        "torre_admin_session",
        "ok"
      )

      window.location.href = "/"

      return

    }

    // OBTENER DATOS GUARDADOS

    const usuarioGuardado =
      (
        localStorage.getItem(
          "torre_admin_usuario"
        ) || "admin"
      ).trim()

    const claveGuardada =
      (
        localStorage.getItem(
          "torre_admin_password"
        ) || "12345"
      ).trim()

    // LIMPIAR INPUTS

    const usuarioIngresado =
      usuario.trim()

    const claveIngresada =
      clave.trim()

    // DEBUG

    console.log(
      "USUARIO GUARDADO:",
      usuarioGuardado
    )

    console.log(
      "CLAVE GUARDADA:",
      claveGuardada
    )

    console.log(
      "USUARIO INGRESADO:",
      usuarioIngresado
    )

    console.log(
      "CLAVE INGRESADA:",
      claveIngresada
    )

    // VALIDAR LOGIN

    if (
      usuarioIngresado ===
        usuarioGuardado &&
      claveIngresada ===
        claveGuardada
    ) {

      // GUARDAR SESION
      localStorage.setItem(
        "torre_admin_session",
        "ok"
      )

      toast.success("¡Inicio de sesión exitoso!", {
        description: "Redireccionando al panel principal..."
      })

      // REDIRECCIONAR
      setTimeout(() => {
        window.location.href = "/"
      }, 800)

    } else {
      toast.error("Usuario o contraseña incorrectos", {
        description: "Por favor, verifica tus datos de acceso."
      })
    }

  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 overflow-hidden font-sans">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-[440px] bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(37,99,235,0.08)] z-10 animate-[fadeIn_0.5s_ease-out]">
        
        {/* LOGO CONTAINER */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 group transition-transform duration-300 hover:scale-105">
            <Building2 size={32} className="text-white" />
            <div className="absolute -inset-2 bg-blue-500/10 rounded-[20px] -z-10 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Torre Admin
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa tus credenciales de acceso
          </p>
        </div>

        {/* FORM FIELDS */}
        <div className="space-y-5">
          {/* USER FIELD */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Usuario
            </label>
            <div className="flex items-center bg-white border border-slate-200/80 rounded-2xl p-1 px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Ej. admin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="flex-1 ml-3 border-none outline-none text-base text-slate-700 bg-transparent placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Contraseña
            </label>
            <div className="flex items-center bg-white border border-slate-200/80 rounded-2xl p-1 px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={mostrarClave ? "text" : "password"}
                placeholder="••••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin()
                  }
                }}
                className="flex-1 ml-3 border-none outline-none text-base text-slate-700 bg-transparent placeholder-slate-400 font-medium tracking-wide"
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {mostrarClave ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleLogin}
            className="w-full mt-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <LogIn size={18} />
            Ingresar al Panel
          </button>
        </div>

        {/* CARD FOOTER */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600 tracking-wide">
              Acceso Protegido
            </span>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Este portal cuenta con seguridad activa SSL.
          </p>
        </div>

      </div>
    </div>
  )
}