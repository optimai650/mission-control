'use client'

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Activity, DollarSign, Server, CheckCircle, Clock, AlertCircle, RefreshCw, Plus, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [newCost, setNewCost] = useState({ amount: '', description: '' })
  const [newLog, setNewLog] = useState({ message: '', level: 'info' })

  const fetchData = async () => {
    try {
      const [tasksRes, costsRes, logsRes, metricsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/costs'),
        fetch('/api/logs'),
        fetch('/api/metrics')
      ])

      const [tasksData, costsData, logsData, metricsData] = await Promise.all([
        tasksRes.json(),
        costsRes.json(),
        logsRes.json(),
        metricsRes.json()
      ])

      setTasks(tasksData)
      setCosts(costsData)
      setLogs(logsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error fetching data:', error)
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
        fetchData()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const createCost = async () => {
    if (!newCost.amount || !newCost.description.trim()) return
    try {
      const response = await fetch('/api/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(newCost.amount),
          description: newCost.description
        })
      })
      if (response.ok) {
        setNewCost({ amount: '', description: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating cost:', error)
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
        fetchData()
      }
    } catch (error) {
      console.error('Error creating log:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
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
      default: return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="secondary">Completada</Badge>
      case 'in_progress': return <Badge variant="default">En Progreso</Badge>
      default: return <Badge variant="destructive">Pendiente</Badge>
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Cargando dashboard...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mission Control Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitoreo y control en tiempo real de OpenClaw</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Desde ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks}</div>
            <p className="text-xs text-muted-foreground">{completedToday} completadas hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Uso</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu.usage || 0}%</div>
            <p className="text-xs text-muted-foreground">{metrics?.cpu.count || 0} núcleos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memoria</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory.percentage || 0}%</div>
            <p className="text-xs text-muted-foreground">{(metrics?.memory.used || 0) / 1024} GB usados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Panel de Tareas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas del Sistema</TabsTrigger>
          <TabsTrigger value="logs">Logs del Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tareas del Sistema</CardTitle>
                  <CardDescription>Gestión de tareas activas y completadas</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Tarea</DialogTitle>
                      <DialogDescription>
                        Añade una nueva tarea al sistema de monitoreo.
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
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={createTask}>Crear Tarea</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(task.status)}
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No hay tareas. Crea una nueva para empezar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
                <CardDescription>Métricas actuales del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'CPU', value: metrics.cpu.usage, color: '#3b82f6' },
                      { name: 'Memoria', value: metrics.memory.percentage, color: '#10b981' },
                      { name: 'Disco', value: metrics.disk.percentage, color: '#f59e0b' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Uso']} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground h-64 flex items-center justify-center">Cargando métricas...</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Recursos</CardTitle>
                <CardDescription>Visión general del uso</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'CPU Usado', value: metrics.cpu.usage, fill: '#3b82f6' },
                          { name: 'CPU Libre', value: 100 - metrics.cpu.usage, fill: '#e5e7eb' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cpu-used" fill="#3b82f6" />
                        <Cell key="cpu-free" fill="#e5e7eb" />
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground h-64 flex items-center justify-center">Cargando métricas...</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{metrics.cpu.usage}%</div>
                    <p className="text-sm text-gray-600">CPU ({metrics.cpu.count} núcleos)</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{metrics.memory.percentage}%</div>
                    <p className="text-sm text-gray-600">Memoria ({(metrics.memory.used / 1024).toFixed(1)} GB usados)</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Server className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-600">{metrics.disk.percentage}%</div>
                    <p className="text-sm text-gray-600">Disco ({metrics.disk.used} GB usados)</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">Cargando métricas...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Logs del Sistema</CardTitle>
                  <CardDescription>Registro de eventos en tiempo real</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Añadir Log
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir Log Manual</DialogTitle>
                      <DialogDescription>
                        Registra un evento o mensaje en el sistema de logs.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Mensaje del log"
                        value={newLog.message}
                        onChange={(e) => setNewLog({ ...newLog, message: e.target.value })}
                      />
                      <select
                        className="w-full p-2 border rounded"
                        value={newLog.level}
                        onChange={(e) => setNewLog({ ...newLog, level: e.target.value })}
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                    <DialogFooter>
                      <Button onClick={createLog}>Añadir Log</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto border">
                {logs.slice(0, 50).map((log) => (
                  <div key={log.id} className="mb-1">
                    <span className="text-blue-400">[{new Date(log.created_at).toLocaleString()}]</span>
                    <span className={`ml-2 ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warning' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No hay logs. Añade uno manualmente o espera eventos del sistema.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}