# ⚡ Setup Rápido - 5 Minutos

## 📋 Paso 1: Crear Tablas en Supabase (2 minutos)

1. **Ve a:** https://supabase.com/dashboard/project/lkillwfvbblwhtslewsg
2. **Click en** "SQL Editor" en el menú lateral
3. **Copia y pega** este script completo:

```sql
-- ============================================
-- MISSION CONTROL - SCHEMA COMPLETO
-- ============================================

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT DEFAULT 'agent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Costos  
CREATE TABLE IF NOT EXISTS costs (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Logs
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error')),
  source TEXT DEFAULT 'system',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_costs_created_at ON costs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);

-- Datos de ejemplo
INSERT INTO tasks (title, description, status, priority) VALUES
  ('Optimizar base de datos', 'Reducir tiempo de respuesta de queries principales', 'in_progress', 'high'),
  ('Implementar caché Redis', 'Añadir capa de caché para reducir carga', 'pending', 'high'),
  ('Actualizar documentación', 'Documentar todos los endpoints nuevos', 'pending', 'medium'),
  ('Revisar logs de errores', 'Analizar y corregir errores recurrentes', 'pending', 'low'),
  ('Deploy v2.0', 'Subir nueva versión a producción', 'completed', 'high'),
  ('Configurar monitoreo', 'Implementar alertas de sistema', 'in_progress', 'medium');

INSERT INTO costs (amount, description, category) VALUES
  (29.99, 'Suscripción mensual Vercel Pro', 'infrastructure'),
  (25.00, 'Plan Supabase Pro', 'database'),
  (12.50, 'API calls OpenAI', 'ai'),
  (5.00, 'Domain registration', 'infrastructure');

INSERT INTO logs (message, level, source) VALUES
  ('Sistema iniciado correctamente', 'info', 'system'),
  ('Alta carga detectada en servidor', 'warning', 'monitoring'),
  ('Conexión a base de datos establecida', 'info', 'database'),
  ('Error al procesar webhook', 'error', 'api'),
  ('Backup completado exitosamente', 'info', 'system');

-- ✅ LISTO!
```

4. **Click en "Run"** (esquina inferior derecha)
5. **Verifica:** Deberías ver "Success. No rows returned"

---

## 🚀 Paso 2: Deploy en Vercel (3 minutos)

### Opción A: Re-deploy (Si ya lo deployaste antes)

1. Ve a: https://vercel.com/dashboard
2. Encuentra tu proyecto "mission-control"
3. Click en **"Deployments"**
4. Click en **"..."** del deploy más reciente
5. Click en **"Redeploy"**
6. ✅ ¡Listo!

### Opción B: Deploy Nuevo

1. Ve a: https://vercel.com/new
2. **Import desde GitHub:** `optimai650/mission-control`
3. **Añade variables de entorno:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lkillwfvbblwhtslewsg.supabase.co
   ```
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWxsd2Z2YmJsd2h0c2xld3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDY4MzMsImV4cCI6MjA4Njc4MjgzM30.j5_Tjte7EQ9Kia6iXsclgoHba8utPUiucG4ay-X10nI
   ```
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWxsd2Z2YmJsd2h0c2xld3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIwNjgzMywiZXhwIjoyMDg2NzgyODMzfQ.WcHQlxsKcCL_8hl8snYABOmTPnBZJjPrAE1rRxa775Y
   ```
4. Click en **"Deploy"**
5. Espera 2-3 minutos ⏱️
6. ✅ ¡Listo!

---

## 🎉 ¡YA ESTÁ!

Ahora tu Mission Control está funcionando con:

✅ **Sidebar lateral** deslizante  
✅ **6 vistas diferentes** (Dashboard, Tareas, Métricas, Costos, Logs, Settings)  
✅ **Kanban board** para gestión de tareas  
✅ **Auto-refresh** cada 60 segundos  
✅ **Datos reales** del sistema (CPU, Memoria, Disco)  
✅ **Gráficos en tiempo real**  
✅ **Tema oscuro moderno**  

---

## 🔍 Verificar que Funciona

1. **Abre tu URL de Vercel** (ej: `mission-control-xxx.vercel.app`)
2. **Deberías ver:**
   - Sidebar a la izquierda (expandible/colapsable)
   - 4 cards de estadísticas con colores (azul, verde, morado, naranja)
   - Tema oscuro con gradientes purple/slate
   - Tareas de ejemplo en el board

3. **Prueba crear una tarea:**
   - Click en "Tareas" en el sidebar
   - Click en "+ Nueva Tarea"
   - Escribe: "Probar Mission Control"
   - Prioridad: Alta (🔴)
   - Click "Crear Tarea"
   - ✅ Debería aparecer en "Por Hacer"

4. **Prueba mover la tarea:**
   - Click en "▶️ Iniciar"
   - Se mueve a "En Progreso"
   - Click en "✅ Completar"
   - Se mueve a "Completadas"

---

## 🐛 Si Algo No Funciona

### "Error al conectar con el servidor"
**Causa:** Variables de entorno mal configuradas  
**Solución:**
1. Ve a Vercel → Tu proyecto → Settings → Environment Variables
2. Verifica que las 3 variables estén correctas
3. Re-deploy

### "Tabla no existe"
**Causa:** No ejecutaste el script SQL  
**Solución:**
1. Ve a Supabase → SQL Editor
2. Ejecuta el script de arriba
3. Refresca tu app

### "Los estilos no se ven"
**Causa:** Caché del navegador  
**Solución:**
1. Ctrl+Shift+R (o Cmd+Shift+R en Mac)
2. Limpia caché del navegador

---

## 📞 Contacto

Si todo está configurado pero algo no funciona:
- Revisa la consola del navegador (F12)
- Verifica los logs de Vercel
- Asegúrate de que Supabase esté "ACTIVE"

---

**¡Ahora tienes un Mission Control profesional! 🚀**
