process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function set504Debes3Meses() {
  console.log("=== REGISTRANDO 3 MESES PENDIENTES PARA EL APARTAMENTO 504 (Mayo, Junio, Julio) ===")

  const meses = [
    { mes: 'Mayo', anio: '2026', limite: '2026-05-05' },
    { mes: 'Junio', anio: '2026', limite: '2026-06-05' },
    { mes: 'Julio', anio: '2026', limite: '2026-07-05' }
  ]

  for (const m of meses) {
    const { data: exist } = await supabase
      .from('mensualidades')
      .select('id')
      .eq('unidad', '504')
      .eq('mes', m.mes)
      .eq('anio', m.anio)
      .single()

    if (exist) {
      await supabase
        .from('mensualidades')
        .update({ estado: 'Pendiente', fecha_pago: null })
        .eq('id', exist.id)
    } else {
      await supabase
        .from('mensualidades')
        .insert([{ unidad: '504', mes: m.mes, anio: m.anio, valor: 20000, estado: 'Pendiente', fecha_limite: m.limite }])
    }
  }

  console.log("✅ Apartamento 504 actualizado con 3 meses pendientes: Mayo, Junio y Julio 2026 ($60.000).")
}

set504Debes3Meses()
