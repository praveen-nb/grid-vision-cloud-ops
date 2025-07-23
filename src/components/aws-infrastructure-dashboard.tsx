import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Server, 
  Database, 
  HardDrive, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cloud,
  Monitor,
  Lock
} from 'lucide-react';

interface AWSResource {
  id: string;
  name: string;
  type: 'ec2' | 'rds' | 's3' | 'security';
  status: 'running' | 'stopped' | 'pending' | 'error';
  region: string;
  cost: number;
  lastUpdate: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    storage?: number;
    connections?: number;
  };
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const AWSInfrastructureDashboard = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<AWSResource[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetchInfrastructureStatus();
    fetchSecurityEvents();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchInfrastructureStatus();
      fetchSecurityEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchInfrastructureStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aws-infrastructure-monitor');
      
      if (error) throw error;
      
      setResources(data.resources || []);
      setTotalCost(data.totalCost || 0);
    } catch (error) {
      console.error('Error fetching infrastructure status:', error);
      // Set mock data for development
      setResources([
        {
          id: 'i-1234567890abcdef0',
          name: 'Grid-Monitor-Web-Server',
          type: 'ec2',
          status: 'running',
          region: 'us-east-1',
          cost: 45.60,
          lastUpdate: new Date().toISOString(),
          metrics: { cpu: 35, memory: 60, storage: 45 }
        },
        {
          id: 'db-instance-1',
          name: 'Grid-Metrics-Database',
          type: 'rds',
          status: 'running',
          region: 'us-east-1',
          cost: 89.30,
          lastUpdate: new Date().toISOString(),
          metrics: { cpu: 25, memory: 40, connections: 15 }
        },
        {
          id: 'grid-data-bucket',
          name: 'Grid-Data-Storage',
          type: 's3',
          status: 'running',
          region: 'us-east-1',
          cost: 12.45,
          lastUpdate: new Date().toISOString(),
          metrics: { storage: 75 }
        }
      ]);
      setTotalCost(147.35);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aws-security-monitor');
      
      if (error) throw error;
      
      setSecurityEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
      // Set mock data for development
      setSecurityEvents([
        {
          id: '1',
          type: 'Unauthorized Access Attempt',
          severity: 'high',
          message: 'Multiple failed login attempts detected from IP 192.168.1.100',
          timestamp: new Date().toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'Configuration Change',
          severity: 'medium',
          message: 'Security group rules modified for EC2 instance',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: true
        }
      ]);
    }
  };

  const handleResourceAction = async (resourceId: string, action: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aws-resource-control', {
        body: { resourceId, action }
      });

      if (error) throw error;

      toast({
        title: "Action Completed",
        description: `${action} operation executed successfully on ${resourceId}`
      });

      fetchInfrastructureStatus();
    } catch (error) {
      console.error('Error executing resource action:', error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to execute resource action",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'ec2':
        return <Server className="h-5 w-5" />;
      case 'rds':
        return <Database className="h-5 w-5" />;
      case 's3':
        return <HardDrive className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">AWS Infrastructure</h2>
          <p className="text-muted-foreground">Monitor and manage your cloud resources</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
          <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EC2 Instances</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter(r => r.type === 'ec2').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {resources.filter(r => r.type === 'ec2' && r.status === 'running').length} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDS Databases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter(r => r.type === 'rds').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {resources.filter(r => r.type === 'rds' && r.status === 'running').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">S3 Buckets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter(r => r.type === 's3').length}
            </div>
            <p className="text-xs text-muted-foreground">
              All operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityEvents.filter(e => !e.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unresolved alerts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <CardDescription>{resource.id} • {resource.region}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={resource.status === 'running' ? 'default' : 'secondary'}>
                        {getStatusIcon(resource.status)}
                        <span className="ml-1">{resource.status}</span>
                      </Badge>
                      <span className="text-sm font-medium">${resource.cost}/month</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resource.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {resource.metrics.cpu && (
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>CPU Usage</span>
                              <span>{resource.metrics.cpu}%</span>
                            </div>
                            <Progress value={resource.metrics.cpu} className="h-2" />
                          </div>
                        )}
                        {resource.metrics.memory && (
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Memory</span>
                              <span>{resource.metrics.memory}%</span>
                            </div>
                            <Progress value={resource.metrics.memory} className="h-2" />
                          </div>
                        )}
                        {resource.metrics.storage && (
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Storage</span>
                              <span>{resource.metrics.storage}%</span>
                            </div>
                            <Progress value={resource.metrics.storage} className="h-2" />
                          </div>
                        )}
                        {resource.metrics.connections && (
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Connections</span>
                              <span>{resource.metrics.connections}</span>
                            </div>
                            <Progress value={resource.metrics.connections} className="h-2" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResourceAction(resource.id, 'restart')}
                        disabled={loading}
                      >
                        Restart
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResourceAction(resource.id, 'monitor')}
                        disabled={loading}
                      >
                        <Monitor className="h-4 w-4 mr-1" />
                        Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Events
                </CardTitle>
                <CardDescription>Recent security alerts and compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <Alert key={event.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getSeverityColor(event.severity) as any}>
                                {event.severity}
                              </Badge>
                              <span className="font-medium">{event.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!event.resolved && (
                            <Button size="sm" variant="outline">
                              Resolve
                            </Button>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Monitoring</CardTitle>
              <CardDescription>Real-time metrics and performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Monitoring dashboard will be implemented with CloudWatch integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};