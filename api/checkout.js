import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;
  const amount = plan === 'deep' ? 399 : 199;
  const name = plan === 'deep' ? 'Deep Research' : 'Basic Results';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: `FindMyHobby - ${name}` }, unit_amount: amount }, quantity: 1 }],
    mode: 'payment',
    success_url: `${req.headers.origin}/?payment=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/?payment=cancelled`,
  });

  return res.status(200).json({ url: session.url });
}
