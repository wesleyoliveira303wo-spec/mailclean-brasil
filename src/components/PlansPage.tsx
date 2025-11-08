'use client'

import { useState } from 'react'
import { Check, Crown, Zap, Building2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { stripePromise, plans } from '@/lib/stripe'

export default function PlansPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan] = useState('free') // Simulando plano atual do usuário

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId) return
    
    setLoading(planId)
    
    try {
      // Chamar API para criar sessão do Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planId,
        }),
      })

      const { sessionId } = await response.json()
      
      // Redirecionar para o Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        })
        
        if (error) {
          console.error('Erro no Stripe:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
    } finally {
      setLoading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Zap className="h-6 w-6" />
      case 'pro': return <Crown className="h-6 w-6" />
      case 'enterprise': return <Building2 className="h-6 w-6" />
      default: return <Zap className="h-6 w-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'text-gray-600'
      case 'pro': return 'text-blue-600'
      case 'enterprise': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const isCurrentPlan = (planId: string) => currentPlan === planId

  return (
    <div className=\"space-y-8\">\n      {/* Header */}\n      <div className=\"text-center space-y-4\">\n        <h1 className=\"text-3xl font-bold text-gray-900\">\n          Escolha o Plano Ideal\n        </h1>\n        <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n          Proteja sua caixa de entrada com nossa IA avançada. \n          Comece grátis e faça upgrade quando precisar de mais recursos.\n        </p>\n      </div>\n\n      {/* Planos */}\n      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto\">\n        {plans.map((plan) => (\n          <Card \n            key={plan.id} \n            className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'}`}\n          >\n            {plan.popular && (\n              <div className=\"absolute -top-4 left-1/2 transform -translate-x-1/2\">\n                <Badge className=\"bg-blue-500 text-white px-4 py-1\">\n                  Mais Popular\n                </Badge>\n              </div>\n            )}\n            \n            <CardHeader className=\"text-center space-y-4\">\n              <div className={`mx-auto p-3 rounded-full bg-gray-100 ${getPlanColor(plan.id)}`}>\n                {getPlanIcon(plan.id)}\n              </div>\n              \n              <div>\n                <CardTitle className=\"text-xl\">{plan.name}</CardTitle>\n                <div className=\"mt-2\">\n                  <span className=\"text-3xl font-bold\">\n                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}\n                  </span>\n                  {plan.price > 0 && (\n                    <span className=\"text-gray-600\">/mês</span>\n                  )}\n                </div>\n              </div>\n            </CardHeader>\n            \n            <CardContent className=\"space-y-6\">\n              {/* Recursos */}\n              <ul className=\"space-y-3\">\n                {plan.features.map((feature, index) => (\n                  <li key={index} className=\"flex items-center gap-3\">\n                    <Check className=\"h-4 w-4 text-green-500 flex-shrink-0\" />\n                    <span className=\"text-sm text-gray-700\">{feature}</span>\n                  </li>\n                ))}\n              </ul>\n              \n              {/* Botão de Ação */}\n              <div className=\"pt-4\">\n                {isCurrentPlan(plan.id) ? (\n                  <Button className=\"w-full\" variant=\"outline\" disabled>\n                    Plano Atual\n                  </Button>\n                ) : plan.price === 0 ? (\n                  <Button className=\"w-full\" variant=\"outline\">\n                    Plano Atual\n                  </Button>\n                ) : (\n                  <Button \n                    className=\"w-full\" \n                    onClick={() => handleSubscribe(plan.priceId!, plan.id)}\n                    disabled={loading === plan.id}\n                  >\n                    {loading === plan.id ? (\n                      <div className=\"flex items-center gap-2\">\n                        <div className=\"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin\" />\n                        Processando...\n                      </div>\n                    ) : (\n                      <div className=\"flex items-center gap-2\">\n                        <CreditCard className=\"h-4 w-4\" />\n                        Assinar Agora\n                      </div>\n                    )}\n                  </Button>\n                )}\n              </div>\n            </CardContent>\n          </Card>\n        ))}\n      </div>\n\n      {/* Informações Adicionais */}\n      <div className=\"bg-gray-50 rounded-lg p-8 max-w-4xl mx-auto\">\n        <div className=\"text-center space-y-4\">\n          <h3 className=\"text-xl font-semibold text-gray-900\">\n            Todos os planos incluem:\n          </h3>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mt-6\">\n            <div className=\"flex items-center gap-3\">\n              <div className=\"p-2 bg-blue-100 rounded-full\">\n                <Check className=\"h-4 w-4 text-blue-600\" />\n              </div>\n              <span className=\"text-sm text-gray-700\">Proteção em tempo real</span>\n            </div>\n            \n            <div className=\"flex items-center gap-3\">\n              <div className=\"p-2 bg-blue-100 rounded-full\">\n                <Check className=\"h-4 w-4 text-blue-600\" />\n              </div>\n              <span className=\"text-sm text-gray-700\">IA treinada em português</span>\n            </div>\n            \n            <div className=\"flex items-center gap-3\">\n              <div className=\"p-2 bg-blue-100 rounded-full\">\n                <Check className=\"h-4 w-4 text-blue-600\" />\n              </div>\n              <span className=\"text-sm text-gray-700\">Conformidade com LGPD</span>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* FAQ Rápido */}\n      <div className=\"max-w-2xl mx-auto space-y-6\">\n        <h3 className=\"text-xl font-semibold text-center text-gray-900\">\n          Perguntas Frequentes\n        </h3>\n        \n        <div className=\"space-y-4\">\n          <div className=\"bg-white p-4 rounded-lg border\">\n            <h4 className=\"font-medium text-gray-900 mb-2\">\n              Posso cancelar a qualquer momento?\n            </h4>\n            <p className=\"text-sm text-gray-600\">\n              Sim, você pode cancelar sua assinatura a qualquer momento. \n              Não há taxas de cancelamento ou multas.\n            </p>\n          </div>\n          \n          <div className=\"bg-white p-4 rounded-lg border\">\n            <h4 className=\"font-medium text-gray-900 mb-2\">\n              Como funciona o período de teste?\n            </h4>\n            <p className=\"text-sm text-gray-600\">\n              Todos os planos pagos incluem 7 dias de teste grátis. \n              Você só será cobrado após o período de teste.\n            </p>\n          </div>\n          \n          <div className=\"bg-white p-4 rounded-lg border\">\n            <h4 className=\"font-medium text-gray-900 mb-2\">\n              Meus dados estão seguros?\n            </h4>\n            <p className=\"text-sm text-gray-600\">\n              Sim, utilizamos criptografia de ponta a ponta e seguimos \n              rigorosamente as normas da LGPD para proteção de dados.\n            </p>\n          </div>\n        </div>\n      </div>\n    </div>\n  )\n}