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
  Mail,
  Lock,
  User
} from 'lucide-react';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signInWithGoogle } = useAuth();

  // Get the redirect path from location state, default to '/'
  const from = location.state?.from || '/';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await signUp(formData.email, formData.password);

      if (signUpError) {
        toast.error(signUpError.message || 'Failed to sign up');
        return;
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: formData.name,
            email: formData.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subscription_status: 'free',
            subscription_tier: 'free',
            subscription_end_date: null,
            company_name: null,
            website: null,
            country: null,
            phone: null,
            avatar_url: null,
            settings: {
              email_notifications: true,
              theme: 'dark',
              language: 'en'
            }
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error('Failed to create profile. Please try again.');
        return;
      }

      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { data: authData, error } = await signInWithGoogle();

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        return;
      }

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Profile check error:', profileCheckError);
        toast.error('Failed to check profile status');
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: authData.user.user_metadata.full_name || authData.user.email.split('@')[0],
              email: authData.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_status: 'free',
              subscription_tier: 'free',
              subscription_end_date: null,
              company_name: null,
              website: null,
              country: null,
              phone: null,
              avatar_url: authData.user.user_metadata.avatar_url || null,
              settings: {
                email_notifications: true,
                theme: 'dark',
                language: 'en'
              }
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Failed to create profile. Please try again.');
          return;
        }
      }

      toast.success('Signed in with Google successfully!');
      navigate(from || '/dashboard');
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error('Failed to connect with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        {/* Left Side - Register Form */}
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
                Join Our Community
              </h2>
              <p className="text-blue-300 mb-8">
                Start your journey to policy excellence
              </p>

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
                  <label htmlFor="name" className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.text
                  )}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-2 rounded-lg",
                        "bg-navy-800/50",
                        "border border-navy-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                        "transition-all duration-200"
                      )}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.text
                  )}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-2 rounded-lg",
                        "bg-navy-800/50",
                        "border border-navy-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                        "transition-all duration-200"
                      )}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.text
                  )}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-2 rounded-lg",
                        "bg-navy-800/50",
                        "border border-navy-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                        "transition-all duration-200"
                      )}
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.text
                  )}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-2 rounded-lg",
                        "bg-navy-800/50",
                        "border border-navy-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                        "transition-all duration-200"
                      )}
                      placeholder="Confirm your password"
                    />
                  </div>
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-slate-300">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Sign in
                </Link>
              </p>
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
                Join the Future of Policy Management
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

export default Register;