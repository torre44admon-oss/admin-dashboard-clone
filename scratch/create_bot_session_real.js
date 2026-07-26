process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createBotSessionTable() {
  console.log("Creando tabla bot_auth_session en Supabase de producción...")
  
  // Usamos fetch REST directo a Supabase con la anon key para verificar si podemos crear o insertar la tabla
  const res = await fetch(`${supabaseUrl}/rest/v1/bot_auth_session?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  
  console.log("Status de la tabla:", res.status)
  if (res.status === 404) {
    console.log("La tabla bot_auth_session NO existe en Supabase REST.")
  } else {
    console.log("La tabla ya responde.")
  }
}

createBotSessionTable()
