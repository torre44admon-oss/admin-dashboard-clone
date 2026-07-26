process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

const unidades = [
  { unidad: "101", piso: 1, propietario: "Teresa Zuares", telefono: "3187180464", email: "" },
  { unidad: "102", piso: 1, propietario: "Maricela Marin", telefono: "3106592953", email: "" },
  { unidad: "201", piso: 2, propietario: "Milvia", telefono: "3184031659", email: "" },
  { unidad: "202", piso: 2, propietario: "Ninfa", telefono: "3027689589", email: "" },
  { unidad: "203", piso: 2, propietario: "Derli Quiñones Prado", telefono: "3224632692", email: "" },
  { unidad: "204", piso: 2, propietario: "Luisa Irene Quintero", telefono: "1111111111", email: "" },
  { unidad: "301", piso: 3, propietario: "Gloria Amparo Arias", telefono: "3164873322", email: "" },
  { unidad: "302", piso: 3, propietario: "Ivonne Patricia", telefono: "3234597239", email: "" },
  { unidad: "303", piso: 3, propietario: "Sandra Rodriguez", telefono: "3045860844", email: "" },
  { unidad: "304", piso: 3, propietario: "Dilio Lucumi Carabali", telefono: "3183868413", email: "" },
  { unidad: "401", piso: 4, propietario: "Maria Leny Sanchez Orosco", telefono: "3146475345", email: "" },
  { unidad: "402", piso: 4, propietario: "Nury Patricia Garcez", telefono: "3117751654", email: "" },
  { unidad: "403", piso: 4, propietario: "Jhaneth Solartemeza", telefono: "3152127700", email: "" },
  { unidad: "404", piso: 4, propietario: "Luis Adrian Londoño", telefono: "3181839748", email: "" },
  { unidad: "501", piso: 5, propietario: "Julio Cesar Castillo", telefono: "3244920382", email: "" },
  { unidad: "502", piso: 5, propietario: "Merli Maria Vallejo", telefono: "3202490200", email: "" },
  { unidad: "503", piso: 5, propietario: "Jhaneth Tulande", telefono: "3127023800", email: "" },
  { unidad: "504", piso: 5, propietario: "Fredy Rivera Plaza", telefono: "3116042094", email: "" },
  { unidad: "601", piso: 6, propietario: "Luis Javier Vidal", telefono: "3116790321", email: "" },
  { unidad: "602", piso: 6, propietario: "Milena Fajardo Fajardo", telefono: "3222795465", email: "" }
]

async function insertAllPropietarios() {
  console.log("=== INSERTANDO LOS 20 PROPIETARIOS REALES DE TORRE 44 EN SUPABASE ===")

  // Limpiar primero unidades de prueba si las hay
  await supabase.from("unidades").delete().neq("unidad", "")

  const { data, error } = await supabase.from("unidades").insert(unidades).select()

  if (error) {
    console.error("❌ Error insertando propietarios:", error.message)
  } else {
    console.log(`✅ ¡ÉXITO! Se insertaron los ${data.length} propietarios reales en Supabase:`)
    data.forEach(u => console.log(`  - Apt ${u.unidad}: ${u.propietario} (${u.telefono})`))
  }
}

insertAllPropietarios()
