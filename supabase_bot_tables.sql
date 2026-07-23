-- ============================================================
-- TABLA: configuracion_bot
-- Guarda la configuración del bot de WhatsApp para el grupo.
-- El grupo_whatsapp_id NO cambia si cambia el número conectado.
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion_bot (
  id SERIAL PRIMARY KEY,
  railway_bot_url TEXT,          -- URL del servidor Railway ej: https://xxx.up.railway.app
  bot_api_key TEXT,              -- Clave secreta para proteger los endpoints del bot
  grupo_whatsapp_id TEXT,        -- ID del grupo ej: 120363...@g.us (se guarda permanentemente)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE configuracion_bot ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo (igual que las demás tablas del sistema)
CREATE POLICY "Allow all operations on configuracion_bot"
  ON configuracion_bot
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLA: comunicados
-- Historial de comunicados enviados al grupo de WhatsApp.
-- ============================================================

CREATE TABLE IF NOT EXISTS comunicados (
  id SERIAL PRIMARY KEY,
  mensaje TEXT NOT NULL,
  enviado_en TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo
CREATE POLICY "Allow all operations on comunicados"
  ON comunicados
  FOR ALL
  USING (true)
  WITH CHECK (true);
