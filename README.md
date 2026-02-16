# 🚀 OpenClaw Mission Control

Dashboard completo de monitoreo y control para OpenClaw con interfaz moderna y tiempo real.

## ✨ Características

- 📊 **Métricas del Sistema** - Monitoreo en tiempo real de CPU, memoria y disco
- ✅ **Gestión de Tareas** - Crea y rastrea tareas con estados (pendiente, en progreso, completada)
- 💰 **Control de Costos** - Seguimiento de gastos operacionales
- 🔍 **Sistema de Logs** - Registro de eventos con niveles (info, warning, error)
- 🎨 **UI Moderna** - Diseño con gradientes, sombras y animaciones suaves
- ⚡ **Tiempo Real** - Actualización automática cada 30 segundos
- 📱 **Responsive** - Funciona perfectamente en móvil, tablet y desktop

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + Radix UI Components
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Deploy**: Vercel / Netlify

## 📦 Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/mission-control.git
cd mission-control
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura Supabase

#### Crea un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a **Settings** → **API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

#### Crea las tablas en Supabase

Ve a **SQL Editor** en Supabase y ejecuta este script:

```sql
-- Tabla de tareas
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de costos
CREATE TABLE costs (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de logs
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  level TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_costs_created_at ON costs(created_at DESC);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_logs_level ON logs(level);
```

### 4. Configura variables de entorno

Copia el archivo de ejemplo y completa tus credenciales:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase.

### 5. Ejecuta el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚢 Deploy en Vercel

1. Haz push de tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy automático ✅

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
```

## 🎨 Mejoras Implementadas

### UI/UX
- ✅ Diseño con gradientes modernos y tarjetas con sombras
- ✅ Animaciones suaves en hover y transiciones
- ✅ Loading state con spinner animado
- ✅ Alertas de error visuales
- ✅ Estados vacíos con iconos y mensajes amigables
- ✅ Gráficos mejorados con AreaChart y degradados

### Funcionalidad
- ✅ Métricas reales del sistema (CPU, memoria, disco)
- ✅ Gestión de diálogos con estado controlado
- ✅ Manejo de errores robusto
- ✅ Formato de fechas en español
- ✅ Actualización automática cada 30 segundos
- ✅ Validación de entrada de datos

### Código
- ✅ Eliminado código duplicado
- ✅ TypeScript estricto
- ✅ Componentes mejor organizados
- ✅ API routes optimizadas
- ✅ Mejor manejo de promesas y async/await

## 🔧 Troubleshooting

### Error de conexión a Supabase

Verifica que:
1. Las variables de entorno estén correctamente configuradas en `.env.local`
2. Las tablas existan en tu proyecto de Supabase
3. Las credenciales sean correctas

### Las métricas no se actualizan

En entornos serverless (Vercel/Netlify), algunas APIs del sistema pueden no estar disponibles. El dashboard usa datos simulados como fallback en esos casos.

## 📄 Licencia

MIT

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o pull request.

---

Hecho con ❤️ para OpenClaw
