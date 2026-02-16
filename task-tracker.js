#!/usr/bin/env node

/**
 * Task Tracker - Sistema REAL de tracking para el agente principal
 * 
 * Uso cuando recibo tareas del usuario:
 * 1. createTask() - Al empezar
 * 2. updateProgress() - Durante el trabajo (cada paso importante)
 * 3. completeTask() - Al terminar con resumen
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lkillwfvbblwhtslewsg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWxsd2Z2YmJsd2h0c2xld3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIwNjgzMywiZXhwIjoyMDg2NzgyODMzfQ.WcHQlxsKcCL_8hl8snYABOmTPnBZJjPrAE1rRxa775Y'
);

class TaskTracker {
  /**
   * Crear tarea nueva cuando el usuario me pide algo
   */
  async createTask(userRequest) {
    const startTime = new Date();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: userRequest.substring(0, 100),
        description: `📝 Solicitud original: ${userRequest}\n\n⏱️ Iniciado: ${startTime.toLocaleString('es-ES')}`,
        status: 'in_progress',
        priority: 'high',
        assigned_to: 'main-agent',
        progress_percentage: 0
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error:', error.message);
      return null;
    }
    
    // Log
    await supabase.from('logs').insert([{
      message: `Nueva tarea #${data.id}: ${userRequest}`,
      level: 'info',
      source: 'main-agent'
    }]);
    
    console.log(`✅ Tarea #${data.id} creada`);
    return data;
  }

  /**
   * Actualizar progreso durante el trabajo
   */
  async updateProgress(taskId, percentage, stepDescription) {
    await supabase
      .from('tasks')
      .update({ progress_percentage: percentage })
      .eq('id', taskId);
    
    await supabase.from('logs').insert([{
      message: `Tarea #${taskId}: ${stepDescription} (${percentage}%)`,
      level: 'info',
      source: 'main-agent'
    }]);
    
    console.log(`📊 ${percentage}%: ${stepDescription}`);
  }

  /**
   * Completar tarea con resumen
   */
  async completeTask(taskId, summary) {
    const { data: task } = await supabase
      .from('tasks')
      .select('created_at')
      .eq('id', taskId)
      .single();
    
    const startTime = new Date(task.created_at);
    const endTime = new Date();
    const minutesSpent = Math.round((endTime - startTime) / 1000 / 60);
    
    const fullSummary = `${summary}

⏱️ Tiempo total: ${minutesSpent} minutos
✅ Completado: ${endTime.toLocaleString('es-ES')}`;

    await supabase
      .from('tasks')
      .update({
        status: 'completed',
        progress_percentage: 100,
        description: fullSummary
      })
      .eq('id', taskId);
    
    await supabase.from('logs').insert([{
      message: `Tarea #${taskId} completada en ${minutesSpent} minutos`,
      level: 'info',
      source: 'main-agent'
    }]);
    
    console.log(`✅ Tarea #${taskId} completada (${minutesSpent} minutos)`);
  }
}

// Export para uso en otros scripts
module.exports = TaskTracker;

// Demo
if (require.main === module) {
  (async () => {
    const tracker = new TaskTracker();
    
    console.log('📋 Demo de Task Tracker:\n');
    
    // Simular tarea del usuario
    const task = await tracker.createTask('Optimiza el código del backend');
    if (!task) return;
    
    await tracker.updateProgress(task.id, 20, 'Analizando código existente');
    await new Promise(r => setTimeout(r, 2000));
    
    await tracker.updateProgress(task.id, 50, 'Refactorizando módulos principales');
    await new Promise(r => setTimeout(r, 2000));
    
    await tracker.updateProgress(task.id, 80, 'Ejecutando tests');
    await new Promise(r => setTimeout(r, 2000));
    
    await tracker.completeTask(task.id, `✅ Optimización completada

Cambios:
- 5 módulos refactorizados
- Performance mejorada 40%
- Todos los tests pasando`);
    
    console.log('\n✅ Demo completada!');
    console.log('🌐 Ve en: https://mission-control-seven-drab.vercel.app/');
  })();
}
