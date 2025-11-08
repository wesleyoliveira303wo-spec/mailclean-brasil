import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Pagamento concluído:', session.id)
        
        // Aqui você pode:
        // 1. Atualizar o banco de dados com a nova assinatura
        // 2. Enviar email de confirmação
        // 3. Ativar recursos premium para o usuário
        
        break

      case 'customer.subscription.created':
        const subscription = event.data.object
        console.log('Nova assinatura criada:', subscription.id)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object
        console.log('Assinatura atualizada:', updatedSubscription.id)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        console.log('Assinatura cancelada:', deletedSubscription.id)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        console.log('Pagamento de fatura bem-sucedido:', invoice.id)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        console.log('Falha no pagamento da fatura:', failedInvoice.id)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}