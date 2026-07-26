process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

const apartamentosPagadosJulio = ["301", "102", "303", "403", "402", "601", "502"]

async function setJulioPaid() {
  console.log("=== REGISTRANDO MENSUALIDAD JULIO 2026 COMO PAGADA PARA LOS 7 APARTAMENTOS ===")

  for (const unidad of apartamentosPagadosJulio) {
    // 1. Buscar si ya existe la mensualidad de Julio 2026
    const { data: exist } = await supabase
      .from('mensualidades')
      .select('id')
      .eq('unidad', unidad)
      .eq('mes', 'Julio')
      .eq('anio', '2026')
      .single()

    if (exist) {
      await supabase
        .from('mensualidades')
        .update({ estado: 'Pagado', fecha_pago: new Date().toISOString().split('T')[0] })
        .eq('id', exist.id)
      console.log(`✅ Apt ${unidad}: Mensualidad de Julio 2026 actualizada a PAGADO.`)
    } else {
      await supabase
        .from('mensualidades')
        .insert([{
          unidad,
          mes: 'Julio',
          anio: '2026',
          valor: 20000,
          estado: 'Pagado',
          fecha_limite: '2026-07-05',
          fecha_pago: new Date().toISOString().split('T')[0]
        }])
      console.log(`✅ Apt ${unidad}: Mensualidad de Julio 2026 insertada como PAGADO.`)
    }
  }
}

setJulioPaid()
