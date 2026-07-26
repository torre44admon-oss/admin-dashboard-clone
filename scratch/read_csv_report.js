const fs = require('fs')

try {
  const content = fs.readFileSync('C:\\Users\\Perdomo G\\Downloads\\reporte-cartera-condominio-torre-44-2026-07-14.csv', 'utf8')
  console.log("=== CONTENIDO DE REPORTE CARTERA CSV (14 JULIO 2026) ===")
  console.log(content)
} catch (e) {
  console.error("Error al leer CSV:", e.message)
}
