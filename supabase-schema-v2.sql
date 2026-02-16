-- ============================================
-- OpenClaw Mission Control v2.0 - Schema Update
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para actualizar las tablas con los nuevos campos
-- ============================================

-- Actualizar tabla de tareas con nuevos campos
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'agent';

-- Actualizar tabla de costos con campo de categoría si no existe
ALTER TABLE costs
ADD COLUMN IF NOT EXISTS category TEXT;

-- Actualizar tabla de logs con campos adicionales si no existen
ALTER TABLE logs
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Actualizar datos existentes con prioridad media por defecto
UPDATE tasks SET priority = 'medium' WHERE priority IS NULL;
UPDATE tasks SET assigned_to = 'agent' WHERE assigned_to IS NULL;

-- ============================================
-- Vista mejorada de resumen de tareas
-- ============================================
CREATE OR REPLACE VIEW tasks_detailed_summary AS
SELECT
  status,
  priority,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM tasks
GROUP BY status, priority
ORDER BY status, priority;

-- ============================================
-- Función para obtener estadísticas del dashboard
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_tasks BIGINT,
  pending_tasks BIGINT,
  in_progress_tasks BIGINT,
  completed_tasks BIGINT,
  completed_today BIGINT,
  total_costs NUMERIC,
  costs_today NUMERIC,
  high_priority_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM tasks)::BIGINT,
    (SELECT COUNT(*) FROM tasks WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress')::BIGINT,
    (SELECT COUNT(*) FROM tasks WHERE status = 'completed')::BIGINT,
    (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE)::BIGINT,
    (SELECT COALESCE(SUM(amount), 0) FROM costs)::NUMERIC,
    (SELECT COALESCE(SUM(amount), 0) FROM costs WHERE DATE(created_at) = CURRENT_DATE)::NUMERIC,
    (SELECT COUNT(*) FROM tasks WHERE priority = 'high' AND status != 'completed')::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Ejemplo de uso:
-- SELECT * FROM get_dashboard_stats();
-- ============================================

-- ============================================
-- Datos de ejemplo actualizados (opcional)
-- ============================================

-- Limpiar datos de ejemplo anteriores (opcional)
-- DELETE FROM tasks WHERE id < 100;

-- Insertar tareas de ejemplo con prioridades
INSERT INTO tasks (title, description, status, priority, assigned_to) VALUES
  ('Optimizar consultas de base de datos', 'Reducir tiempo de respuesta de queries principales', 'in_progress', 'high', 'agent'),
  ('Implementar caché Redis', 'Añadir capa de caché para reducir carga en DB', 'pending', 'high', 'agent'),
  ('Actualizar documentación API', 'Documentar todos los endpoints nuevos', 'pending', 'medium', 'agent'),
  ('Revisar logs de errores', 'Analizar y corregir errores recurrentes', 'pending', 'low', 'agent'),
  ('Deploy de nueva versión', 'Subir v2.0 a producción', 'completed', 'high', 'agent'),
  ('Configurar monitoreo', 'Implementar alertas de sistema', 'in_progress', 'medium', 'agent');

-- ============================================
-- ✅ Schema v2.0 actualizado exitosamente
-- ============================================
