import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2026-06-24.dahlia',
  });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the stripe_customer_id from the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return new NextResponse('No Stripe customer found', { status: 400 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings`;

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Stripe Portal Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
