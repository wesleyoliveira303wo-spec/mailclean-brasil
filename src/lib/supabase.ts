import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface EmailAccount {
  id: string
  user_id: string
  email: string
  provider: string
  is_active: boolean
  created_at: string
}

export interface EmailStats {
  id: string
  user_id: string
  date: string
  emails_processed: number
  spam_blocked: number
  false_positives: number
  ai_efficiency: number
}

export interface FilterRule {
  id: string
  user_id: string
  type: 'blocked' | 'allowed'
  email_pattern: string
  is_active: boolean
  created_at: string
}

export interface QuarantineEmail {
  id: string
  user_id: string
  from_email: string
  subject: string
  category: 'spam' | 'phishing'
  confidence: number
  received_at: string
  is_reviewed: boolean
}