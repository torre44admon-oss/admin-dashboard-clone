process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testMoreRoutes() {
  const { data: botConfig } = await supabase.from('configuracion_bot').select('*').limit(1)
  const bot = botConfig?.[0]
  const baseUrl = bot?.railway_bot_url

  const routes = [
    '/send-individual',
    '/send-private',
    '/send-direct',
    '/send-text',
    '/send-single',
    '/send-user',
    '/send-msg',
    '/send-aviso',
    '/api/send',
    '/api/send-message'
  ]

  for (const r of routes) {
    try {
      const res = await fetch(`${baseUrl}${r}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json", "x-api-key": bot.bot_api_key },
        body: JSON.stringify({ phone: "573014130109", to: "573014130109", message: "test" })
      })
      const text = await res.text()
      if (res.status !== 404) {
        console.log(`🚀 ¡ENCONTRADA! Ruta ${r}: HTTP ${res.status} => ${text}`)
      }
    } catch (e) {}
  }
}

testMoreRoutes()
