process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearProductionLastReport() {
  console.log("Limpiando fecha_ultimo_reporte en Supabase...")
  const { data: configs } = await supabase
    .from("configuracion_automatico")
    .select("id, fecha_ultimo_reporte")

  if (configs && configs.length > 0) {
    for (const c of configs) {
      const { error } = await supabase
        .from("configuracion_automatico")
        .update({ fecha_ultimo_reporte: null })
        .eq("id", c.id)

      if (error) console.error("Error al limpiar ID", c.id, error)
      else console.log("✅ Limpiado con éxito fecha_ultimo_reporte para ID", c.id)
    }
  }
}

clearProductionLastReport()
