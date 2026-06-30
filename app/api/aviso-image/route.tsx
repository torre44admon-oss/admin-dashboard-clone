import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const nombreTorre = searchParams.get("nombreTorre") || "Torre 44"
    const logoUrl = searchParams.get("logoUrl") || ""
    const periodo = searchParams.get("periodo") || "Julio de 2026"
    const unidad = searchParams.get("unidad") || "101"
    const propietario = searchParams.get("propietario") || "Propietario"
    const montoCuota = parseFloat(searchParams.get("montoCuota") || "0")
    const mensajePie = searchParams.get("mensajePie") || "Por favor realizar el pago a tiempo."
    const direccion = searchParams.get("direccion") || ""
    
    // Parse cargos
    const cargosRaw = searchParams.get("cargos") || "[]"
    let cargos: any[] = []
    try {
      cargos = JSON.parse(cargosRaw)
    } catch (e) {}

    const total = montoCuota + cargos.reduce((acc, c) => acc + (parseFloat(c.monto) || 0), 0)

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
            backgroundColor: "#0B0F19",
            color: "#FFFFFF",
            padding: "30px",
          }}
        >
          {/* Main Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              backgroundColor: "#131926",
              border: "1px solid #1E293B",
              borderRadius: "24px",
              padding: "40px",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1E293B", paddingBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {logoUrl ? (
                  <img src={logoUrl} width="60" height="60" style={{ borderRadius: "12px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>
                    T44
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "24px", fontWeight: "bold" }}>{nombreTorre}</span>
                  <span style={{ fontSize: "12px", color: "#94A3B8" }}>{direccion}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase" }}>Aviso de Cobro</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#3B82F6" }}>{periodo}</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", fontSize: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ color: "#94A3B8" }}>Propietario:</span>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>{propietario}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span style={{ color: "#94A3B8" }}>Apartamento:</span>
                <span style={{ fontWeight: "bold", fontSize: "18px", color: "#10B981" }}>Apto. {unidad}</span>
              </div>
            </div>

            {/* Table */}
            <div style={{ display: "flex", flexDirection: "column", marginTop: "30px", flexGrow: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1E293B", paddingBottom: "8px", fontWeight: "bold", fontSize: "12px", color: "#94A3B8" }}>
                <span>Concepto</span>
                <span>Monto</span>
              </div>
              
              {/* Cuota Base */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1E293B", fontSize: "14px" }}>
                <span>Cuota de Administración</span>
                <span style={{ fontWeight: "bold" }}>$ {montoCuota.toLocaleString("es-CO")}</span>
              </div>

              {/* Cargos */}
              {cargos.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1E293B", fontSize: "14px" }}>
                  <span>{c.concepto}</span>
                  <span style={{ fontWeight: "bold" }}>$ {parseFloat(c.monto).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #1E293B", paddingTop: "20px", marginTop: "20px" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>Total a Pagar</span>
              <span style={{ fontSize: "28px", fontWeight: "bold", color: "#10B981" }}>$ {total.toLocaleString("es-CO")}</span>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", flexDirection: "column", marginTop: "30px", borderTop: "1px solid #1E293B", paddingTop: "15px", fontSize: "11px", color: "#94A3B8", textAlign: "center" }}>
              <span>{mensajePie}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 800,
      }
    )
  } catch (error: any) {
    return new Response(`Error rendering image: ${error.message}`, { status: 500 })
  }
}
