import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  event_details: any;
  source_ip?: string;
  target_system?: string;
  status: string;
  response_actions: any[];
  connection_id?: string;
  created_at: string;
  updated_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  activeThreats: number;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    resolvedEvents: 0,
    activeThreats: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch security events
  const fetchSecurityData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch recent security events (last 7 days)
      const eventsResponse = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsResponse.error) {
        throw eventsResponse.error;
      }

      const securityEvents = (eventsResponse.data || []).map(event => ({
        ...event,
        source_ip: event.source_ip as string | undefined,
        target_system: event.target_system as string | undefined,
        event_details: event.event_details as any,
        response_actions: event.response_actions as any[]
      }));
      setEvents(securityEvents);

      // Calculate metrics
      const totalEvents = securityEvents.length;
      const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
      const resolvedEvents = securityEvents.filter(e => e.status === 'resolved').length;
      const activeThreats = securityEvents.filter(e => 
        e.status === 'detected' && (e.severity === 'high' || e.severity === 'critical')
      ).length;

      setMetrics({
        totalEvents,
        criticalEvents,
        resolvedEvents,
        activeThreats
      });

    } catch (err) {
      console.error('Error fetching security data:', err);
      setError(err.message);
      toast({
        title: "Security Error",
        description: "Failed to load security monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time security monitoring
  useEffect(() => {
    if (!user) return;

    fetchSecurityData();

    // Subscribe to new security events
    const securityChannel = supabase
      .channel('security_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events'
        },
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            criticalEvents: newEvent.severity === 'critical' ? prev.criticalEvents + 1 : prev.criticalEvents,
            activeThreats: (newEvent.status === 'detected' && (newEvent.severity === 'high' || newEvent.severity === 'critical')) 
              ? prev.activeThreats + 1 : prev.activeThreats
          }));
          
          // Show critical security alerts
          if (newEvent.severity === 'critical' || newEvent.severity === 'high') {
            toast({
              title: `${newEvent.severity.toUpperCase()} Security Alert`,
              description: `${newEvent.event_type}: ${newEvent.event_details?.description || 'Security event detected'}`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(securityChannel);
    };
  }, [user, fetchSecurityData]);

  // Log user session for security audit
  const logUserSession = useCallback(async (action: string, details?: any) => {
    if (!user) return;

    try {
      await supabase.from('security_events').insert({
        event_type: 'user_session',
        severity: 'low',
        event_details: {
          user_id: user.id,
          action,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ...details
        },
        status: 'logged'
      });
    } catch (err) {
      console.error('Error logging user session:', err);
    }
  }, [user]);

  // Validate session security
  const validateSession = useCallback(async () => {
    if (!user) return false;

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        await logUserSession('session_invalid', { reason: 'No active session' });
        return false;
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = new Date(session.session.expires_at! * 1000);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;

      if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
        toast({
          title: "Session Expiring",
          description: "Your session will expire soon. Please save your work.",
          variant: "destructive"
        });
        
        await logUserSession('session_expiring', { 
          expires_at: expiresAt.toISOString(),
          remaining_time: expiresAt.getTime() - now.getTime()
        });
      }

      return true;
    } catch (err) {
      console.error('Error validating session:', err);
      await logUserSession('session_validation_error', { error: err.message });
      return false;
    }
  }, [user, logUserSession]);

  // Enhanced logout with security logging
  const secureLogout = useCallback(async () => {
    await logUserSession('logout_initiated');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      await logUserSession('logout_successful');
    } catch (err) {
      console.error('Error during logout:', err);
      await logUserSession('logout_error', { error: err.message });
      throw err;
    }
  }, [logUserSession]);

  return {
    events,
    metrics,
    loading,
    error,
    logUserSession,
    validateSession,
    secureLogout,
    refetch: fetchSecurityData
  };
};