import React from "react"

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif", color: "#1e293b", lineHeight: 1.6 }}>
      <h1 style={{ color: "#2d4486", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        Política de Privacidad de Torre 44 Administración
      </h1>
      <p style={{ fontSize: "14px", color: "#64748b" }}>Última actualización: 10 de julio de 2026</p>

      <section style={{ marginTop: "30px" }}>
        <h2>1. Información que Recolectamos</h2>
        <p>
          Nuestra aplicación recopila y procesa únicamente la información necesaria para la gestión administrativa del condominio, que incluye: nombres de copropietarios, números de apartamento, números de teléfono celular (para el envío de avisos de cobro por WhatsApp) e información de cuotas de administración.
        </p>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>2. Uso de la Información</h2>
        <p>
          La información recopilada se utiliza exclusivamente para:
        </p>
        <ul>
          <li>Generar y enviar los avisos de cobro mensuales a través de WhatsApp.</li>
          <li>Permitir a los copropietarios consultar de manera automática su saldo pendiente (chatbot).</li>
          <li>Mantener el registro administrativo interno del condominio.</li>
        </ul>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>3. Compartición de Datos</h2>
        <p>
          No vendemos, alquilamos ni compartimos los datos personales de los copropietarios con terceros, excepto con Meta (para el envío de mensajes a través de su API oficial de WhatsApp) y Supabase (proveedor seguro de bases de datos).
        </p>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>4. Seguridad de los Datos</h2>
        <p>
          Implementamos medidas de seguridad técnicas para proteger la información contra accesos no autorizados, pérdidas o alteraciones.
        </p>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>5. Derechos del Usuario</h2>
        <p>
          Los copropietarios pueden solicitar la corrección, actualización o eliminación de sus datos de la base de datos comunicándose directamente con la administración del condominio.
        </p>
      </section>

      <section style={{ marginTop: "40px", borderTop: "1px solid #e2e8f0", paddingTop: "20px", fontSize: "14px", color: "#64748b" }}>
        <p>Alto de Santa Elena, Administración Torre 44.</p>
      </section>
    </div>
  )
}
