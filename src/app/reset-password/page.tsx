'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Verificar se há um token válido na URL
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    
    if (access_token && refresh_token) {
      setValidToken(true)
      
      // Definir a sessão com os tokens
      supabase.auth.setSession({
        access_token,
        refresh_token
      })
    } else {
      setError('Link de redefinição inválido ou expirado.')
    }
  }, [searchParams])

  const validateForm = () => {
    if (!password) {
      setError('Nova senha é obrigatória.')
      return false
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      toast({
        title: "Senha alterada com sucesso!",
        description: "Você já pode fazer login com sua nova senha.",
      })
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      
      let errorMessage = 'Erro ao redefinir senha. Tente novamente.'
      
      if (error.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (error.message?.includes('New password should be different')) {
        errorMessage = 'A nova senha deve ser diferente da atual.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      toast({
        title: "Erro ao redefinir senha",
        description: errorMessage,
        variant: "destructive",
      })
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
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
            </div>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Senha alterada!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Redirecionando para o login...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
            </div>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Link inválido</CardTitle>
            <CardDescription>
              {error || 'Link de redefinição inválido ou expirado.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/forgot-password')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Solicitar novo link
            </Button>
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
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
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
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-600">Mínimo de 6 caracteres</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                'Alterar senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}