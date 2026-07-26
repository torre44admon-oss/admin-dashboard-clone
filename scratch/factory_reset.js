process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function factoryResetDataOnly() {
  console.log("=== RESTABLECIMIENTO DE FÁBRICA (MANTENIENDO CONFIGURACIONES) ===")

  // Tablas a vaciar (Datos operacionales)
  const dataTables = [
    'cobros',
    'cartera',
    'historial_cartera',
    'mensualidades',
    'multas_asignadas',
    'portafolio_multas',
    'multas',
    'proyectos_asignados',
    'portafolio_proyectos',
    'proyectos',
    'unidades'
  ]

  for (const table of dataTables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', 0)
      if (error) {
        console.error(`Error al vaciar tabla ${table}:`, error.message)
      } else {
        console.log(`✅ Tabla '${table}' vaciada completamente.`)
      }
    } catch (e) {
      console.error(`Excepción en tabla ${table}:`, e.message)
    }
  }

  console.log("\n🔒 CONFIGURACIONES PRESERVADAS INTACTAS:")
  console.log("- configuracion_torre (Conservada)")
  console.log("- configuracion_bot (Conservada)")
  console.log("- configuracion_automatico (Conservada)")
  console.log("- configuracion_tasas_mora (Conservada)")
  console.log("- bot_auth_session (Conservada)")
}

factoryResetDataOnly()
