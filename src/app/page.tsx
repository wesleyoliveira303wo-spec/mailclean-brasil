'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Mail, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Filter,
  Users,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Search,
  Download,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/auth'
import { 
  getUserStats, 
  getWeeklyStats, 
  getUserFilterRules, 
  createFilterRule, 
  toggleFilterRule, 
  deleteFilterRule,
  getQuarantineEmails,
  releaseQuarantineEmail,
  deleteQuarantineEmail,
  getUserEmailAccounts,
  addEmailAccount
} from '@/lib/database'
import type { User, EmailStats, FilterRule, QuarantineEmail, EmailAccount } from '@/lib/supabase'

export default function MailCleanBrasil() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { toast } = useToast()

  // Estados para dados reais
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<EmailStats[]>([])
  const [filterRules, setFilterRules] = useState<FilterRule[]>([])
  const [quarantineEmails, setQuarantineEmails] = useState<QuarantineEmail[]>([])
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [newRuleEmail, setNewRuleEmail] = useState('')
  const [newRuleType, setNewRuleType] = useState<'blocked' | 'allowed'>('blocked')

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth()
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await getCurrentUser()
        setUser(userProfile)
        loadUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        clearUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const userProfile = await getCurrentUser()
      setUser(userProfile)
      if (userProfile) {
        loadUserData(userProfile.id)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      const [
        userStats,
        weeklyData,
        rules,
        quarantine,
        accounts
      ] = await Promise.all([
        getUserStats(userId),
        getWeeklyStats(userId),
        getUserFilterRules(userId),
        getQuarantineEmails(userId),
        getUserEmailAccounts(userId)
      ])

      setStats(userStats)
      setWeeklyStats(weeklyData)
      setFilterRules(rules)
      setQuarantineEmails(quarantine)
      setEmailAccounts(accounts)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const clearUserData = () => {
    setStats(null)
    setWeeklyStats([])
    setFilterRules([])
    setQuarantineEmails([])
    setEmailAccounts([])
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    try {
      if (isLogin) {
        await signIn(email, password)
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao MailClean Brasil.",
        })
      } else {
        await signUp(email, password, name)
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar a conta.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer logout.",
        variant: "destructive",
      })
    }
  }

  const handleAddFilterRule = async () => {
    if (!user || !newRuleEmail.trim()) return

    try {
      const newRule = await createFilterRule(user.id, newRuleType, newRuleEmail.trim())
      setFilterRules([newRule, ...filterRules])
      setNewRuleEmail('')
      toast({
        title: "Regra adicionada",
        description: `E-mail ${newRuleEmail} foi ${newRuleType === 'blocked' ? 'bloqueado' : 'permitido'}.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a regra.",
        variant: "destructive",
      })
    }
  }

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await toggleFilterRule(ruleId, isActive)
      setFilterRules(filterRules.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ))
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a regra.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteFilterRule(ruleId)
      setFilterRules(filterRules.filter(rule => rule.id !== ruleId))
      toast({
        title: "Regra removida",
        description: "A regra foi excluída com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover a regra.",
        variant: "destructive",
      })
    }
  }

  const handleReleaseEmail = async (emailId: string) => {
    try {
      await releaseQuarantineEmail(emailId)
      setQuarantineEmails(quarantineEmails.filter(email => email.id !== emailId))
      toast({
        title: "E-mail liberado",
        description: "O e-mail foi movido para a caixa de entrada.",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível liberar o e-mail.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuarantineEmail = async (emailId: string) => {
    try {
      await deleteQuarantineEmail(emailId)
      setQuarantineEmails(quarantineEmails.filter(email => email.id !== emailId))
      toast({
        title: "E-mail excluído",
        description: "O e-mail foi removido permanentemente.",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o e-mail.",
        variant: "destructive",
      })
    }
  }

  // Função para processar pagamento
  const handleUpgrade = async (plan: string) => {
    if (plan === 'free') return

    setIsProcessingPayment(true)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Erro ao criar sessão de pagamento')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Componente de Login/Registro
  const AuthScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MailClean Brasil</h1>
          </div>
          <CardDescription>
            Mantenha sua caixa de entrada limpa e segura com IA brasileira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" name="name" type="text" placeholder="Seu nome" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com.br" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowPassword(!showPassword)
                  }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-600 mt-4">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? 'Criar conta gratuita' : 'Fazer login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Componente do Dashboard Principal
  const Dashboard = () => {
    const defaultStats = {
      emails_processed: 0,
      spam_blocked: 0,
      false_positives: 0,
      ai_efficiency: 0
    }

    const currentStats = stats || defaultStats

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral da sua proteção de e-mail</p>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">E-mails Processados</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.emails_processed.toLocaleString()}</div>
              <p className="text-xs text-gray-600">Hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spam Bloqueado</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{currentStats.spam_blocked}</div>
              <p className="text-xs text-gray-600">Ameaças eliminadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falsos Positivos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{currentStats.false_positives}</div>
              <p className="text-xs text-gray-600">Para revisão</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiência da IA</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{currentStats.ai_efficiency}%</div>
              <Progress value={currentStats.ai_efficiency} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de tendência semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Semanal</CardTitle>
            <CardDescription>E-mails processados e spam bloqueado nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyStats.length > 0 ? (
              <div className="space-y-4">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-12">
                      {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((day.emails_processed / 250) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{day.emails_processed}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${Math.min((day.spam_blocked / 20) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-600 w-8">{day.spam_blocked}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado disponível ainda.</p>
                <p className="text-sm">Os dados aparecerão conforme você usar o sistema.</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span>Processados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full" />
                <span>Bloqueados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Componente da Caixa Limpa
  const CleanInbox = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Caixa Limpa</h2>
          <p className="text-gray-600">E-mails importantes e seguros</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar e-mails..." className="w-64" />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Caixa de entrada limpa</h3>
            <p>Conecte suas contas de e-mail para ver mensagens filtradas aqui.</p>
            <Button className="mt-4" onClick={() => setActiveTab('settings')}>
              <Plus className="h-4 w-4 mr-2" />
              Conectar conta de e-mail
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Componente da Quarentena
  const Quarantine = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quarentena</h2>
          <p className="text-gray-600">E-mails suspeitos bloqueados pela IA</p>
        </div>
        {quarantineEmails.length > 0 && (
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Tudo
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {quarantineEmails.length > 0 ? (
            <div className="divide-y">
              {quarantineEmails.map((email) => (
                <div key={email.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-gray-900">{email.from_email}</span>
                        <Badge variant={email.category === 'spam' ? 'destructive' : 'outline'}>
                          {email.category === 'spam' ? 'Spam' : 'Phishing'}
                        </Badge>
                        <Badge variant="secondary">
                          {email.confidence}% confiança
                        </Badge>
                      </div>
                      <p className="mt-1 text-gray-600">{email.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(email.received_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleReleaseEmail(email.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Liberar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteQuarantineEmail(email.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum e-mail em quarentena</h3>
              <p>Ótimo! Não há e-mails suspeitos no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Componente de Configurações
  const SettingsPanel = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600">Personalize suas regras de filtragem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regras de Filtragem */}
        <Card>
          <CardHeader>
            <CardTitle>Regras de Filtragem</CardTitle>
            <CardDescription>Gerencie remetentes bloqueados e permitidos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="email@exemplo.com" 
                className="flex-1" 
                value={newRuleEmail}
                onChange={(e) => setNewRuleEmail(e.target.value)}
              />
              <select 
                value={newRuleType} 
                onChange={(e) => setNewRuleType(e.target.value as 'blocked' | 'allowed')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="blocked">Bloquear</option>
                <option value="allowed">Permitir</option>
              </select>
              <Button size="sm" onClick={handleAddFilterRule}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-2">
              {filterRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.type === 'blocked' ? 'destructive' : 'default'}>
                      {rule.type === 'blocked' ? 'Bloqueado' : 'Permitido'}
                    </Badge>
                    <span className="text-sm">{rule.email_pattern}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={rule.is_active} 
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filterRules.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma regra configurada ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações da IA */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações da IA</CardTitle>
            <CardDescription>Ajuste a sensibilidade da detecção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sensibilidade para Spam</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Baixa</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-3/4" />
                </div>
                <span className="text-sm">Alta</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sensibilidade para Phishing</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Baixa</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full w-5/6" />
                </div>
                <span className="text-sm">Alta</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quarentena Automática</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Aprendizado Contínuo</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Relatórios Semanais</Label>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contas Conectadas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas de E-mail Conectadas</CardTitle>
          <CardDescription>Gerencie suas contas de e-mail protegidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emailAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{account.email}</p>
                    <p className="text-sm text-gray-600">{account.provider} - {account.is_active ? 'Conectado' : 'Desconectado'}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Desconectar</Button>
              </div>
            ))}
            
            {emailAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conta conectada ainda.</p>
              </div>
            )}
            
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Conectar Nova Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Componente de Planos
  const PricingPlans = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Planos</h2>
        <p className="text-gray-600 mt-2">Escolha o plano ideal para suas necessidades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plano Gratuito */}
        <Card className={`relative ${user?.plan === 'free' ? 'ring-2 ring-blue-600' : ''}`}>
          <CardHeader>
            <CardTitle className="text-center">Gratuito</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">R$ 0</span>
              <span className="text-gray-600">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                1 conta de e-mail
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                200 e-mails/mês
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Detecção básica de spam
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Suporte por e-mail
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant={user?.plan === 'free' ? 'default' : 'outline'}
              disabled={user?.plan === 'free'}
            >
              {user?.plan === 'free' ? 'Plano Atual' : 'Selecionar'}
            </Button>
          </CardContent>
        </Card>

        {/* Plano Pro */}
        <Card className={`relative ${user?.plan === 'pro' ? 'ring-2 ring-blue-600' : ''}`}>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-600">Mais Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-center">Pro</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">R$ 29</span>
              <span className="text-gray-600">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                3 contas de e-mail
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                5.000 e-mails/mês
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                IA avançada anti-phishing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Quarentena automática
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Relatórios detalhados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Suporte prioritário
              </li>
            </ul>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleUpgrade('pro')}
              disabled={isProcessingPayment || user?.plan === 'pro'}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                user?.plan === 'pro' ? 'Plano Atual' : 'Upgrade para Pro'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Plano Empresarial */}
        <Card className={`relative ${user?.plan === 'enterprise' ? 'ring-2 ring-blue-600' : ''}`}>
          <CardHeader>
            <CardTitle className="text-center">Empresarial</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">R$ 99</span>
              <span className="text-gray-600">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Contas ilimitadas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                E-mails ilimitados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Multiusuário
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                API completa
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Relatórios executivos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Suporte 24/7
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant={user?.plan === 'enterprise' ? 'default' : 'outline'}
              onClick={() => handleUpgrade('enterprise')}
              disabled={isProcessingPayment || user?.plan === 'enterprise'}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                user?.plan === 'enterprise' ? 'Plano Atual' : 'Upgrade para Empresarial'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver logado, mostrar tela de login
  if (!user) {
    return <AuthScreen />
  }

  // Interface principal do SaaS
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">MailClean Brasil</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Plano {user.plan === 'free' ? 'Gratuito' : user.plan === 'pro' ? 'Pro' : 'Empresarial'}
              </Badge>
              <span className="text-sm text-gray-600">Olá, {user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Caixa Limpa
            </TabsTrigger>
            <TabsTrigger value="quarantine" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Quarentena
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="inbox">
            <CleanInbox />
          </TabsContent>

          <TabsContent value="quarantine">
            <Quarantine />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>

          <TabsContent value="plans">
            <PricingPlans />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}