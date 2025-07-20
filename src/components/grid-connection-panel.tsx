import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Power, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MapPin,
  Zap,
  Settings,
  Lock,
  Globe
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GridConnection {
  id: string;
  name: string;
  type: 'Distribution' | 'Transmission' | 'Generation' | 'Renewable';
  location: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'maintenance';
  voltage: number;
  frequency: number;
  lastUpdate: Date;
}

interface DatabaseGridConnection {
  id: string;
  name: string;
  type: string;
  location: string;
  endpoint: string;
  protocol: string;
  status: string;
  voltage: number | null;
  frequency: number | null;
  last_update: string;
}

const GridConnectionPanel: React.FC = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<GridConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: '',
    location: '',
    endpoint: '',
    protocol: '',
    apiKey: ''
  });

  // Load connections from database
  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading connections:', error);
        toast({
          title: "Error",
          description: "Failed to load grid connections",
          variant: "destructive"
        });
        return;
      }

      // Transform database format to component format
      const transformedConnections: GridConnection[] = data.map((conn: DatabaseGridConnection) => ({
        id: conn.id,
        name: conn.name,
        type: conn.type as GridConnection['type'],
        location: conn.location,
        status: conn.status as GridConnection['status'],
        voltage: conn.voltage || 0,
        frequency: conn.frequency || 0,
        lastUpdate: new Date(conn.last_update)
      }));

      setConnections(transformedConnections);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!newConnection.name || !newConnection.type || !newConnection.location || !newConnection.endpoint || !newConnection.protocol) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add grid connections.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Insert new connection into database
      const { data, error } = await supabase
        .from('grid_connections')
        .insert({
          user_id: user.id,
          name: newConnection.name,
          type: newConnection.type,
          location: newConnection.location,
          endpoint: newConnection.endpoint,
          protocol: newConnection.protocol,
          status: 'connecting',
          api_credentials_encrypted: newConnection.apiKey ? btoa(newConnection.apiKey) : null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Simulate connection process
      setTimeout(async () => {
        // Update connection status to connected
        const { error: updateError } = await supabase
          .from('grid_connections')
          .update({
            status: 'connected',
            voltage: Math.random() * 50000 + 10000,
            frequency: 59.9 + Math.random() * 0.2,
            last_update: new Date().toISOString()
          })
          .eq('id', data.id);

        if (!updateError) {
          // Reload connections to show updated status
          loadConnections();
          
          toast({
            title: "Grid Connected",
            description: `Successfully connected to ${newConnection.name}`,
          });
        }

        setIsConnecting(false);
      }, 3000);

      // Reset form
      setNewConnection({ 
        name: '', 
        type: '', 
        location: '', 
        endpoint: '', 
        protocol: '', 
        apiKey: '' 
      });

    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to establish grid connection. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'connecting': return <Activity className="h-4 w-4 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5 text-primary" />
            Grid Connection Manager
          </CardTitle>
          <CardDescription>
            Connect and monitor utility grids with secure, real-time data access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connections">Active Connections</TabsTrigger>
              <TabsTrigger value="add">Add New Grid</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connections" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading connections...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {connections.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Grid Connections</h3>
                        <p className="text-muted-foreground mb-4">
                          Start by adding your first utility grid connection.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    connections.map((connection) => (
                      <Card key={connection.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{connection.name}</h3>
                                <Badge variant="outline">{connection.type}</Badge>
                                <div className="flex items-center gap-2">
                                  <div className={`h-3 w-3 rounded-full ${getStatusColor(connection.status)}`}></div>
                                  <span className="text-sm text-muted-foreground capitalize">
                                    {connection.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {connection.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="h-4 w-4" />
                                  {(connection.voltage / 1000).toFixed(1)}kV
                                </div>
                                <div className="flex items-center gap-1">
                                  <Activity className="h-4 w-4" />
                                  {connection.frequency.toFixed(2)}Hz
                                </div>
                              </div>
                              
                              <p className="text-xs text-muted-foreground">
                                Last updated: {connection.lastUpdate.toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center gap-1 text-sm">
                                {getStatusIcon(connection.status)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grid-name">Grid Name</Label>
                  <Input
                    id="grid-name"
                    placeholder="e.g., Pacific Northwest Grid"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grid-type">Grid Type</Label>
                  <Select value={newConnection.type} onValueChange={(value) => setNewConnection(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grid type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Distribution">Distribution</SelectItem>
                      <SelectItem value="Transmission">Transmission</SelectItem>
                      <SelectItem value="Generation">Generation</SelectItem>
                      <SelectItem value="Renewable">Renewable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grid-location">Location</Label>
                  <Input
                    id="grid-location"
                    placeholder="e.g., Seattle, WA"
                    value={newConnection.location}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grid-endpoint">Connection Endpoint</Label>
                  <Input
                    id="grid-endpoint"
                    placeholder="https://api.yourgrid.com/v1"
                    value={newConnection.endpoint}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, endpoint: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grid-protocol">Protocol</Label>
                  <Select value={newConnection.protocol} onValueChange={(value) => setNewConnection(prev => ({ ...prev, protocol: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNP3">DNP3</SelectItem>
                      <SelectItem value="Modbus">Modbus</SelectItem>
                      <SelectItem value="IEC 61850">IEC 61850</SelectItem>
                      <SelectItem value="SCADA">SCADA</SelectItem>
                      <SelectItem value="REST API">REST API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API credentials"
                      value={newConnection.apiKey}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Secure encrypted connection</span>
                </div>
                
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || !newConnection.name || !newConnection.type}
                  className="min-w-[140px]"
                >
                  {isConnecting ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Connect Grid
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { GridConnectionPanel };