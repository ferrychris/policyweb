import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import stripePromise, { createSubscription } from '../../lib/stripe';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ clientSecret, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard`,
                },
                redirect: 'if_required',
            });

            if (error) {
                onError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess();
            }
        } catch (err) {
            onError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full mt-4 py-3 px-6 rounded-lg bg-[#4B3B7C] text-white font-medium hover:bg-[#B4A5FF] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {processing ? (
                    <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Processing...
                    </>
                ) : (
                    'Subscribe Now'
                )}
            </button>
        </form>
    );
};

const PackageSection = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .order('price');

            if (error) throw error;

            const processedData = data.map(pkg => ({
                ...pkg,
                features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]')
            }));

            setPackages(processedData);
        } catch (err) {
            console.error('Error processing packages:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (pkg) => {
        try {
            setSubscribing(true);
            setSelectedPackage(pkg);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Please sign in to subscribe');
            }

            const response = await createSubscription(pkg.stripe_price_id);
            setPaymentIntent(response.clientSecret);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubscribing(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // Refresh user's subscription status
        await fetchPackages();
        setSelectedPackage(null);
        setPaymentIntent(null);
    };

    const handlePaymentError = (message) => {
        setError(message);
        setPaymentIntent(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4A5FF]"></div>
            </div>
        );
    }

    return (
        <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-[#B4A5FF] to-[#4B3B7C] text-transparent bg-clip-text">
                        Choose Your Plan
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Select the perfect package that suits your policy management needs
                    </p>
                </div>

                {error && (
                    <div className="text-red-500 text-center mb-8 p-4 bg-red-500/10 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative p-8 rounded-xl bg-gray-900/50 border border-[#B4A5FF]/20 hover:border-[#B4A5FF]/40 transition-all duration-300"
                        >
                            {pkg.is_popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-[#4B3B7C] text-white text-sm px-3 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                                <p className="text-gray-400 mb-4">{pkg.description}</p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-4xl font-bold text-white">${pkg.price}</span>
                                    <span className="text-gray-400 ml-2">/{pkg.billing_period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {(pkg.features || []).map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-[#B4A5FF] mr-3 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {selectedPackage?.id === pkg.id && paymentIntent ? (
                                <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent }}>
                                    <PaymentForm
                                        clientSecret={paymentIntent}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                </Elements>
                            ) : (
                                <button
                                    className="w-full py-3 px-6 rounded-lg bg-[#4B3B7C] text-white font-medium hover:bg-[#B4A5FF] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    onClick={() => handleSubscribe(pkg)}
                                    disabled={!pkg.is_available || subscribing}
                                >
                                    {subscribing && selectedPackage?.id === pkg.id ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Processing...
                                        </>
                                    ) : pkg.is_available ? (
                                        'Get Started'
                                    ) : (
                                        'Coming Soon'
                                    )}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PackageSection; 