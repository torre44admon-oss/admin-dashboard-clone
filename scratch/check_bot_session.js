process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSessionRows() {
  const { data, error } = await supabase.from('bot_auth_session').select('id, updated_at')
  console.log('FILAS EN bot_auth_session:', data ? data.length : 0, error)
  if (data) console.log(data)
}

checkSessionRows()
