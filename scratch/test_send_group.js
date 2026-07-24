const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

// Probemos enviar al grupo "A" (ID: 120363430427886761@g.us)
const bodyData = JSON.stringify({
  groupId: '120363430427886761@g.us',
  message: '📢 *PRUEBA DE BOT GRUPO*\nEl bot de WhatsApp para el condominio está funcionando perfectamente.'
})

const options = {
  hostname: 'whatsapp-bot-y44i.onrender.com',
  path: '/send-group',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'torre44grupo2026',
    'Content-Length': Buffer.byteLength(bodyData)
  },
  agent
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => console.log('RESPONSE SEND GROUP:', res.statusCode, data))
})

req.on('error', (err) => console.error('ERROR SEND GROUP:', err.message))
req.write(bodyData)
req.end()
