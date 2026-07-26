process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanUnidadesOnly() {
  console.log("=== LIMPIANDO TABLA UNIDADES (CONSERVANDO SOLO CARTERA) ===")

  const { error } = await supabase.from('unidades').delete().neq('id', 0)

  if (error) {
    console.error("Error limpiando unidades:", error.message)
  } else {
    console.log("✅ Tabla 'unidades' vaciada completamente.")
  }

  const { data: cartera } = await supabase.from('cartera').select('*')
  console.log(`📊 Tabla 'cartera' conservada intacta (${cartera.length} registros):`)
  console.log(cartera.map(c => `Apt ${c.unidad}: $${Number(c.deuda).toLocaleString('es-CO')}`).join('\n'))
}

cleanUnidadesOnly()
