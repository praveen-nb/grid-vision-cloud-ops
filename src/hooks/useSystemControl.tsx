import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  isRunning: boolean;
  lastRun: string | null;
  nextRun: string | null;
  stats: {
    totalConnections: number;
    metricsGenerated: number;
    alertsGenerated: number;
    aiPredictions: number;
    anomaliesDetected: number;
    alertsResolved: number;
  };
}

export const useSystemControl = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isRunning: false,
    lastRun: null,
    nextRun: null,
    stats: {
      totalConnections: 0,
      metricsGenerated: 0,
      alertsGenerated: 0,
      aiPredictions: 0,
      anomaliesDetected: 0,
      alertsResolved: 0
    }
  });

  const startSystem = useCallback(async () => {
    try {
      setLoading(true);
      
      toast({
        title: "Starting System",
        description: "Initializing real-time monitoring systems..."
      });

      const { data, error } = await supabase.functions.invoke('system-scheduler');

      if (error) {
        throw error;
      }

      const result = await data;
      
      if (result.success) {
        setSystemStatus({
          isRunning: true,
          lastRun: result.details.timestamp,
          nextRun: result.nextRun,
          stats: result.summary
        });

        toast({
          title: "System Started",
          description: `Generated ${result.summary.metricsGenerated} metrics, ${result.summary.alertsGenerated} alerts, and ${result.summary.aiPredictions} AI predictions`
        });
      } else {
        throw new Error(result.error || 'Failed to start system');
      }
    } catch (error) {
      console.error('Error starting system:', error);
      toast({
        title: "System Error",
        description: error.message || "Failed to start monitoring system",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runDataSimulation = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('realtime-data-simulator');
      if (error) throw error;

      const result = await data;
      
      toast({
        title: "Data Simulation Complete",
        description: `Generated ${result.metricsGenerated} metrics for ${result.connectionsProcessed} connections`
      });

      return result;
    } catch (error) {
      console.error('Error running data simulation:', error);
      toast({
        title: "Simulation Error",
        description: error.message || "Failed to simulate data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runAIAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('ai-analytics-processor');
      if (error) throw error;

      const result = await data;
      
      toast({
        title: "AI Analytics Complete",
        description: `Generated ${result.totalPredictions} predictions, detected ${result.totalAnomalies} anomalies`
      });

      return result;
    } catch (error) {
      console.error('Error running AI analytics:', error);
      toast({
        title: "AI Analytics Error",
        description: error.message || "Failed to process AI analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runAlertManagement = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('alert-management-system');
      if (error) throw error;

      const result = await data;
      
      toast({
        title: "Alert Management Complete",
        description: `Generated ${result.alertsGenerated} new alerts, resolved ${result.alertsAutoResolved} stale alerts`
      });

      return result;
    } catch (error) {
      console.error('Error running alert management:', error);
      toast({
        title: "Alert Management Error",
        description: error.message || "Failed to manage alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const stopSystem = useCallback(async () => {
    setSystemStatus({
      isRunning: false,
      lastRun: systemStatus.lastRun,
      nextRun: null,
      stats: systemStatus.stats
    });

    toast({
      title: "System Stopped",
      description: "Real-time monitoring systems have been stopped"
    });
  }, [systemStatus, toast]);

  return {
    systemStatus,
    loading,
    startSystem,
    stopSystem,
    runDataSimulation,
    runAIAnalytics,
    runAlertManagement
  };
};