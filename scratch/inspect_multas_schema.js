process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function getMultasColumns() {
  const { data, error } = await supabase.from('multas').insert([{ test_dummy: 1 }])
  console.log("Error con columnas reales:", error.message)
}

getMultasColumns()
