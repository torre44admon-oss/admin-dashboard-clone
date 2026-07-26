process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function set101PendingJulio() {
  console.log("=== REGISTRANDO MENSUALIDAD JULIO 2026 COMO PENDIENTE PARA APT 101 ===")

  const { data: exist } = await supabase
    .from('mensualidades')
    .select('id')
    .eq('unidad', '101')
    .eq('mes', 'Julio')
    .eq('anio', '2026')
    .single()

  if (exist) {
    await supabase
      .from('mensualidades')
      .update({ estado: 'Pendiente', fecha_pago: null })
      .eq('id', exist.id)
    console.log("✅ Apt 101: Mensualidad de Julio 2026 actualizada a PENDIENTE.")
  } else {
    await supabase
      .from('mensualidades')
      .insert([{
        unidad: '101',
        mes: 'Julio',
        anio: '2026',
        valor: 20000,
        estado: 'Pendiente',
        fecha_limite: '2026-07-05',
        created_at: '2026-07-05T00:00:00.000Z'
      }])
    console.log("✅ Apt 101: Mensualidad de Julio 2026 insertada como PENDIENTE.")
  }
}

set101PendingJulio()
