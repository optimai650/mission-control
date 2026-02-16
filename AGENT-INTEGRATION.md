# 🤖 Integración del Agente con Mission Control

## 📖 Qué es Esto

El **Mission Control** NO es para que el usuario organice tareas manualmente.  
Es un **dashboard de monitoreo en tiempo real** de lo que hace el agente (yo).

---

## ✅ Qué Registra Automáticamente

### 1. 📋 **Tareas**
Cuando el usuario me pide algo:
- **Creo la tarea** automáticamente con título y descripción
- **La inicio** cuando empiezo a trabajar (`pending` → `in_progress`)
- **La completo** cuando termino, con resumen detallado de lo hecho

### 2. 💰 **Costos**
Cada vez que uso APIs pagas:
- Claude/GPT API calls
- Servicios externos (Vercel, Supabase, etc.)
- Herramientas de terceros

### 3. 🔍 **Logs**
Todo lo que hago:
- Acciones importantes
- Errores encontrados
- Warnings del sistema
- Info general

### 4. 📊 **Métricas**
Uso de recursos del servidor:
- CPU
- Memoria RAM
- Disco
- (Se actualizan cada 60 segundos automáticamente)

---

## 🛠️ Cómo Funciona

### Cliente JavaScript

Archivo: `mission-control-client.js`

```javascript
const MissionControl = require('./mission-control-client');
const mc = new MissionControl();

// Crear tarea cuando el usuario pide algo
await mc.createTask(
  "Optimizar base de datos",
  "Reducir tiempo de respuesta de queries",
  "high" // priority: high, medium, low
);

// Iniciar cuando empiezo a trabajar
await mc.startTask(taskId);

// Completar con resumen
await mc.completeTask(taskId, `
  Optimización completada:
  - Índices añadidos en campos clave
  - Query time reducido de 2.5s a 0.3s
  - Performance mejoró 88%
`);

// Registrar costos
await mc.recordCost(0.50, "API calls Claude Sonnet (50K tokens)", "ai");

// Logs
await mc.log("Optimización iniciada", "info", "agent");
await mc.log("Alta carga detectada", "warning", "monitoring");
await mc.log("Error en conexión", "error", "database");
```

### CLI (Línea de Comandos)

```bash
# Ver estado general
node mission-control-client.js status

# Ver tareas pendientes
node mission-control-client.js pending

# Crear tarea
node mission-control-client.js create "Título" "Descripción" high

# Iniciar tarea
node mission-control-client.js start 5

# Completar tarea
node mission-control-client.js complete 5 "Resumen de lo hecho"

# Registrar costo
node mission-control-client.js cost 0.25 "API call GPT-4"

# Registrar log
node mission-control-client.js log "Sistema iniciado" info agent
```

---

## 🎯 Flujo de Trabajo Típico

### Ejemplo: Usuario pide "Optimiza la base de datos"

**1. Recibo el mensaje**
```javascript
await mc.createTask(
  "Optimizar base de datos", 
  "Usuario solicita optimización de queries lentos",
  "high"
);
// → Tarea aparece en Mission Control como "Pendiente"
```

**2. Empiezo a trabajar**
```javascript
await mc.startTask(taskId);
// → Tarea se mueve a "En Progreso"
```

**3. Trabajo en la tarea**
```javascript
// Mientras trabajo, registro logs
await mc.log("Analizando queries lentos...", "info", "agent");
await mc.log("Creando índices en tabla users...", "info", "database");

// Si uso APIs, registro costos
await mc.recordCost(0.15, "API call para análisis de queries", "ai");
```

**4. Termino la tarea**
```javascript
await mc.completeTask(taskId, `
  ✅ Optimización completada exitosamente
  
  Cambios realizados:
  - Añadidos 3 índices en campos frecuentemente consultados
  - Optimizada query principal (2.5s → 0.3s, mejora del 88%)
  - Implementado caché para resultados recurrentes
  
  Resultados:
  - Tiempo de respuesta: -88%
  - Carga del servidor: -45%
  - Throughput: +120%
  
  Archivos modificados: 3
  Commits: 1
`);
// → Tarea se mueve a "Completadas" con resumen visible
```

**5. El usuario ve en Mission Control:**
- ✅ Tarea completada
- 📝 Resumen detallado de lo que hice
- 💰 Costo de la operación ($0.15)
- 🔍 Logs de cada paso
- 📊 Métricas del sistema durante la ejecución

---

## 🌐 Dashboard

URL: https://mission-control-seven-drab.vercel.app/

### Vistas Disponibles

1. **📊 Dashboard**
   - Resumen general
   - Gráficos de uso de recursos
   - Últimas tareas completadas

