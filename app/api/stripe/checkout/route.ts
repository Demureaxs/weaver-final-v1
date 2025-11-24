import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { stripe } from '@/lib/stripe';

const PLANS = {
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_12345', // Replace with real price ID
  // Add more plans if needed
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { plan } = await req.json();
    const priceId = PLANS[plan as keyof typeof PLANS];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // or 'subscription'
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.userId,
        credits: '500', // Example: Pro plan gives 500 credits
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
