process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function syncAllApartmentMensualidades() {
  console.log("=== SINCRONIZANDO ESTADO EXACTO DE LAS MENSUALIDADES DE LOS 20 APARTAMENTOS ===")

  // 1. Apartamentos Al Día (301, 102, 303, 403, 402, 601, 502)
  const alDia = ["301", "102", "303", "403", "402", "601", "502"]
  const mesesHastaJulio = [
    { mes: "Marzo", anio: "2026" },
    { mes: "Abril", anio: "2026" },
    { mes: "Mayo", anio: "2026" },
    { mes: "Junio", anio: "2026" },
    { mes: "Julio", anio: "2026" }
  ]

  for (const u of alDia) {
    for (const m of mesesHastaJulio) {
      const { data: exist } = await supabase.from('mensualidades').select('id').eq('unidad', u).eq('mes', m.mes).eq('anio', m.anio).single()
      if (exist) {
        await supabase.from('mensualidades').update({ estado: 'Pagado', fecha_pago: '2026-07-05' }).eq('id', exist.id)
      } else {
        await supabase.from('mensualidades').insert([{ unidad: u, mes: m.mes, anio: m.anio, valor: 20000, estado: 'Pagado', fecha_limite: '2026-07-05', fecha_pago: '2026-07-05' }])
      }
    }
    console.log(`✅ Apt ${u}: Marcad@ como AL DÍA (Marzo a Julio Pagados).`)
  }

  // 2. Deben Junio y Julio (201, 501, 503, 504)
  const debenJunioJulio = ["201", "501", "503", "504"]
  for (const u of debenJunioJulio) {
    // Meses pasados (Marzo, Abril, Mayo) al día
    for (const m of [{ mes: "Marzo", anio: "2026" }, { mes: "Abril", anio: "2026" }, { mes: "Mayo", anio: "2026" }]) {
      const { data: exist } = await supabase.from('mensualidades').select('id').eq('unidad', u).eq('mes', m.mes).eq('anio', m.anio).single()
      if (exist) {
        await supabase.from('mensualidades').update({ estado: 'Pagado', fecha_pago: '2026-05-05' }).eq('id', exist.id)
      } else {
        await supabase.from('mensualidades').insert([{ unidad: u, mes: m.mes, anio: m.anio, valor: 20000, estado: 'Pagado', fecha_limite: '2026-05-05', fecha_pago: '2026-05-05' }])
      }
    }
    // Junio y Julio pendientes
    for (const m of [{ mes: "Junio", anio: "2026", fecha_limite: "2026-06-05" }, { mes: "Julio", anio: "2026", fecha_limite: "2026-07-05" }]) {
      const { data: exist } = await supabase.from('mensualidades').select('id').eq('unidad', u).eq('mes', m.mes).eq('anio', m.anio).single()
      if (exist) {
        await supabase.from('mensualidades').update({ estado: 'Pendiente', fecha_pago: null }).eq('id', exist.id)
      } else {
        await supabase.from('mensualidades').insert([{ unidad: u, mes: m.mes, anio: m.anio, valor: 20000, estado: 'Pendiente', fecha_limite: m.fecha_limite }])
      }
    }
    console.log(`✅ Apt ${u}: Registrad@ debiendo Junio y Julio (Pasados pagados).`)
  }

  // 3. Apartamento 401 (Exento hasta Diciembre 2026)
  const mesesAño = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  for (const mes of mesesAño) {
    const { data: exist } = await supabase.from('mensualidades').select('id').eq('unidad', '401').eq('mes', mes).eq('anio', '2026').single()
    if (exist) {
      await supabase.from('mensualidades').update({ estado: 'Pagado', fecha_pago: '2026-01-01' }).eq('id', exist.id)
    } else {
      await supabase.from('mensualidades').insert([{ unidad: '401', mes: mes, anio: '2026', valor: 20000, estado: 'Pagado', fecha_limite: '2026-01-01', fecha_pago: '2026-01-01' }])
    }
  }
  console.log(`✅ Apt 401: Configurado como EXENTO / AL DÍA hasta Diciembre 2026.`)

  // 4. El resto de apartamentos no mencionados (deben únicamente Julio 2026)
  // No incluidos arriba, ni 404, ni 203, 204
  const omitidos = ["301", "102", "303", "403", "402", "601", "502", "201", "501", "503", "504", "404", "401", "203", "204"]
  const { data: todasUnidades } = await supabase.from('unidades').select('unidad')
  const unidadesRestantes = (todasUnidades || []).map(u => u.unidad).filter(u => !omitidos.includes(u))

  for (const u of unidadesRestantes) {
    // Meses pasados (Marzo a Junio) al día
    for (const m of [{ mes: "Marzo", anio: "2026" }, { mes: "Abril", anio: "2026" }, { mes: "Mayo", anio: "2026" }, { mes: "Junio", anio: "2026" }]) {
      const { data: exist } = await supabase.from('mensualidades').select('id').eq('unidad', u).eq('mes', m.mes).eq('anio', m.anio).single()
      if (exist) {
        await supabase.from('mensualidades').update({ estado: 'Pagado', fecha_pago: '2026-06-05' }).eq('id', exist.id)
      } else {
        await supabase.from('mensualidades').insert([{ unidad: u, mes: m.mes, anio: m.anio, valor: 20000, estado: 'Pagado', fecha_limite: '2026-06-05', fecha_pago: '2026-06-05' }])
      }
    }
    // Julio pendiente
    const { data: existJulio } = await supabase.from('mensualidades').select('id').eq('unidad', u).eq('mes', 'Julio').eq('anio', '2026').single()
    if (existJulio) {
      await supabase.from('mensualidades').update({ estado: 'Pendiente', fecha_pago: null }).eq('id', existJulio.id)
    } else {
      await supabase.from('mensualidades').insert([{ unidad: u, mes: 'Julio', anio: '2026', valor: 20000, estado: 'Pendiente', fecha_limite: '2026-07-05' }])
    }
    console.log(`✅ Apt ${u}: Debe únicamente el mes de Julio 2026 (Meses pasados pagados).`)
  }
}

syncAllApartmentMensualidades()
