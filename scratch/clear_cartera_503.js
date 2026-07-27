process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function clearCartera503() {
  console.log("=== BORRANDO SALDO DE CARTERA ANTERIOR PARA EL APARTAMENTO 503 ===")

  // Eliminar o poner en 0 la deuda en cartera del 503
  const { data, error } = await supabase
    .from('cartera')
    .update({ deuda: 0 })
    .eq('unidad', '503')
    .select()

  if (error) {
    console.error("Error al actualizar cartera 503:", error)
  } else {
    console.log("✅ Cartera anterior del 503 dejada en $0:", data)
  }
}

clearCartera503()
