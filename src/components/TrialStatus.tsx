import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export const TrialStatus = () => {
  const { user } = useUser();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrialDays = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .rpc('get_trial_days_left', { user_id: user.id });
        
        if (!error) {
          setDaysLeft(data);
        }
      } catch (error) {
        console.error('Error fetching trial days:', error);
      }
    };

    fetchTrialDays();
  }, [user]);

  if (!user || daysLeft === null) return null;

  const isExpiringSoon = daysLeft <= 7;
  const isExpired = daysLeft <= 0;

  return (
    <Badge 
      variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "default"}
      className="flex items-center gap-1"
    >
      <Clock className="w-3 h-3" />
      {isExpired ? "Trial Expired" : `${daysLeft} days left in trial`}
    </Badge>
  );
};