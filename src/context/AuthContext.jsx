import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Read admin session synchronously so it's available on the VERY FIRST render
const getInitialUser = () => {
  const storedAdmin = localStorage.getItem('admin_session');
  if (storedAdmin) {
    try { return JSON.parse(storedAdmin); } catch { return null; }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(() => !localStorage.getItem('admin_session'));

  useEffect(() => {
    // Check initial session
    const getInitialSession = async () => {
      // 1. Check if we have an active "Master Key" bypass session saved locally
      const storedAdmin = localStorage.getItem('admin_session');
      if (storedAdmin) {
        setUser(JSON.parse(storedAdmin));
        setLoading(false);
        return;
      }

      // 2. Otherwise, check Supabase for real users
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // 3. Protect against Supabase accidentally overwriting our local override!
      const storedAdmin = localStorage.getItem('admin_session');
      if (storedAdmin) {
        setUser(JSON.parse(storedAdmin));
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Successfully signed in!");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const signUpWithEmail = async (email, password, name, phone = '', address = '', pincode = '') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            address,
            pincode
          }
        }
      });
      if (error) throw error;
      toast.success("Registration successful! Check your email if verification is required.");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      // 1. Clear any local mock admin overrides
      localStorage.removeItem('admin_session');
      
      // 2. Clear real Supabase cloud sessions
      const { error } = await supabase.auth.signOut();
      if (error && error.message !== 'Auth session missing!') console.warn('Supabase SignOut Warning:', error.message);
      
      toast.success("Successfully signed out!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const forceAdminLogin = () => {
    // Local bypass without hitting Supabase (useful for instant demo access)
    const mockUser = {
      id: 'admin_local_override_001',
      email: 'admin@gmail.com',
      user_metadata: { full_name: 'Store Admin' }
    };
    
    // Save to localStorage so it survives page reloads
    localStorage.setItem('admin_session', JSON.stringify(mockUser));
    
    setUser(mockUser);
    setLoading(false);
    toast.success("Welcome Back, Master Admin!");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, forceAdminLogin, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
