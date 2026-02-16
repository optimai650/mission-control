'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Activity, DollarSign, Server, CheckCircle, Clock, AlertCircle, 
  Plus, FileText, Zap, Menu, X, Home, BarChart3, ListTodo, 
  Settings, Bell, TrendingUp, Calendar, Users, ChevronRight,
  PlayCircle, PauseCircle, Trash2
} from 'lucide-react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority?: string
  assigned_to?: string
  created_at: string
  updated_at?: string
}

interface Cost {
  id: number
  amount: number
  description?: string
  category?: string
  created_at: string
}

interface Log {
  id: number
  message: string
  level: string
  source?: string
  created_at: string
}

interface Metrics {
  cpu: { usage: number; count: number }
  memory: { used: number; total: number; percentage: number }
  disk: { used: string; total: string; percentage: number }
  timestamp: string
}

type ViewType = 'dashboard' | 'tasks' | 'metrics' | 'logs' | 'costs' | 'settings'

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [metricsHistory, setMetricsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Task dialog states
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium',
    assigned_to: 'agent'
  })
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      setError(null)
      const [tasksRes, costsRes, logsRes, metricsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/costs'),
        fetch('/api/logs'),
        fetch('/api/metrics')
      ])

      if (!tasksRes.ok || !costsRes.ok || !logsRes.ok || !metricsRes.ok) {
        throw new Error('Error al cargar datos del servidor')
      }

      const [tasksData, costsData, logsData, metricsData] = await Promise.all([
        tasksRes.json(),
        costsRes.json(),
        logsRes.json(),
        metricsRes.json()
      ])

      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setCosts(Array.isArray(costsData) ? costsData : [])
      setLogs(Array.isArray(logsData) ? logsData : [])
      setMetrics(metricsData)
      
      // Add to metrics history for graphs
      if (metricsData) {
        setMetricsHistory(prev => {
          const newHistory = [...prev, {
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            cpu: metricsData.cpu.usage,
            memory: metricsData.memory.percentage,
            disk: metricsData.disk.percentage
          }]
          return newHistory.slice(-20) // Keep last 20 data points
        })
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al conectar con el servidor. Verifica tu configuración.')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    if (!newTask.title.trim()) return
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      if (response.ok) {
        setNewTask({ title: '', description: '', priority: 'medium', assigned_to: 'agent' })
        setIsTaskDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const totalCosts = costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0)
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const completedToday = tasks.filter(task =>
    task.status === 'completed' &&
    new Date(task.created_at).toDateString() === new Date().toDateString()
  ).length

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'tasks', icon: ListTodo, label: 'Tareas', badge: pendingTasks.length },
    { id: 'metrics', icon: BarChart3, label: 'Métricas', badge: null },
    { id: 'costs', icon: DollarSign, label: 'Costos', badge: null },
    { id: 'logs', icon: FileText, label: 'Logs', badge: logs.filter(l => l.level === 'error').length || null },
    { id: 'settings', icon: Settings, label: 'Configuración', badge: null },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-500 mx-auto mb-4"></div>
            <Zap className="h-8 w-8 text-purple-400 absolute top-6 left-1/2 -ml-4" />
          </div>
          <p className="text-white font-semibold text-lg">Iniciando Mission Control...</p>
          <p className="text-purple-300 text-sm mt-2">Conectando con sistemas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800/50 backdrop-blur-lg border-r border-slate-700/50 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-xs text-slate-400 mt-1">OpenClaw v2.0</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-slate-400" /> : <Menu className="h-5 w-5 text-slate-400" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg transition-all ${
                currentView === item.id
                  ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </div>
              {sidebarOpen && item.badge !== null && item.badge > 0 && (
                <Badge className="bg-red-500 text-white">{item.badge}</Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sistema Online</p>
                <p className="text-xs text-slate-400">
                  {lastUpdate.toLocaleTimeString('es-ES')}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {currentView === 'dashboard' && '📊 Dashboard General'}
                  {currentView === 'tasks' && '✅ Gestión de Tareas'}
                  {currentView === 'metrics' && '📈 Métricas del Sistema'}
                  {currentView === 'costs' && '💰 Control de Costos'}
                  {currentView === 'logs' && '🔍 Sistema de Logs'}
                  {currentView === 'settings' && '⚙️ Configuración'}
                </h2>
                <p className="text-slate-400">
                  Última actualización: {lastUpdate.toLocaleString('es-ES')} • Auto-refresh: 60s
                </p>
              </div>
              <Button
                onClick={fetchData}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
              >
                <Activity className="h-4 w-4 mr-2" />
                Actualizar Ahora
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300">Error de Conexión</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="h-8 w-8 opacity-80" />
                      <TrendingUp className="h-5 w-5 opacity-60" />
                    </div>
                    <div className="text-3xl font-bold mb-1">${totalCosts.toFixed(2)}</div>
                    <p className="text-sm opacity-80">Costos Totales</p>
                    <p className="text-xs opacity-60 mt-2">Últimas 24 horas</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle className="h-8 w-8 opacity-80" />
                      <Activity className="h-5 w-5 opacity-60" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{completedTasks.length}</div>
                    <p className="text-sm opacity-80">Tareas Completadas</p>
                    <p className="text-xs opacity-60 mt-2">{completedToday} hoy</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Server className="h-8 w-8 opacity-80" />
                      <BarChart3 className="h-5 w-5 opacity-60" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{metrics?.cpu.usage.toFixed(1)}%</div>
                    <p className="text-sm opacity-80">Uso de CPU</p>
                    <p className="text-xs opacity-60 mt-2">{metrics?.cpu.count} núcleos</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <ListTodo className="h-8 w-8 opacity-80" />
                      <Clock className="h-5 w-5 opacity-60" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{pendingTasks.length}</div>
                    <p className="text-sm opacity-80">Tareas Pendientes</p>
                    <p className="text-xs opacity-60 mt-2">{inProgressTasks.length} en progreso</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Uso de Recursos (Tiempo Real)</CardTitle>
                    <CardDescription className="text-slate-400">Últimos 20 minutos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={metricsHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Line type="monotone" dataKey="cpu" stroke="#a855f7" strokeWidth={2} name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} name="Memoria %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Tareas por Estado</CardTitle>
                    <CardDescription className="text-slate-400">Distribución actual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Pendientes', value: pendingTasks.length, fill: '#ef4444' },
                        { name: 'En Progreso', value: inProgressTasks.length, fill: '#3b82f6' },
                        { name: 'Completadas', value: completedTasks.length, fill: '#10b981' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tasks */}
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Tareas Recientes</CardTitle>
                      <CardDescription className="text-slate-400">Últimas 5 tareas</CardDescription>
                    </div>
                    <Button 
                      onClick={() => setCurrentView('tasks')}
                      variant="outline" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Ver Todas
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {task.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : task.status === 'in_progress' ? (
                            <PlayCircle className="h-5 w-5 text-blue-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-slate-400" />
                          )}
                          <div>
                            <p className="font-medium text-white">{task.title}</p>
                            <p className="text-sm text-slate-400 mt-1">{task.description || 'Sin descripción'}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tasks View */}
          {currentView === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    Todas ({tasks.length})
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    Pendientes ({pendingTasks.length})
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    En Progreso ({inProgressTasks.length})
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    Completadas ({completedTasks.length})
                  </Button>
                </div>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Crear Nueva Tarea</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Esta tarea será asignada al agente automáticamente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Título</label>
                        <Input
                          placeholder="Ej: Optimizar base de datos"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Descripción</label>
                        <Textarea
                          placeholder="Detalles de la tarea..."
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          rows={4}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Prioridad</label>
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                          className="w-full p-2 rounded-lg bg-slate-700 border-slate-600 text-white"
                        >
                          <option value="low">🟢 Baja</option>
                          <option value="medium">🟡 Media</option>
                          <option value="high">🔴 Alta</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="border-slate-600 text-slate-300">
                        Cancelar
                      </Button>
                      <Button onClick={createTask} className="bg-purple-600 hover:bg-purple-700">
                        Crear Tarea
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Task Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending */}
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-400" />
                      Por Hacer ({pendingTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{task.description || 'Sin descripción'}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTask(task.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No hay tareas pendientes
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* In Progress */}
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-blue-400" />
                      En Progreso ({inProgressTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {inProgressTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 hover:border-blue-500 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{task.description || 'Sin descripción'}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'pending')}
                            className="border-slate-600 text-slate-300 text-xs"
                          >
                            <PauseCircle className="h-3 w-3 mr-1" />
                            Pausar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {inProgressTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No hay tareas en progreso
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Completed */}
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Completadas ({completedTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {completedTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 hover:border-green-500 transition-colors opacity-75">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white line-through">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{task.description || 'Sin descripción'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle className="h-3 w-3" />
                          Completada
                        </div>
                      </div>
                    ))}
                    {completedTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No hay tareas completadas
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Metrics View */}
          {currentView === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
                  <CardContent className="pt-6 text-center">
                    <Server className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                    <div className="text-4xl font-bold text-white mb-2">
                      {metrics?.cpu.usage.toFixed(1)}%
                    </div>
                    <p className="text-slate-300 font-medium">CPU</p>
                    <p className="text-slate-400 text-sm mt-1">{metrics?.cpu.count} núcleos</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
                  <CardContent className="pt-6 text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                    <div className="text-4xl font-bold text-white mb-2">
                      {metrics?.memory.percentage.toFixed(1)}%
                    </div>
                    <p className="text-slate-300 font-medium">Memoria</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {((metrics?.memory.used || 0) / 1024).toFixed(1)} GB / {((metrics?.memory.total || 0) / 1024).toFixed(1)} GB
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
                  <CardContent className="pt-6 text-center">
                    <Server className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                    <div className="text-4xl font-bold text-white mb-2">
                      {metrics?.disk.percentage.toFixed(1)}%
                    </div>
                    <p className="text-slate-300 font-medium">Disco</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {metrics?.disk.used} GB / {metrics?.disk.total} GB
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Histórico de Recursos</CardTitle>
                  <CardDescription className="text-slate-400">Últimos 20 puntos de medición</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={metricsHistory}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Area type="monotone" dataKey="cpu" stroke="#a855f7" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                      <Area type="monotone" dataKey="memory" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMemory)" name="Memoria %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Costs View */}
          {currentView === 'costs' && (
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Registro de Costos</CardTitle>
                <CardDescription className="text-slate-400">Total: ${totalCosts.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costs.map((cost) => (
                    <div key={cost.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{cost.description || 'Sin descripción'}</p>
                        <p className="text-sm text-slate-400">{new Date(cost.created_at).toLocaleString('es-ES')}</p>
                      </div>
                      <div className="text-xl font-bold text-blue-400">${parseFloat(cost.amount.toString()).toFixed(2)}</div>
                    </div>
                  ))}
                  {costs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      No hay costos registrados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logs View */}
          {currentView === 'logs' && (
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Sistema de Logs</CardTitle>
                <CardDescription className="text-slate-400">Eventos del sistema en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="mb-2 hover:bg-slate-800 px-2 py-1 rounded transition-colors">
                      <span className="text-blue-400">[{new Date(log.created_at).toLocaleString('es-ES')}]</span>
                      <span className={`ml-2 font-bold ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warning' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="ml-2 text-slate-300">{log.message}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-slate-500 py-12">
                      No hay logs registrados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Configuración del Sistema</CardTitle>
                <CardDescription className="text-slate-400">Ajustes y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Auto-Refresh</h3>
                    <p className="text-sm text-slate-400 mb-3">Actualización automática cada 60 segundos</p>
                    <Badge className="bg-green-500 text-white">Activo</Badge>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Base de Datos</h3>
                    <p className="text-sm text-slate-400">Supabase PostgreSQL</p>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Versión</h3>
                    <p className="text-sm text-slate-400">OpenClaw Mission Control v2.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
