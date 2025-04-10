import React, { useState, useEffect, ChangeEvent, FocusEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';

// Define types for state
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FieldTouched {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

// Use React.FC 
const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();
  // Restore explicit state types
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({}); 
  const [fieldTouched, setFieldTouched] = useState<FieldTouched>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Restore React.ChangeEvent type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldTouched[name as keyof FieldTouched]) {
      validateField(name, value);
    }
  };

  // Restore React.FocusEvent type
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string): boolean => {
    let error: string | undefined = undefined;
    switch (name) {
      case 'name':
        if (!value) error = 'Name is required';
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email address is invalid';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Confirm Password is required';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email address is invalid';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm Password is required';
    else if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match';

    setFormErrors(errors);
    isValid = Object.keys(errors).length === 0;
    return isValid;
  };

  // Restore React.FormEvent type
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    setFieldTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting', {
        position: 'top-center', style: themeClasses.toastError // Restore usage
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: signUpError } = await signUp(formData.email, formData.password, formData.name);

      if (signUpError) {
        throw signUpError;
      }

      if (!authData?.user && !authData?.session) {
        console.warn('Auth data missing after signup call. Verification might be needed or backend issue exists.');
      }

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Verification email sent! Please check your inbox before logging in.',
            email: formData.email
          }
        });
      }, 1000);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration', {
        position: 'top-center', style: themeClasses.toastError // Restore usage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        const { error } = await signInWithGoogle();
        if (error) {
            toast.error(error.message || 'Google Sign-in failed.', { position: 'top-center', style: themeClasses.toastError }); // Restore usage
        }
    } catch (error: any) {
        console.error('Google Sign-in error:', error);
        toast.error('An unexpected error occurred during Google Sign-in.', { position: 'top-center', style: themeClasses.toastError }); // Restore usage
    } finally {
        setIsLoading(false);
    }
};

  return (
    // Restore usage - Ensure themeClasses is exported from utils.ts
    <div className={cn('min-h-screen flex items-center justify-center relative overflow-hidden', themeClasses.background)}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-opacity-20 bg-black rounded-xl shadow-xl backdrop-blur-md border border-purple-700 border-opacity-30 relative z-10"
      >
        {/* Restore usage - Ensure themeClasses is exported from utils.ts */}
        <h2 className={cn('text-3xl font-bold text-center', themeClasses.textPrimary)}>
          Create Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="relative">
            {/* Restore usage - Ensure themeClasses is exported from utils.ts */}
            <User className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5', themeClasses.textSecondary)} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              // Restore usage - Ensure themeClasses is exported from utils.ts
              className={cn('w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2', themeClasses.input, formErrors.name && fieldTouched.name ? themeClasses.inputError : themeClasses.inputFocus)}
              aria-invalid={!!(formErrors.name && fieldTouched.name)}
              aria-describedby={formErrors.name && fieldTouched.name ? 'name-error' : undefined}
              required
            />
            {formErrors.name && fieldTouched.name && <p id="name-error" className="text-red-500 text-xs mt-1 ml-1">{formErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="relative">
             {/* Restore usage - Ensure themeClasses is exported from utils.ts */}
            <Mail className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5', themeClasses.textSecondary)} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              // Restore usage - Ensure themeClasses is exported from utils.ts
              className={cn('w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2', themeClasses.input, formErrors.email && fieldTouched.email ? themeClasses.inputError : themeClasses.inputFocus)}
              aria-invalid={!!(formErrors.email && fieldTouched.email)}
              aria-describedby={formErrors.email && fieldTouched.email ? 'email-error' : undefined}
              required
            />
            {formErrors.email && fieldTouched.email && <p id="email-error" className="text-red-500 text-xs mt-1 ml-1">{formErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="relative">
            {/* Restore usage - Ensure themeClasses is exported from utils.ts */}
            <Lock className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5', themeClasses.textSecondary)} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              // Restore usage - Ensure themeClasses is exported from utils.ts
              className={cn('w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2', themeClasses.input, formErrors.password && fieldTouched.password ? themeClasses.inputError : themeClasses.inputFocus)}
              aria-invalid={!!(formErrors.password && fieldTouched.password)}
              aria-describedby={formErrors.password && fieldTouched.password ? 'password-error' : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
               // Restore usage - Ensure themeClasses is exported from utils.ts
              className={cn('absolute right-3 top-1/2 transform -translate-y-1/2', themeClasses.textSecondary)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {formErrors.password && fieldTouched.password && <p id="password-error" className="text-red-500 text-xs mt-1 ml-1">{formErrors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
             {/* Restore usage - Ensure themeClasses is exported from utils.ts */}
            <Lock className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5', themeClasses.textSecondary)} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              // Restore usage - Ensure themeClasses is exported from utils.ts
              className={cn('w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2', themeClasses.input, formErrors.confirmPassword && fieldTouched.confirmPassword ? themeClasses.inputError : themeClasses.inputFocus)}
              aria-invalid={!!(formErrors.confirmPassword && fieldTouched.confirmPassword)}
              aria-describedby={formErrors.confirmPassword && fieldTouched.confirmPassword ? 'confirm-password-error' : undefined}
              required
            />
             <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              // Restore usage - Ensure themeClasses is exported from utils.ts
              className={cn('absolute right-3 top-1/2 transform -translate-y-1/2', themeClasses.textSecondary)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {formErrors.confirmPassword && fieldTouched.confirmPassword && <p id="confirm-password-error" className="text-red-500 text-xs mt-1 ml-1">{formErrors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            // Restore usage - Ensure gradientClasses is exported from utils.ts
            className={cn(
              'w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-300 ease-in-out',
              gradientClasses.primary,
              'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center my-4">
          <span className="h-px w-full bg-gray-600"></span>
          <span className="px-4 text-sm text-gray-400">OR</span>
          <span className="h-px w-full bg-gray-600"></span>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center py-2 px-4 rounded-lg border border-gray-600 text-white font-medium transition duration-300 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          )}
        >
          <Chrome className="w-5 h-5 mr-2" />
          Sign up with Google
        </button>

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register; 