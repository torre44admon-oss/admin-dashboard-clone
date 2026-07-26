process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

const proyectosCat = [
  {
    t: "Pintura",
    d: "Adecuación y pintura de zonas comunes.",
    p: "$ 75,000"
  }
]

async function seedProyectos() {
  console.log("=== INGRESANDO CATÁLOGO DE PROYECTOS EN SUPABASE ===")

  await supabase.from("proyectos").delete().neq("id", 0)

  const { data, error } = await supabase.from("proyectos").insert(proyectosCat).select()

  if (error) {
    console.error("❌ Error al insertar proyectos:", error.message)
  } else {
    console.log(`✅ ¡ÉXITO! Se ingresaron ${data.length} proyectos al catálogo de Supabase:`)
    data.forEach(item => console.log(`  - ${item.t}: ${item.p} (${item.d})`))
  }
}

seedProyectos()
