import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface PricingRequestData {
  planName: string;
  planPrice: string;
  companyName?: string;
  phone?: string;
}

export const usePricingRequest = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const submitPricingRequest = async (data: PricingRequestData) => {
    if (!user) {
      toast.error("Please log in to submit a pricing request");
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pricing_requests')
        .insert({
          user_id: user.id,
          plan_name: data.planName,
          plan_price: data.planPrice,
          company_name: data.companyName || user.companyName,
          email: user.email,
          phone: data.phone,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast.success("Pricing request submitted! Admin will review your request.");
      return true;
    } catch (error) {
      console.error('Error submitting pricing request:', error);
      toast.error("Failed to submit pricing request. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitPricingRequest, loading };
};