process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedAutoConfig() {
  console.log("Insertando/Actualizando configuración automática con día 24 en Supabase...")
  const { data: exist } = await supabase.from("configuracion_automatico").select("id").limit(1)

  if (exist && exist.length > 0) {
    const { data, error } = await supabase.from("configuracion_automatico").update({
      dia_reporte_automatico: 24,
      hora_reporte_automatico: "10:35",
      telefono_reportes: JSON.stringify([{ phone: "573014130109", reports: true, commands: true }]),
      fecha_ultimo_reporte: null
    }).eq("id", exist[0].id).select()
    console.log("✅ Fila actualizada:", data, error)
  } else {
    const { data, error } = await supabase.from("configuracion_automatico").insert([{
      dia_reporte_automatico: 24,
      hora_reporte_automatico: "10:35",
      telefono_reportes: JSON.stringify([{ phone: "573014130109", reports: true, commands: true }]),
      fecha_ultimo_reporte: null
    }]).select()
    console.log("✅ Fila insertada:", data, error)
  }
}

seedAutoConfig()
