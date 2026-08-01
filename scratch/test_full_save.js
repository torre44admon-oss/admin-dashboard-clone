process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFullSave() {
  console.log("=== COMPROBANDO GUARDADO EN SUPABASE CON FALLBACK Y SIN FALLA ===")

  const comunicadoRecord = {
    mensaje: "Comunicado oficial de prueba guardado en Supabase",
    enviado_en: new Date().toISOString()
  }

  const { data, error } = await supabase.from("comunicados").insert([comunicadoRecord]).select()
  console.log("Resultado de guardado:", data || error)
}

testFullSave()
