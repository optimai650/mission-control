import { NextResponse } from 'next/server'
import osu from 'node-os-utils'

export async function GET() {
  try {
    const cpu = osu.cpu
    const mem = osu.mem
    const drive = osu.drive

    const cpuUsage = await cpu.usage()
    const memInfo = await mem.info()
    const driveInfo = await drive.info()

    const metrics = {
      cpu: {
        usage: cpuUsage,
        count: cpu.count()
      },
      memory: {
        used: memInfo.usedMemMb,
        total: memInfo.totalMemMb,
        percentage: Math.round((memInfo.usedMemMb / memInfo.totalMemMb) * 100)
      },
      disk: {
        used: driveInfo.usedGb,
        total: driveInfo.totalGb,
        percentage: Math.round((parseFloat(driveInfo.usedGb) / parseFloat(driveInfo.totalGb)) * 100)
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 })
  }
}