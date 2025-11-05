import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These are the public URL and Anon Key for your Supabase project.
// RLS (Row Level Security) should be enabled in your Supabase tables
// to ensure data is secure.
const supabaseUrl = 'https://xoznfiravojvqketkewv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvem5maXJhdm9qdnFrZXRrZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTAyNTQsImV4cCI6MjA3Nzg2NjI1NH0.yJrVqrSWuifXkeelSYGjmg8hD3IwStcpsuM68ydsRt0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
