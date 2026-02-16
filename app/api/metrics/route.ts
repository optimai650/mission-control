import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock metrics for demo purposes (since node-os-utils may not work in serverless environments)
    const metrics = {
      cpu: {
        usage: Math.floor(Math.random() * 100), // Random 0-100%
        count: 4
      },
      memory: {
        used: 2048,
        total: 8192,
        percentage: 25
      },
      disk: {
        used: '50',
        total: '256',
        percentage: 20
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 })
  }
}