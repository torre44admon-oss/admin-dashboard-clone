process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createComunicadosTable() {
  console.log("=== INTENTANDO CREAR LA TABLA COMUNICADOS EN SUPABASE ===")

  // Intentar crear mediante query sql rpc si existe o insertar primer registro mock
  const { data, error } = await supabase.from('comunicados').insert([
    {
      mensaje: "Comunicado de prueba inicial",
      enviado_en: new Date().toISOString()
    }
  ]).select()

  if (error) {
    console.log("Respuesta de la BD:", error)
  } else {
    console.log("✅ Tabla comunicados funcional en Supabase:", data)
  }
}

createComunicadosTable()
