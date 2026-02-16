'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Activity, DollarSign, Server, CheckCircle, Clock, AlertCircle, RefreshCw, Plus, FileText, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'

interface Task {
  id: number
  title: string
  description?: string
  status: string
  created_at: string
}

interface Cost {
  id: number
  amount: number
  description?: string
  created_at: string
}

interface Log {
  id: number
  message: string
  level: string
  created_at: string
}

interface Metrics {
  cpu: { usage: number; count: number }
  memory: { used: number; total: number; percentage: number }
  disk: { used: string; total: string; percentage: number }
  timestamp: string
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [newLog, setNewLog] = useState({ message: '', level: 'info' })

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
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al conectar con el servidor. Verifica tu configuración de Supabase.')
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
        setNewTask({ title: '', description: '' })
        setIsTaskDialogOpen(false)
        fetchData()
      } else {
        setError('Error al crear tarea')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setError('Error al crear tarea')
    }
  }

  const createLog = async () => {
    if (!newLog.message.trim()) return
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      })
      if (response.ok) {
        setNewLog({ message: '', level: 'info' })
        setIsLogDialogOpen(false)
        fetchData()
      } else {
        setError('Error al crear log')
      }
    } catch (error) {
      console.error('Error creating log:', error)
      setError('Error al crear log')
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalCosts = costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0)
  const activeTasks = tasks.filter(task => task.status !== 'completed').length
  const completedToday = tasks.filter(task =>
    task.status === 'completed' &&
    new Date(task.created_at).toDateString() === new Date().toDateString()
  ).length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-500" />
      default: return <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { text: string; className: string }> = {
      completed: { text: 'Completada', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      in_progress: { text: 'En Progreso', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
      pending: { text: 'Pendiente', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' }
    }
    const variant = variants[status] || variants.pending
    return <Badge className={variant.className}>{variant.text}</Badge>
  }

  const getLogLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-green-400'
    }
    return styles[level] || styles.info
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando Mission Control...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mission Control
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Monitoreo en tiempo real de OpenClaw
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-shadow">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error de Conexión</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Costo Total</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalCosts.toFixed(2)}</div>
              <p className="text-xs opacity-80 mt-1">Últimas 24 horas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Tareas Activas</CardTitle>
              <Activity className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeTasks}</div>
              <p className="text-xs opacity-80 mt-1">{completedToday} completadas hoy</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Uso de CPU</CardTitle>
              <Server className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.cpu.usage.toFixed(1) || 0}%</div>
              <p className="text-xs opacity-80 mt-1">{metrics?.cpu.count || 0} núcleos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Memoria</CardTitle>
              <Server className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.memory.percentage.toFixed(1) || 0}%</div>
              <p className="text-xs opacity-80 mt-1">{((metrics?.memory.used || 0) / 1024).toFixed(1)} GB usados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md p-1 rounded-lg">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📋 Tareas
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              📊 Métricas
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              🔍 Logs
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">Gestión de Tareas</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Administra y monitorea el estado de tus tareas
                    </CardDescription>
                  </div>
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Tarea
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Tarea</DialogTitle>
                        <DialogDescription>
                          Añade una tarea al sistema de monitoreo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Título de la tarea"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Descripción (opcional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={createTask} className="bg-blue-600 hover:bg-blue-700">
                          Crear Tarea
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.slice(0, 10).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(task.status)}
                          <div>
                            <p className="font-semibold text-gray-900">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(task.created_at).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No hay tareas registradas</p>
                      <p className="text-gray-500 text-sm mt-1">Crea tu primera tarea para comenzar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Uso de Recursos del Sistema</CardTitle>
                <CardDescription className="text-base">Monitoreo en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={[
                        { name: 'CPU', value: metrics.cpu.usage, color: '#3b82f6' },
                        { name: 'Memoria', value: metrics.memory.percentage, color: '#10b981' },
                        { name: 'Disco', value: metrics.disk.percentage, color: '#f59e0b' }
                      ]}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Uso']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    <div className="animate-pulse">Cargando métricas...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Server className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {metrics?.cpu.usage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 font-medium">CPU</p>
                    <p className="text-xs text-gray-500 mt-1">{metrics?.cpu.count} núcleos disponibles</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <div className="text-4xl font-bold text-green-600 mb-1">
                      {metrics?.memory.percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Memoria</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((metrics?.memory.used || 0) / 1024).toFixed(1)} GB / {((metrics?.memory.total || 0) / 1024).toFixed(1)} GB
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Server className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                    <div className="text-4xl font-bold text-orange-600 mb-1">
                      {metrics?.disk.percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Disco</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics?.disk.used} GB / {metrics?.disk.total} GB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">Sistema de Logs</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Registro de eventos en tiempo real
                    </CardDescription>
                  </div>
                  <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="shadow-md">
                        <FileText className="h-4 w-4 mr-2" />
                        Añadir Log
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Log Manual</DialogTitle>
                        <DialogDescription>
                          Registra un evento en el sistema
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Mensaje del log"
                          value={newLog.message}
                          onChange={(e) => setNewLog({ ...newLog, message: e.target.value })}
                          rows={4}
                        />
                        <select
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newLog.level}
                          onChange={(e) => setNewLog({ ...newLog, level: e.target.value })}
                        >
                          <option value="info">ℹ️ Info</option>
                          <option value="warning">⚠️ Warning</option>
                          <option value="error">❌ Error</option>
                        </select>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={createLog} className="bg-green-600 hover:bg-green-700">
                          Añadir Log
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm h-96 overflow-y-auto border shadow-inner">
                  {logs.length > 0 ? (
                    logs.slice(0, 100).map((log) => (
                      <div key={log.id} className="mb-2 hover:bg-gray-800 px-2 py-1 rounded transition-colors">
                        <span className="text-blue-400">[{new Date(log.created_at).toLocaleString('es-ES')}]</span>
                        <span className={`ml-2 font-bold ${getLogLevelBadge(log.level)}`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay logs registrados</p>
                      <p className="text-xs mt-2">Los eventos del sistema aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
