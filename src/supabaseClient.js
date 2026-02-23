import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. App will use localStorage fallback (if implemented) or fail.')
} else {
    console.log('--- Supabase Config ---');
    console.log('Endpoint:', supabaseUrl.substring(0, 15) + '...');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
