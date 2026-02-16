import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin as getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { message, level } = await request.json()

    const { data: log, error } = await supabase
      .from('logs')
      .insert([{ message, level: level || 'info' }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(log)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating log' }, { status: 500 })
  }
}