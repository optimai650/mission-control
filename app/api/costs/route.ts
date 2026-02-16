import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin as getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  try {
    const { data: costs, error } = await supabase
      .from('costs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(costs)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching costs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  try {
    const { amount, description } = await request.json()

    const { data: cost, error } = await supabase
      .from('costs')
      .insert([{ amount, description }])
      .select()
      .single()

    if (error) throw error

    // TODO: Add cost alerts with Resend email integration
    // Currently commented out to avoid build issues without env vars

    return NextResponse.json(cost)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating cost' }, { status: 500 })
  }
}