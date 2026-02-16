# 🚀 Guía de Deployment - OpenClaw Mission Control

## Deploy en Vercel (Recomendado)

Vercel es la plataforma oficial de Next.js y ofrece deploy automático y escalado.

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de tener todo commiteado
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Paso 2: Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:

**Variables requeridas:**
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Variables opcionales (para alertas por email):**
```
RESEND_API_KEY=re_...
ALERT_EMAIL_FROM=alerts@tudominio.com
ALERT_EMAIL_TO=tuemail@ejemplo.com
```

5. Click en **"Deploy"**
6. ¡Listo! Tu app estará disponible en: `https://tu-proyecto.vercel.app`

### Configuración Avanzada

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build` (auto-detectado)
- Output Directory: `.next` (auto-detectado)
- Install Command: `npm install` (auto-detectado)

**Node.js Version:**
- Usa Node.js 18.x o superior

**Environment Variables:**
- Puedes añadir variables para diferentes entornos: Production, Preview, Development

### Auto-Deploy

Vercel automáticamente hace deploy cuando:
- Haces push a la rama `main` → Deploy a Production
- Creas un Pull Request → Deploy Preview

---

## Deploy en Netlify

Alternativa popular a Vercel con funcionalidades similares.

### Paso 1: Conectar Repositorio

1. Ve a [netlify.com](https://netlify.com) e inicia sesión
2. Click en **"Add new site"** → **"Import an existing project"**
3. Conecta tu cuenta de GitHub y selecciona el repo

### Paso 2: Configurar Build

**Build settings:**
```
Build command: npm run build
Publish directory: .next
```

### Paso 3: Variables de Entorno

Añade las mismas variables que en Vercel (ver arriba).

### Paso 4: Deploy

Click en **"Deploy site"** y espera a que termine.

**Post-Deploy:**
- Configura un custom domain si lo deseas
- Habilita HTTPS automático (viene por defecto)

---

## Deploy en Railway

Plataforma moderna con deploy de apps full-stack.

### Paso 1: Crear Proyecto

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repositorio

### Paso 2: Configurar

Railway auto-detecta Next.js. Solo necesitas:

1. Añadir variables de entorno en **"Variables"** tab
2. Espera a que termine el build

### Paso 3: Dominio

Railway te da un dominio automático tipo `*.up.railway.app`

---

## Deploy Manual (VPS/Server)

Para deploy en tu propio servidor (DigitalOcean, AWS EC2, etc.)

### Requisitos

- Node.js 18+ instalado
- PM2 para process management
- Nginx como reverse proxy (opcional)

### Paso 1: Preparar Server

```bash
# Instalar Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

### Paso 2: Clonar y Build

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/mission-control.git
cd mission-control

# Instalar dependencias
npm install

# Crear archivo .env.local con tus variables

# Build
npm run build
```

### Paso 3: Ejecutar con PM2

```bash
# Iniciar app
pm2 start npm --name "mission-control" -- start

# Hacer que PM2 inicie en boot
pm2 startup
pm2 save
```

### Paso 4: Configurar Nginx (Opcional)

Crea un archivo de configuración en `/etc/nginx/sites-available/mission-control`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activa el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/mission-control /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Deploy con Docker

### Dockerfile

Crea un `Dockerfile` en la raíz:

```dockerfile
FROM node:18-alpine AS base

# Dependencias
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build y Run

```bash
# Build
docker build -t mission-control .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  mission-control
```

### Docker Compose

Crea `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mission-control:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

Ejecuta con:

```bash
docker-compose up -d
```

---

## Monitoreo Post-Deploy

### Vercel Analytics

Habilita analytics en tu dashboard de Vercel para:
- Número de visitantes
- Core Web Vitals
- Performance metrics

### Uptime Monitoring

Configura servicios como:
- [UptimeRobot](https://uptimerobot.com) (gratis)
- [Pingdom](https://pingdom.com)
- [Better Stack](https://betterstack.com)

### Error Tracking

Integra Sentry para tracking de errores:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Troubleshooting

### Build falla en Vercel/Netlify

**Error:** `Cannot find module '@/lib/supabase'`

**Solución:** Asegúrate de que `tsconfig.json` tiene:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Variables de entorno no funcionan

**Síntoma:** Error de conexión a Supabase

**Solución:**
1. Verifica que las variables tengan el prefijo `NEXT_PUBLIC_` para uso en cliente
2. En Vercel/Netlify, asegúrate de que las variables estén en "Production"
3. Re-deploy después de añadir variables nuevas

### La app no carga después del deploy

**Checklist:**
- ✅ Build exitoso sin errores
- ✅ Variables de entorno configuradas correctamente
- ✅ Supabase está accesible desde internet
- ✅ No hay CORS issues en Supabase

---

## Performance Tips

### 1. Habilitar ISR (Incremental Static Regeneration)

Añade `revalidate` en tus páginas:

```typescript
export const revalidate = 60 // Revalidar cada 60 segundos
```

### 2. Optimizar Imágenes

Usa el componente `next/image` para lazy loading automático:

```tsx
import Image from 'next/image'

<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### 3. Edge Runtime

Para APIs ultra-rápidas, usa Edge Runtime:

```typescript
export const runtime = 'edge'
```

---

## 🎉 ¡Deploy Completo!

Tu Mission Control está ahora en producción. Monitorea tus métricas y disfruta de tu dashboard. 🚀
