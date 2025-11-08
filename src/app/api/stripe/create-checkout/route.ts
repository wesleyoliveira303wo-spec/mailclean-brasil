import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createOrRetrieveCustomer, STRIPE_PRICES } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { planType, userEmail, userId } = await req.json()

    if (!planType || !userEmail) {
      return NextResponse.json(
        { error: 'Plan type and user email are required' },
        { status: 400 }
      )
    }

    // Validar plano
    if (!STRIPE_PRICES[planType as keyof typeof STRIPE_PRICES]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Criar ou recuperar cliente no Stripe
    const customer = await createOrRetrieveCustomer(userEmail, userId)

    // Criar sessão de checkout
    const session = await createCheckoutSession(
      STRIPE_PRICES[planType as keyof typeof STRIPE_PRICES],
      customer.id,
      userEmail
    )

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}