import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const nombreTorre = searchParams.get("nombreTorre") || "TORRE 44"
    const logoUrl = searchParams.get("logoUrl") || ""
    const periodo = searchParams.get("periodo") || "Julio de 2026"
    const unidad = searchParams.get("unidad") || "101"
    const propietario = searchParams.get("propietario") || "Propietario"
    const montoCuota = parseFloat(searchParams.get("montoCuota") || "20000")
    const mensajePie = searchParams.get("mensajePie") || "Por favor realizar el pago a tiempo."
    const direccion = searchParams.get("direccion") || ""
    
    // Parse cargos
    const cargosRaw = searchParams.get("cargos") || "[]"
    let cargos: any[] = []
    try {
      cargos = JSON.parse(cargosRaw)
    } catch (e) {}

    const total = montoCuota + cargos.reduce((acc, c) => acc + (parseFloat(c.monto) || 0), 0)

    const hoyColombia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
    const fechaGeneracion = hoyColombia.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "45px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Main Card Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              backgroundColor: "#ffffff",
              border: "1px solid #dfe5ec",
              borderRadius: "30px",
              padding: "50px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Header */}
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
                {/* Left side: Logo & Title */}
                <div style={{ display: "flex", gap: "22px", flex: 1, minWidth: 0, marginRight: "20px" }}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      width="85"
                      height="85"
                      style={{
                        borderRadius: "18px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        background: "#2d4486",
                        color: "#ffffff",
                        width: "85px",
                        height: "85px",
                        borderRadius: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "30px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      T44
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: nombreTorre.length > 15 ? "22px" : "42px",
                        fontWeight: "bold",
                        color: "#1e293b",
                        margin: 0,
                        wordBreak: "break-word",
                        lineHeight: 1.2,
                      }}
                    >
                      {nombreTorre}
                    </span>
                    <span
                      style={{
                        color: "#2d4486",
                        fontWeight: "bold",
                        marginTop: "8px",
                        fontSize: "22px",
                        letterSpacing: "1px",
                      }}
                    >
                      AVISO DE COBRO
                    </span>
                  </div>
                </div>

                {/* Right side: Recuadro */}
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "24px",
                    borderRadius: "22px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: "240px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
                      Fecha de generación:
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>
                      {fechaGeneracion}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
                      Periodo:
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#2d4486" }}>
                      {periodo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Table */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "24px",
                  padding: "35px",
                  marginBottom: "40px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "50%", gap: "16px" }}>
                  <span style={{ fontSize: "22px", color: "#1e293b" }}>
                    <strong style={{ fontWeight: "bold" }}>Apartamento:</strong> {unidad}
                  </span>
                  <span style={{ fontSize: "22px", color: "#1e293b" }}>
                    <strong style={{ fontWeight: "bold" }}>Propietario:</strong> {propietario}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", width: "50%", gap: "16px", alignItems: "flex-end" }}>
                  {direccion && (
                    <span style={{ fontSize: "18px", color: "#64748b" }}>
                      {direccion}
                    </span>
                  )}
                </div>
              </div>

              {/* Cuota Administrativa */}
              <div style={{ display: "flex", flexDirection: "column", marginBottom: "40px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginBottom: "14px",
                    letterSpacing: "1px",
                    fontWeight: "bold",
                  }}
                >
                  CUOTA ADMINISTRATIVA
                </span>

                <div
                  style={{
                    border: "1px solid #dfe5ec",
                    borderRadius: "22px",
                    padding: "24px 30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "22px",
                    color: "#1e293b",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <span>Cuota Administrativa</span>
                  <span style={{ fontWeight: "bold", fontSize: "26px" }}>
                    $ {montoCuota.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              {/* Cargos Adicionales */}
              {cargos.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "40px" }}>
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#64748b",
                      marginBottom: "14px",
                      letterSpacing: "1px",
                      fontWeight: "bold",
                    }}
                  >
                    CARGOS ADICIONALES
                  </span>

                  <div
                    style={{
                      border: "1px solid #dfe5ec",
                      borderRadius: "22px",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    {cargos.map((linea, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "22px 30px",
                          borderBottom: idx !== cargos.length - 1 ? "1px solid #dfe5ec" : "none",
                          fontSize: "20px",
                          color: "#1e293b",
                        }}
                      >
                        <span>{linea.concepto}</span>
                        <span style={{ fontWeight: "bold", fontSize: "22px" }}>
                          $ {parseFloat(linea.monto).toLocaleString("es-CO")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Total Box */}
              <div
                style={{
                  background: "linear-gradient(135deg, #2d4486, #2563eb)",
                  color: "#ffffff",
                  borderRadius: "22px",
                  padding: "24px 30px",
                  marginBottom: "40px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "1px" }}>
                  TOTAL A PAGAR
                </span>
                <span style={{ fontSize: "48px", fontWeight: "bold" }}>
                  $ {total.toLocaleString("es-CO")}
                </span>
              </div>

              {/* Mensaje Nequi / Pie */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "22px",
                  padding: "26px",
                  marginBottom: "40px",
                  display: "flex",
                }}
              >
                <p style={{ margin: 0, fontSize: "20px", lineHeight: "32px", color: "#1e3a8a" }}>
                  {mensajePie}
                </p>
              </div>

              {/* Footer */}
              <div
                style={{
                  textAlign: "center",
                  borderTop: "2px dashed #cbd5e1",
                  paddingTop: "30px",
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#2d4486",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    fontSize: "26px",
                  }}
                >
                  ¡Gracias por su puntualidad!
                </span>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "16px",
                    letterSpacing: "2px",
                    fontWeight: "bold",
                  }}
                >
                  ADMINISTRACIÓN
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 1300,
      }
    )
  } catch (error: any) {
    return new Response(`Error rendering image: ${error.message}`, { status: 500 })
  }
}
