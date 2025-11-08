import { loadStripe } from '@stripe/stripe-js'

// Inicializar Stripe com a chave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export { stripePromise }

// Configuração dos planos
export const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    priceId: null,
    features: [
      '1 conta de e-mail',
      'Até 200 e-mails analisados/mês',
      'Detecção básica de spam',
      'Suporte por e-mail'
    ],
    limits: {
      accounts: 1,
      emailsPerMonth: 200,
      quarantine: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 34.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      '3 contas de e-mail',
      '5.000 e-mails analisados/mês',
      'Quarentena automática',
      'Detecção avançada de phishing',
      'Relatórios semanais',
      'Suporte prioritário'
    ],
    limits: {
      accounts: 3,
      emailsPerMonth: 5000,
      quarantine: true
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 89.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Contas ilimitadas',
      'E-mails ilimitados',
      'Multiusuário',
      'API completa',
      'Relatórios detalhados',
      'Integração personalizada',
      'Suporte 24/7',
      'Gerente de conta dedicado'
    ],
    limits: {
      accounts: -1, // ilimitado
      emailsPerMonth: -1, // ilimitado
      quarantine: true
    }
  }
]