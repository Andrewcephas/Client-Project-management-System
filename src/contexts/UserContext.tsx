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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // For OAuth users, ensure profile exists and is active
          if (event === 'SIGNED_IN' && session.user.app_metadata?.provider) {
            setTimeout(() => {
              handleOAuthUser(session.user);
            }, 100);
          } else {
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 0);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

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

  const handleOAuthUser = async (supabaseUser: SupabaseUser) => {
    try {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking OAuth profile:', error);
        return;
      }

      if (!profile) {
        // Create profile for OAuth user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
            role: 'client',
            status: 'active'
          });

        if (insertError) {
          console.error('Error creating OAuth profile:', insertError);
          toast.error('Failed to create user profile');
          return;
        }
      }

      // Fetch the profile
      fetchUserProfile(supabaseUser.id);
    } catch (error) {
      console.error('Error handling OAuth user:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code !== 'PGRST116') {
          toast.error('Failed to load user profile');
        }
        return;
      }

      if (profile && profile.status === 'active') {
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
          toast.error('An account with this email already exists.');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (data.user) {
        // If registering as a company, create the company record and update profile
        if (userData.role === 'company' && userData.companyName) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: userData.companyName,
              email: email.trim(),
              status: 'active',
              subscription_status: 'trial',
              subscription_plan: 'trial'
            })
            .select('id')
            .single();

          if (companyError) {
            console.error('Error creating company:', companyError);
            toast.error('Failed to create company. Please contact support.');
            return false;
          }

          if (companyData) {
            // Update the new user's profile with the company ID
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({ company_id: companyData.id })
              .eq('id', data.user.id);

            if (profileUpdateError) {
              console.error('Error updating profile with company ID:', profileUpdateError);
              toast.error('Failed to link company to your profile. Please contact support.');
            }
          }
        }

        toast.success('Registration successful!');
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
