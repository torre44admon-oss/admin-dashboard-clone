process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function set204ExactStructure() {
  console.log("=== REGISTRANDO APARTAMENTO 204: CARTERA ANTERIOR $205.000 + 14 MESES DE ADMINISTRACIÓN ===")

  // 1. Cartera Anterior en $205.000
  await supabase.from('cartera').update({ deuda: 205000 }).eq('unidad', '204')
  
  const { data: histExist } = await supabase.from('historial_cartera').select('id').eq('unidad', '204').limit(1)
  if (histExist && histExist.length > 0) {
    await supabase.from('historial_cartera').update({ monto: 205000, saldoResultante: 205000 }).eq('id', histExist[0].id)
  }

  // 2. Registrar mensualidades vencidas de los últimos meses hasta sumar $280.000 (14 cuotas de $20.000)
  // Generar meses pasados de 2025 y 2026
  const meses2025_2026 = [
    { mes: 'Junio', anio: '2025' },
    { mes: 'Julio', anio: '2025' },
    { mes: 'Agosto', anio: '2025' },
    { mes: 'Septiembre', anio: '2025' },
    { mes: 'Octubre', anio: '2025' },
    { mes: 'Noviembre', anio: '2025' },
    { mes: 'Diciembre', anio: '2025' },
    { mes: 'Enero', anio: '2026' },
    { mes: 'Febrero', anio: '2026' },
    { mes: 'Marzo', anio: '2026' },
    { mes: 'Abril', anio: '2026' },
    { mes: 'Mayo', anio: '2026' },
    { mes: 'Junio', anio: '2026' },
    { mes: 'Julio', anio: '2026' }
  ]

  for (const m of meses2025_2026) {
    const { data: exist } = await supabase
      .from('mensualidades')
      .select('id')
      .eq('unidad', '204')
      .eq('mes', m.mes)
      .eq('anio', m.anio)
      .single()

    if (exist) {
      await supabase.from('mensualidades').update({ estado: 'Pendiente', valor: 20000, fecha_pago: null }).eq('id', exist.id)
    } else {
      await supabase.from('mensualidades').insert([{
        unidad: '204',
        mes: m.mes,
        anio: m.anio,
        valor: 20000,
        estado: 'Pendiente',
        fecha_limite: `${m.anio}-07-05`
      }])
    }
  }

  console.log("✅ Apartamento 204 configurado exactamente: Cartera Anterior $205.000 + 14 meses vencidos ($280.000).")
}

set204ExactStructure()
