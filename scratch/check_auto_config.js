process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAutoConfig() {
  console.log("=== REVISANDO CONFIGURACIÓN DE ENVÍO AUTOMÁTICO ===")

  const { data: config } = await supabase
    .from('configuracion_automatico')
    .select('*')

  console.log("Configuración Automática actual:", config)
}

checkAutoConfig()
