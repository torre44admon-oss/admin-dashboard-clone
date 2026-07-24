process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
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

async function seedBotConfig() {
  const { data, error } = await supabase.from('configuracion_bot').insert([{
    railway_bot_url: 'https://whatsapp-bot-y44i.onrender.com',
    bot_api_key: 'torre44grupo2026',
    grupo_whatsapp_id: '120363430427886761@g.us'
  }]).select()

  if (error) {
    console.error('Error insertando bot config:', error)
  } else {
    console.log('✅ Bot config insertado con éxito en Supabase:', JSON.stringify(data, null, 2))
  }
}

seedBotConfig()
