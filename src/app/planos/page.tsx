'use client'

import { useState } from 'react'
import { Shield, Mail, Crown, Zap, CheckCircle, CreditCard, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function PlanosPage() {
  const [processingPayment, setProcessingPayment] = useState(false)

  const handleSubscribe = async (planType: 'pro' | 'empresarial') => {
    setProcessingPayment(true)
    
    try {
      // Chamar API para criar sessão de checkout do Stripe
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          userEmail: 'usuario@exemplo.com', // Em produção, pegar do contexto de autenticação
          userId: 'user_123', // Em produção, pegar do contexto de autenticação
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      // Redirecionar para o Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de checkout não recebida')
      }
      
    } catch (error) {
      console.error('Erro no pagamento:', error)
      alert(`Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setProcessingPayment(false)
    }
  }

  const planos = [
    {
      id: 'gratuito',
      nome: 'Gratuito',
      preco: 'R$ 0',
      periodo: '/mês',
      descricao: 'Ideal para uso pessoal básico',
      recursos: [
        '1 conta de e-mail',
        'Até 200 e-mails analisados/mês',
        'Detecção básica de spam',
        'Suporte por e-mail'
      ],
      popular: false,
      cor: 'gray',
      icon: Mail
    },
    {
      id: 'pro',
      nome: 'Pro',
      preco: 'R$ 34,99',
      periodo: '/mês',
      descricao: 'Para usuários que precisam de mais proteção',
      recursos: [
        '3 contas de e-mail',
        '5.000 e-mails analisados/mês',
        'Quarentena automática',
        'Detecção avançada de phishing',
        'Relatórios detalhados',
        'Suporte prioritário'
      ],
      popular: true,
      cor: 'blue',
      icon: Zap
    },
    {
      id: 'empresarial',
      nome: 'Empresarial',
      preco: 'R$ 89,99',
      periodo: '/mês',
      descricao: 'Solução completa para empresas',
      recursos: [
        'Contas ilimitadas',
        'E-mails ilimitados',
        'Multiusuário com permissões',
        'API para integração',
        'Relatórios empresariais',
        'Dashboard administrativo',
        'Suporte 24/7',
        'Treinamento personalizado'
      ],
      popular: false,
      cor: 'purple',
      icon: Crown
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Voltar
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">MailClean Brasil</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Proteja seus e-mails com a melhor tecnologia brasileira de inteligência artificial. 
            Comece grátis e evolua conforme suas necessidades.
          </p>
          
          {/* Garantia */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Garantia de 30 dias ou seu dinheiro de volta
          </div>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {planos.map((plano) => {
            const IconComponent = plano.icon
            return (
              <Card 
                key={plano.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plano.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plano.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1 flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plano.cor === 'gray' ? 'bg-gray-100' :
                      plano.cor === 'blue' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      <IconComponent className={`h-8 w-8 ${
                        plano.cor === 'gray' ? 'text-gray-600' :
                        plano.cor === 'blue' ? 'text-blue-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plano.nome}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-4xl font-bold text-gray-900">{plano.preco}</span>
                    <span className="text-gray-600">{plano.periodo}</span>
                  </div>
                  <CardDescription className="mt-2">{plano.descricao}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plano.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{recurso}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    {plano.id === 'gratuito' ? (
                      <Link href="/register">
                        <Button className="w-full" variant="outline">
                          Começar Grátis
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className={`w-full ${
                          plano.popular 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : plano.id === 'empresarial' 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : ''
                        }`}
                        onClick={() => handleSubscribe(plano.id as 'pro' | 'empresarial')}
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Assinar Agora
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Segurança Garantida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Pagamentos processados via Stripe (segurança mundial)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Dados criptografados e protegidos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Conformidade com LGPD
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cancele a qualquer momento
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Suporte Brasileiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Atendimento em português
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Horário comercial brasileiro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Documentação em português
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Treinamento personalizado (plano Empresarial)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Rápido */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h4>
                <p className="text-gray-600">Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Como funciona a garantia?</h4>
                <p className="text-gray-600">Se não ficar satisfeito em 30 dias, devolvemos 100% do valor pago, sem perguntas.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Posso mudar de plano depois?</h4>
                <p className="text-gray-600">Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Os dados ficam seguros?</h4>
                <p className="text-gray-600">Sim, usamos criptografia de ponta e seguimos as melhores práticas de segurança.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}