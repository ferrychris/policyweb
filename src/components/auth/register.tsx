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
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldTouched, setFieldTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
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

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const error = validateField(name, formData[name]);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Only validate if the field has been touched
    if (fieldTouched[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFieldTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting', {
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

    setIsLoading(true);

    try {
      const { data: authData, error: signUpError } = await signUp(formData.email, formData.password, formData.name);
      
      if (signUpError) {
        throw signUpError;
      }

      if (!authData?.user) {
        throw new Error('Failed to create user account');
      }

      toast.success('Registration successful! Please check your email to verify your account.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });

      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Please check your email to verify your account before logging in.',
            email: formData.email
          } 
        });
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration', {
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
      const { data: authData, error } = await signInWithGoogle();

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

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      // PGRST116: row not found (expected if new user)
      if (profileCheckError && profileCheckError.code !== 'PGRST116') { 
        console.error('Profile check error:', profileCheckError);
        toast.error('Failed to check profile status', {
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

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              name: authData.user.user_metadata.full_name || authData.user.email.split('@')[0],
              email: authData.user.email,
              profile_picture_url: authData.user.user_metadata.avatar_url || null,
              // Default values matching previous schema context
              tier_level: 1, 
              subscription_status: 'active',
              subscription_start_date: new Date().toISOString(),
              subscription_end_date: null,
              last_login: new Date().toISOString(),
              user_preferences: {
                  language: 'en',
                  notifications: true,
                  theme: 'dark'
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Failed to create profile after Google sign-in. Please try again.', {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#1A0B2E',
              color: '#fff',
              border: '1px solid #2E1D4C',
            },
          });
          // Potentially sign out the user here if profile creation is critical
          return;
        }
      }

      toast.success('Signed in with Google successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
      navigate(from || '/dashboard'); // Navigate after success
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

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
    )}>
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden z-0">
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
              animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* Cosmic nebula effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-blend-screen z-0">
        <div className="absolute top-10 left-10 w-1/3 h-1/3 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-1/2 h-1/2 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 rounded-full bg-pink-500/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-screen items-center">
        {/* Left Side - Register Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className={cn(
            "max-w-md mx-auto w-full",
            "backdrop-blur-lg bg-gray-900/60",
            "p-8 rounded-2xl border border-purple-700/50 shadow-xl"
          )}>
            <div className="flex items-center gap-2 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                FinePolicy
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={cn("text-3xl font-bold mb-2 text-white")}>
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
                  "relative overflow-hidden group border border-gray-700",
                  "bg-gray-800 hover:bg-gray-700 text-white mb-6"
                )}
              >
                <div className="relative flex items-center justify-center gap-2">
                  {isGoogleLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" className="fill-current">
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
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={cn(
                    "px-2 bg-gray-900/60 text-slate-300"
                  )}>
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className={cn(
                    "block text-sm font-medium mb-1 text-slate-300"
                  )}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={cn(
                        "w-full pl-10 pr-10 py-2 rounded-lg",
                        "bg-gray-800/70",
                        "border",
                        formErrors.name ? "border-red-500" : "border-gray-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none",
                        "transition-all duration-200"
                      )}
                      placeholder="Enter your full name"
                    />
                    {fieldTouched.name && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formErrors.name ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={cn(
                    "block text-sm font-medium mb-1 text-slate-300"
                  )}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={cn(
                        "w-full pl-10 pr-10 py-2 rounded-lg",
                        "bg-gray-800/70",
                        "border",
                        formErrors.email ? "border-red-500" : "border-gray-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none",
                        "transition-all duration-200"
                      )}
                      placeholder="Enter your email"
                    />
                    {fieldTouched.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formErrors.email ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className={cn(
                    "block text-sm font-medium mb-1 text-slate-300"
                  )}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={cn(
                        "w-full pl-10 pr-10 py-2 rounded-lg",
                        "bg-gray-800/70",
                        "border",
                        formErrors.password ? "border-red-500" : "border-gray-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none",
                        "transition-all duration-200"
                      )}
                      placeholder="Enter your password"
                    />
                    {fieldTouched.password && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formErrors.password ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={cn(
                    "block text-sm font-medium mb-1 text-slate-300"
                  )}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={cn(
                        "w-full pl-10 pr-10 py-2 rounded-lg",
                        "bg-gray-800/70",
                        "border",
                        formErrors.confirmPassword ? "border-red-500" : "border-gray-700",
                        "text-white placeholder-slate-400",
                        "focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none",
                        "transition-all duration-200"
                      )}
                      placeholder="Confirm your password"
                    />
                    {fieldTouched.confirmPassword && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formErrors.confirmPassword ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium",
                    "bg-gradient-to-r from-purple-600 to-blue-600",
                    "text-white",
                    "transform hover:scale-102 transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-300">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
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
                "text-4xl font-bold mb-8 text-white"
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
                        "text-lg font-semibold mb-1 text-white"
                      )}>
                        {feature.title}
                      </h3>
                      <p className="text-slate-300">
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