"use client"

import { useState, useEffect } from "react"

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

      // REDIRECCIONAR

      window.location.href = "/"

    } else {

      alert(
        "Usuario o contraseña incorrectos"
      )

    }

  }

  return (

    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#edf4ff 0%,#dbeafe 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >

      {/* CIRCULO */}

      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,#93c5fd 0%,#bfdbfe 60%,transparent 70%)",
          opacity: 0.7,
        }}
      />

      {/* FONDO DERECHO */}

      <div
        style={{
          position: "absolute",
          top: "-140px",
          right: "-120px",
          width: "420px",
          height: "320px",
          background:
            "linear-gradient(135deg,#1d4ed8,#2563eb)",
          borderRadius: "50%",
          transform: "rotate(-12deg)",
        }}
      />

      {/* FONDO IZQUIERDO */}

      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-120px",
          width: "420px",
          height: "320px",
          background:
            "linear-gradient(135deg,#60a5fa,#2563eb)",
          borderRadius: "50%",
          transform: "rotate(12deg)",
        }}
      />

      {/* CARD */}

      <div
        style={{
          width: "420px",
          background: "rgba(255,255,255,0.94)",
          borderRadius: "30px",
          padding: "30px 30px 26px",
          position: "relative",
          zIndex: 10,
          boxShadow:
            "0 18px 40px rgba(37,99,235,0.16)",
          border:
            "1px solid rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
        }}
      >

        {/* PUNTOS */}

        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "30px",
            display: "grid",
            gridTemplateColumns: "repeat(4,6px)",
            gap: "6px",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "#2563eb",
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* ICONO */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >

          <div
            style={{
              width: "82px",
              height: "82px",
              borderRadius: "24px",
              background:
                "linear-gradient(135deg,#2563eb,#1d4ed8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow:
                "0 12px 25px rgba(37,99,235,0.30)",
              position: "relative",
            }}
          >

            <div
              style={{
                position: "absolute",
                inset: "-14px",
                borderRadius: "30px",
                background:
                  "rgba(37,99,235,0.08)",
              }}
            />

            <Building2
              size={40}
              color="#ffffff"
              style={{
                position: "relative"
              }}
            />

          </div>

        </div>

        {/* TITULO */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "22px",
          }}
        >

          <h1
            style={{
              margin: 0,
              fontSize: "31px",
              fontWeight: "bold",
              color: "#0f172a",
            }}
          >
            Sistema Administrativo
          </h1>

          <div
            style={{
              width: "150px",
              height: "3px",
              borderRadius: "999px",
              background:
                "linear-gradient(90deg,#2563eb,#60a5fa)",
              margin: "14px auto 12px",
              position: "relative",
            }}
          >

            <div
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#2563eb",
                left: "50%",
                top: "-3px",
                transform: "translateX(-50%)",
              }}
            />

          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Accede a tu cuenta para continuar
          </p>

        </div>

        {/* USUARIO */}

        <div style={{ marginBottom: "14px" }}>

          <div
            style={{
              height: "58px",
              borderRadius: "16px",
              background: "#ffffff",
              border: "1px solid #dbeafe",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              boxShadow:
                "0 4px 12px rgba(37,99,235,0.08)",
            }}
          >

            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "#eff6ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >

              <User
                size={20}
                color="#2563eb"
              />

            </div>

            <input
              type="text"
              placeholder="Ingrese usuario"
              value={usuario}
              onChange={(e) =>
                setUsuario(
                  e.target.value
                )
              }
              style={{
                flex: 1,
                marginLeft: "14px",
                border: "none",
                outline: "none",
                fontSize: "17px",
                color: "#475569",
                background: "transparent",
              }}
            />

          </div>

        </div>

        {/* PASSWORD */}

        <div style={{ marginBottom: "22px" }}>

          <div
            style={{
              height: "58px",
              borderRadius: "16px",
              background: "#ffffff",
              border: "1px solid #dbeafe",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              boxShadow:
                "0 4px 12px rgba(37,99,235,0.08)",
            }}
          >

            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "#eff6ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >

              <Lock
                size={20}
                color="#2563eb"
              />

            </div>

            <input
              type={
                mostrarClave
                  ? "text"
                  : "password"
              }
              placeholder="Ingrese contraseña"
              value={clave}
              onChange={(e) =>
                setClave(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  handleLogin()
                }

              }}
              style={{
                flex: 1,
                marginLeft: "14px",
                border: "none",
                outline: "none",
                fontSize: "17px",
                color: "#475569",
                background: "transparent",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setMostrarClave(
                  !mostrarClave
                )
              }
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >

              {mostrarClave ? (

                <EyeOff
                  size={22}
                  color="#64748b"
                />

              ) : (

                <Eye
                  size={22}
                  color="#64748b"
                />

              )}

            </button>

          </div>

        </div>

        {/* BOTON */}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            height: "58px",
            border: "none",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#ffffff",
            fontSize: "23px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            boxShadow:
              "0 12px 24px rgba(37,99,235,0.25)",
          }}
        >

          <LogIn size={24} />

          Ingresar

        </button>

        {/* FOOTER */}

        <div
          style={{
            marginTop: "26px",
            textAlign: "center",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "8px",
            }}
          >

            <div
              style={{
                width: "90px",
                height: "2px",
                background: "#dbeafe",
              }}
            />

            <ShieldCheck
              size={26}
              color="#2563eb"
            />

            <div
              style={{
                width: "90px",
                height: "2px",
                background: "#dbeafe",
              }}
            />

          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Acceso seguro y confiable
          </p>

        </div>

      </div>

    </div>
  )
}