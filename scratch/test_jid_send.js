process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSendGroupWithJid() {
  const { data: botConfig } = await supabase.from('configuracion_bot').select('*').limit(1)
  const bot = botConfig?.[0]
  const baseUrl = bot?.railway_bot_url

  console.log("Probando envio individual a través de Baileys al 3014130109...")

  const payload = {
    groupId: "573014130109@s.whatsapp.net",
    message: "📢 *PRUEBA DE AVISO A TU WHATSAPP (Apto 303)*\nHola Sandra, esta es una prueba de envío directo por el bot de WhatsApp."
  }

  const res = await fetch(`${baseUrl}/send-group`, {
    method: 'POST',
    headers: { "Content-Type": "application/json", "x-api-key": bot.bot_api_key },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  console.log(`Resultado: HTTP ${res.status} => ${text}`)
}

testSendGroupWithJid()
