process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function upsertCartera204() {
  const { data: exist } = await supabase.from('cartera').select('id').eq('unidad', '204').maybeSingle()
  
  if (exist) {
    await supabase.from('cartera').update({ deuda: 205000 }).eq('unidad', '204')
  } else {
    await supabase.from('cartera').insert([{ unidad: '204', deuda: 205000 }])
  }
  console.log("✅ Cartera anterior de $205.000 asegurada para el Apt 204.")
}

upsertCartera204()
