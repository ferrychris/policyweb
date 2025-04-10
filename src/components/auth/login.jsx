import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    Star,
    Sparkles,
    Rocket,
    Zap,
    ArrowRight,
    Lock
} from 'lucide-react';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [formErrors, setFormErrors] = useState({ email: '', password: '' });
    const [registrationMessage, setRegistrationMessage] = useState(useLocation().state?.message || '');
    const navigate = useNavigate();
    const { signIn, signUp, signInWithGoogle, user, resetPassword } = useAuth();

    // Get the redirect path from location state, default to '/dashboard'
    const from = useLocation().state?.from || '/dashboard';

    // Redirect if already authenticated
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    // Stars animation
    const [stars, setStars] = useState([]);

    useEffect(() => {
        // Generate random stars
        const newStars = Array.from({ length: 100 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.7 + 0.3
        }));
        setStars(newStars);
    }, []);

    useEffect(() => {
        if (registrationMessage) {
            toast.info(registrationMessage, {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: '#1A0B2E',
                    color: '#fff',
                    border: '1px solid #2E1D4C',
                },
            });
        }
    }, [registrationMessage]);

    const validateForm = () => {
        const errors = {};
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: authData, error: signInError } = await signIn(email, password);
            
            if (signInError) {
                throw signInError;
            }

            if (!authData?.user) {
                throw new Error('Failed to authenticate user');
            }

            // Update last_login timestamp in profiles table
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                    last_login: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', authData.user.id);

            if (updateError) {
                console.error('Failed to update last login:', updateError);
                // Continue with login even if update fails
            }

            // Show success message
            toast.success('Login successful! Redirecting...', {
                duration: 2000,
                position: 'top-center',
                style: {
                    background: '#1A0B2E',
                    color: '#fff',
                    border: '1px solid #2E1D4C',
                },
            });

            // Navigate to dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'An error occurred during login', {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: '#1A0B2E',
                    color: '#fff',
                    border: '1px solid #2E1D4C',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                console.error('Google sign-in error:', error);
                toast.error(error.message || 'Failed to sign in with Google', {
                    duration: 5000,
                    position: 'top-center',
                    style: {
                        background: '#1A0B2E',
                        color: '#fff',
                        border: '1px solid #2E1D4C',
                    },
                });
                return;
            }
            toast.success('Google sign-in successful!', {
                duration: 2000,
                position: 'top-center',
                style: {
                    background: '#1A0B2E',
                    color: '#fff',
                    border: '1px solid #2E1D4C',
                },
            });
        } catch (error) {
            console.error('Google OAuth error:', error);
            toast.error('Failed to connect with Google. Please try again.', {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: '#1A0B2E',
                    color: '#fff',
                    border: '1px solid #2E1D4C',
                },
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsResetting(true);

        try {
            const { error } = await resetPassword(resetEmail);
            if (error) {
                toast.error(error.message || 'Failed to send reset email');
                return;
            }
            toast.success('Password reset email sent! Check your inbox.');
            setShowResetPassword(false);
            setResetEmail('');
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.message || 'An error occurred while sending reset email');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className={cn(
            "min-h-screen relative overflow-hidden",
            gradientClasses.background
        )}>
            {/* Animated stars background */}
            <div className="absolute inset-0 overflow-hidden">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`
                        }}
                    />
                ))}
            </div>

            {/* Cosmic nebula effect */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-blend-screen">
                <div className="absolute top-10 left-10 w-1/3 h-1/3 rounded-full bg-purple-500/20 blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-1/2 h-1/2 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 rounded-full bg-pink-500/20 blur-3xl"></div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-screen">
                {/* Left Side - Login Form */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className={cn(
                        "max-w-md mx-auto w-full",
                        "backdrop-blur-lg bg-navy-800/40",
                        "p-8 rounded-2xl border border-navy-700 shadow-xl"
                    )}>
                        <div className="flex items-center gap-2 mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h1 className={gradientClasses.text}>
                                FinePolicy
                            </h1>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className={cn("text-3xl font-bold mb-2", themeClasses.heading)}>
                                Welcome Back, Explorer
                            </h2>
                            <p className="text-blue-300 mb-8">
                                Resume your journey to policy excellence
                            </p>

                            {showResetPassword ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className={cn("text-3xl font-bold mb-2", themeClasses.heading)}>
                                        Reset Password
                                    </h2>
                                    <p className="text-blue-300 mb-8">
                                        Enter your email to receive reset instructions
                                    </p>

                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <div>
                                            <label htmlFor="reset-email" className={cn(
                                                "block text-sm font-medium mb-1",
                                                themeClasses.text
                                            )}>
                                                Email address
                                            </label>
                                            <input
                                                id="reset-email"
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                required
                                                className={cn(
                                                    "w-full px-4 py-2 rounded-lg",
                                                    "bg-navy-800/50",
                                                    "border border-navy-700",
                                                    "text-white placeholder-slate-400",
                                                    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                                                    "transition-all duration-200"
                                                )}
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setShowResetPassword(false)}
                                                className="text-blue-300 hover:text-blue-200 text-sm"
                                            >
                                                Back to login
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isResetting}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg font-medium",
                                                    "bg-gradient-to-r from-cyan-600 to-blue-600",
                                                    "text-white",
                                                    "transform hover:scale-102 transition-all duration-200",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                {isResetting ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                        <span>Sending...</span>
                                                    </div>
                                                ) : (
                                                    <span>Send Reset Link</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={isGoogleLoading}
                                        className={cn(
                                            "w-full py-3 rounded-lg transition-all duration-200 font-medium",
                                            "relative overflow-hidden group border border-navy-700",
                                            "bg-navy-800 hover:bg-navy-700 text-white mb-6"
                                        )}
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-navy-800 to-navy-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative flex items-center justify-center gap-2">
                                            {isGoogleLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                    <span>Connecting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18">
                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                    </svg>
                                                    <span>Continue with Google</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-navy-700"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className={cn(
                                                "px-2 bg-navy-800/40 text-slate-300"
                                            )}>
                                                Or continue with email
                                            </span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className={cn(
                                                "block text-sm font-medium mb-1",
                                                themeClasses.text
                                            )}>
                                                Email address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className={cn(
                                                    "w-full px-4 py-2 rounded-lg",
                                                    "bg-navy-800/50",
                                                    "border",
                                                    formErrors.email ? "border-red-500" : "border-navy-700",
                                                    "text-white placeholder-slate-400",
                                                    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                                                    "transition-all duration-200"
                                                )}
                                                placeholder="Enter your email"
                                            />
                                            {formErrors.email && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="password" className={cn(
                                                "block text-sm font-medium mb-1",
                                                themeClasses.text
                                            )}>
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className={cn(
                                                    "w-full px-4 py-2 rounded-lg",
                                                    "bg-navy-800/50",
                                                    "border",
                                                    formErrors.password ? "border-red-500" : "border-navy-700",
                                                    "text-white placeholder-slate-400",
                                                    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                                                    "transition-all duration-200"
                                                )}
                                                placeholder="Enter your password"
                                            />
                                            {formErrors.password && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={cn(
                                                "w-full py-3 rounded-lg font-medium",
                                                "bg-gradient-to-r from-cyan-600 to-blue-600",
                                                "text-white",
                                                "transform hover:scale-102 transition-all duration-200",
                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                            )}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                    <span>Loading...</span>
                                                </div>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </button>
                                    </form>

                                    <div className="flex items-center justify-between mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowResetPassword(true)}
                                            className="text-blue-300 hover:text-blue-200 text-sm flex items-center gap-1"
                                        >
                                            <Lock className="w-4 h-4" />
                                            <span>Forgot password?</span>
                                        </button>
                                        <Link
                                            to="/register"
                                            className="text-blue-300 hover:text-blue-200 text-sm"
                                        >
                                            Create an account
                                        </Link>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Right Side - Features */}
                <div className="hidden md:flex flex-col justify-center p-12">
                    <div className="max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className={cn(
                                "text-4xl font-bold mb-8",
                                themeClasses.heading
                            )}>
                                Discover the Future of Policy Management
                            </h2>
                        </motion.div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: Star,
                                    title: "AI-Powered Policy Creation",
                                    description: "Create comprehensive policies in minutes with our advanced AI technology"
                                },
                                {
                                    icon: Sparkles,
                                    title: "Smart Templates",
                                    description: "Access a vast library of customizable policy templates"
                                },
                                {
                                    icon: Rocket,
                                    title: "Seamless Integration",
                                    description: "Connect with your existing tools and workflows effortlessly"
                                },
                                {
                                    icon: Zap,
                                    title: "Real-time Collaboration",
                                    description: "Work together with your team in real-time"
                                }
                            ].map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            "bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                                        )}>
                                            <Icon className="h-6 w-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "text-lg font-semibold mb-1",
                                                themeClasses.heading
                                            )}>
                                                {feature.title}
                                            </h3>
                                            <p className={themeClasses.text}>
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;