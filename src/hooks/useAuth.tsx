'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, auth, userService, User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!supabase) {
      console.warn('Supabase não configurado, funcionando em modo offline')
      setLoading(false)
      return
    }

    // Verificar sessão inicial
    getInitialSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setSupabaseUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function getInitialSession() {
    try {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erro ao obter sessão inicial:', error)
        setLoading(false)
        return
      }

      if (session?.user) {
        console.log('Sessão inicial encontrada:', session.user.email)
        setSupabaseUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        console.log('Nenhuma sessão inicial encontrada')
      }
    } catch (error) {
      console.error('Erro inesperado ao obter sessão inicial:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const profile = await userService.getUserProfile(userId)
      console.log('Perfil carregado:', profile.email)
      setUser(profile)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      // Se não encontrar o perfil, criar um novo
      if (supabaseUser) {
        try {
          console.log('Criando novo perfil para:', supabaseUser.email)
          const newProfile = await userService.createUserProfile(
            userId,
            supabaseUser.email || '',
            supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário'
          )
          setUser(newProfile)
        } catch (createError) {
          console.error('Erro ao criar perfil:', createError)
        }
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    console.log('Tentando fazer login com:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Erro no login:', error)
      throw error
    }
    
    if (data.user) {
      console.log('Login bem-sucedido:', data.user.email)
      setSupabaseUser(data.user)
      await loadUserProfile(data.user.id)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    console.log('Tentando registrar:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm` : undefined
      }
    })
    
    if (error) {
      console.error('Erro no registro:', error)
      throw error
    }
    
    console.log('Registro iniciado, aguardando confirmação de email:', email)
    
    // Não definir usuário ainda - aguardar confirmação de email
    return data
  }

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    console.log('Fazendo logout')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erro no logout:', error)
      throw error
    }
    setUser(null)
    setSupabaseUser(null)
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
    }

    console.log('Solicitando reset de senha para:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
    })
    if (error) {
      console.error('Erro ao solicitar reset:', error)
      throw error
    }
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}