import { SUPABASE_SECRET_KEY } from '$env/static/private'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createClient } from '@supabase/supabase-js'
import SupabaseAdapter from '$lib/adapters/supabase'

export const serviceSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY)
export const serviceAdapter = new SupabaseAdapter(serviceSupabase)
