'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, DollarSign, Server, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

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
        <TabsList>
          <TabsTrigger value="tasks">Panel de Tareas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas del Sistema</TabsTrigger>
          <TabsTrigger value="logs">Logs en Vivo</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Recientes</CardTitle>
              <CardDescription>Estado de las tareas activas y completadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas del Sistema</CardTitle>
              <CardDescription>Monitoreo en tiempo real del rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.cpu.usage}%</div>
                    <p className="text-sm text-muted-foreground">CPU Uso</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
                    <p className="text-sm text-muted-foreground">Memoria</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.disk.percentage}%</div>
                    <p className="text-sm text-muted-foreground">Disco</p>
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
              <CardTitle>Logs del Sistema</CardTitle>
              <CardDescription>Stream de logs en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
                {logs.slice(0, 20).map((log) => (
                  <p key={log.id}>
                    [{new Date(log.created_at).toLocaleString()}] {log.message}
                  </p>
                ))}
                {logs.length === 0 && <p>No hay logs disponibles</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}