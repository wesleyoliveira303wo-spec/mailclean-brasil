import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()

    // Definir preços baseados no plano
    const planPrices = {
      pro: {
        amount: 2900, // R$ 29,00
        name: 'MailClean Pro',
        description: '3 contas de e-mail, 5.000 e-mails/mês, IA avançada'
      },
      enterprise: {
        amount: 9900, // R$ 99,00
        name: 'MailClean Empresarial',
        description: 'Contas ilimitadas, e-mails ilimitados, API completa'
      }
    }

    const selectedPlan = planPrices[plan as keyof typeof planPrices]
    
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/?canceled=true`,
      metadata: {
        plan: plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}