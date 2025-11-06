import { supabase } from './supabase'
import type { EmailStats, FilterRule, QuarantineEmail, EmailAccount } from './supabase'

// Estatísticas do usuário
export async function getUserStats(userId: string): Promise<EmailStats | null> {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('email_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getWeeklyStats(userId: string): Promise<EmailStats[]> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const { data, error } = await supabase
    .from('email_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', weekAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

// Regras de filtro
export async function getUserFilterRules(userId: string): Promise<FilterRule[]> {
  const { data, error } = await supabase
    .from('filter_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createFilterRule(
  userId: string, 
  type: 'blocked' | 'allowed', 
  emailPattern: string
): Promise<FilterRule> {
  const { data, error } = await supabase
    .from('filter_rules')
    .insert([
      {
        user_id: userId,
        type,
        email_pattern: emailPattern,
        is_active: true
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleFilterRule(ruleId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('filter_rules')
    .update({ is_active: isActive })
    .eq('id', ruleId)

  if (error) throw error
}

export async function deleteFilterRule(ruleId: string): Promise<void> {
  const { error } = await supabase
    .from('filter_rules')
    .delete()
    .eq('id', ruleId)

  if (error) throw error
}

// E-mails em quarentena
export async function getQuarantineEmails(userId: string): Promise<QuarantineEmail[]> {
  const { data, error } = await supabase
    .from('quarantine_emails')
    .select('*')
    .eq('user_id', userId)
    .eq('is_reviewed', false)
    .order('received_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function releaseQuarantineEmail(emailId: string): Promise<void> {
  const { error } = await supabase
    .from('quarantine_emails')
    .update({ is_reviewed: true })
    .eq('id', emailId)

  if (error) throw error
}

export async function deleteQuarantineEmail(emailId: string): Promise<void> {
  const { error } = await supabase
    .from('quarantine_emails')
    .delete()
    .eq('id', emailId)

  if (error) throw error
}

// Contas de e-mail
export async function getUserEmailAccounts(userId: string): Promise<EmailAccount[]> {
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function addEmailAccount(
  userId: string, 
  email: string, 
  provider: string
): Promise<EmailAccount> {
  const { data, error } = await supabase
    .from('email_accounts')
    .insert([
      {
        user_id: userId,
        email,
        provider,
        is_active: true
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// Atualizar estatísticas diárias
export async function updateDailyStats(
  userId: string,
  emailsProcessed: number,
  spamBlocked: number,
  falsePositives: number,
  aiEfficiency: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  
  const { error } = await supabase
    .from('email_stats')
    .upsert([
      {
        user_id: userId,
        date: today,
        emails_processed: emailsProcessed,
        spam_blocked: spamBlocked,
        false_positives: falsePositives,
        ai_efficiency: aiEfficiency
      }
    ])

  if (error) throw error
}