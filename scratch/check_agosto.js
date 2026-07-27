process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPagosAgosto() {
  console.log("=== REVISANDO REGISTROS Y PAGOS DE AGOSTO DE 2026 ===")

  // 1. Mensualidades de Agosto
  const { data: mensAgosto } = await supabase
    .from('mensualidades')
    .select('*')
    .eq('mes', 'Agosto')
    .eq('anio', '2026')

  console.log("1. Mensualidades de Agosto 2026:", mensAgosto || [])

  // 2. Historial de Pagos en Agosto
  const { data: historialAgosto } = await supabase
    .from('historial_cartera')
    .select('*')
    .ilike('concepto', '%Agosto%')

  console.log("2. Historial de Pagos con concepto Agosto:", historialAgosto || [])
}

checkPagosAgosto()
