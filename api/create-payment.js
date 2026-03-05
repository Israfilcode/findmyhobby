import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;
  const amount = plan === 'deep' ? 399 : 199;
  const description = plan === 'deep' ? 'Deep Research ($3.99)' : 'Basic Results ($1.99)';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
    mode: 'payment',
    success_url: `${req.headers.origin}/?success=true&plan=${plan}`,
    cancel_url: `${req.headers.origin}/?canceled=true`,
  });

  res.status(200).json({ url: session.url });
}
