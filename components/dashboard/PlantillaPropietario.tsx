"use client"

import { FileText, Building } from "lucide-react"

interface LineaFactura {
  tipo: string
  concepto: string
  monto: number
}

interface PlantillaProps {
  nombreTorre?: string
  logoUrl?: string
  moneda?: string
  periodoMesAnio?: string
  numeroUnidad?: string
  nombrePropietario?: string
  telefonoPropietario?: string
  correoPropietario?: string
  nombreCuotaMantenimiento?: string
  montoCuotaMantenimiento?: number
  cargosAdicionales?: LineaFactura[]
  mensajePiePagina?: string
  direccionTorre?: string
  mesesVencidos?: string[]
}

export function PlantillaPropietario({
  nombreTorre = "TORRE 44",
  logoUrl,
  moneda = "COP",
  periodoMesAnio = "Julio de 2026",
  numeroUnidad = "101",
  nombrePropietario = "Sandra Perdomo",
  telefonoPropietario = "3014130109",
  correoPropietario = "perdomoeloy128@gmail.com",
  nombreCuotaMantenimiento = "Cuota Administrativa",
  montoCuotaMantenimiento = 20000,
  cargosAdicionales = [],
  mensajePiePagina = "Por favor realizar el pago a tiempo.",
  direccionTorre = "",
  mesesVencidos = [],
}: PlantillaProps) {

  const totalSuma =
    montoCuotaMantenimiento +
    cargosAdicionales.reduce((acc, item) => acc + item.monto, 0)

  const fechaGeneracion = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div
      style={{
        width: "800px",
        minHeight: "1400px",
        background: "#ffffff",
        padding: "45px",
        color: "#1e293b",
        fontFamily: "Arial",
        boxSizing: "border-box",
      }}
    >

      {/* CONTENEDOR */}
      <div
        style={{
          border: "1px solid #dfe5ec",
          borderRadius: "30px",
          padding: "50px",
          background: "#ffffff",
          minHeight: "1300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >

        <div>

          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "35px",
              marginBottom: "40px",
            }}
          >

            {/* IZQUIERDA */}
            <div
              style={{
                display: "flex",
                gap: "22px",
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="logo"
                  style={{
                    width: "85px",
                    height: "85px",
                    borderRadius: "18px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    background: "#2d4486",
                    color: "#fff",
                    padding: "22px",
                    borderRadius: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building size={42} />
                </div>
              )}

              <div>
                <h1
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {nombreTorre}
                </h1>
                {direccionTorre && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      margin: "6px 0 0 2px",
                      fontWeight: "normal",
                    }}
                  >
                    {direccionTorre}
                  </p>
                )}

                <p
                  style={{
                    color: "#2d4486",
                    fontWeight: "bold",
                    marginTop: "12px",
                    marginBottom: "12px",
                    fontSize: "24px",
                    letterSpacing: "1px",
                  }}
                >
                  AVISO DE COBRO
                </p>
              </div>
            </div>

            {/* RECUADRO DERECHO */}
            <div
              style={{
                background: "#f8fafc",
                padding: "24px",
                borderRadius: "22px",
                border: "1px solid #e2e8f0",
                minWidth: "260px",
              }}
            >

              {/* FECHA */}
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#94a3b8",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  Fecha de generación:
                </div>

                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    lineHeight: 1.4,
                  }}
                >
                  {fechaGeneracion}
                </div>
              </div>

              {/* PERIODO */}
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#94a3b8",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  Periodo:
                </div>

                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    lineHeight: 1.4,
                    color: "#2d4486",
                  }}
                >
                  {periodoMesAnio}
                </div>
              </div>

            </div>
          </div>

          {/* DATOS */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "24px",
              padding: "35px",
              marginBottom: "40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "35px",
            }}
          >

            <div>
              <p style={{ marginBottom: "22px", fontSize: "24px" }}>
                <strong>Apartamento:</strong> {numeroUnidad}
              </p>

              <p style={{ margin: 0, fontSize: "24px" }}>
                <strong>Teléfono:</strong> {telefonoPropietario}
              </p>
            </div>

            <div>
              <p style={{ marginBottom: "22px", fontSize: "24px" }}>
                <strong>Propietario:</strong> {nombrePropietario}
              </p>

              <p style={{ margin: 0, fontSize: "24px" }}>
                <strong>Correo:</strong> {correoPropietario}
              </p>
            </div>

          </div>

          {/* CUOTA */}
          <div style={{ marginBottom: "40px" }}>
            <h3
              style={{
                fontSize: "18px",
                color: "#64748b",
                marginBottom: "18px",
                letterSpacing: "1px",
              }}
            >
              CUOTA ADMINISTRATIVA
            </h3>

            <div
              style={{
                border: "1px solid #dfe5ec",
                borderRadius: "22px",
                padding: "30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "24px",
              }}
            >
              <div>
                {nombreCuotaMantenimiento}
              </div>

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "28px",
                }}
              >
                $ {(montoCuotaMantenimiento / 1000).toFixed(3)}
              </div>
            </div>

            {mesesVencidos && mesesVencidos.length > 0 && (
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "20px",
                  color: "#b45309",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: "14px",
                  padding: "12px 20px",
                  fontWeight: "bold",
                  lineHeight: "1.4",
                }}
              >
                Meses Vencidos: <span style={{ fontWeight: "normal", color: "#78350f" }}>{mesesVencidos.join(", ")}</span>
              </div>
            )}
          </div>

          {/* CARGOS */}
          {cargosAdicionales.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  color: "#64748b",
                  marginBottom: "18px",
                  letterSpacing: "1px",
                }}
              >
                CARGOS ADICIONALES
              </h3>

              <div
                style={{
                  border: "1px solid #dfe5ec",
                  borderRadius: "22px",
                  overflow: "hidden",
                }}
              >
                {cargosAdicionales.map((linea, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "26px 30px",
                      borderBottom:
                        idx !== cargosAdicionales.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                      fontSize: "22px",
                    }}
                  >
                    <div>
                      {linea.tipo} - {linea.concepto}
                    </div>

                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "24px",
                      }}
                    >
                      $ {(linea.monto / 1000).toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOTAL */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "#ffffff",
              borderRadius: "22px",
              padding: "24px 30px",
              marginBottom: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            {/* TEXTO */}
            <div>
              <div
                style={{
                  fontSize: "18px",
                  opacity: 0.9,
                  marginBottom: "6px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                TOTAL A PAGAR
              </div>

              <div
                style={{
                  fontSize: "16px",
                  opacity: 0.8,
                }}
              >
                {}
              </div>
            </div>

            {/* VALOR */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: "bold",
                  lineHeight: 1,
                }}
              >
                $ {(totalSuma / 1000).toFixed(3)}
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  opacity: 0.9,
                }}
              >
                {}
              </div>
            </div>

          </div>

          {/* MENSAJE */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "22px",
              padding: "28px",
              marginBottom: "40px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                lineHeight: "36px",
              }}
            >
              {mensajePiePagina}
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            borderTop: "2px dashed #cbd5e1",
            paddingTop: "35px",
            marginTop: "35px",
          }}
        >
          <p
            style={{
              color: "#2d4486",
              fontWeight: "bold",
              marginBottom: "12px",
              fontSize: "28px",
            }}
          >
            ¡Gracias por su puntualidad!
          </p>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              margin: 0,
              letterSpacing: "2px",
            }}
          >
            ADMINISTRACIÓN
          </p>
        </div>

      </div>
    </div>
  )
}