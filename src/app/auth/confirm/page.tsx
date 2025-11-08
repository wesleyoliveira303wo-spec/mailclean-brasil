'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Pegar os parâmetros da URL
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        console.log('Parâmetros recebidos:', { token_hash, type })

        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Link de confirmação inválido. Parâmetros ausentes.')
          return
        }

        // Usar exchangeCodeForSession para confirmar o email
        const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash)

        if (error) {
          console.error('Erro na confirmação:', error)
          setStatus('error')
          
          if (error.message.includes('expired')) {
            setMessage('Link de confirmação expirado. Solicite um novo link.')
          } else if (error.message.includes('invalid')) {
            setMessage('Link de confirmação inválido.')
          } else {
            setMessage(`Erro ao confirmar e-mail: ${error.message}`)
          }
          return
        }

        if (data.user && data.session) {
          console.log('Email confirmado com sucesso:', data.user.email)
          setStatus('success')
          setMessage('E-mail confirmado com sucesso! Redirecionando para o dashboard...')
          
          // Redirecionar para o dashboard após 2 segundos
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Não foi possível confirmar o e-mail. Dados inválidos.')
        }

      } catch (error: any) {
        console.error('Erro inesperado:', error)
        setStatus('error')
        setMessage(`Erro inesperado: ${error.message || 'Tente novamente.'}`)
      }
    }

    // Só executar se tiver parâmetros na URL
    if (searchParams.get('token_hash')) {
      confirmEmail()
    } else {
      setStatus('error')
      setMessage('Link de confirmação inválido. Acesse através do link enviado por e-mail.')
    }
  }, [searchParams, router])

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleResendConfirmation = () => {
    router.push('/register')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === 'error' && (
              <AlertTriangle className="h-16 w-16 text-red-600" />
            )}
          </div>
          
          <CardTitle className={`
            ${status === 'loading' ? 'text-blue-600' : ''}
            ${status === 'success' ? 'text-green-600' : ''}
            ${status === 'error' ? 'text-red-600' : ''}
          `}>
            {status === 'loading' && 'Confirmando e-mail...'}
            {status === 'success' && 'E-mail confirmado!'}
            {status === 'error' && 'Erro na confirmação'}
          </CardTitle>
          
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-gray-600">
              Aguarde enquanto confirmamos seu e-mail...
            </p>
          )}
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Sua conta foi ativada com sucesso!
              </p>
              <p className="text-sm text-gray-600">
                Você já pode fazer login normalmente.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleResendConfirmation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Solicitar novo link
                </Button>
                
                <Button 
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full"
                >
                  Voltar ao login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}