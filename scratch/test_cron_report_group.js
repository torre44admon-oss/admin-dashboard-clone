const fetch = require('node-fetch')

async function testReport() {
  try {
    const res = await fetch('http://localhost:3000/api/cron-report?manual=true')
    const json = await res.json()
    console.log('Respuesta del reporte:', JSON.stringify(json, null, 2))
  } catch (err) {
    console.error('Error al probar:', err.message)
  }
}

testReport()
