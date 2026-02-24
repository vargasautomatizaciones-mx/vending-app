import { createClient } from '@supabase/supabase-js'

// --- 100% BROWSER CLIENT (Zero Netlify Functions) ---
// This application connects directly from the user's browser to Supabase.
// No serverless functions or backend proxies are used.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
