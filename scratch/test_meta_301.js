process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testMetaDirectTo301() {
  console.log("=== PROBANDO META CLOUD API DIRECTO AL 3014130109 ===")

  // Consultar credenciales si existen en env o DB
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "3171336407"
  const token = process.env.WHATSAPP_TOKEN

  console.log("Phone ID:", phoneId)
  console.log("Token existe?:", !!token)

  if (!token) {
    console.log("⚠️ WHATSAPP_TOKEN no está definido en el archivo .env local de Node, let's test /api/whatsapp call.")
  }

  // Hacer test llamando a /api/whatsapp localmente o directo a Meta
  try {
    const res = await fetch("https://admin-dashboard-clone-9rp4.vercel.app/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefono: "573014130109",
        mensaje: "Test directo desde Meta API"
      })
    })

    const text = await res.text()
    console.log(`Respuesta de Meta API (/api/whatsapp) status: ${res.status}`)
    console.log("Cuerpo devuelto:", text)
  } catch (err) {
    console.error("Error al probar:", err.message)
  }
}

testMetaDirectTo301()
