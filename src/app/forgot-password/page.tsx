'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ArrowLeft, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!auth.isConfigured()) {
      setError('Supabase não configurado. Configure as variáveis de ambiente primeiro.')
      return
    }
    
    if (!email) {
      setError('Por favor, digite seu e-mail.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await auth.resetPassword(email)
      setSuccess(true)
      
    } catch (error: any) {
      console.error('Erro ao recuperar senha:', error)
      
      let errorMessage = 'Erro inesperado. Tente novamente.'
      
      if (error.message?.includes('conectividade')) {
        errorMessage = 'Problema de conectividade. Verifique sua conexão com a internet.'
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'E-mail inválido. Verifique o formato do e-mail.'
      } else if (error.message?.includes('User not found')) {
        errorMessage = 'E-mail não encontrado. Verifique se o e-mail está correto.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
            </div>
            <CardTitle className="text-green-600">E-mail Enviado!</CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Instruções enviadas</span>
              </div>
              <p className="text-sm text-green-700">
                Enviamos um e-mail com instruções para redefinir sua senha para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Voltar ao Login
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full"
              >
                Enviar para outro e-mail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
          </div>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber instruções de recuperação
          </CardDescription>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}