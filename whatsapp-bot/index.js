require('dotenv').config()
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const express = require('express')
const qrcode = require('qrcode')
const P = require('pino')
const path = require('path')

const app = express()
app.use(express.json())

// Habilitar CORS para que el panel web pueda llamar al bot
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

let sock = null
let qrCodeData = null
let isConnected = false
let connectionStatus = 'disconnected'

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Torre44 Bot', 'Chrome', '1.0.0'],
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      qrCodeData = await qrcode.toDataURL(qr)
      isConnected = false
      connectionStatus = 'waiting_qr'
      console.log('QR generado - escanea en /qr')
    }

    if (connection === 'close') {
      isConnected = false
      connectionStatus = 'disconnected'
      qrCodeData = null
      const statusCode = (lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log('Conexión cerrada. Código:', statusCode, '| Reconectar:', shouldReconnect)
      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 5000)
      } else {
        connectionStatus = 'logged_out'
      }
    } else if (connection === 'open') {
      isConnected = true
      connectionStatus = 'connected'
      qrCodeData = null
      console.log('✅ Conectado a WhatsApp!')
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

// ── Middleware de seguridad ──────────────────────────────────────
function checkApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apiKey || req.body?.apiKey
  if (key !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  next()
}

// ── Endpoints ───────────────────────────────────────────────────

// Estado de la conexión (sin clave - para el panel)
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    status: connectionStatus,
    hasQr: !!qrCodeData
  })
})

// QR para escanear (sin clave - para el panel)
app.get('/qr', (req, res) => {
  if (isConnected) {
    return res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px">
        <h2 style="color:#22c55e">✅ Ya conectado a WhatsApp</h2>
        <p>El bot está activo y listo para enviar mensajes al grupo.</p>
      </body></html>
    `)
  }
  if (!qrCodeData) {
    return res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px">
        <h2>⏳ Generando QR...</h2>
        <p>Espera unos segundos y recarga esta página.</p>
        <script>setTimeout(()=>location.reload(), 3000)</script>
      </body></html>
    `)
  }
  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0b0f19;color:white">
      <h2 style="color:#60a5fa">📱 Escanea este QR con WhatsApp</h2>
      <p style="color:#94a3b8">Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo</p>
      <img src="${qrCodeData}" style="width:280px;border-radius:16px;margin:20px auto;display:block"/>
      <p style="color:#64748b;font-size:14px">Esta página se actualiza automáticamente</p>
      <script>setTimeout(()=>location.reload(), 8000)</script>
    </body></html>
  `)
})

// Listar grupos disponibles del número conectado
app.get('/groups', checkApiKey, async (req, res) => {
  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'Bot no conectado', connected: false })
  }
  try {
    const groups = await sock.groupFetchAllParticipating()
    const list = Object.entries(groups).map(([id, g]) => ({
      id,
      name: g.subject,
      participants: g.participants?.length || 0
    }))
    list.sort((a, b) => a.name.localeCompare(b.name))
    res.json({ connected: true, groups: list })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Enviar mensaje de texto al grupo
app.post('/send-group', checkApiKey, async (req, res) => {
  const { groupId, message } = req.body

  if (!groupId || !message) {
    return res.status(400).json({ error: 'Faltan groupId o message' })
  }
  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'Bot no conectado', connected: false })
  }
  try {
    await sock.sendMessage(groupId, { text: message })
    res.json({ success: true, groupId })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Desconectar / cerrar sesión (para reconectar con otro número)
app.post('/logout', checkApiKey, async (req, res) => {
  try {
    if (sock) await sock.logout()
    isConnected = false
    connectionStatus = 'logged_out'
    qrCodeData = null
    res.json({ success: true, message: 'Sesión cerrada. Recarga /qr para conectar nuevo número.' })
    // Reconectar para generar nuevo QR
    setTimeout(connectToWhatsApp, 3000)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Iniciar servidor ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🤖 Bot servidor corriendo en puerto ${PORT}`)
  connectToWhatsApp()
})
