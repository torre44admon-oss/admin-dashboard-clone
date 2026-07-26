process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function addApto404Mensualidades() {
  console.log("=== REGISTRANDO MENSUALIDADES DESDE MARZO PARA APT 404 ===")

  const meses = [
    { mes: "Marzo", anio: "2026", fecha_limite: "2026-03-05" },
    { mes: "Abril", anio: "2026", fecha_limite: "2026-04-05" },
    { mes: "Mayo", anio: "2026", fecha_limite: "2026-05-05" },
    { mes: "Junio", anio: "2026", fecha_limite: "2026-06-05" },
    { mes: "Julio", anio: "2026", fecha_limite: "2026-07-05" }
  ]

  for (const m of meses) {
    const { data: exist } = await supabase
      .from('mensualidades')
      .select('id')
      .eq('unidad', '404')
      .eq('mes', m.mes)
      .eq('anio', m.anio)
      .single()

    if (!exist) {
      const { error } = await supabase.from('mensualidades').insert([{
        unidad: "404",
        mes: m.mes,
        anio: m.anio,
        valor: 20000,
        estado: "Pendiente",
        fecha_limite: m.fecha_limite,
        created_at: `${m.fecha_limite}T00:00:00.000Z`
      }])

      if (error) {
        console.error(`Error al insertar mensualidad ${m.mes}:`, error.message)
      } else {
        console.log(`✅ Registrada mensualidad ${m.mes} 2026 para Apt 404 ($20.000)`)
      }
    } else {
      console.log(`Mensualidad ${m.mes} 2026 para Apt 404 ya existía.`)
    }
  }
}

addApto404Mensualidades()
