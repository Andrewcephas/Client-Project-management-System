
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  subscription_plan: string;
  subscription_status: 'active' | 'trial' | 'expired';
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUser();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedCompanies: Company[] = (data || []).map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        status: company.status as 'active' | 'inactive',
        subscription_plan: company.subscription_plan,
        subscription_status: company.subscription_status as 'active' | 'trial' | 'expired',
        subscription_end_date: company.subscription_end_date,
        created_at: company.created_at,
        updated_at: company.updated_at
      }));
      
      setCompanies(formattedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) throw error;
      
      const formattedCompany: Company = {
        id: data.id,
        name: data.name,
        email: data.email,
        status: data.status as 'active' | 'inactive',
        subscription_plan: data.subscription_plan,
        subscription_status: data.subscription_status as 'active' | 'trial' | 'expired',
        subscription_end_date: data.subscription_end_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCompanies(prev => [formattedCompany, ...prev]);
      return { success: true, data: formattedCompany };
    } catch (error) {
      console.error('Error adding company:', error);
      return { success: false, error };
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedCompany: Company = {
        id: data.id,
        name: data.name,
        email: data.email,
        status: data.status as 'active' | 'inactive',
        subscription_plan: data.subscription_plan,
        subscription_status: data.subscription_status as 'active' | 'trial' | 'expired',
        subscription_end_date: data.subscription_end_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCompanies(prev => prev.map(company => 
        company.id === id ? formattedCompany : company
      ));
      return { success: true, data: formattedCompany };
    } catch (error) {
      console.error('Error updating company:', error);
      return { success: false, error };
    }
  };

  const deactivateExpiredSubscriptions = async () => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          status: 'inactive',
          subscription_status: 'expired'
        })
        .lt('subscription_end_date', new Date().toISOString())
        .eq('subscription_status', 'active');

      if (error) throw error;
      await fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating expired subscriptions:', error);
    }
  };

  const getActiveCompanies = () => {
    return companies.filter(company => 
      company.status === 'active' && company.subscription_status === 'active'
    );
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCompanies();
    }
  }, [isAdmin]);

  return {
    companies,
    loading,
    addCompany,
    updateCompany,
    deactivateExpiredSubscriptions,
    getActiveCompanies,
    refetch: fetchCompanies
  };
};
