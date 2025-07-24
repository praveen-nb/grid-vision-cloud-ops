import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface GridConnection {
  id: string;
  user_id: string;
  name: string;
  type: string;
  location: string;
  endpoint: string;
  protocol: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  voltage?: number;
  frequency?: number;
  last_update: string;
  created_at: string;
  updated_at: string;
}

interface ConnectionStats {
  total: number;
  connected: number;
  disconnected: number;
  error: number;
  maintenance: number;
}

export const useGridConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<GridConnection[]>([]);
  const [stats, setStats] = useState<ConnectionStats>({
    total: 0,
    connected: 0,
    disconnected: 0,
    error: 0,
    maintenance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from connections
  const calculateStats = useCallback((connections: GridConnection[]): ConnectionStats => {
    return {
      total: connections.length,
      connected: connections.filter(c => c.status === 'connected').length,
      disconnected: connections.filter(c => c.status === 'disconnected').length,
      error: connections.filter(c => c.status === 'error').length,
      maintenance: connections.filter(c => c.status === 'maintenance').length
    };
  }, []);

  // Fetch user's grid connections
  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('grid_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const gridConnections = (data || []).map(conn => ({
        ...conn,
        status: conn.status as GridConnection['status']
      }));
      setConnections(gridConnections);
      setStats(calculateStats(gridConnections));

    } catch (err) {
      console.error('Error fetching grid connections:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load grid connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, calculateStats]);

  // Create new grid connection
  const createConnection = useCallback(async (connectionData: Omit<GridConnection, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_update'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('grid_connections')
        .insert({
          ...connectionData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Connection Created",
        description: `Grid connection "${connectionData.name}" has been created successfully`,
      });

      return data;
    } catch (err) {
      console.error('Error creating connection:', err);
      toast({
        title: "Error",
        description: "Failed to create grid connection",
        variant: "destructive"
      });
      throw err;
    }
  }, [user]);

  // Update grid connection
  const updateConnection = useCallback(async (connectionId: string, updates: Partial<GridConnection>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('grid_connections')
        .update(updates)
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Connection Updated",
        description: "Grid connection has been updated successfully",
      });

      return data;
    } catch (err) {
      console.error('Error updating connection:', err);
      toast({
        title: "Error",
        description: "Failed to update grid connection",
        variant: "destructive"
      });
      throw err;
    }
  }, [user]);

  // Delete grid connection
  const deleteConnection = useCallback(async (connectionId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('grid_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Connection Deleted",
        description: "Grid connection has been deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting connection:', err);
      toast({
        title: "Error",
        description: "Failed to delete grid connection",
        variant: "destructive"
      });
      throw err;
    }
  }, [user]);

  // Test connection status
  const testConnection = useCallback(async (connectionId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Simulate connection test
      const testResult = Math.random() > 0.2; // 80% success rate
      const newStatus = testResult ? 'connected' : 'error';

      await updateConnection(connectionId, {
        status: newStatus,
        last_update: new Date().toISOString()
      });

      toast({
        title: testResult ? "Connection Test Passed" : "Connection Test Failed",
        description: testResult 
          ? "Grid connection is responding normally"
          : "Grid connection failed to respond",
        variant: testResult ? "default" : "destructive"
      });

      return testResult;
    } catch (err) {
      console.error('Error testing connection:', err);
      toast({
        title: "Test Error",
        description: "Failed to test grid connection",
        variant: "destructive"
      });
      throw err;
    }
  }, [user, updateConnection]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchConnections();

    // Subscribe to changes in user's grid connections
    const connectionsChannel = supabase
      .channel('user_grid_connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grid_connections',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newConnection = payload.new as GridConnection;
            setConnections(prev => {
              const updated = [newConnection, ...prev];
              setStats(calculateStats(updated));
              return updated;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedConnection = payload.new as GridConnection;
            setConnections(prev => {
              const updated = prev.map(conn => 
                conn.id === updatedConnection.id ? updatedConnection : conn
              );
              setStats(calculateStats(updated));
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedConnection = payload.old as GridConnection;
            setConnections(prev => {
              const updated = prev.filter(conn => conn.id !== deletedConnection.id);
              setStats(calculateStats(updated));
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(connectionsChannel);
    };
  }, [user, fetchConnections, calculateStats]);

  return {
    connections,
    stats,
    loading,
    error,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    refetch: fetchConnections
  };
};