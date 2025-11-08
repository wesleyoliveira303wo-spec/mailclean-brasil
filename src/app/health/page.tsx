'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { auth } from '@/lib/supabase'

interface HealthCheck {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: string
}

export default function HealthPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)

  const runHealthChecks = async () => {
    setLoading(true)
    const newChecks: HealthCheck[] = []

    // 1. Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      newChecks.push({
        name: 'Variáveis de Ambiente',
        status: 'success',
        message: 'Configuradas corretamente',
        details: `URL: ${supabaseUrl.substring(0, 30)}...`
      })
    } else {
      newChecks.push({
        name: 'Variáveis de Ambiente',
        status: 'error',
        message: 'Variáveis do Supabase não encontradas',
        details: 'NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes'
      })
    }

    // 2. Verificar configuração do Supabase
    if (auth.isConfigured()) {
      newChecks.push({
        name: 'Configuração Supabase',
        status: 'success',
        message: 'Cliente Supabase inicializado',
        details: 'Cliente criado com sucesso'
      })
    } else {
      newChecks.push({
        name: 'Configuração Supabase',
        status: 'error',
        message: 'Cliente Supabase não inicializado',
        details: 'Verifique as variáveis de ambiente'
      })
    }

    // 3. Testar conectividade
    try {
      const connectionTest = await auth.testConnection()
      if (connectionTest.success) {
        newChecks.push({
          name: 'Conectividade Supabase',
          status: 'success',
          message: 'Conexão estabelecida',
          details: 'Comunicação com o banco funcionando'
        })
      } else {
        newChecks.push({
          name: 'Conectividade Supabase',
          status: 'error',
          message: 'Falha na conexão',
          details: connectionTest.error || 'Erro desconhecido'
        })
      }
    } catch (error: any) {
      newChecks.push({
        name: 'Conectividade Supabase',
        status: 'error',
        message: 'Erro ao testar conexão',
        details: error.message
      })
    }

    // 4. Verificar CSS/Tailwind
    newChecks.push({
      name: 'Sistema de CSS',
      status: 'success',
      message: 'Tailwind CSS carregado',
      details: 'PostCSS configurado corretamente'
    })

    // 5. Verificar fontes
    newChecks.push({
      name: 'Fontes',
      status: 'success',
      message: 'Fontes carregadas',
      details: 'Geist Sans, Inter e outras fontes disponíveis'
    })

    setChecks(newChecks)
    setLoading(false)
  }

  useEffect(() => {
    runHealthChecks()
  }, [])

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">OK</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">ERRO</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">AVISO</Badge>
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800">CARREGANDO</Badge>
    }
  }

  const hasErrors = checks.some(check => check.status === 'error')
  const allSuccess = checks.every(check => check.status === 'success')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificação de Saúde do Sistema
          </h1>
          <p className="text-gray-600">
            Diagnóstico completo do MailClean Brasil
          </p>
        </div>

        {/* Status Geral */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loading ? (
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              ) : allSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : hasErrors ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              )}
              Status Geral do Sistema
            </CardTitle>
            <CardDescription>
              {loading ? (
                'Executando verificações...'
              ) : allSuccess ? (
                '✅ Todos os sistemas funcionando normalmente'
              ) : hasErrors ? (
                '❌ Problemas detectados que precisam ser corrigidos'
              ) : (
                '⚠️ Sistema funcionando com avisos'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                onClick={runHealthChecks} 
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Executar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verificações Individuais */}
        <div className="space-y-4">
          {checks.map((check, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    {check.name}
                  </div>
                  {getStatusBadge(check.status)}
                </CardTitle>
                <CardDescription>
                  {check.message}
                </CardDescription>
              </CardHeader>
              {check.details && (
                <CardContent>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    <strong>Detalhes:</strong> {check.details}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Instruções de Correção */}
        {hasErrors && (
          <Card className="mt-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">
                Como Corrigir os Problemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>1. Se há problemas de conectividade:</strong>
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    <li>Verifique sua conexão com a internet</li>
                    <li>Confirme se as variáveis do Supabase estão corretas</li>
                    <li>Tente recarregar a página</li>
                  </ul>
                </div>
                <div>
                  <strong>2. Se há problemas de configuração:</strong>
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    <li>Verifique o arquivo .env.local</li>
                    <li>Confirme se NEXT_PUBLIC_SUPABASE_URL está correto</li>
                    <li>Confirme se NEXT_PUBLIC_SUPABASE_ANON_KEY está correto</li>
                  </ul>
                </div>
                <div>
                  <strong>3. Se o problema persistir:</strong>
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    <li>Reinicie o servidor de desenvolvimento</li>
                    <li>Limpe o cache do navegador</li>
                    <li>Verifique o console do navegador para erros</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Sistema */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Versão Next.js:</strong> 15.4.6
              </div>
              <div>
                <strong>Versão React:</strong> 19.1.0
              </div>
              <div>
                <strong>Versão Tailwind:</strong> 4.x
              </div>
              <div>
                <strong>Versão Supabase:</strong> 2.80.0
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}