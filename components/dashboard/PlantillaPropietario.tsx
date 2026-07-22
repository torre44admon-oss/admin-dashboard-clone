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
        minHeight: "1350px",
        background: "#0b0f19",
        padding: "45px",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >

      {/* CONTENEDOR */}
      <div
        style={{
          border: "1px solid #1e293b",
          borderRadius: "30px",
          padding: "50px",
          background: "#151c2c",
          minHeight: "1260px",
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
              borderBottom: "1px solid #2d3748",
              paddingBottom: "35px",
              marginBottom: "40px",
            }}
          >

            {/* IZQUIERDA */}
            <div
              style={{
                display: "flex",
                gap: "22px",
                flex: 1,
                minWidth: 0,
                marginRight: "20px",
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
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    background: "#2d4486",
                    color: "#fff",
                    width: "85px",
                    height: "85px",
                    borderRadius: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Building size={42} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontSize:
                      nombreTorre.length > 40
                        ? "22px"
                        : nombreTorre.length > 28
                        ? "26px"
                        : nombreTorre.length > 18
                        ? "32px"
                        : "40px",
                    fontWeight: "bold",
                    margin: 0,
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                    color: "#ffffff",
                  }}
                >
                  {nombreTorre}
                </h1>
                {direccionTorre && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#94a3b8",
                      margin: "6px 0 0 2px",
                      fontWeight: "normal",
                    }}
                  >
                    Dirección: <span style={{ color: "#ffffff", fontWeight: "bold" }}>{direccionTorre}</span>
                  </p>
                )}

                <p
                  style={{
                    color: "#94a3b8",
                    fontWeight: "bold",
                    marginTop: "10px",
                    marginBottom: "10px",
                    fontSize: "20px",
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
                background: "#1e293b",
                padding: "20px 24px",
                borderRadius: "22px",
                border: "1px solid #2d3748",
                minWidth: "220px",
                flexShrink: 0,
              }}
            >

              {/* FECHA */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  Fecha de generación:
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#ffffff",
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
                    fontSize: "14px",
                    color: "#94a3b8",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  Periodo:
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    lineHeight: 1.4,
                    color: "#60a5fa",
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
              background: "#1e293b",
              border: "1px solid #2d3748",
              borderRadius: "24px",
              padding: "35px",
              marginBottom: "40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "35px",
            }}
          >

            <div>
              <p style={{ marginBottom: "22px", fontSize: "22px", color: "#94a3b8" }}>
                <strong style={{ color: "#94a3b8" }}>Apartamento:</strong>{" "}
                <span style={{ color: "#34d399", fontWeight: "bold" }}>{numeroUnidad}</span>
              </p>

              <p style={{ margin: 0, fontSize: "22px", color: "#94a3b8" }}>
                <strong style={{ color: "#94a3b8" }}>Teléfono:</strong>{" "}
                <span style={{ color: "#ffffff", fontWeight: "bold" }}>{telefonoPropietario}</span>
              </p>
            </div>

            <div>
              <p style={{ marginBottom: "22px", fontSize: "22px", color: "#94a3b8" }}>
                <strong style={{ color: "#94a3b8" }}>Propietario:</strong>{" "}
                <span style={{ color: "#ffffff", fontWeight: "bold" }}>{nombrePropietario}</span>
              </p>

              <p style={{ margin: 0, fontSize: "22px", color: "#94a3b8" }}>
                <strong style={{ color: "#94a3b8" }}>Correo:</strong>{" "}
                <span style={{ color: "#ffffff", fontWeight: "bold" }}>{correoPropietario || "Sin correo"}</span>
              </p>
            </div>

          </div>

          {/* CUOTA */}
          <div style={{ marginBottom: "40px" }}>
            <h3
              style={{
                fontSize: "16px",
                color: "#94a3b8",
                marginBottom: "16px",
                letterSpacing: "1px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              CUOTA ADMINISTRATIVA
            </h3>

            <div
              style={{
                background: "#1e293b",
                border: "1px solid #2d3748",
                borderRadius: "22px",
                padding: "26px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "22px",
                color: "#ffffff",
              }}
            >
              <div>
                {nombreCuotaMantenimiento}
              </div>

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "26px",
                  color: "#ffffff",
                }}
              >
                $ {montoCuotaMantenimiento.toLocaleString("es-CO")}
              </div>
            </div>

            {mesesVencidos && mesesVencidos.length > 0 && (
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "18px",
                  color: "#fbbf24",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  borderRadius: "14px",
                  padding: "12px 20px",
                  fontWeight: "bold",
                  lineHeight: "1.4",
                }}
              >
                Meses Vencidos: <span style={{ fontWeight: "normal", color: "#fef3c7" }}>{mesesVencidos.join(", ")}</span>
              </div>
            )}
          </div>

          {/* CARGOS */}
          {cargosAdicionales.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  color: "#94a3b8",
                  marginBottom: "16px",
                  letterSpacing: "1px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                CARGOS ADICIONALES
              </h3>

              <div
                style={{
                  background: "#1e293b",
                  border: "1px solid #2d3748",
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
                      padding: "24px 30px",
                      borderBottom:
                        idx !== cargosAdicionales.length - 1
                          ? "1px solid #2d3748"
                          : "none",
                      fontSize: "20px",
                      color: "#ffffff",
                    }}
                  >
                    <div>
                      {linea.tipo} - {linea.concepto}
                    </div>

                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "22px",
                        color: "#ffffff",
                      }}
                    >
                      $ {linea.monto.toLocaleString("es-CO")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOTAL */}
          <div
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
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
                  marginBottom: "4px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                TOTAL A PAGAR
              </div>
            </div>

            {/* VALOR */}
            <div
              style={{
                fontSize: "44px",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              $ {totalSuma.toLocaleString("es-CO")}
            </div>

          </div>

          {/* MENSAJE */}
          {mensajePiePagina && (
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #2d3748",
                borderRadius: "22px",
                padding: "26px",
                marginBottom: "40px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "20px",
                  lineHeight: "32px",
                  color: "#cbd5e1",
                }}
              >
                {mensajePiePagina}
              </p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            borderTop: "2px dashed #334155",
            paddingTop: "30px",
            marginTop: "30px",
          }}
        >
          <p
            style={{
              color: "#60a5fa",
              fontWeight: "bold",
              marginBottom: "8px",
              fontSize: "26px",
            }}
          >
            ¡Gracias por su puntualidad!
          </p>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              margin: 0,
              fontWeight: "bold",
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