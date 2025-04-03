import Stripe from 'stripe';
import { supabase } from '../../lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { priceId, customerId } = req.body;
        const user = await supabase.auth.getUser();

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Create or get Stripe customer
        let stripeCustomerId = customerId;
        if (!stripeCustomerId) {
            const { data: userData } = await supabase
                .from('users')
                .select('stripe_customer_id')
                .eq('id', user.id)
                .single();

            if (userData?.stripe_customer_id) {
                stripeCustomerId = userData.stripe_customer_id;
            } else {
                const customer = await stripe.customers.create({
                    email: user.email,
                    metadata: {
                        supabaseUserId: user.id
                    }
                });
                stripeCustomerId = customer.id;

                // Save Stripe customer ID to user profile
                await supabase
                    .from('users')
                    .update({ stripe_customer_id: stripeCustomerId })
                    .eq('id', user.id);
            }
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });

        // Save subscription details to Supabase
        await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: stripeCustomerId,
                status: subscription.status,
                price_id: priceId,
                current_period_end: new Date(subscription.current_period_end * 1000),
            });

        return res.status(200).json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ error: error.message });
    }
} 