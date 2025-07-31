import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDataSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);

  const startSimulation = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('realtime-data-simulator');
      
      if (error) {
        console.error('Simulation error:', error);
        toast.error('Failed to start data simulation');
        return;
      }

      if (data?.success) {
        toast.success(`Generated ${data.metricsGenerated} metrics for ${data.connectionsProcessed} connections`);
      } else {
        toast.warning(data?.message || 'No data generated');
      }
    } catch (error) {
      console.error('Error calling simulator:', error);
      toast.error('Failed to start data simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const startAutoSimulation = () => {
    // Generate data immediately
    startSimulation();
    
    // Then generate data every 10 seconds
    const interval = setInterval(() => {
      startSimulation();
    }, 10000);

    return () => clearInterval(interval);
  };

  return {
    startSimulation,
    startAutoSimulation,
    isSimulating
  };
}