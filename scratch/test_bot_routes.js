process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testEndpoints() {
  const { data: botConfig } = await supabase.from('configuracion_bot').select('*').limit(1)
  const bot = botConfig?.[0]
  const baseUrl = bot?.railway_bot_url

  console.log("Base URL del Bot:", baseUrl)

  const routes = ['/status', '/send-message', '/send', '/send-group', '/message']

  for (const r of routes) {
    try {
      const res = await fetch(`${baseUrl}${r}`, {
        method: r.includes('status') ? 'GET' : 'POST',
        headers: { "Content-Type": "application/json", "x-api-key": bot.bot_api_key },
        body: r.includes('status') ? undefined : JSON.stringify({ phone: "573014130109", message: "test" })
      })
      const text = await res.text()
      console.log(`Ruta ${r}: HTTP ${res.status} => ${text.substring(0, 100)}`)
    } catch (e) {
      console.log(`Ruta ${r}: Error ${e.message}`)
    }
  }
}

testEndpoints()
