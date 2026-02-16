#!/usr/bin/env node

/**
 * Mission Control Client
 * 
 * Cliente para que el agente (yo) registre automáticamente:
 * - Tareas que recibo del usuario
 * - Estado de las tareas (pending → in_progress → completed)
 * - Costos de API calls
 * - Logs de acciones
 * - Métricas del sistema
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lkillwfvbblwhtslewsg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWxsd2Z2YmJsd2h0c2xld3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIwNjgzMywiZXhwIjoyMDg2NzgyODMzfQ.WcHQlxsKcCL_8hl8snYABOmTPnBZJjPrAE1rRxa775Y'
);

class MissionControl {
  /**
   * Crear una nueva tarea
   */
  async createTask(title, description, priority = 'medium') {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title, 
        description, 
        status: 'pending',
        priority,
        assigned_to: 'agent'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creando tarea:', error.message);
      return null;
    }
    
    console.log(`✅ Tarea creada: ${title} (ID: ${data.id})`);
    await this.log(`Tarea creada: ${title}`, 'info', 'agent');
    return data;
  }

  /**
   * Actualizar estado de una tarea
   */
  async updateTaskStatus(taskId, status, completionSummary = null) {
    const updateData = { status, updated_at: new Date().toISOString() };
    
    // Si se completa, añadir resumen a la descripción
    if (status === 'completed' && completionSummary) {
      const { data: task } = await supabase
        .from('tasks')
        .select('description')
        .eq('id', taskId)
        .single();
      
      if (task) {
        updateData.description = `${task.description}\n\n✅ COMPLETADO:\n${completionSummary}`;
      }
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error actualizando tarea:', error.message);
      return null;
    }
    
    const statusEmoji = {
      pending: '⏸️',
      in_progress: '▶️',
      completed: '✅'
    };
    
    console.log(`${statusEmoji[status]} Tarea #${taskId} → ${status}`);
    await this.log(`Tarea #${taskId} actualizada a ${status}`, 'info', 'agent');
    return data;
  }

  /**
   * Iniciar trabajo en una tarea
   */
  async startTask(taskId) {
    return await this.updateTaskStatus(taskId, 'in_progress');
  }

  /**
   * Completar una tarea con resumen
   */
  async completeTask(taskId, summary) {
    return await this.updateTaskStatus(taskId, 'completed', summary);
  }

  /**
   * Registrar un costo (API call, servicio, etc.)
   */
  async recordCost(amount, description, category = 'api') {
    const { data, error } = await supabase
      .from('costs')
      .insert([{ amount, description, category }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error registrando costo:', error.message);
      return null;
    }
    
    console.log(`💰 Costo registrado: $${amount.toFixed(2)} - ${description}`);
    return data;
  }

  /**
   * Registrar un log
   */
  async log(message, level = 'info', source = 'agent') {
    const { data, error } = await supabase
      .from('logs')
      .insert([{ message, level, source }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error registrando log:', error.message);
      return null;
    }
    
    const levelEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${levelEmoji[level]} [${source}] ${message}`);
    return data;
  }

  /**
   * Obtener tareas pendientes
   */
  async getPendingTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error obteniendo tareas:', error.message);
      return [];
    }
    
    return data;
  }

  /**
   * Obtener total de costos
   */
  async getTotalCosts() {
    const { data, error } = await supabase
      .from('costs')
      .select('amount');
    
    if (error) return 0;
    
    return data.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);
  }

  /**
   * Dashboard de estado
   */
  async status() {
    console.log('\n📊 MISSION CONTROL STATUS\n');
    
    const { count: totalTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
    const { count: pendingTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: inProgressTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress');
    const { count: completedTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    
    const totalCosts = await this.getTotalCosts();
    
    console.log(`📋 Tareas Totales: ${totalTasks}`);
    console.log(`  ⏸️  Pendientes: ${pendingTasks}`);
    console.log(`  ▶️  En Progreso: ${inProgressTasks}`);
    console.log(`  ✅ Completadas: ${completedTasks}`);
    console.log(`\n💰 Costos Totales: $${totalCosts.toFixed(2)}`);
    console.log(`\n🌐 Dashboard: https://mission-control-seven-drab.vercel.app/\n`);
  }
}

// CLI Interface
if (require.main === module) {
  const mc = new MissionControl();
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    switch (command) {
      case 'create':
        await mc.createTask(args[1], args[2], args[3] || 'medium');
        break;
      case 'start':
        await mc.startTask(parseInt(args[1]));
        break;
      case 'complete':
        await mc.completeTask(parseInt(args[1]), args[2]);
        break;
      case 'cost':
        await mc.recordCost(parseFloat(args[1]), args[2], args[3] || 'api');
        break;
      case 'log':
        await mc.log(args[1], args[2] || 'info', args[3] || 'agent');
        break;
      case 'pending':
        const tasks = await mc.getPendingTasks();
        console.log('\n📋 Tareas Pendientes:\n');
        tasks.forEach(t => {
          const priority = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority];
          console.log(`  ${priority} #${t.id}: ${t.title}`);
          if (t.description) console.log(`     ${t.description}`);
        });
        console.log();
        break;
      case 'status':
        await mc.status();
        break;
      default:
        console.log(`
Mission Control Client - Uso:

  node mission-control-client.js create "Título" "Descripción" [priority]
  node mission-control-client.js start <task_id>
  node mission-control-client.js complete <task_id> "Resumen de lo hecho"
  node mission-control-client.js cost <amount> "Descripción" [category]
  node mission-control-client.js log "Mensaje" [level] [source]
  node mission-control-client.js pending
  node mission-control-client.js status

Ejemplos:

  node mission-control-client.js create "Optimizar código" "Refactorizar módulo X" high
  node mission-control-client.js start 5
  node mission-control-client.js complete 5 "Código refactorizado, mejoró 30% performance"
  node mission-control-client.js cost 0.05 "API call Claude Sonnet"
  node mission-control-client.js log "Sistema iniciado" info system
        `);
    }
  })();
}

module.exports = MissionControl;
