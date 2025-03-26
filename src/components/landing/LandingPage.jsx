import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import {
    FileText,
    Shield,
    Zap,
    Users,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import Header from './Header';

const LandingPage = () => {
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
        <div className="min-h-screen">
            <Header />
            {/* Hero Section */}
            <section className={cn(
                "relative overflow-hidden pt-16",
                gradientClasses.background
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={cn(
                                "text-4xl md:text-6xl font-bold mb-6",
                                themeClasses.heading
                            )}
                        >
                            Create Professional Policies
                            <span className="block text-cyan-400">in Minutes</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-blue-300 mb-8 max-w-2xl mx-auto"
                        >
                            Generate, customize, and manage your company policies with our AI-powered platform.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/register"
                                className={cn(
                                    "inline-flex items-center px-6 py-3 rounded-lg",
                                    "bg-gradient-to-r from-cyan-500 to-blue-500",
                                    "text-white font-medium",
                                    "hover:from-cyan-600 hover:to-blue-600",
                                    "transition-all duration-200"
                                )}
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to="/pricing"
                                className={cn(
                                    "inline-flex items-center px-6 py-3 rounded-lg",
                                    "bg-navy-800/50 backdrop-blur-sm",
                                    "text-white font-medium",
                                    "hover:bg-navy-800/70",
                                    "transition-all duration-200"
                                )}
                            >
                                View Pricing
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-navy-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className={cn(
                            "text-3xl md:text-4xl font-bold mb-4",
                            themeClasses.heading
                        )}>
                            Why Choose FinePolicy?
                        </h2>
                        <p className="text-blue-300 max-w-2xl mx-auto">
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
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className={cn(
                                        "p-6 rounded-xl",
                                        "bg-navy-800/50 backdrop-blur-sm",
                                        "border border-navy-700"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-blue-300">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-navy-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <h2 className={cn(
                                "text-3xl md:text-4xl font-bold mb-6",
                                themeClasses.heading
                            )}>
                                Everything You Need to Create Professional Policies
                            </h2>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center text-blue-300"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-cyan-400 mr-3" />
                                        {benefit}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className={cn(
                                "p-8 rounded-2xl",
                                "bg-navy-900/50 backdrop-blur-sm",
                                "border border-navy-700"
                            )}
                        >
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Ready to Get Started?
                            </h3>
                            <p className="text-blue-300 mb-6">
                                Join thousands of companies that trust FinePolicy for their policy management needs.
                            </p>
                            <Link
                                to="/register"
                                className={cn(
                                    "inline-flex items-center px-6 py-3 rounded-lg",
                                    "bg-gradient-to-r from-cyan-500 to-blue-500",
                                    "text-white font-medium",
                                    "hover:from-cyan-600 hover:to-blue-600",
                                    "transition-all duration-200"
                                )}
                            >
                                Create Your Account
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage; 