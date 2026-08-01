process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseComunicados() {
  console.log("=== PROBANDO INSERCIÓN DIRECTA EN TABLA COMUNICADOS ===")

  const { data, error } = await supabase
    .from('comunicados')
    .insert([
      {
        mensaje: "Prueba de guardado directo en Supabase",
        enviado_en: new Date().toISOString()
      }
    ])
    .select()

  if (error) {
    console.error("Detalle del error en Supabase:", error)
  } else {
    console.log("✅ Inserción exitosa en Supabase:", data)
  }
}

testSupabaseComunicados()
