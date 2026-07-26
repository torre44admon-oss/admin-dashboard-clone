const fs = require('fs')
const path = require('path')

function searchSqlFiles(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const fullPath = path.join(dir, f)
    if (f.endsWith('.sql') || f.endsWith('.json') || f.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        if (content.includes('unidades') && (content.includes('insert') || content.includes('INSERT') || content.includes('propietario'))) {
          console.log(`=== ENCONTRADO EN: ${fullPath} ===`)
          console.log(content.slice(0, 1500))
        }
      } catch (e) {}
    }
  }
}

searchSqlFiles('C:\\Users\\Perdomo G\\Downloads\\admin-dashboard-clone')
searchSqlFiles('C:\\Users\\Perdomo G\\Downloads\\admin-dashboard-clone\\scratch')
searchSqlFiles('C:\\Users\\Perdomo G\\Downloads')
