import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Clock, 
  Database, 
  Server, 
  Network,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const DRLatencyMetricsDashboard = () => {
  const [drStatus, setDrStatus] = useState('healthy');
  const [lastTest, setLastTest] = useState('2024-01-12 02:00:00');
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    primaryLatency: 8.5,
    secondaryLatency: 12.3,
    replicationLag: 45,
    networkLatency: 2.1
  });

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        primaryLatency: prev.primaryLatency + (Math.random() - 0.5) * 2,
        secondaryLatency: prev.secondaryLatency + (Math.random() - 0.5) * 3,
        replicationLag: Math.max(0, prev.replicationLag + (Math.random() - 0.5) * 10),
        networkLatency: prev.networkLatency + (Math.random() - 0.5) * 0.5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const drSites = [
    {
      site: 'Primary (us-east-1)',
      status: 'Active',
      rto: '< 5 min',
      rpo: '< 1 min',
      latency: realTimeMetrics.primaryLatency,
      availability: '99.99%',
      lastBackup: '2024-01-12 14:15:00'
    },
    {
      site: 'Secondary (us-west-2)', 
      status: 'Standby',
      rto: '< 15 min',
      rpo: '< 5 min',
      latency: realTimeMetrics.secondaryLatency,
      availability: '99.95%',
      lastBackup: '2024-01-12 14:10:00'
    },
    {
      site: 'Tertiary (Azure Central)',
      status: 'Cold',
      rto: '< 60 min',
      rpo: '< 1 hour',
      latency: 45.2,
      availability: '99.90%',
      lastBackup: '2024-01-12 12:00:00'
    }
  ];

  const latencyMetrics = [
    { metric: 'API Response Time', current: '8.5ms', target: '<10ms', trend: 'down', status: 'good' },
    { metric: 'Database Query Time', current: '4.2ms', target: '<5ms', trend: 'stable', status: 'good' },
    { metric: 'Cross-Region Sync', current: '45ms', target: '<50ms', trend: 'up', status: 'warning' },
    { metric: 'Backup Completion', current: '2.3min', target: '<5min', trend: 'down', status: 'good' },
    { metric: 'Failover Time', current: '87s', target: '<300s', trend: 'down', status: 'good' },
    { metric: 'Network Round Trip', current: '2.1ms', target: '<3ms', trend: 'stable', status: 'good' }
  ];

  const testResults = [
    {
      testType: 'Automated Failover',
      timestamp: '2024-01-12 02:00',
      duration: '4m 23s',
      rto: '4m 23s',
      rpo: '45s',
      status: 'Passed',
      dataLoss: '0 records'
    },
    {
      testType: 'Manual Failover',
      timestamp: '2024-01-10 14:30',
      duration: '8m 15s',
      rto: '8m 15s',
      rpo: '2m 10s',
      status: 'Passed',
      dataLoss: '0 records'
    },
    {
      testType: 'Database Recovery',
      timestamp: '2024-01-08 10:15',
      duration: '12m 45s',
      rto: '12m 45s',
      rpo: '5m 30s',
      status: 'Passed',
      dataLoss: '0 records'
    },
    {
      testType: 'Network Partition',
      timestamp: '2024-01-05 16:20',
      duration: '6m 52s',
      rto: '6m 52s',
      rpo: '1m 25s',
      status: 'Passed',
      dataLoss: '0 records'
    }
  ];

  const complianceMetrics = [
    { requirement: 'RTO Compliance', target: '< 15 min', actual: '4m 23s', status: 'pass' },
    { requirement: 'RPO Compliance', target: '< 5 min', actual: '45s', status: 'pass' },
    { requirement: 'Data Integrity', target: '100%', actual: '100%', status: 'pass' },
    { requirement: 'Test Frequency', target: 'Monthly', actual: 'Monthly', status: 'pass' },
    { requirement: 'Documentation', target: 'Complete', actual: 'Complete', status: 'pass' },
    { requirement: 'Staff Training', target: 'Quarterly', actual: 'Quarterly', status: 'pass' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="text-primary" />
              DR & Latency Metrics
            </h1>
            <p className="text-muted-foreground">Disaster Recovery Performance & Latency Analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Test DR
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Status
            </Button>
            <Button size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Failover
            </Button>
          </div>
        </div>

        {/* DR Status Alert */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All DR sites operational. Last automated test: {lastTest} - RTO: 4m 23s, RPO: 45s
          </AlertDescription>
        </Alert>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">RTO</span>
              </div>
              <div className="text-2xl font-bold">4m 23s</div>
              <div className="text-xs text-green-600">Target: &lt;15min</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Database className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">RPO</span>
              </div>
              <div className="text-2xl font-bold">45s</div>
              <div className="text-xs text-green-600">Target: &lt;5min</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Network className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Replication Lag</span>
              </div>
              <div className="text-2xl font-bold">{realTimeMetrics.replicationLag.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Cross-region</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Network RTT</span>
              </div>
              <div className="text-2xl font-bold">{realTimeMetrics.networkLatency.toFixed(1)}ms</div>
              <div className="text-xs text-muted-foreground">Inter-site</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sites">DR Sites</TabsTrigger>
            <TabsTrigger value="latency">Latency Analysis</TabsTrigger>
            <TabsTrigger value="testing">DR Testing</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="sites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Disaster Recovery Sites</CardTitle>
                <CardDescription>Multi-site disaster recovery infrastructure status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drSites.map((site, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Server className="h-5 w-5" />
                          <span className="font-medium">{site.site}</span>
                          <Badge variant={
                            site.status === 'Active' ? 'default' :
                            site.status === 'Standby' ? 'secondary' : 'outline'
                          }>
                            {site.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Availability: {site.availability}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">RTO:</span>
                          <div className="font-medium">{site.rto}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">RPO:</span>
                          <div className="font-medium">{site.rpo}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Latency:</span>
                          <div className="font-medium">{site.latency.toFixed(1)}ms</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Last Backup:</span>
                          <div className="font-medium">{site.lastBackup}</div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="latency" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latencyMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                        {metric.trend === 'stable' && <Activity className="h-4 w-4 text-blue-500" />}
                        <Badge variant={
                          metric.status === 'good' ? 'default' :
                          metric.status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{metric.current}</div>
                    <div className="text-xs text-muted-foreground">Target: {metric.target}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Latency Breakdown</CardTitle>
                <CardDescription>End-to-end latency analysis across components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Request Path Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 border rounded">
                          <span>Load Balancer:</span>
                          <span className="font-medium">0.8ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>API Gateway:</span>
                          <span className="font-medium">2.1ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Application Processing:</span>
                          <span className="font-medium">3.4ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Database Query:</span>
                          <span className="font-medium">4.2ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded bg-primary/10">
                          <span className="font-medium">Total End-to-End:</span>
                          <span className="font-bold">8.5ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Cross-Region Latency</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 border rounded">
                          <span>us-east-1 → us-west-2:</span>
                          <span className="font-medium">65ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>us-east-1 → eu-west-1:</span>
                          <span className="font-medium">89ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>us-east-1 → ap-southeast-1:</span>
                          <span className="font-medium">187ms</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Replication Lag:</span>
                          <span className="font-medium">{realTimeMetrics.replicationLag.toFixed(0)}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>DR Test Results</CardTitle>
                <CardDescription>Historical disaster recovery test execution results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((test, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{test.testType}</span>
                          <Badge variant={test.status === 'Passed' ? 'default' : 'destructive'}>
                            {test.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{test.timestamp}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium">{test.duration}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">RTO:</span>
                          <div className="font-medium">{test.rto}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">RPO:</span>
                          <div className="font-medium">{test.rpo}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data Loss:</span>
                          <div className="font-medium text-green-600">{test.dataLoss}</div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Next Scheduled Test</h4>
                  <div className="text-sm">
                    <div>Test Type: Automated Failover</div>
                    <div>Scheduled: 2024-02-12 02:00:00 UTC</div>
                    <div>Expected Duration: ~5 minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
                <CardDescription>DR compliance with industry standards and internal SLAs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {complianceMetrics.map((metric, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.requirement}</span>
                          {metric.status === 'pass' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> :
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          }
                        </div>
                        <div className="text-lg font-bold">{metric.actual}</div>
                        <div className="text-xs text-muted-foreground">Target: {metric.target}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert className="mt-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All compliance requirements met. Next audit due: March 2024
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Monitoring</CardTitle>
                  <CardDescription>Live system health and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Primary Site Health</span>
                          <span className="text-sm">99.9%</span>
                        </div>
                        <Progress value={99.9} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Secondary Site Health</span>
                          <span className="text-sm">99.7%</span>
                        </div>
                        <Progress value={99.7} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Data Sync Status</span>
                          <span className="text-sm">98.5%</span>
                        </div>
                        <Progress value={98.5} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Configuration</CardTitle>
                  <CardDescription>DR monitoring thresholds and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border rounded">
                        <span>RTO Threshold:</span>
                        <span className="font-medium">15 minutes</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>RPO Threshold:</span>
                        <span className="font-medium">5 minutes</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Replication Lag:</span>
                        <span className="font-medium">100ms</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Site Availability:</span>
                        <span className="font-medium">&lt; 99%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};