const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=')
  if (k && v) env[k.trim()] = v.trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function checkBotConfig() {
  const { data } = await supabase.from('configuracion_bot').select('*')
  console.log('CONFIGURACION_BOT EN SUPABASE:', JSON.stringify(data, null, 2))
}

checkBotConfig()
