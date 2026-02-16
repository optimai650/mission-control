import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET() {
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
  try {
    const { amount, description } = await request.json()

    const { data: cost, error } = await supabase
      .from('costs')
      .insert([{ amount, description }])
      .select()
      .single()

    if (error) throw error

    // Check total costs and send alert if over threshold
    const { data: totalCosts } = await supabase
      .from('costs')
      .select('amount')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const total = totalCosts?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0

    if (total > 50) { // Threshold example
      await resend.emails.send({
        from: 'alerts@tuapp.com',
        to: 'tuemail@example.com', // Replace with your email
        subject: 'Alerta: Costos altos en OpenClaw',
        html: `<p>Los costos del día han superado $50. Total actual: $${total.toFixed(2)}</p>`
      })
    }

    return NextResponse.json(cost)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating cost' }, { status: 500 })
  }
}