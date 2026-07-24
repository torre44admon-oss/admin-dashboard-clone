const https = require('https')

const agent = new https.Agent({ rejectUnauthorized: false })

https.get('https://admin-dashboard-clone-9rp4.vercel.app/api/cron-report', { agent }, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => console.log('RESPONSE API CRON REPORT:\n', data))
}).on('error', (err) => console.error('ERROR API CRON REPORT:', err.message))
