process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyAllSupabaseTables() {
  console.log("=== AUDITORÍA COMPLETA DE GUARDADO EN SUPABASE ===")

  const tablas = [
    'unidades',
    'mensualidades',
    'cartera',
    'historial_cartera',
    'portafolio_proyectos',
    'portafolio_multas',
    'comunicados',
    'cobros',
    'configuracion_torre',
    'configuracion_aviso',
    'configuracion_automatico',
    'configuracion_bot',
    'configuracion_tasas_mora'
  ]

  for (const t of tablas) {
    const { data, error } = await supabase.from(t).select('*').limit(5)
    if (error) {
      console.log(`❌ Tabla '${t}': Error (${error.message})`)
    } else {
      console.log(`✅ Tabla '${t}': OK (${data.length} registros verificados en Supabase)`)
    }
  }
}

verifyAllSupabaseTables()
