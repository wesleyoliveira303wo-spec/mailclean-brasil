import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Erro na verificação do webhook:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Processar eventos do Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Pagamento concluído:', session.id)
      
      // Aqui você atualizaria o banco de dados com a nova assinatura
      // Exemplo: await updateUserSubscription(session.customer, session.metadata.planId)
      break

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      console.log('Pagamento recorrente bem-sucedido:', invoice.id)
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice
      console.log('Pagamento falhou:', failedInvoice.id)
      
      // Notificar usuário sobre falha no pagamento
      break

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      console.log('Assinatura cancelada:', subscription.id)
      
      // Downgrade do usuário para plano gratuito
      break

    default:
      console.log(`Evento não tratado: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}