2. **✅ Tareas** (Kanban)
   - **Por Hacer**: Tareas pendientes (🔴🟡🟢 por prioridad)
   - **En Progreso**: Lo que estoy haciendo ahora
   - **Completadas**: Con resumen de lo hecho

3. **📈 Métricas**
   - CPU, Memoria, Disco
   - Gráficos históricos (últimos 20 minutos)

4. **💰 Costos**
   - Lista de gastos
   - Total acumulado
   - Por categoría (ai, infrastructure, database)

5. **🔍 Logs**
   - Terminal en tiempo real
   - Filtrado por nivel (info, warning, error)
   - Últimos 100 logs

6. **⚙️ Configuración**
   - Auto-refresh status
   - Info del sistema

---

## 🔄 Auto-Refresh

El dashboard se actualiza **automáticamente cada 60 segundos**.  
No necesitas refrescar manualmente, todo aparece en tiempo real.

---

## 🎨 Prioridades

Cuando creo una tarea, asigno prioridad basada en:

- 🔴 **Alta (high)**: Urgente, bloqueante, o crítico
- 🟡 **Media (medium)**: Importante pero no bloqueante
- 🟢 **Baja (low)**: Nice to have, mejoras futuras

---

## 📊 Ejemplo de Sesión Completa

```javascript
// Usuario: "Optimiza el código y sube a producción"

// 1. Creo tareas
const task1 = await mc.createTask("Optimizar código", "Refactorizar módulos críticos", "high");
const task2 = await mc.createTask("Deploy a producción", "Subir v2.0", "high");

// 2. Trabajo en tarea 1
await mc.startTask(task1.id);
await mc.log("Iniciando optimización de código...", "info", "agent");

// ... trabajo ...

await mc.recordCost(0.25, "API calls Claude para análisis de código", "ai");
await mc.completeTask(task1.id, "Código optimizado, mejora del 40% en performance");

// 3. Trabajo en tarea 2
await mc.startTask(task2.id);
await mc.log("Iniciando deploy a Vercel...", "info", "agent");

// ... deploy ...

await mc.recordCost(0.00, "Deploy a Vercel (plan gratuito)", "infrastructure");
await mc.completeTask(task2.id, "Deploy exitoso, app funcionando en producción");

// 4. Resumen final
await mc.log("Sesión completada - 2 tareas finalizadas", "info", "agent");
await mc.status(); // Muestra resumen en consola
```

**El usuario ve en Mission Control:**
- ✅ 2 tareas completadas
- 💰 $0.25 de costo total
- 🔍 Todos los logs del proceso
- 📊 Métricas de recursos durante la sesión

---

## 🚀 Setup del Agente

Para integrar esto en el workflow del agente:

### 1. Instalar dependencias
```bash
cd /root/.openclaw/workspace
npm install @supabase/supabase-js
```

### 2. Importar el cliente
```javascript
const MissionControl = require('./mission-control-client');
const mc = new MissionControl();
```

### 3. Usar en el código del agente
```javascript
// Al recibir petición del usuario
const task = await mc.createTask(userRequest, details, priority);

// Al empezar a trabajar
await mc.startTask(task.id);

// Mientras trabajo
await mc.log("Paso X completado", "info", "agent");

// Si uso APIs pagas
await mc.recordCost(apiCost, description, "ai");

// Al terminar
await mc.completeTask(task.id, summaryOfWork);
```

---

## 💡 Tips

### Para el Agente (yo)
- ✅ Crear tarea SIEMPRE que el usuario pida algo
- ✅ Actualizar estado a "in_progress" cuando empiezo
- ✅ Logs frecuentes para que el usuario vea progreso
- ✅ Registrar TODOS los costos de APIs
- ✅ Resumen detallado al completar (qué hice, resultados, archivos cambiados)

### Para el Usuario
- 📊 Revisa el dashboard en tiempo real
- 🔍 Usa los logs para ver qué estoy haciendo ahora
- 💰 Monitorea costos para ver cuánto gastas
- 📈 Métricas para ver si necesitas más recursos (CPU/RAM)

---

## 🔧 Troubleshooting

### "No aparece mi tarea"
- Verifica que el agente haya llamado `createTask()`
- Checa la consola del agente para errores
- Refresca el dashboard (o espera 60s al auto-refresh)

### "Los costos no se suman bien"
- Verifica que todos los costos se registren con `recordCost()`
- Checa que el `amount` sea numérico (no string)

### "Los logs no aparecen"
- Asegúrate de usar `mc.log()` en el código del agente
- Nivel debe ser: 'info', 'warning', o 'error'

---

## 📞 Contacto

**Dashboard:** https://mission-control-seven-drab.vercel.app/  
**Proyecto Supabase:** lkillwfvbblwhtslewsg  
**Repo GitHub:** optimai650/mission-control

---

**¡El Mission Control está listo para monitorear todo lo que hago! 🚀**
