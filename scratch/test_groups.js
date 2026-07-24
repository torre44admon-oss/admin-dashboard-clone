const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

const options = {
  hostname: 'whatsapp-bot-y44i.onrender.com',
  path: '/groups',
  method: 'GET',
  headers: {
    'x-api-key': 'torre44grupo2026'
  },
  agent
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => console.log('RESPONSE GROUPS:', res.statusCode, data))
})

req.on('error', (err) => console.error('ERROR:', err.message))
req.end()
