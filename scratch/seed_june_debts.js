process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

const apartamentosDeudaJunio = ["201", "501", "503", "504"]
const mesesDeuda = [
  { mes: "Junio", anio: "2026", fecha_limite: "2026-06-05" },
  { mes: "Julio", anio: "2026", fecha_limite: "2026-07-05" }
]

async function addJunioJulyDebts() {
  console.log("=== REGISTRANDO MENSUALIDADES DE JUNIO Y JULIO COMO PENDIENTES (201, 501, 503, 504) ===")

  for (const unidad of apartamentosDeudaJunio) {
    for (const m of mesesDeuda) {
      const { data: exist } = await supabase
        .from('mensualidades')
        .select('id')
        .eq('unidad', unidad)
        .eq('mes', m.mes)
        .eq('anio', m.anio)
        .single()

      if (!exist) {
        await supabase
          .from('mensualidades')
          .insert([{
            unidad,
            mes: m.mes,
            anio: m.anio,
            valor: 20000,
            estado: 'Pendiente',
            fecha_limite: m.fecha_limite,
            created_at: `${m.fecha_limite}T00:00:00.000Z`
          }])
        console.log(`✅ Apt ${unidad}: Mensualidad de ${m.mes} 2026 registrada como PENDIENTE.`)
      } else {
        await supabase
          .from('mensualidades')
          .update({ estado: 'Pendiente' })
          .eq('id', exist.id)
        console.log(`✅ Apt ${unidad}: Mensualidad de ${m.mes} 2026 actualizada a PENDIENTE.`)
      }
    }
  }
}

addJunioJulyDebts()
