const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=')
  if (k && v) env[k.trim()] = v.trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetReportDate() {
  const { data: config } = await supabase
    .from("configuracion_automatico")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)

  if (config && config.length > 0) {
    const { error } = await supabase
      .from("configuracion_automatico")
      .update({ fecha_ultimo_reporte: null })
      .eq("id", config[0].id)

    if (error) {
      console.error("Error al resetear:", error)
    } else {
      console.log("✅ fecha_ultimo_reporte reseteado a NULL exitosamente.")
    }
  }
}

resetReportDate()
