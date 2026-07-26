process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function deepSearchData() {
  console.log("=== BÚSQUEDA PROFUNDA EN TODAS LAS TABLAS DE SUPABASE ===")
  
  const tables = [
    'unidades',
    'cartera',
    'historial_cartera',
    'mensualidades',
    'cobros',
    'multas_asignadas',
    'proyectos_asignados',
    'portafolio_multas',
    'portafolio_proyectos',
    'configuracion_aviso'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        console.log(`Tabla ${table}: Error (${error.message})`)
      } else {
        console.log(`Tabla '${table}': ${data.length} filas encontradas.`)
        if (data.length > 0 && data.length <= 15) {
          console.log(`--- Contenido de ${table} ---`)
          console.log(JSON.stringify(data, null, 2))
        }
      }
    } catch (e) {
      console.log(`Error en ${table}:`, e.message)
    }
  }
}

deepSearchData()
