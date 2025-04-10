import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Removed options to simplify the call for debugging
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/callback`,
        //   data: {
        //     full_name: name, 
        //   },
        // },
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (!data?.user) {
        throw new Error('Failed to create user account');
      }

      // If signup is successful, Supabase will handle the profile creation via trigger
      // No need to insert profile manually here anymore

      toast.success('Verification email sent! Please check your inbox.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });

      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let errorMessage = 'Failed to sign in';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
        throw new Error(errorMessage);
      }

      toast.success('Signed in successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });

      return { data, error: null };
    } catch (error) {
      toast.error(error.message || 'Failed to sign in', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        let errorMessage = 'Failed to sign in with Google';
        if (error.message.includes('popup blocked')) {
          errorMessage = 'Please allow popups for Google sign-in';
        }
        throw new Error(errorMessage);
      }

      return { data, error: null };
    } catch (error) {
      toast.error(error.message || 'Failed to sign in with Google', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Signed out successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
    } catch (error) {
      toast.error('Failed to sign out', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        let errorMessage = 'Failed to send reset password email';
        if (error.message.includes('email not found')) {
          errorMessage = 'No account found with this email address';
        }
        throw new Error(errorMessage);
      }

      toast.success('Password reset email sent! Please check your inbox.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });

      return { error: null };
    } catch (error) {
      toast.error(error.message || 'Failed to send reset password email', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });

      return { error: null };
    } catch (error) {
      toast.error('Failed to update password', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1A0B2E',
          color: '#fff',
          border: '1px solid #2E1D4C',
        },
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
