process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function update503JunioPaid() {
  console.log("=== MARCANDO JUNIO 2026 COMO PAGADO PARA EL APARTAMENTO 503 ===")

  // Actualizar la cuota de Junio del 503 a Pagado
  const { data, error } = await supabase
    .from('mensualidades')
    .update({ estado: 'Pagado', fecha_pago: '2026-06-05' })
    .eq('unidad', '503')
    .eq('mes', 'Junio')
    .eq('anio', '2026')
    .select()

  if (error) {
    console.error("Error al actualizar 503:", error)
  } else {
    console.log("✅ Apartamento 503 actualizado con éxito. Junio pagado:", data)
  }
}

update503JunioPaid()
