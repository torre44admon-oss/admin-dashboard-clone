process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function restoreCarteraData() {
  console.log("=== RESTAURANDO SALDOS ANTERIORES EN SUPABASE ===")

  // 1. Asegurar Unidades
  const unidades = [
    { unidad: "101", piso: "1", propietario: "eloy", telefono: "3014130109" },
    { unidad: "102", piso: "1", propietario: "sandra", telefono: "3045860844" },
    { unidad: "201", piso: "2", propietario: "CAARD", telefono: "3014130109" }
  ]

  for (const u of unidades) {
    const { data: exist } = await supabase.from('unidades').select('id').eq('unidad', u.unidad).single()
    if (!exist) {
      await supabase.from('unidades').insert([u])
      console.log(`Unidad ${u.unidad} insertada.`)
    } else {
      await supabase.from('unidades').update(u).eq('unidad', u.unidad)
      console.log(`Unidad ${u.unidad} actualizada.`)
    }
  }

  // 2. Insertar/Actualizar Cartera Anterior
  const carteras = [
    { unidad: "101", saldo_anterior: 160000, updated_at: new Date().toISOString() },
    { unidad: "102", saldo_anterior: 205000, updated_at: new Date().toISOString() },
    { unidad: "201", saldo_anterior: 0, updated_at: new Date().toISOString() }
  ]

  for (const c of carteras) {
    const { data: exist } = await supabase.from('cartera').select('id').eq('unidad', c.unidad).single()
    if (exist) {
      await supabase.from('cartera').update({ saldo_anterior: c.saldo_anterior }).eq('unidad', c.unidad)
    } else {
      await supabase.from('cartera').insert([c])
    }
    console.log(`Cartera anterior de Apt ${c.unidad} restaurada: $${c.saldo_anterior.toLocaleString('es-CO')}`)
  }
}

restoreCarteraData()
