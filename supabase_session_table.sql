-- Tabla para guardar la sesión del bot de WhatsApp (Baileys) de forma persistente
CREATE TABLE IF NOT EXISTS bot_auth_session (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE bot_auth_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on bot_auth_session"
  ON bot_auth_session
  FOR ALL
  USING (true)
  WITH CHECK (true);
