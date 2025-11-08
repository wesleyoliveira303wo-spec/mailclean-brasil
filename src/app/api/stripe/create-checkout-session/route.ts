import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, planId } = await req.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID é obrigatório' },
        { status: 400 }
      )
    }

    // Criar sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${req.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        planId,
      },
      subscription_data: {
        trial_period_days: 7, // 7 dias de teste grátis
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Erro ao criar sessão do Stripe:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}