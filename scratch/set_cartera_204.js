process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function setCartera204() {
  console.log("=== REGISTRANDO CARTERA ANTERIOR DE $205.000 PARA EL APARTAMENTO 204 ===")

  // 1. Actualizar tabla cartera
  const { data: cart, error: errCart } = await supabase
    .from('cartera')
    .update({ deuda: 205000 })
    .eq('unidad', '204')
    .select()

  console.log("1. Cartera de 204 actualizada:", cart || errCart)

  // 2. Insertar en historial_cartera
  const { data: hist, error: errHist } = await supabase
    .from('historial_cartera')
    .insert([{
      unidad: '204',
      tipo: 'deuda',
      monto: 205000,
      fecha: '2026-07-01',
      saldoResultante: 205000
    }])
    .select()

  console.log("2. Historial de cartera 204 insertado:", hist || errHist)
}

setCartera204()
