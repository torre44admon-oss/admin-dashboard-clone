const fs = require('fs')

const transcriptPath = 'C:\\Users\\Perdomo G\\.gemini\\antigravity\\brain\\e504d9ff-a5f0-4388-a1c6-e9035c51539f\\.system_generated\\logs\\transcript.jsonl'

try {
  const content = fs.readFileSync(transcriptPath, 'utf8')
  const lines = content.split('\n')
  console.log(`Buscando en ${lines.length} líneas de la conversación...`)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('unidades') && (line.includes('INSERT') || line.includes('insert') || line.includes('propietario') || line.includes('sql'))) {
      console.log(`--- ENCONTRADO EN LÍNEA ${i + 1} ---`)
      console.log(line.slice(0, 1000))
    }
  }
} catch (e) {
  console.error("Error al leer transcript:", e.message)
}
