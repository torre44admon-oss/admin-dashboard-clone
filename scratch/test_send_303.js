process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSendAviso303() {
  console.log("=== ENVIANDO PRUEBA REAL DE AVISO DE COBRO AL APTO 303 (3014130109) ===")

  // Obtener config del bot
  const { data: botConfig } = await supabase.from('configuracion_bot').select('*').limit(1)
  const bot = botConfig?.[0]

  console.log("Bot URL:", bot?.railway_bot_url)

  // Mensaje de prueba de aviso
  const msg = `📢 *AVISO DE COBRO - APTO 303*\n*Conjunto Residencial Altos de Santa Elena - Torre 44*\n\nEstimado(a) Sandra Rodriguez,\nAdjuntamos su aviso de cobro correspondiente al período actual.\n\nTotal a Pagar: $ 25.000`

  // Enviar a través del bot de Railway directamente al teléfono 573014130109
  try {
    const res = await fetch(`${bot.railway_bot_url}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": bot.bot_api_key
      },
      body: JSON.stringify({
        phone: "573014130109",
        message: msg
      })
    })

    const text = await res.text()
    console.log("Respuesta del Bot de Railway para 3014130109:", res.status, text)
  } catch (err) {
    console.error("Error al enviar vía Railway bot:", err.message)
  }
}

testSendAviso303()
