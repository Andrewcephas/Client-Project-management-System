
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

export interface Client {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
  company_id: string;
  avatar: string;
}

export const useCompanyClients = () => {
  const { user, isCompany } = useUser();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user || !isCompany || !user.companyId) {
        setClients([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email, status, created_at, company_id, user_id')
        .eq('company_id', user.companyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      const formattedClients: Client[] = (data || []).map(client => ({
        ...client,
        status: client.status as 'active' | 'inactive',
        full_name: client.full_name || client.email.split('@')[0],
        avatar: (client.full_name || client.email.split('@')[0]).split(' ').map(n => n[0]).join('').toUpperCase()
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [user, isCompany, user?.companyId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const updateClientStatus = async (clientId: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', clientId);

      if (error) throw error;
      
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, status } : c));
      toast.success(`Client ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Failed to update client status');
    }
  };

  return { clients, loading, refetchClients: fetchClients, updateClientStatus };
};
