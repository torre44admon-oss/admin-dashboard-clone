process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectCarteraData() {
  console.log("=== INSPECCIONANDO DATOS DE CARTERA ===")
  
  const { data: cartera, error: errC } = await supabase.from('cartera').select('*')
  console.log("Tabla 'cartera':", cartera ? cartera.length : 0, "registros", errC || '')
  if (cartera && cartera.length > 0) console.log(cartera)

  const { data: historial, error: errH } = await supabase.from('historial_cartera').select('*')
  console.log("Tabla 'historial_cartera':", historial ? historial.length : 0, "registros", errH || '')
  if (historial && historial.length > 0) console.log(historial)

  const { data: mensualidades, error: errM } = await supabase.from('mensualidades').select('*')
  console.log("Tabla 'mensualidades':", mensualidades ? mensualidades.length : 0, "registros", errM || '')

  const { data: unidades, error: errU } = await supabase.from('unidades').select('*')
  console.log("Tabla 'unidades':", unidades ? unidades.length : 0, "registros", errU || '')
}

inspectCarteraData()
