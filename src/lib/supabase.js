import { createClient } from '@supabase/supabase-js'

// Pastikan untuk mengisi nilai ini di file .env.local Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ganti-dengan-url-project-anda.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'ganti-dengan-anon-key-project-anda'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
