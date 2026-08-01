process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkComunicadosTable() {
  console.log("=== COMPROBANDO TABLA COMUNICADOS ===")

  const { data, error } = await supabase.from("comunicados").select("*")
  if (error) {
    console.error("Error al consultar la tabla comunicados:", error)
  } else {
    console.log("Registros actuales en comunicados:", data)
  }
}

checkComunicadosTable()
