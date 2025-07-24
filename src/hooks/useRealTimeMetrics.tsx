import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface GridMetric {
  id: string;
  connection_id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface GridAlert {
  id: string;
  connection_id: string;
  alert_type: string;
  message: string;
  severity: string;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

interface AIAnalytic {
  id: string;
  connection_id: string;
  model_type: string;
  prediction_type: string;
  confidence_score: number;
  prediction_data: any;
  is_anomaly: boolean;
  severity_level: string;
  created_at: string;
}

export const useRealTimeMetrics = (connectionId?: string) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<GridMetric[]>([]);
  const [alerts, setAlerts] = useState<GridAlert[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!user || !connectionId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch recent metrics (last hour)
      const metricsResponse = await supabase
        .from('grid_metrics')
        .select('*')
        .eq('connection_id', connectionId)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (metricsResponse.error) {
        throw metricsResponse.error;
      }

      // Fetch unresolved alerts
      const alertsResponse = await supabase
        .from('grid_alerts')
        .select('*')
        .eq('connection_id', connectionId)
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (alertsResponse.error) {
        throw alertsResponse.error;
      }

      // Fetch recent AI analytics
      const analyticsResponse = await supabase
        .from('ai_analytics')
        .select('*')
        .eq('connection_id', connectionId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (analyticsResponse.error) {
        throw analyticsResponse.error;
      }

      setMetrics(metricsResponse.data || []);
      setAlerts(alertsResponse.data || []);
      setAnalytics(analyticsResponse.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, connectionId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !connectionId) return;

    fetchInitialData();

    // Subscribe to real-time updates for metrics
    const metricsChannel = supabase
      .channel('grid_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grid_metrics',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          const newMetric = payload.new as GridMetric;
          setMetrics(prev => [newMetric, ...prev.slice(0, 99)]); // Keep last 100 records
          
          // Show toast for critical metrics
          if (newMetric.metric_type === 'voltage' && (newMetric.value < 200 || newMetric.value > 250)) {
            toast({
              title: "Voltage Alert",
              description: `Critical voltage level: ${newMetric.value}${newMetric.unit}`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    // Subscribe to alerts
    const alertsChannel = supabase
      .channel('grid_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grid_alerts',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          const newAlert = payload.new as GridAlert;
          setAlerts(prev => [newAlert, ...prev]);
          
          // Show toast notification for new alerts
          toast({
            title: `${newAlert.severity.toUpperCase()} Alert`,
            description: newAlert.message,
            variant: newAlert.severity === 'high' ? 'destructive' : 'default'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'grid_alerts',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          const updatedAlert = payload.new as GridAlert;
          setAlerts(prev => prev.map(alert => 
            alert.id === updatedAlert.id ? updatedAlert : alert
          ));
        }
      )
      .subscribe();

    // Subscribe to AI analytics
    const analyticsChannel = supabase
      .channel('ai_analytics_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_analytics',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          const newAnalytic = payload.new as AIAnalytic;
          setAnalytics(prev => [newAnalytic, ...prev.slice(0, 49)]); // Keep last 50 records
          
          // Show toast for anomalies
          if (newAnalytic.is_anomaly) {
            toast({
              title: "AI Anomaly Detected",
              description: `${newAnalytic.prediction_type} detected with ${(newAnalytic.confidence_score * 100).toFixed(1)}% confidence`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(analyticsChannel);
    };
  }, [user, connectionId, fetchInitialData]);

  // Method to resolve an alert
  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('grid_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }

      toast({
        title: "Alert Resolved",
        description: "Alert has been marked as resolved"
      });
    } catch (err) {
      console.error('Error resolving alert:', err);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  }, []);

  return {
    metrics,
    alerts,
    analytics,
    loading,
    error,
    resolveAlert,
    refetch: fetchInitialData
  };
};