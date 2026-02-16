import { NextResponse } from 'next/server'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Función para obtener uso de CPU (promedio de carga)
function getCpuUsage(): number {
  const loadAvg = os.loadavg()[0] // Load average de 1 minuto
  const cpuCount = os.cpus().length
  const cpuUsagePercent = (loadAvg / cpuCount) * 100
  return Math.min(Math.round(cpuUsagePercent * 10) / 10, 100)
}

// Función para obtener información de disco (Linux/macOS)
async function getDiskUsage(): Promise<{ used: string; total: string; percentage: number }> {
  try {
    const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $3,$2,$5}'")
    const [used, total, percentStr] = stdout.trim().split(' ')
    const percentage = parseInt(percentStr.replace('%', ''))
    
    return {
      used: used.replace('G', ''),
      total: total.replace('G', ''),
      percentage: isNaN(percentage) ? 0 : percentage
    }
  } catch (error) {
    // Fallback para Windows o errores
    return {
      used: '0',
      total: '100',
      percentage: 0
    }
  }
}

export async function GET() {
  try {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memoryPercentage = Math.round((usedMem / totalMem) * 100 * 10) / 10

    const cpuUsage = getCpuUsage()
    const cpuCount = os.cpus().length

    const diskInfo = await getDiskUsage()

    const metrics = {
      cpu: {
        usage: cpuUsage,
        count: cpuCount
      },
      memory: {
        used: Math.round(usedMem / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        percentage: memoryPercentage
      },
      disk: diskInfo,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Error fetching system metrics' },
      { status: 500 }
    )
  }
}
