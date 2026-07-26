process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function insertCaptureCartera() {
  console.log("=== INGRESANDO CARTERA DE LA CAPTURA EN SISTEMA LIMPIO ===")

  const items = [
    { id: 1, unidad: "102", deuda: 205000 },
    { id: 2, unidad: "202", deuda: 15000 },
    { id: 3, unidad: "203", deuda: 493000 },
    { id: 4, unidad: "302", deuda: 250000 },
    { id: 5, unidad: "404", deuda: 60000 },
    { id: 6, unidad: "501", deuda: 368000 },
    { id: 7, unidad: "503", deuda: 100000 },
    { id: 8, unidad: "504", deuda: 20000 }
  ]

  for (const item of items) {
    // 1. Insertar Unidad si no existe
    const { data: uExist } = await supabase.from('unidades').select('id').eq('unidad', item.unidad).single()
    if (!uExist) {
      await supabase.from('unidades').insert([{
        unidad: item.unidad,
        piso: item.unidad.charAt(0),
        propietario: `Propietario ${item.unidad}`,
        telefono: ""
      }])
    }

    // 2. Insertar Registro de Cartera
    const { data, error } = await supabase.from('cartera').insert([{
      id: item.id,
      unidad: item.unidad,
      deuda: item.deuda
    }]).select()

    if (error) {
      console.error(`Error en unidad ${item.unidad}:`, error.message)
    } else {
      console.log(`✅ Apt ${item.unidad} ingresado con Cartera: $${item.deuda.toLocaleString('es-CO')}`)
    }
  }
}

insertCaptureCartera()
