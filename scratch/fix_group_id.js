process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateBotGroupId() {
  console.log("=== ACTUALIZANDO ID DEL GRUPO DE WHATSAPP EN SUPABASE ===")
  const nuevoGroupId = "120363406735377823@g.us"

  const { data, error } = await supabase
    .from('configuracion_bot')
    .update({ grupo_whatsapp_id: nuevoGroupId, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()

  if (error) {
    console.error("❌ Error al actualizar el grupo:", error.message)
  } else {
    console.log("✅ ¡ÉXITO! ID de grupo actualizado a:", nuevoGroupId)
  }
}

updateBotGroupId()
