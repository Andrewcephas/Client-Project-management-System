
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'company' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  avatar?: string;
  phone?: string;
  permissions: string[];
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: {
    fullName: string;
    role: UserRole;
    companyName?: string;
    companyId?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isCompany: boolean;
  isClient: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load user profile');
        return;
      }

      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.full_name || profile.email.split('@')[0],
          email: profile.email,
          role: profile.role as UserRole,
          companyId: profile.company_id,
          companyName: profile.company_name,
          permissions: getPermissionsByRole(profile.role as UserRole)
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Failed to load user profile');
    }
  };

  const getPermissionsByRole = (role: UserRole): string[] => {
    switch (role) {
      case 'admin':
        return ['read', 'write', 'delete', 'manage'];
      case 'company':
        return ['read', 'write', 'manage-team'];
      case 'client':
        return ['read'];
      default:
        return ['read'];
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Clear any existing sessions first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (data.user && data.session) {
        toast.success('Login successful!');
        return true;
      }

      toast.error('Login failed. Please try again.');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: {
    fullName: string;
    role: UserRole;
    companyName?: string;
    companyId?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.fullName.trim(),
            role: userData.role,
            company_name: userData.companyName || '',
            company_id: userData.companyId || ''
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (data.user) {
        toast.success('Registration successful! Please check your email to verify your account.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed');
        return;
      }
      
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        role,
        permissions: getPermissionsByRole(role)
      };
      setUser(updatedUser);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCompany = user?.role === 'company';
  const isClient = user?.role === 'client';

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        logout,
        switchRole,
        isAdmin,
        isCompany,
        isClient,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
