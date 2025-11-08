'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Settings,
  Archive,
  Trash2,
  Plus,
  Filter,
  BarChart3,
  Users,
  Clock,
  CreditCard,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import PlansPage from '@/components/PlansPage'

// Dados simulados para demonstração
const mockStats = {
  emailsProcessedToday: 1247,
  spamBlocked: 89,
  falsePositives: 3,
  aiEfficiency: 97.2,
  weeklyTrend: [
    { day: 'Seg', processed: 1100, spam: 85 },
    { day: 'Ter', processed: 1350, spam: 92 },
    { day: 'Qua', processed: 980, spam: 67 },
    { day: 'Qui', processed: 1420, spam: 103 },
    { day: 'Sex', processed: 1247, spam: 89 },
    { day: 'Sáb', processed: 890, spam: 45 },
    { day: 'Dom', processed: 650, spam: 32 }
  ]
}

const mockEmails = [
  {
    id: 1,
    from: 'promocoes@loja.com.br',
    subject: 'OFERTA IMPERDÍVEL - 70% OFF',
    category: 'spam',
    confidence: 95,
    time: '10:30',
    preview: 'Aproveite nossa mega promoção...'
  },
  {
    id: 2,
    from: 'security@banco-falso.com',
    subject: 'Urgente: Confirme sua conta',
    category: 'phishing',
    confidence: 98,
    time: '09:15',
    preview: 'Sua conta será bloqueada se não...'
  },
  {
    id: 3,
    from: 'newsletter@empresa.com',
    subject: 'Novidades da semana',
    category: 'promocoes',
    confidence: 87,
    time: '08:45',
    preview: 'Confira as últimas novidades...'
  }
]

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const router = useRouter()

  const handleLogout = () => {
    // Remover do localStorage
    localStorage.removeItem('authToken')
    
    // Remover cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Redirecionar para login
    router.push('/login')
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spam': return 'bg-red-100 text-red-800'
      case 'phishing': return 'bg-orange-100 text-orange-800'
      case 'promocoes': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spam': return <Trash2 className="h-4 w-4" />
      case 'phishing': return <AlertTriangle className="h-4 w-4" />
      case 'promocoes': return <Mail className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">MailClean Brasil</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">E-mails Processados Hoje</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.emailsProcessedToday.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spam Bloqueado</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{mockStats.spamBlocked}</div>
              <p className="text-xs text-muted-foreground">
                7.1% do total processado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falsos Positivos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{mockStats.falsePositives}</div>
              <p className="text-xs text-muted-foreground">
                0.24% taxa de erro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiência da IA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockStats.aiEfficiency}%</div>
              <Progress value={mockStats.aiEfficiency} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Navegação */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="clean">Caixa Limpa</TabsTrigger>
            <TabsTrigger value="quarantine">Quarentena</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Tendência */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tendência Semanal
                  </CardTitle>
                  <CardDescription>
                    E-mails processados e spam bloqueado nos últimos 7 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStats.weeklyTrend.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 text-sm font-medium">{day.day}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-16">{day.processed}</div>
                              <Progress 
                                value={(day.processed / 1500) * 100} 
                                className="flex-1 h-2"
                              />
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-red-600">
                          {day.spam} spam
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Atividade Recente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>
                    Últimas ações da IA de proteção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Spam bloqueado</p>
                        <p className="text-xs text-gray-600">promocoes@loja.com.br - 10:30</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Phishing detectado</p>
                        <p className="text-xs text-gray-600">security@banco-falso.com - 09:15</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">E-mail liberado</p>
                        <p className="text-xs text-gray-600">contato@empresa.com - 08:45</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Caixa Limpa */}
          <TabsContent value="clean" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Caixa Limpa
                    </CardTitle>
                    <CardDescription>
                      E-mails aprovados pela IA - seguros para leitura
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Nova Conta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sua caixa está limpa!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Todos os e-mails importantes estão seguros em sua caixa de entrada original.
                  </p>
                  <Button variant="outline">
                    Verificar E-mails Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quarentena */}
          <TabsContent value="quarantine" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5 text-orange-600" />
                      Quarentena
                    </CardTitle>
                    <CardDescription>
                      E-mails suspeitos bloqueados pela IA - revise antes de liberar
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      Liberar Todos
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEmails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getCategoryIcon(email.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{email.from}</p>
                            <Badge className={getCategoryColor(email.category)}>
                              {email.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {email.confidence}% confiança
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-900 mb-1">{email.subject}</p>
                          <p className="text-xs text-gray-600">{email.preview}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {email.time}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                          Liberar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planos */}
          <TabsContent value="plans" className="space-y-6">
            <PlansPage />
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Remetentes Bloqueados</CardTitle>
                  <CardDescription>
                    Lista de e-mails e domínios sempre bloqueados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">spam@exemplo.com</span>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        Remover
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">*.phishing-site.com</span>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        Remover
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Remetente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Remetentes Permitidos</CardTitle>
                  <CardDescription>
                    Lista de e-mails sempre considerados seguros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">contato@empresa.com</span>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        Remover
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">newsletter@confiavel.com</span>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        Remover
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Remetente
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configurações da IA</CardTitle>
                <CardDescription>
                  Ajuste o comportamento da inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sensibilidade para Spam
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Baixa</span>
                      <Progress value={75} className="flex-1" />
                      <span className="text-sm text-gray-600">Alta</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Atualmente: Alta (75%) - Menos falsos positivos
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sensibilidade para Phishing
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Baixa</span>
                      <Progress value={90} className="flex-1" />
                      <span className="text-sm text-gray-600">Alta</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Atualmente: Máxima (90%) - Proteção total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}