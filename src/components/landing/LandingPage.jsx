import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import whitepolicy from './image/whitepolicy.png';
import emailjs from '@emailjs/browser';
import {
    FileText,
    Shield,
    Zap,
    Users,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Rocket,
    Star,
    ExternalLink,
    Clock,
    X,
    Mail,
    AlertCircle,
    Loader2
} from 'lucide-react';
import Header from './Header';
import cropedLogo from './image/cropedlogo.png';

// Import company logos
import nividaLogo from './image/nivida.png';
import liminalLogo from './image/liminal.png';
import halcyonLogo from './image/halcyon.png';
import protectaiLogo from './image/protectai.png';

// Company logos for the Trusted by section
const companyLogos = [
    { name: 'Protectai', logo: protectaiLogo },
    { name: 'Nivida', logo: nividaLogo },
    { name: 'Liminal', logo: liminalLogo },
    { name: 'Halcyon', logo: halcyonLogo },
];

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_finepolicy';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_waitlist';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

const LandingPage = () => {
    const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [formStatus, setFormStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const formRef = useRef();

    const handleWaitlistSubmit = (e) => {
        e.preventDefault();
        setFormStatus('loading');

        // Prepare the template parameters
        const templateParams = {
            to_email: email, // Will be sent to this email address
            from_name: "FinePolicy Team",
            to_name: name || "Policy Enthusiast",
            user_email: email,
            user_name: name,
            message: `Thank you for joining our waitlist! We'll notify you when we launch our platform.`,
            reply_to: email,
            join_date: new Date().toLocaleString()
        };

        // Send the email using EmailJS
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
            .then((response) => {
                console.log('Email sent successfully!', response);
                setFormStatus('success');

                // Reset form and close modal after 3 seconds
                setTimeout(() => {
                    setFormStatus('idle');
                    setIsWaitlistModalOpen(false);
                    setEmail('');
                    setName('');
                }, 3000);
            })
            .catch((error) => {
                console.error('Failed to send email:', error);
                setFormStatus('error');
                setErrorMessage('Failed to join waitlist. Please try again later.');
            });
    };

    const features = [
        {
            icon: FileText,
            title: "AI-Powered Policy Generation",
            description: "Create comprehensive policies in minutes with our advanced AI technology"
        },
        {
            icon: Shield,
            title: "Secure & Compliant",
            description: "Ensure your policies meet industry standards and regulatory requirements"
        },
        {
            icon: Zap,
            title: "Real-time Updates",
            description: "Keep your policies up-to-date with automatic version control"
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Work together with your team in real-time"
        }
    ];

    const benefits = [
        "Save time with AI-powered policy generation",
        "Ensure compliance with industry standards",
        "Easy to customize and update",
        "Secure document storage",
        "Team collaboration features",
        "Export in multiple formats"
    ];

    return (
        <div className="min-h-screen bg-black">
            <Header />
            {/* Hero Section with Gradient + Masked Grid Pattern */}
            <section className="relative overflow-hidden pt-20 bg-gradient-to-b from-black via-purple-900/50 to-black min-h-[90vh] flex flex-col items-center justify-center">
                {/* Animated + Masked Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-pan-new"></div>

                {/* Coming Soon Badge */}
                <div className="absolute top-24 right-8 md:right-16 lg:right-24">
                    <div className="bg-[#7121ef]/80 text-white px-4 py-2 rounded-full shadow-lg flex items-center transform rotate-12">
                        <Clock className="w-5 h-5 mr-2" />
                        <span className="font-bold">Coming Soon</span>
                    </div>
                </div>

                {/* Logo with recurrent zoom animation */}
                <div className="mb-1 w-48 h-48 flex items-center justify-center relative z-10">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        className="w-full h-full"
                    >
                        <img
                            src={whitepolicy}
                            alt="FinePolicy Logo"
                            className="w-[100px] h-full mt-[10px] object-contain"
                        />
                    </motion.div>

                    {/* Pulsing glow effect - keep this */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-[#7121ef]/20 filter blur-md -z-10"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl md:text-8xl font-bold mb-8 text-white whitespace-nowrap mx-auto"
                    >
                        Your Trusted AI Policy Partner
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-2xl text-gray-300 mb-14 max-w-3xl mx-auto leading-relaxed"
                    >
                        At FinePolicy, we guide you through the transformative journey of policy
                        creation—ensuring every step is secure, compliant, and aligned with your
                        business goals.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <div className="relative group">
                            <span
                                className="inline-flex items-center px-10 py-5 rounded-lg bg-[#7121ef]/50 text-white text-lg font-semibold cursor-not-allowed opacity-80 overflow-hidden"
                            >
                                <motion.div
                                    className="flex items-center"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    Get Started
                                    <motion.div
                                        className="ml-3"
                                        initial={{ x: 0 }}
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <ArrowRight className="h-6 w-6" />
                                    </motion.div>
                                </motion.div>
                                <motion.span
                                    className="ml-2 bg-[#7121ef] text-white text-sm px-2 py-1 rounded"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    Coming Soon
                                </motion.span>
                            </span>
                            <div className="absolute -bottom-8 left-0 right-0 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                We're working hard to launch soon!
                            </div>
                        </div>
                        <span
                            className="inline-flex items-center px-10 py-5 rounded-lg bg-transparent border border-[#7121ef]/50 text-white text-lg font-semibold cursor-not-allowed opacity-80 overflow-hidden group"
                        >
                            <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                Take the Policy Readiness Assessment
                                <motion.div
                                    className="ml-3"
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 4 }}
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{
                                        x: {
                                            duration: 1.5,
                                            repeat: Infinity,
                                            repeatType: "loop",
                                            ease: "easeInOut",
                                            repeatDelay: 0.5
                                        }
                                    }}
                                >
                                    <ArrowRight className="h-6 w-6" />
                                </motion.div>
                            </motion.div>
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-16 bg-black border-t border-b border-gray-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            Trusted by Industry Leaders
                        </h2>
                    </div>
                    <div className="flex justify-center items-center space-x-4 md:space-x-8 lg:space-x-16 mx-auto">
                        {companyLogos.map((company, index) => (
                            <motion.div
                                key={company.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex justify-center items-center"
                            >
                                <img
                                    src={company.logo}
                                    alt={company.name + " logo"}
                                    className="h-10 md:h-12 lg:h-16 w-auto object-contain mix-blend-lighten filter brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                            Why Choose FinePolicy?
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Our platform offers everything you need to create and manage professional policies efficiently.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="p-6 rounded-xl bg-gray-900/50 border border-[#7121ef]/20"
                                    whileHover={{
                                        boxShadow: "0 0 15px rgba(113, 33, 239, 0.3)",
                                        borderColor: "rgba(113, 33, 239, 0.5)",
                                        transition: { duration: 0.3 }
                                    }}
                                    animate={{
                                        boxShadow: [
                                            "0 0 0 rgba(113, 33, 239, 0)",
                                            "0 0 8px rgba(113, 33, 239, 0.15)",
                                            "0 0 0 rgba(113, 33, 239, 0)"
                                        ],
                                        borderColor: [
                                            "rgba(113, 33, 239, 0.2)",
                                            "rgba(113, 33, 239, 0.4)",
                                            "rgba(113, 33, 239, 0.2)"
                                        ]
                                    }}
                                    transition={{
                                        opacity: { duration: 0.5, delay: index * 0.1 },
                                        y: { duration: 0.5, delay: index * 0.1 },
                                        boxShadow: {
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut",
                                            duration: 4,
                                            delay: index * 1.2
                                        },
                                        borderColor: {
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut",
                                            duration: 4,
                                            delay: index * 1.2
                                        }
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-[#7121ef]/10 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-[#7121ef]" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-300">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Upcoming Features Section */}
            <section className="py-20 bg-gradient-to-b from-black via-[#7121ef]/10 to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 relative">
                        <div className="inline-block mb-4">
                            <span className="bg-[#7121ef] text-white text-sm px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                                Coming Soon
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                            Exciting Features on the Horizon
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            We're constantly innovating to bring you the best policy management tools. Here's a sneak peek of what's coming next.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature Card 1 */}
                        <motion.div
                            className="p-8 sm:p-10 rounded-xl bg-gray-900/50 border border-[#7121ef]/20 relative group overflow-hidden h-full flex flex-col"
                            animate={{
                                boxShadow: [
                                    "0 0 0 rgba(113, 33, 239, 0.1)",
                                    "0 0 15px rgba(113, 33, 239, 0.3)",
                                    "0 0 0 rgba(113, 33, 239, 0.1)"
                                ],
                                borderColor: [
                                    "rgba(113, 33, 239, 0.2)",
                                    "rgba(113, 33, 239, 0.5)",
                                    "rgba(113, 33, 239, 0.2)"
                                ]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                        >
                            <div className="absolute right-3 top-3 bg-[#7121ef] text-white text-xs px-2 py-1 rounded-bl transform rotate-0 font-medium">
                                Coming Soon
                            </div>
                            <div className="w-16 h-16 rounded-lg bg-[#7121ef]/10 flex items-center justify-center mb-6">
                                <Rocket className="h-8 w-8 text-[#7121ef]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Advanced Analytics Dashboard
                            </h3>
                            <p className="text-gray-300 mb-6 flex-grow">
                                Track policy compliance, view readiness scores, and generate comprehensive reports with our powerful analytics tools.
                            </p>
                            <div className="pt-4 border-t border-gray-800/30">
                                <span className="text-[#7121ef] text-sm font-medium flex items-center cursor-not-allowed opacity-80">
                                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </motion.div>

                        {/* Feature Card 2 */}
                        <motion.div
                            className="p-8 sm:p-10 rounded-xl bg-gray-900/50 border border-[#7121ef]/20 relative group overflow-hidden h-full flex flex-col"
                            animate={{
                                boxShadow: [
                                    "0 0 0 rgba(113, 33, 239, 0.1)",
                                    "0 0 15px rgba(113, 33, 239, 0.3)",
                                    "0 0 0 rgba(113, 33, 239, 0.1)"
                                ],
                                borderColor: [
                                    "rgba(113, 33, 239, 0.2)",
                                    "rgba(113, 33, 239, 0.5)",
                                    "rgba(113, 33, 239, 0.2)"
                                ]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                                delay: 1.7
                            }}
                        >
                            <div className="absolute right-3 top-3 bg-[#7121ef] text-white text-xs px-2 py-1 rounded-bl transform rotate-0 font-medium">
                                Coming Soon
                            </div>
                            <div className="w-16 h-16 rounded-lg bg-[#7121ef]/10 flex items-center justify-center mb-6">
                                <Star className="h-8 w-8 text-[#7121ef]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Premium Policy Templates
                            </h3>
                            <p className="text-gray-300 mb-6 flex-grow">
                                Access a growing library of industry-specific templates crafted by legal experts and optimized for compliance.
                            </p>
                            <div className="pt-4 border-t border-gray-800/30">
                                <span className="text-[#7121ef] text-sm font-medium flex items-center cursor-not-allowed opacity-80">
                                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </motion.div>

                        {/* Feature Card 3 */}
                        <motion.div
                            className="p-8 sm:p-10 rounded-xl bg-gray-900/50 border border-[#7121ef]/20 relative group overflow-hidden h-full flex flex-col"
                            animate={{
                                boxShadow: [
                                    "0 0 0 rgba(113, 33, 239, 0.1)",
                                    "0 0 15px rgba(113, 33, 239, 0.3)",
                                    "0 0 0 rgba(113, 33, 239, 0.1)"
                                ],
                                borderColor: [
                                    "rgba(113, 33, 239, 0.2)",
                                    "rgba(113, 33, 239, 0.5)",
                                    "rgba(113, 33, 239, 0.2)"
                                ]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                                delay: 3.4
                            }}
                        >
                            <div className="absolute right-3 top-3 bg-[#7121ef] text-white text-xs px-2 py-1 rounded-bl transform rotate-0 font-medium">
                                Coming Soon
                            </div>
                            <div className="w-16 h-16 rounded-lg bg-[#7121ef]/10 flex items-center justify-center mb-6">
                                <Sparkles className="h-8 w-8 text-[#7121ef]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Integration Ecosystem
                            </h3>
                            <p className="text-gray-300 mb-6 flex-grow">
                                Seamlessly connect with your existing tools including Slack, Microsoft Teams, Google Workspace, and more.
                            </p>
                            <div className="pt-4 border-t border-gray-800/30">
                                <span className="text-[#7121ef] text-sm font-medium flex items-center cursor-not-allowed opacity-80">
                                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-14 text-center">
                        <button
                            onClick={() => setIsWaitlistModalOpen(true)}
                            className="inline-flex items-center px-8 py-4 rounded-lg bg-[#7121ef]/20 text-white font-medium border border-[#7121ef]/40 overflow-hidden group relative hover:bg-[#7121ef]/30 transition-colors"
                        >
                            <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="mr-2"
                                >
                                    <Clock className="h-5 w-5" />
                                </motion.div>
                                Join the Waiting List
                            </motion.div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gradient-to-b from-black via-black to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                                Everything You Need to Create <span className="text-[#7121ef]">Professional Policies</span>
                            </h2>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center text-gray-300"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-[#7121ef] mr-3 flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </motion.li>
                                ))}
                            </ul>
                            <motion.div
                                className="mt-8"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <span
                                    className="inline-flex items-center px-6 py-3 rounded-lg bg-[#7121ef] text-white font-medium cursor-not-allowed opacity-80"
                                >
                                    <motion.div
                                        className="flex items-center"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        Get Started Today
                                        <motion.div
                                            className="ml-2"
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 4 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </motion.div>
                                    </motion.div>
                                </span>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl bg-black/50 border border-[#7121ef]/20"
                            whileHover={{
                                boxShadow: "0 0 20px rgba(113, 33, 239, 0.3)",
                                borderColor: "rgba(113, 33, 239, 0.5)",
                                transition: { duration: 0.3 }
                            }}
                            animate={{
                                boxShadow: [
                                    "0 0 0 rgba(113, 33, 239, 0.1)",
                                    "0 0 12px rgba(113, 33, 239, 0.2)",
                                    "0 0 0 rgba(113, 33, 239, 0.1)"
                                ],
                                borderColor: [
                                    "rgba(113, 33, 239, 0.2)",
                                    "rgba(113, 33, 239, 0.4)",
                                    "rgba(113, 33, 239, 0.2)"
                                ]
                            }}
                            transition={{
                                opacity: { duration: 0.5 },
                                x: { duration: 0.5 },
                                boxShadow: {
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    duration: 4,
                                },
                                borderColor: {
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    duration: 4,
                                }
                            }}
                        >
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Ready to Get Started?
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Join thousands of companies that trust FinePolicy for their policy management needs.
                            </p>
                            <span
                                className="inline-flex items-center px-6 py-3 rounded-lg bg-[#7121ef] text-white font-medium cursor-not-allowed opacity-80"
                            >
                                <motion.div
                                    className="flex items-center"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    Create Your Account
                                    <motion.div
                                        className="ml-2"
                                        initial={{ x: 0 }}
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </motion.div>
                                </motion.div>
                            </span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-black border-t border-[#7121ef]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div className="space-y-4">
                            <h3 className="text-white font-semibold text-lg">FinePolicy</h3>
                            <p className="text-gray-400 text-sm">
                                Your trusted AI policy partner for secure and compliant policy management.
                            </p>
                            <div className="flex space-x-4">
                                <span className="text-gray-400 hover:text-[#7121ef] transition-colors cursor-not-allowed opacity-80">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="text-gray-400 hover:text-[#7121ef] transition-colors cursor-not-allowed opacity-80">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </span>
                                <span className="text-gray-400 hover:text-[#7121ef] transition-colors cursor-not-allowed opacity-80">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="text-gray-400 hover:text-[#7121ef] transition-colors cursor-not-allowed opacity-80">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.32 35.32 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">Features</h3>
                            <ul className="space-y-2">
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">AI Policy Generation</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Compliance Tools</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Team Collaboration</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Version Control</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Document Export</span></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Documentation</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Blog</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Tutorials</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">API Reference</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Support</span></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">About Us</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Careers</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Contact</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Privacy Policy</span></li>
                                <li><span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Terms of Service</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800/50 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-500 text-sm">
                                &copy; {new Date().getFullYear()} FinePolicy. All rights reserved.
                            </p>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Privacy Policy</span>
                                <span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Terms of Service</span>
                                <span className="text-gray-400 cursor-not-allowed opacity-80 text-sm">Cookie Policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Waitlist Modal */}
            <AnimatePresence>
                {isWaitlistModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsWaitlistModalOpen(false)}
                    >
                        <motion.div
                            className="bg-gray-900 rounded-xl p-6 max-w-md w-full relative border border-[#7121ef]/30"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                onClick={() => setIsWaitlistModalOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#7121ef]/20 mb-4">
                                    <Clock className="h-6 w-6 text-[#7121ef]" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Join Our Waitlist</h3>
                                <p className="text-gray-400 mt-2">Be the first to know when we launch.</p>
                            </div>

                            {formStatus === 'idle' && (
                                <form ref={formRef} onSubmit={handleWaitlistSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name (Optional)</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#7121ef] focus:border-transparent"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-gray-800 border border-gray-700 text-white pl-10 py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#7121ef] focus:border-transparent"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            You'll receive a confirmation email at this address.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#7121ef] hover:bg-[#8341f0] text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                                    >
                                        Join Waitlist
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </form>
                            )}

                            {formStatus === 'loading' && (
                                <motion.div
                                    className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Loader2 className="h-12 w-12 text-[#7121ef] mx-auto mb-4 animate-spin" />
                                    <h4 className="text-white font-medium">Processing...</h4>
                                    <p className="text-gray-300">Adding you to our waitlist</p>
                                </motion.div>
                            )}

                            {formStatus === 'success' && (
                                <motion.div
                                    className="bg-[#7121ef]/20 p-8 rounded-lg border border-[#7121ef]/40 text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <CheckCircle2 className="h-12 w-12 text-[#7121ef] mx-auto mb-4" />
                                    <h4 className="text-white font-medium text-lg">Thank You!</h4>
                                    <p className="text-gray-300">You've been added to our waitlist. We'll notify you when we launch.</p>
                                </motion.div>
                            )}

                            {formStatus === 'error' && (
                                <motion.div
                                    className="bg-red-900/20 p-8 rounded-lg border border-red-700/40 text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                                    <h4 className="text-white font-medium text-lg">Something went wrong</h4>
                                    <p className="text-gray-300">{errorMessage}</p>
                                    <button
                                        className="mt-4 text-white bg-[#7121ef] hover:bg-[#8341f0] px-4 py-2 rounded-lg text-sm font-medium"
                                        onClick={() => setFormStatus('idle')}
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}

                            <p className="text-gray-500 text-xs mt-6 text-center">
                                By joining, you agree to our Privacy Policy and Terms of Service.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage; 