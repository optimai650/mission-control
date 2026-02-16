import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin as getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  try {
    const { title, description, status } = await request.json()

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{ title, description, status: status || 'pending' }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}