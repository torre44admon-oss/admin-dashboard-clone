const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

https.get('https://whatsapp-bot-y44i.onrender.com/status', { agent }, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => console.log('STATUS RENDER:', data))
}).on('error', (err) => console.error('ERROR RENDER:', err.message))
