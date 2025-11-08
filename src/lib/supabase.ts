import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis estão disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de configuração
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas. Configure nas variáveis de ambiente.')
}

// Cliente Supabase com verificação de configuração
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'mailclean-brasil'
        }
      }
    })
  : null

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

// Função auxiliar para retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Se é erro de configuração, não tenta novamente
      if (error.message?.includes('Supabase não configurado') || 
          error.message?.includes('Invalid API key') ||
          error.message?.includes('Invalid login credentials')) {
        throw error
      }
      
      // Se é o último attempt, lança o erro
      if (attempt === maxRetries) {
        break
      }
      
      // Aguarda antes do próximo attempt (backoff exponencial)
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Função para criar timeout em promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Operação demorou mais que o esperado')), timeoutMs)
    )
  ])
}

// Funções de autenticação centralizadas
export const auth = {
  // Verificar se o Supabase está configurado
  isConfigured() {
    return supabase !== null && supabaseUrl && supabaseAnonKey
  },

  // Testar conectividade com o Supabase
  async testConnection() {
    if (!supabase) {
      return { success: false, error: 'Supabase não configurado' }
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from('users').select('count').limit(1),
        5000
      )
      
      if (error && !error.message.includes('relation "users" does not exist')) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erro de conectividade' 
      }
    }
  },

  // Registrar novo usuário
  async signUp(email: string, password: string, name: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name
            }
          }
        }),
        15000
      )
      
      if (error) {
        // Melhorar mensagens de erro
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade. Verifique sua conexão com a internet e tente novamente.')
        }
        throw error
      }
      
      return data
    })
  },

  // Fazer login
  async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    // Validar entrada
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        }),
        15000
      )
      
      if (error) {
        // Melhorar mensagens de erro específicas
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conectividade. Verifique sua conexão com a internet e as configurações do Supabase.')
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.')
        }
        if (error.message.includes('Too many requests')) {
          throw new Error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.')
        }
        throw error
      }
      
      return data
    }, 2) // Máximo 2 tentativas para login
  },

  // Fazer logout
  async signOut() {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        10000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade durante logout.')
        }
        throw error
      }
    })
  },

  // Recuperar senha
  async resetPassword(email: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email.trim().toLowerCase()),
        10000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade. Tente novamente.')
        }
        throw error
      }
      
      return data
    })
  },

  // Reenviar confirmação de email
  async resendConfirmation(email: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase.auth.resend({
          type: 'signup',
          email: email.trim().toLowerCase()
        }),
        10000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade. Tente novamente.')
        }
        throw error
      }
      
      return data
    })
  },

  // Obter sessão atual
  async getSession() {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        5000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          console.warn('Erro de conectividade ao obter sessão:', error.message)
          return null
        }
        throw error
      }
      
      return session
    } catch (error: any) {
      console.warn('Erro ao obter sessão:', error.message)
      return null
    }
  },

  // Obter usuário atual
  async getUser() {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    try {
      const { data: { user }, error } = await withTimeout(
        supabase.auth.getUser(),
        5000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          console.warn('Erro de conectividade ao obter usuário:', error.message)
          return null
        }
        throw error
      }
      
      return user
    } catch (error: any) {
      console.warn('Erro ao obter usuário:', error.message)
      return null
    }
  }
}

// Funções para gerenciar dados do usuário
export const userService = {
  // Criar perfil do usuário na tabela users
  async createUserProfile(userId: string, email: string, name: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .insert([{
            id: userId,
            email: email.trim().toLowerCase(),
            name: name.trim(),
            plan: 'free',
            created_at: new Date().toISOString()
          }])
          .select()
          .single(),
        10000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade ao criar perfil.')
        }
        throw error
      }
      
      return data
    })
  },

  // Buscar perfil do usuário
  async getUserProfile(userId: string) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single(),
        10000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade ao buscar perfil.')
        }
        throw error
      }
      
      return data
    })
  },

  // Atualizar perfil do usuário
  async updateUserProfile(userId: string, updates: Partial<User>) {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    return retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single(),
        10000
      )
      
      if (error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conectividade ao atualizar perfil.')
        }
        throw error
      }
      
      return data
    })
  }
}