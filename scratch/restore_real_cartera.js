process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function restoreRealCartera() {
  console.log("=== RESTAURANDO CARTERA REAL DESDE CAPTURA ===")

  // 1. Borrar cualquier dato de prueba anterior en cartera
  await supabase.from('cartera').delete().neq('id', 0)

  // 2. Insertar los saldos exactos de la captura
  const realCartera = [
    { id: 1, unidad: "102", deuda: 205000 },
    { id: 2, unidad: "202", deuda: 15000 },
    { id: 3, unidad: "203", deuda: 493000 },
    { id: 4, unidad: "302", deuda: 250000 },
    { id: 5, unidad: "404", deuda: 60000 },
    { id: 6, unidad: "501", deuda: 368000 },
    { id: 7, unidad: "503", deuda: 100000 },
    { id: 8, unidad: "504", deuda: 20000 }
  ]

  for (const item of realCartera) {
    const { data: uExist } = await supabase.from('unidades').select('id').eq('unidad', item.unidad).single()
    if (!uExist) {
      await supabase.from('unidades').insert([{
        unidad: item.unidad,
        piso: item.unidad.charAt(0),
        propietario: `Propietario ${item.unidad}`,
        telefono: ""
      }])
    }

    const { data, error } = await supabase.from('cartera').insert([{
      id: item.id,
      unidad: item.unidad,
      deuda: item.deuda
    }]).select()

    if (error) {
      console.error(`Error en unidad ${item.unidad}:`, error.message)
    } else {
      console.log(`✅ Restaurado Apt ${item.unidad}: $${item.deuda.toLocaleString('es-CO')}`)
    }
  }
}

restoreRealCartera()
