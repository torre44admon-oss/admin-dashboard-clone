process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function addProyecto204() {
  console.log("=== AGREGANDO PROYECTO DE $25.000 AL APARTAMENTO 204 ===")

  // 1. Actualizar el proyecto existente o crear un nuevo registro de $25.000 para el 204
  const { data: proyExist } = await supabase
    .from('portafolio_proyectos')
    .select('id')
    .eq('unidad', '204')
    .eq('estado', 'Pendiente')

  if (proyExist && proyExist.length > 0) {
    await supabase
      .from('portafolio_proyectos')
      .update({ valor: 25000, proyecto: 'Proyecto Cuota ($25.000)' })
      .eq('id', proyExist[0].id)
  } else {
    await supabase
      .from('portafolio_proyectos')
      .insert([{
        unidad: '204',
        propietario: 'Luisa Irene Quintero',
        proyecto: 'Proyecto Cuota ($25.000)',
        valor: 25000,
        estado: 'Pendiente',
        fecha: '2026-07-26'
      }])
  }

  console.log("✅ Proyecto de $25.000 registrado con éxito para el Apartamento 204.")
}

addProyecto204()
