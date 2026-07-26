process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

const multasCat = [
  {
    t: "Ruido",
    d: "Límites: 65 dB día / 55 dB noche.",
    m: "$ 35,000"
  },
  {
    t: "Basuras",
    d: "Incumplimiento en el manejo de residuos y horarios de recolección.",
    m: "$ 35,000"
  },
  {
    t: "Mascotas",
    d: "Incumplimiento de normas para mascotas.",
    m: "$ 35,000"
  },
  {
    t: "Aseo",
    d: "Incumplimiento de aseo o no firmar la planilla de asistencia.",
    m: "$ 35,000"
  }
]

async function seedMultas() {
  console.log("=== INGRESANDO CATÁLOGO DE MULTAS EN SUPABASE ===")

  await supabase.from("multas").delete().neq("id", 0)

  const { data, error } = await supabase.from("multas").insert(multasCat).select()

  if (error) {
    console.error("❌ Error al insertar multas:", error.message)
  } else {
    console.log(`✅ ¡ÉXITO! Se ingresaron ${data.length} multas al catálogo de Supabase:`)
    data.forEach(item => console.log(`  - ${item.t}: ${item.m} (${item.d})`))
  }
}

seedMultas()
