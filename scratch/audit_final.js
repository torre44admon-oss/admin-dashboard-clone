process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function auditBuildingState() {
  console.log("=== AUDITORÍA DEFINITIVA DE LA TORRE 44 ===")

  // 1. Mensualidades pendientes
  const { data: mens } = await supabase.from('mensualidades').select('*').eq('estado', 'Pendiente')
  let sumMens = 0
  const mapaMens = {}
  if (mens) {
    mens.forEach(m => {
      sumMens += Number(m.valor) || 0
      if (!mapaMens[m.unidad]) mapaMens[m.unidad] = []
      mapaMens[m.unidad].push(m.mes)
    })
  }

  // 2. Cartera anterior
  const { data: cart } = await supabase.from('cartera').select('*')
  let sumCart = 0
  const mapaCart = {}
  if (cart) {
    cart.forEach(c => {
      const v = Number(c.deuda) || 0
      if (v > 0) {
        sumCart += v
        mapaCart[c.unidad] = v
      }
    })
  }

  // 3. Proyectos pendientes
  const { data: proy } = await supabase.from('portafolio_proyectos').select('*').eq('estado', 'Pendiente')
  let sumProy = 0
  const mapaProy = {}
  if (proy) {
    proy.forEach(p => {
      sumProy += Number(p.valor) || 0
      if (!mapaProy[p.unidad]) mapaProy[p.unidad] = []
      mapaProy[p.unidad].push(p.proyecto)
    })
  }

  // 4. Multas pendientes
  const { data: mult } = await supabase.from('portafolio_multas').select('*').in('estado', ['Pendiente', 'Vencida'])
  let sumMult = 0
  const mapaMult = {}
  if (mult) {
    mult.forEach(m => {
      sumMult += Number(m.valor) || 0
      if (!mapaMult[m.unidad]) mapaMult[m.unidad] = []
      mapaMult[m.unidad].push(m.tipo_multa)
    })
  }

  const totalGeneral = sumMens + sumCart + sumProy + sumMult

  console.log(`\nRESUMEN DE RECAUDACIÓN Y DEUDAS:`)
  console.log(`• Cartera Anterior: $${sumCart.toLocaleString('es-CO')}`)
  console.log(`• Mensualidades Vencidas: $${sumMens.toLocaleString('es-CO')}`)
  console.log(`• Proyectos Pendientes: $${sumProy.toLocaleString('es-CO')}`)
  console.log(`• Multas Pendientes: $${sumMult.toLocaleString('es-CO')}`)
  console.log(`----------------------------------------`)
  console.log(`💰 DEUDA TOTAL COPROPIEDAD: $${totalGeneral.toLocaleString('es-CO')}\n`)

  console.log("DESGLOSE POR APARTAMENTO:")
  const { data: unidades } = await supabase.from('unidades').select('unidad, propietario').order('unidad')
  if (unidades) {
    unidades.forEach(u => {
      const mList = mapaMens[u.unidad] || []
      const cVal = mapaCart[u.unidad] || 0
      const pList = mapaProy[u.unidad] || []
      const muList = mapaMult[u.unidad] || []

      if (mList.length > 0 || cVal > 0 || pList.length > 0 || muList.length > 0) {
        console.log(`• Apto ${u.unidad} (${u.propietario}): ${mList.length > 0 ? 'Cuotas: ' + mList.join(', ') + ' | ' : ''}${cVal > 0 ? 'Cartera Ant: $' + cVal.toLocaleString('es-CO') + ' | ' : ''}${pList.length > 0 ? 'Proyectos: ' + pList.join(', ') + ' | ' : ''}${muList.length > 0 ? 'Multas: ' + muList.join(', ') : ''}`)
      } else {
        console.log(`• Apto ${u.unidad} (${u.propietario}): ✅ AL DÍA`)
      }
    })
  }
}

auditBuildingState()
