# OpenClaw Mission Control Dashboard

Un dashboard completo de monitoreo y control para OpenClaw con métricas en tiempo real, gestión de tareas y análisis de costos.

## 🚀 Características

### Dashboard Principal
- **Monitoreo de Costos en Tiempo Real**: Tracking de gastos de API calls, tokens utilizados
- **Panel de Tareas**: Estado de tareas (completadas, en progreso, pendientes)  
- **Métricas de Sistema**: CPU, memoria, sesiones activas
- **Logs en Vivo**: Stream de logs del sistema en tiempo real

### Tecnologías
- **Frontend**: Next.js 14 con TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js con Express, Socket.io para tiempo real
- **Base de Datos**: SQLite para desarrollo, PostgreSQL para producción
- **Visualización**: Chart.js, Recharts para gráficos
- **Notificaciones**: Integración con Resend para alertas

## 📦 Instalación y Deployment

### Desarrollo Local
```bash
git clone [REPO_URL]
cd mission-control
npm install
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t mission-control .
docker run -p 3000:3000 mission-control
```

## 🔧 Configuración

Ver `config/README.md` para configuración detallada de APIs y variables de entorno.

## 📱 Screenshots

[Screenshots del dashboard serán añadidos aquí]

---

Desarrollado para optimizar el monitoreo y control de OpenClaw.