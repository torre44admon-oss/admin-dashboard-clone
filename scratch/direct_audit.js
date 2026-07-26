process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function runDirectAudit() {
  console.log("=== INICIANDO AUDITORÍA DIRECTA DE SOLO LECTURA ===")

  // 1. Unidades
  const { data: unidades } = await supabase.from('unidades').select('*').order('unidad')
  console.log(`\n1. UNIDADES: ${unidades ? unidades.length : 0} apartamentos registrados.`)

  // 2. Mensualidades
  const { data: mensualidades } = await supabase.from('mensualidades').select('*').order('unidad')
  console.log(`\n2. MENSUALIDADES: ${mensualidades ? mensualidades.length : 0} registros encontrados.`)
  if (mensualidades) {
    const pend = mensualidades.filter(m => m.estado === 'Pendiente')
    const pag = mensualidades.filter(m => m.estado === 'Pagado')
    console.log(`   - Pendientes: ${pend.length}`)
    console.log(`   - Pagadas: ${pag.length}`)
  }

  // 3. Cartera
  const { data: cartera } = await supabase.from('cartera').select('*').order('unidad')
  console.log(`\n3. CARTERA ANTERIOR: ${cartera ? cartera.length : 0} registros en cartera.`)
  if (cartera) {
    cartera.forEach(c => console.log(`   - Apt ${c.unidad}: $${Number(c.deuda || c.saldo_anterior || 0).toLocaleString('es-CO')}`))
  }

  // 4. Multas y Proyectos
  const { data: multas } = await supabase.from('multas').select('*')
  const { data: proyectos } = await supabase.from('proyectos').select('*')
  console.log(`\n4. CATÁLOGOS:`)
  console.log(`   - Multas: ${multas ? multas.length : 0} items (${multas ? multas.map(m => m.t).join(', ') : ''})`)
  console.log(`   - Proyectos: ${proyectos ? proyectos.length : 0} items (${proyectos ? proyectos.map(p => p.t).join(', ') : ''})`)

  // 5. Bot status
  const { data: botConfig } = await supabase.from('configuracion_bot').select('*').limit(1)
  console.log(`\n5. CONFIGURACIÓN DEL BOT:`, botConfig ? botConfig[0] : 'Sin registro')
}

runDirectAudit()
