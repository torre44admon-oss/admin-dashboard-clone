process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdminSum() {
  console.log("=== CALCULANDO MONTO RECAUDADO DE ADMINISTRACIÓN Y MENSUALIDADES ===")

  // 1. Mensualidades Pagadas
  const { data: mensPagadas } = await supabase
    .from('mensualidades')
    .select('*')
    .eq('estado', 'Pagado')

  let sumaMens = 0
  const desgloseMens = []
  if (mensPagadas) {
    mensPagadas.forEach(m => {
      sumaMens += Number(m.valor) || 0
      desgloseMens.push({ unidad: m.unidad, mes: m.mes, val: m.valor })
    })
  }

  console.log(`Total Mensualidades Pagadas: $${sumaMens}`)
  console.log(`Cantidad de mensualidades pagadas: ${desgloseMens.length}`)
  console.log(desgloseMens)
}

checkAdminSum()
