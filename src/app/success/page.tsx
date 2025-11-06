'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // Aqui você pode fazer uma chamada para verificar o status da sessão
      // Por enquanto, vamos simular o sucesso
      setTimeout(() => {
        setSession({
          customer_email: 'usuario@exemplo.com',
          amount_total: 2900,
          currency: 'brl'
        })
        setLoading(false)
      }, 1000)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Valor pago:</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {session?.amount_total ? (session.amount_total / 100).toFixed(2) : '29,00'}
            </p>
          </div>
          
          <div className="text-left space-y-2">
            <h3 className="font-semibold text-gray-900">O que acontece agora:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sua conta foi automaticamente atualizada
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Você pode conectar até 3 contas de e-mail
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Proteção avançada contra phishing ativada
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Relatórios detalhados disponíveis
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Shield className="h-4 w-4 mr-2" />
                Acessar MailClean Brasil
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500">
            Um e-mail de confirmação foi enviado para {session?.customer_email || 'seu e-mail'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}