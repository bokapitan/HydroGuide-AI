import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabaseClient' // Ensure this path is correct for your project structure

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // EVENT 1: USER PAID (Turn Pro ON)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id
    const stripeCustomerId = session.customer

    if (userId) {
      await supabase
        .from('profiles')
        .update({ 
            is_pro: true, 
            stripe_customer_id: stripeCustomerId,
            theme_color: 'gold' // Auto-set theme on upgrade
        })
        .eq('id', userId)
      console.log(`✅ User ${userId} upgraded to PRO.`)
    }
  }

  // EVENT 2: SUBSCRIPTION CANCELLED (Turn Pro OFF)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const stripeCustomerId = subscription.customer

    // Find user by their Stripe ID
    await supabase
        .from('profiles')
        .update({ is_pro: false, theme_color: 'cyan' }) // Revert to default
        .eq('stripe_customer_id', stripeCustomerId)
    
    console.log(`❌ Subscription cancelled for customer ${stripeCustomerId}`)
  }

  return NextResponse.json({ received: true })
}