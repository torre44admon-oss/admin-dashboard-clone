import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = 'force-dynamic'

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

    // Satori (Next OG) permite pasar un ArrayBuffer directamente al atributo `src` de <img>.
    // Esta es la forma oficial y más robusta de renderizar imágenes remotas en ImageResponse,
    // evitando cualquier problema de codificación de caracteres o límites de tamaño de base64.
    let logoSrc: any = ""
    if (logoUrl) {
      if (logoUrl.startsWith("data:")) {
        logoSrc = logoUrl
      } else if (logoUrl.startsWith("http")) {
        try {
          const res = await fetch(logoUrl)
          if (res.ok) {
            const ct = res.headers.get("content-type") || "image/png"
            if (ct.startsWith("image/")) {
              logoSrc = await res.arrayBuffer()
            }
          }
        } catch (e) {
          console.error("Error al descargar logo en el backend:", e)
        }
      }
    }

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
            backgroundColor: "#0b0f19",
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
              backgroundColor: "#151c2c",
              border: "1px solid #1e293b",
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
                  borderBottom: "1px solid #2d3748",
                  paddingBottom: "35px",
                  marginBottom: "40px",
                }}
              >
                {/* Left side: Logo & Title */}
                <div style={{ display: "flex", gap: "22px", flex: 1, minWidth: 0, marginRight: "20px" }}>
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      width={140}
                      height={140}
                      style={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "28px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        background: "#2d4486",
                        color: "#ffffff",
                        width: "140px",
                        height: "140px",
                        borderRadius: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "52px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      T44
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, justifyContent: "center", flex: 1 }}>
                    <span
                      style={{
                        fontSize: nombreTorre.length > 40 ? "18px" : nombreTorre.length > 25 ? "22px" : nombreTorre.length > 15 ? "28px" : "36px",
                        fontWeight: "bold",
                        color: "#ffffff",
                        margin: 0,
                        wordBreak: "break-word",
                        lineHeight: 1.2,
                      }}
                    >
                      {nombreTorre}
                    </span>
                    <span
                      style={{
                        color: "#94a3b8",
                        fontWeight: "bold",
                        marginTop: "8px",
                        fontSize: "20px",
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
                    background: "#1e293b",
                    padding: "24px",
                    borderRadius: "22px",
                    border: "1px solid #2d3748",
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
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>
                      {fechaGeneracion}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
                      Periodo:
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#60a5fa" }}>
                      {periodo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Table */}
              <div
                style={{
                  background: "#1e293b",
                  border: "1px solid #2d3748",
                  borderRadius: "24px",
                  padding: "35px",
                  marginBottom: "40px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "50%", gap: "16px" }}>
                  <span style={{ fontSize: "22px", color: "#94a3b8" }}>
                    Apartamento: <span style={{ color: "#34d399", fontWeight: "bold" }}>{unidad}</span>
                  </span>
                  <span style={{ fontSize: "22px", color: "#94a3b8" }}>
                    Propietario: <span style={{ color: "#ffffff", fontWeight: "bold" }}>{propietario}</span>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", width: "50%", gap: "16px", alignItems: "flex-end" }}>
                  {direccion && (
                    <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                      Dirección: <span style={{ color: "#ffffff", fontWeight: "bold" }}>{direccion}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Cuota Administrativa Section */}
              {(() => {
                const adminCargos = cargos.filter((c: any) => 
                  c.concepto.startsWith("Meses Vencidos") || 
                  c.concepto.startsWith("Intereses de Mora") || 
                  c.concepto.startsWith("Cuota ")
                )
                const extraCargos = cargos.filter((c: any) => 
                  !c.concepto.startsWith("Meses Vencidos") && 
                  !c.concepto.startsWith("Intereses de Mora") && 
                  !c.concepto.startsWith("Cuota ")
                )

                return (
                  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "40px", width: "100%" }}>
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#94a3b8",
                          marginBottom: "14px",
                          letterSpacing: "1px",
                          fontWeight: "bold",
                        }}
                      >
                        CUOTA ADMINISTRATIVA
                      </span>

                      <div
                        style={{
                          border: "1px solid #2d3748",
                          borderRadius: "22px",
                          backgroundColor: "#1e293b",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "22px 30px",
                            fontSize: "22px",
                            color: "#ffffff",
                            borderBottom: adminCargos.length > 0 ? "1px solid #2d3748" : "none",
                          }}
                        >
                          <span style={{ flex: 1, minWidth: 0 }}>Cuota Administrativa</span>
                          <span style={{ fontWeight: "bold", fontSize: "26px", flexShrink: 0, marginLeft: "20px" }}>
                            $ {montoCuota.toLocaleString("es-CO")}
                          </span>
                        </div>

                        {adminCargos.map((linea: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "22px 30px",
                              borderBottom: idx !== adminCargos.length - 1 ? "1px solid #2d3748" : "none",
                              fontSize: "20px",
                              color: "#ffffff",
                            }}
                          >
                            <span style={{ flex: 1, minWidth: 0, paddingRight: "16px", wordBreak: "break-word" }}>
                              {linea.concepto}
                            </span>
                            <span style={{ fontWeight: "bold", fontSize: "22px", flexShrink: 0, marginLeft: "20px" }}>
                              $ {parseFloat(linea.monto).toLocaleString("es-CO")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cargos Adicionales Section */}
                    {extraCargos.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", marginBottom: "40px", width: "100%" }}>
                        <span
                          style={{
                            fontSize: "16px",
                            color: "#94a3b8",
                            marginBottom: "14px",
                            letterSpacing: "1px",
                            fontWeight: "bold",
                          }}
                        >
                          CARGOS ADICIONALES
                        </span>

                        <div
                          style={{
                            border: "1px solid #2d3748",
                            borderRadius: "22px",
                            backgroundColor: "#1e293b",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            width: "100%",
                          }}
                        >
                          {extraCargos.map((linea: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "22px 30px",
                                borderBottom: idx !== extraCargos.length - 1 ? "1px solid #2d3748" : "none",
                                fontSize: "20px",
                                color: "#ffffff",
                              }}
                            >
                              <span style={{ flex: 1, minWidth: 0, paddingRight: "16px", wordBreak: "break-word" }}>
                                {linea.concepto}
                              </span>
                              <span style={{ fontWeight: "bold", fontSize: "22px", flexShrink: 0, marginLeft: "20px" }}>
                                $ {parseFloat(linea.monto).toLocaleString("es-CO")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Total Box (Dark themed layout similar to screenshot) */}
              <div
                style={{
                  borderTop: "1px solid #2d3748",
                  paddingTop: "30px",
                  marginBottom: "40px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", letterSpacing: "1px" }}>
                  Total a Pagar
                </span>
                <span style={{ fontSize: "44px", fontWeight: "bold", color: "#34d399" }}>
                  $ {total.toLocaleString("es-CO")}
                </span>
              </div>

              {/* Mensaje Nequi / Pie */}
              <div
                style={{
                  background: "#1e293b",
                  border: "1px solid #2d3748",
                  borderRadius: "22px",
                  padding: "26px",
                  marginBottom: "40px",
                  display: "flex",
                }}
              >
                <p style={{ margin: 0, fontSize: "20px", lineHeight: "32px", color: "#94a3b8" }}>
                  {mensajePie}
                </p>
              </div>

              {/* Footer */}
              <div
                style={{
                  textAlign: "center",
                  borderTop: "1px dashed #2d3748",
                  paddingTop: "30px",
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#60a5fa",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    fontSize: "26px",
                  }}
                >
                  ¡Gracias por su puntualidad!
                </span>
                <span
                  style={{
                    color: "#64748b",
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

