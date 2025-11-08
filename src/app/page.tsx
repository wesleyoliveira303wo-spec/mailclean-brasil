'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, CheckCircle, CreditCard, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && user) {
      router.push('/dashboard')
    }
  }, [mounted, loading, user, router])

  // Aguardar hidratação completa
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
          <span className="text-lg font-medium text-gray-700">Carregando...</span>
        </div>
      </div>
    )
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
          <span className="text-lg font-medium text-gray-700">Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  // Se usuário estiver logado, será redirecionado para dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
          <span className="text-lg font-medium text-gray-700">Redirecionando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">MailClean Brasil</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/planos">
                <Button variant="outline" size="sm">
                  Ver Planos
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            MailClean Brasil
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A primeira solução brasileira de inteligência artificial para proteger seus e-mails contra spam, phishing e ameaças digitais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Mail className="h-5 w-5 mr-2" />
                Começar Grátis
              </Button>
            </Link>
            <Link href="/planos">
              <Button size="lg" variant="outline">
                <CreditCard className="h-5 w-5 mr-2" />
                Ver Planos e Preços
              </Button>
            </Link>
          </div>

          {/* Aviso de Sistema */}
          <div className="mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">
                    Sistema funcionando normalmente. Proteção 24/7 ativa.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Proteção Avançada</CardTitle>
              <CardDescription>
                IA brasileira treinada para detectar ameaças locais e globais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Detecção de spam 97.2% precisa
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Bloqueio de phishing em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Quarentena inteligente
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Fácil de Usar</CardTitle>
              <CardDescription>
                Configure em minutos, proteja para sempre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Integração automática
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Dashboard intuitivo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Relatórios detalhados
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle>Suporte Brasileiro</CardTitle>
              <CardDescription>
                Atendimento em português, horário comercial brasileiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Suporte técnico especializado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Documentação em português
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Conformidade com LGPD
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Números que Impressionam
            </h2>
            <p className="text-gray-600">
              Resultados reais de clientes que confiam no MailClean Brasil
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">97.2%</div>
              <div className="text-gray-600">Precisão na detecção</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-gray-600">E-mails protegidos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">5.000+</div>
              <div className="text-gray-600">Usuários ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Proteção contínua</div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Pronto para Proteger seus E-mails?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Junte-se a milhares de brasileiros que já protegem seus e-mails com nossa IA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Começar Grátis Agora
                  </Button>
                </Link>
                <Link href="/planos">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Ver Todos os Planos
                  </Button>
                </Link>
              </div>
              <p className="text-sm mt-4 opacity-75">
                Sem cartão de crédito • Garantia de 30 dias • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}