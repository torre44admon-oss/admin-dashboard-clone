process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEnvio28() {
  console.log("=== AUDITANDO REGISTROS DE ENVÍO DEL DÍA 28 DE JULIO DE 2026 ===")

  // 1. Revisar marca de agua de envío automático
  const { data: config } = await supabase.from('configuracion_automatico').select('*')
  console.log("1. Configuración y marcas de agua:", config)

  // 2. Revisar cobros registrados en la fecha 28
  const { data: cobros28 } = await supabase.from('cobros').select('*').ilike('fecha', '%2026-07-28%')
  console.log(`2. Cobros generados el 28 de Julio: ${cobros28?.length || 0}`)
  if (cobros28) {
    console.log("Unidades con cobros generados el 28:", cobros28.map(c => c.unidad))
  }

  // 3. Revisar el total de unidades de la torre
  const { data: unidades } = await supabase.from('unidades').select('unidad, propietario, telefono').order('unidad')
  console.log(`3. Total de unidades registradas: ${unidades?.length || 0}`)
}

checkEnvio28()
