require('dotenv').config()
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const express = require('express')
const qrcode = require('qrcode')
const P = require('pino')
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

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

// ── Adaptador de Auth Persistente con Supabase ───────────────────
let supabase = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
}

async function useSupabaseAuthState() {
  if (!supabase) {
    console.log('⚠️ Sin variables de Supabase en el bot, usando auth local de disco.')
    return useMultiFileAuthState('auth_info_baileys')
  }

  const readData = async (id) => {
    try {
      const { data, error } = await supabase.from('bot_auth_session').select('data').eq('id', id).single()
      if (error || !data) return null
      return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver)
    } catch {
      return null
    }
  }

  const writeData = async (id, value) => {
    try {
      const serialized = JSON.parse(JSON.stringify(value, BufferJSON.replacer))
      await supabase.from('bot_auth_session').upsert({ id, data: serialized, updated_at: new Date().toISOString() })
    } catch (e) {
      console.error('Error guardando creds en Supabase:', e.message)
    }
  }

  const removeData = async (id) => {
    try {
      await supabase.from('bot_auth_session').delete().eq('id', id)
    } catch (e) {
      console.error('Error borrando creds de Supabase:', e.message)
    }
  }

  const creds = (await readData('creds')) || initAuthCreds()

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {}
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`)
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value)
              }
              if (value) data[id] = value
            })
          )
          return data
        },
        set: async (data) => {
          const tasks = []
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id]
              const key = `${category}-${id}`
              if (value) tasks.push(writeData(key, value))
              else tasks.push(removeData(key))
            }
          }
          await Promise.all(tasks)
        }
      }
    },
    saveCreds: async () => {
      await writeData('creds', creds)
    }
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useSupabaseAuthState()
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

// Estado de la conexión
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    status: connectionStatus,
    hasQr: !!qrCodeData
  })
})

// QR para escanear
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

// Listar grupos disponibles
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

// Desconectar / cerrar sesión
app.post('/logout', checkApiKey, async (req, res) => {
  try {
    if (sock) await sock.logout()
    isConnected = false
    connectionStatus = 'logged_out'
    qrCodeData = null
    if (supabase) {
      await supabase.from('bot_auth_session').delete().neq('id', 'null')
    }
    res.json({ success: true, message: 'Sesión cerrada. Recarga /qr para conectar nuevo número.' })
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
