process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function removeFuturosMeses() {
  console.log("=== ELIMINANDO MESES POSTERIORES A JULIO 2026 DE LA BD ===")

  // Eliminar cuotas de Agosto en adelante para que no aparezca nada de Agosto
  const { data, error } = await supabase
    .from('mensualidades')
    .delete()
    .in('mes', ['Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'])
    .select()

  if (error) {
    console.error("Error al eliminar futuros meses:", error)
  } else {
    console.log("✅ Cuotas futuras de Agosto a Diciembre eliminadas con éxito:", data)
  }
}

removeFuturosMeses()
