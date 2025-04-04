import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import stripePromise, { createSubscription } from '../../lib/stripe';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaTimes } from 'react-icons/fa';

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
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPolicyType, setSelectedPolicyType] = useState(null);
    const [policyTypes, setPolicyTypes] = useState([]);

    useEffect(() => {
        fetchPackages();
        fetchPolicyTypes();
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

    const fetchPolicyTypes = async () => {
        try {
            const { data, error } = await supabase
                .from('policy_types')
                .select('*');

            if (error) throw error;

            setPolicyTypes(data);
        } catch (err) {
            console.error('Error processing policy types:', err);
            setError(err.message);
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

    const handleGeneratePolicy = () => {
        setShowPackageModal(true);
    };

    const handlePolicyTypeSelect = async (typeId) => {
        const selectedType = policyTypes.find(type => type.id === typeId);
        if (selectedType) {
            setSelectedPolicyType(selectedType);
            setShowPackageModal(false);

            // Show package selection before details
            setShowPackageModal(true);
        }
    };

    const handlePackageSelect = async (packageType) => {
        setSelectedPackage(packageType);
        setShowPackageModal(false);
        setShowDetailsModal(true);
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

            {/* Package Selection Modal */}
            {showPackageModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
                            aria-hidden="true"
                        />

                        <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#E2DDFF]">Select Package</h3>
                                    <p className="mt-1 text-[#B4A5FF]">Choose a package to continue</p>
                                </div>
                                <button
                                    onClick={() => setShowPackageModal(false)}
                                    className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <PolicyTypeSelector
                                onSelect={handlePackageSelect}
                                currentSubscription={null}
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PackageSection; 