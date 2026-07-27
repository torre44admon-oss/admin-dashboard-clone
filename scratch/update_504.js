process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function update504Data() {
  console.log("=== ACTUALIZANDO DATOS DEL APARTAMENTO 504 ===")

  // 1. Marcar proyecto pintura como pagado
  const { data: proyData, error: errProy } = await supabase
    .from('portafolio_proyectos')
    .update({ estado: 'Pagado' })
    .eq('unidad', '504')
    .select()

  console.log("1. Proyecto Pintura marcado como Pagado:", proyData || errProy)

  // 2. Dejar cartera anterior en 0
  const { data: cartData, error: errCart } = await supabase
    .from('cartera')
    .update({ deuda: 0 })
    .eq('unidad', '504')
    .select()

  console.log("2. Cartera anterior dejada en 0:", cartData || errCart)
}

update504Data()
