-- ============================================
-- OpenClaw Mission Control - Supabase Schema
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para crear todas las tablas e índices necesarios
-- ============================================

-- Eliminar tablas si existen (solo para desarrollo)
-- ⚠️ CUIDADO: Esto borrará todos los datos
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS costs CASCADE;
-- DROP TABLE IF EXISTS logs CASCADE;

-- ============================================
-- Tabla de Tareas
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Tabla de Costos
-- ============================================
CREATE TABLE IF NOT EXISTS costs (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  category TEXT, -- Opcional: para categorizar costos
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tabla de Logs
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error')),
  source TEXT, -- Opcional: fuente del log (api, system, user, etc.)
  metadata JSONB, -- Opcional: datos adicionales en formato JSON
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Índices para optimizar consultas
-- ============================================

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC);

-- Costs
CREATE INDEX IF NOT EXISTS idx_costs_created_at ON costs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_costs_category ON costs(category);

-- Logs
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);

-- ============================================
-- Row Level Security (RLS) - Opcional
-- ============================================
-- Descomenta estas líneas si quieres habilitar RLS
-- y configurar políticas de acceso

-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Política de ejemplo: permitir todo al service role
-- CREATE POLICY "Service role can do everything on tasks"
--   ON tasks
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role can do everything on costs"
--   ON costs
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role can do everything on logs"
--   ON logs
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ============================================
-- Datos de ejemplo (opcional)
-- ============================================

-- Insertar tareas de ejemplo
INSERT INTO tasks (title, description, status) VALUES
  ('Configurar monitoreo de CPU', 'Implementar sistema de alertas cuando CPU > 80%', 'completed'),
  ('Optimizar consultas de base de datos', 'Reducir tiempo de respuesta de las queries principales', 'in_progress'),
  ('Documentar API endpoints', 'Crear documentación completa de todos los endpoints', 'pending'),
  ('Implementar caché Redis', 'Añadir capa de caché para reducir carga en DB', 'pending');

-- Insertar costos de ejemplo
INSERT INTO costs (amount, description, category) VALUES
  (29.99, 'Suscripción mensual Vercel Pro', 'infrastructure'),
  (25.00, 'Plan Supabase Pro', 'database'),
  (12.50, 'API calls OpenAI', 'ai'),
  (5.00, 'Domain registration', 'infrastructure');

-- Insertar logs de ejemplo
INSERT INTO logs (message, level, source) VALUES
  ('Sistema iniciado correctamente', 'info', 'system'),
  ('Alta carga detectada en servidor', 'warning', 'monitoring'),
  ('Conexión a base de datos establecida', 'info', 'database'),
  ('Error al procesar webhook', 'error', 'api'),
  ('Backup completado exitosamente', 'info', 'system');

-- ============================================
-- Vistas útiles (opcional)
-- ============================================

-- Vista de resumen de tareas
CREATE OR REPLACE VIEW tasks_summary AS
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM tasks
GROUP BY status;

-- Vista de costos por categoría
CREATE OR REPLACE VIEW costs_by_category AS
SELECT
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM costs
WHERE category IS NOT NULL
GROUP BY category
ORDER BY total_amount DESC;

-- Vista de logs por nivel
CREATE OR REPLACE VIEW logs_by_level AS
SELECT
  level,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM logs
GROUP BY level
ORDER BY count DESC;

-- ============================================
-- Funciones útiles
-- ============================================

-- Función para limpiar logs antiguos (> 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT cleanup_old_logs(30); -- Elimina logs de más de 30 días

-- ============================================
-- ✅ Schema creado exitosamente
-- ============================================
-- Ahora puedes ejecutar tu aplicación con:
-- npm run dev
-- ============================================
