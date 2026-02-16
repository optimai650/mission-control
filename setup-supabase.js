const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://lkillwfvbblwhtslewsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWxsd2Z2YmJsd2h0c2xld3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIwNjgzMywiZXhwIjoyMDg2NzgyODMzfQ.WcHQlxsKcCL_8hl8snYABOmTPnBZJjPrAE1rRxa775Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Configurando base de datos de Mission Control...\n');

  // Crear tabla de tareas
  console.log('📋 Creando tabla de tareas...');
  const { error: tasksError } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  });
  
  if (tasksError) console.log('Tasks table might already exist:', tasksError.message);
  else console.log('✅ Tabla tasks creada');

  // Crear tabla de costos
  console.log('\n💰 Creando tabla de costos...');
  const { error: costsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS costs (
        id BIGSERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
        description TEXT,
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  if (costsError) console.log('Costs table might already exist:', costsError.message);
  else console.log('✅ Tabla costs creada');

  // Crear tabla de logs
  console.log('\n🔍 Creando tabla de logs...');
  const { error: logsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS logs (
        id BIGSERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error')),
        source TEXT DEFAULT 'system',
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  if (logsError) console.log('Logs table might already exist:', logsError.message);
  else console.log('✅ Tabla logs creada');

  // Insertar datos de ejemplo
  console.log('\n📦 Insertando datos de ejemplo...');
  
  const sampleTasks = [
    { title: 'Optimizar consultas de base de datos', description: 'Reducir tiempo de respuesta', status: 'in_progress', priority: 'high' },
    { title: 'Implementar caché Redis', description: 'Añadir capa de caché', status: 'pending', priority: 'high' },
    { title: 'Actualizar documentación', description: 'Documentar nuevos endpoints', status: 'pending', priority: 'medium' },
    { title: 'Revisar logs de errores', description: 'Analizar errores recurrentes', status: 'pending', priority: 'low' },
    { title: 'Deploy v2.0 a producción', description: 'Subir nueva versión', status: 'completed', priority: 'high' }
  ];

  for (const task of sampleTasks) {
    await supabase.from('tasks').insert([task]);
  }
  console.log('✅ Tareas de ejemplo creadas');

  const sampleCosts = [
    { amount: 29.99, description: 'Suscripción mensual Vercel Pro', category: 'infrastructure' },
    { amount: 25.00, description: 'Plan Supabase Pro', category: 'database' },
    { amount: 12.50, description: 'API calls OpenAI', category: 'ai' }
  ];

  for (const cost of sampleCosts) {
    await supabase.from('costs').insert([cost]);
  }
  console.log('✅ Costos de ejemplo creados');

  const sampleLogs = [
    { message: 'Sistema iniciado correctamente', level: 'info', source: 'system' },
    { message: 'Alta carga detectada en servidor', level: 'warning', source: 'monitoring' },
    { message: 'Conexión a base de datos establecida', level: 'info', source: 'database' },
    { message: 'Backup completado exitosamente', level: 'info', source: 'system' }
  ];

  for (const log of sampleLogs) {
    await supabase.from('logs').insert([log]);
  }
  console.log('✅ Logs de ejemplo creados');

  console.log('\n🎉 ¡Base de datos configurada correctamente!');
  console.log('\nPróximos pasos:');
  console.log('1. npm run dev (para desarrollo local)');
  console.log('2. O deploy en Vercel para producción');
}

setupDatabase().catch(console.error);
