process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTelefonoAdmin() {
  console.log("=== BUSCANDO TELÉFONO 3014130109 EN SUPABASE ===")

  const { data: unidades, error } = await supabase.from('unidades').select('*')

  if (error) {
    console.error("Error al consultar unidades:", error)
    return
  }

  const coincidencia = unidades.filter(u => String(u.telefono).includes("3014130109"))

  console.log(`Búsqueda para '3014130109': Encontradas ${coincidencia.length} unidades:`)
  console.log(coincidencia)

  console.log("\nLista completa de teléfonos en la tabla 'unidades':")
  unidades.forEach(u => {
    console.log(`- Apto ${u.unidad}: Propietario='${u.propietario}', Teléfono='${u.telefono}'`)
  })
}

checkTelefonoAdmin()
