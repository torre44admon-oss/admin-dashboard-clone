process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateCartera204Full() {
  console.log("=== REGISTRANDO 14 MESES DE CARTERA ANTERIOR ($280.000) PARA EL APT 204 ===")

  // 1. Actualizar tabla cartera a $280.000
  const { data: exist } = await supabase.from('cartera').select('id').eq('unidad', '204').maybeSingle()
  if (exist) {
    await supabase.from('cartera').update({ deuda: 280000 }).eq('unidad', '204')
  } else {
    await supabase.from('cartera').insert([{ unidad: '204', deuda: 280000 }])
  }

  // 2. Actualizar o insertar en historial_cartera
  const { data: histExist } = await supabase.from('historial_cartera').select('id').eq('unidad', '204').limit(1)
  if (histExist && histExist.length > 0) {
    await supabase.from('historial_cartera').update({ monto: 280000, saldoResultante: 280000 }).eq('id', histExist[0].id)
  } else {
    await supabase.from('historial_cartera').insert([{
      unidad: '204',
      tipo: 'deuda',
      monto: 280000,
      fecha: '2026-07-01',
      saldoResultante: 280000
    }])
  }

  console.log("✅ Apartamento 204 actualizado con $280.000 de Cartera Anterior (14 meses).")
}

updateCartera204Full()
