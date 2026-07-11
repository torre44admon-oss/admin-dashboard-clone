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

  const [logoUrl, setLogoUrl] = useState("")
  const [nombreTorre, setNombreTorre] = useState("Torre Admin")

  useEffect(() => {
    const logoGuardado = localStorage.getItem("logo_url")
    const nombreGuardado = localStorage.getItem("nombre_torre")
    if (logoGuardado) setLogoUrl(logoGuardado)
    if (nombreGuardado) setNombreTorre(nombreGuardado)

    // RESTABLECER CREDENCIALES SI SE PASA ?reset=true EN LA URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("reset") === "true") {
      localStorage.setItem("torre_admin_usuario", "admin")
      localStorage.setItem("torre_admin_password", "12345")
      toast.success("Credenciales restablecidas a: admin / 12345")
      window.history.replaceState({}, document.title, window.location.pathname)
    }

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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#030513] overflow-hidden font-poppins">
      
      {/* GOOGLE FONTS POPPINS IMPORT */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* BACKGROUND FLOATING DECORATIONS (GEOMETRIC NEON SHAPES & GLOWS) */}
      
      {/* Glow behind center */}
      <div className="absolute w-[800px] h-[500px] bg-[#1A82FF]/10 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Top-Right Neon Circular Ring */}
      <div className="absolute top-[8%] right-[15%] w-[180px] h-[180px] rounded-full border-4 border-[#1A82FF]/60 opacity-60 blur-[1px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />

      {/* Bottom-Left Concentric Circles */}
      <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 opacity-25 pointer-events-none rotate-45 select-none">
        <div className="w-full h-full rounded-full border border-sky-400 flex items-center justify-center p-6">
          <div className="w-full h-full rounded-full border border-sky-400 flex items-center justify-center p-6">
            <div className="w-full h-full rounded-full border border-sky-400 flex items-center justify-center p-6">
              <div className="w-full h-full rounded-full border border-sky-400 bg-sky-400/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Top-Left Blurred Cyan Triangle */}
      <div className="absolute top-[12%] left-[18%] w-24 h-24 opacity-30 blur-[2px] rotate-[15deg] pointer-events-none select-none">
        <svg className="w-full h-full text-sky-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5">
          <polygon points="50,15 90,85 10,85" />
        </svg>
      </div>

      {/* Center-Left Orange Triangle */}
      <div className="absolute top-[34%] left-[6%] w-8 h-8 opacity-65 rotate-[-25deg] pointer-events-none select-none">
        <svg className="w-full h-full text-orange-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
          <polygon points="50,15 90,85 10,85" />
        </svg>
      </div>

      {/* Center-Top Cyan Square (Diamond) */}
      <div className="absolute top-[22%] left-[45%] w-7 h-7 opacity-40 rotate-[45deg] pointer-events-none select-none">
        <div className="w-full h-full border-2 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]" />
      </div>

      {/* Bottom-Center Downward Triangle */}
      <div className="absolute bottom-[22%] left-[53%] w-8 h-8 opacity-50 rotate-[180deg] pointer-events-none select-none">
        <svg className="w-full h-full text-sky-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
          <polygon points="50,15 90,85 10,85" />
        </svg>
      </div>

      {/* MAIN CONTAINER CARD */}
      <div className="relative w-[1000px] h-[540px] bg-[#070A21] rounded-[20px] overflow-hidden flex flex-row shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-10 animate-[fadeIn_0.5s_ease-out] border border-white/5 shrink-0">
        
        {/* CARD BACKGROUND FLUID WAVES */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40" viewBox="0 0 1000 540" preserveAspectRatio="none">
          <path d="M 0,380 C 250,300 500,480 750,360 T 1000,400 L 1000,540 L 0,540 Z" fill="#0A183C" />
          <path d="M 0,420 C 300,320 600,520 800,390 T 1000,430 L 1000,540 L 0,540 Z" fill="#0E2356" opacity="0.6" />
        </svg>

        {/* LEFT SIDE: FORM ELEVATED BOX CARD */}
        <div className="w-[45%] h-full flex items-center justify-center p-8 z-10">
          
          <div className="bg-[#090C28]/95 backdrop-blur-md rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 p-8 flex flex-col justify-between h-[420px] w-[340px]">
            
            {/* AVATAR CENTER (DYNAMIC USER LOGO) */}
            <div className="flex flex-col items-center mt-1">
              <div className="w-[84px] h-[84px] rounded-full border-2 border-sky-400/80 flex items-center justify-center bg-transparent p-[2px] transition-transform duration-300 hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#070A21]">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <User size={30} className="text-sky-400/95" />
                  )}
                </div>
              </div>
            </div>

            {/* WELCOME TITLE */}
            <div className="text-center">
              <h3 className="text-xl font-medium text-white tracking-wide">
                ¡Bienvenido!
              </h3>
            </div>

            {/* FORM INPUTS */}
            <div className="space-y-4 my-auto">
              {/* Username Input */}
              <div className="relative flex items-center h-[44px] bg-[#131738] rounded-[8px] px-4 border border-transparent focus-within:border-sky-500/40 transition-all duration-300">
                <User size={16} className="text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Usuario o Correo"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 tracking-wide font-sans"
                />
              </div>

              {/* Password Input */}
              <div className="relative flex items-center h-[44px] bg-[#131738] rounded-[8px] px-4 border border-transparent focus-within:border-sky-500/40 transition-all duration-300">
                <Lock size={16} className="text-slate-400 mr-3 shrink-0" />
                <input
                  type={mostrarClave ? "text" : "password"}
                  placeholder="Contraseña"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin()
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 tracking-wide font-sans"
                />
                <button
                  type="button"
                  onClick={() => setMostrarClave(!mostrarClave)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {mostrarClave ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* ACTION BUTTON (SIGN IN ONLY) */}
              <div className="pt-2">
                <button
                  onClick={handleLogin}
                  className="w-full h-[40px] bg-[#1A82FF] hover:bg-[#3393FF] text-white font-bold rounded-[8px] text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(26,130,255,0.3)] cursor-pointer"
                >
                  INICIAR SESIÓN
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE: LOGO TEXT & BRANDING */}
        <div className="w-[55%] h-full flex flex-col items-center justify-center text-center p-12 z-10">
          <h1 className="text-[52px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#1A82FF] leading-none mb-4 font-poppins uppercase">
            ALTO DE SANTA ELENA
          </h1>
          
          {/* Cyan/Blue Separator Bar */}
          <div className="w-28 h-[3px] bg-[#1A82FF] rounded-full mb-6 shadow-[0_0_10px_rgba(26,130,255,0.5)]" />
          
          <p className="text-xs text-[#8E94C5] tracking-widest uppercase font-semibold">
            Tu portal de administración
          </p>
        </div>

      </div>
    </div>
  )
}

