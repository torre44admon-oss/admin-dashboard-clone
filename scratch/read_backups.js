const fs = require('fs')

try {
  const f1 = fs.readFileSync('C:\\Users\\Perdomo G\\Downloads\\respaldo-condominio-torre-44-2026-07-11.json', 'utf8')
  console.log("=== CONTENIDO DE RESPALDO 2026-07-11 ===")
  console.log(f1)
} catch (e) {
  console.error("Error f1:", e.message)
}

try {
  const f2 = fs.readFileSync('C:\\Users\\Perdomo G\\Downloads\\respaldo-condominio-torre-44-2026-07-14.json', 'utf8')
  console.log("=== CONTENIDO DE RESPALDO 2026-07-14 ===")
  console.log(f2)
} catch (e) {
  console.error("Error f2:", e.message)
}
