process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedHistorialCartera() {
  console.log("=== POBLANDO HISTORIAL DE CARTERA CON SALDOS INICIALES ===")

  const { data: carteraRows } = await supabase.from('cartera').select('*')
  
  if (!carteraRows) return

  for (const c of carteraRows) {
    const deudaVal = Number(c.deuda) || 0
    if (deudaVal > 0) {
      // Check if already in historial
      const { data: exist } = await supabase
        .from('historial_cartera')
        .select('id')
        .eq('unidad', c.unidad)
        .eq('tipo', 'deuda')
        .limit(1)

      if (!exist || exist.length === 0) {
        const { error } = await supabase.from('historial_cartera').insert([{
          unidad: c.unidad,
          tipo: 'deuda',
          monto: deudaVal,
          fecha: '2026-07-01',
          saldoResultante: deudaVal
        }])
        if (error) {
          console.error(`Error al insertar historial para apto ${c.unidad}:`, error)
        } else {
          console.log(`✅ Registro de deuda inicial agregado a historial_cartera para Apto ${c.unidad}: $${deudaVal}`)
        }
      }
    }
  }
}

seedHistorialCartera()
