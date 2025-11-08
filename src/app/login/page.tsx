'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simular login para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simular token de autenticação
      const authToken = 'demo-token-' + Date.now()
      
      // Salvar no localStorage para compatibilidade
      localStorage.setItem('authToken', authToken)
      
      // Salvar no cookie para o middleware
      document.cookie = `authToken=${authToken}; path=/; max-age=86400; SameSite=Lax`
      
      console.log('Login bem-sucedido:', email)
      
      // Redirecionar para o dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Erro inesperado no login:', error)
      setError('Erro inesperado. Tente novamente em alguns instantes.')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
          </div>
          <CardTitle>Fazer Login</CardTitle>
          <CardDescription>
            Entre na sua conta para acessar o dashboard
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href="/register" 
                className="text-blue-600 hover:underline font-medium"
              >
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}