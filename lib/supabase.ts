import { createClient } from '@supabase/supabase-js'

// Client for server-side operations (API routes) - bypasses RLS
export const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('Supabase environment variables not configured')
    return null
  }
  return createClient(url, key)
}

// Client for client-side operations (if needed)
export const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn('Supabase environment variables not configured')
    return null
  }
  return createClient(url, key)
}