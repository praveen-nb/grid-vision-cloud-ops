import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Pause,
  Square,
  BarChart3,
  Database,
  Network,
  Cpu,
  Settings
} from 'lucide-react';

export const LoadTestingDashboard = () => {
  const [testStatus, setTestStatus] = useState('idle');
  const [currentTest, setCurrentTest] = useState(null);

  const loadTests = [
    {
      id: 'LT-001',
      name: 'SCADA Data Ingestion Peak',
      type: 'Stress Test',
      duration: '30 min',
      status: 'Completed',
      maxThroughput: '50,000 req/sec',
      avgResponse: '12ms',
      errorRate: '0.02%',
      lastRun: '2024-01-12 10:30'
    },
    {
      id: 'LT-002', 
      name: 'Real-time Dashboard Load',
      type: 'Load Test',
      duration: '60 min',
      status: 'Running',
      maxThroughput: '25,000 req/sec',
      avgResponse: '28ms',
      errorRate: '0.00%',
      lastRun: '2024-01-12 14:00'
    },
    {
      id: 'LT-003',
      name: 'Grid Simulation Burst',
      type: 'Spike Test',
      duration: '15 min',
      status: 'Scheduled',
      maxThroughput: '100,000 req/sec',
      avgResponse: '8ms',
      errorRate: '0.15%',
      lastRun: '2024-01-12 16:00'
    }
  ];

  const performanceMetrics = [
    { metric: 'Peak Throughput', value: '50K req/sec', baseline: '45K req/sec', status: 'pass' },
    { metric: 'Average Latency', value: '12ms', baseline: '<15ms', status: 'pass' },
    { metric: 'P95 Latency', value: '35ms', baseline: '<50ms', status: 'pass' },
    { metric: 'P99 Latency', value: '89ms', baseline: '<100ms', status: 'pass' },
    { metric: 'Error Rate', value: '0.02%', baseline: '<0.1%', status: 'pass' },
    { metric: 'CPU Utilization', value: '67%', baseline: '<80%', status: 'pass' },
    { metric: 'Memory Usage', value: '78%', baseline: '<85%', status: 'pass' },
    { metric: 'Database Connections', value: '245/500', baseline: '<400', status: 'pass' }
  ];

  const infrastructureMetrics = [
    { component: 'API Gateway', throughput: '45,230 req/sec', latency: '8ms', cpu: '45%', memory: '62%' },
    { component: 'Load Balancer', throughput: '48,750 req/sec', latency: '3ms', cpu: '23%', memory: '34%' },
    { component: 'Application Servers', throughput: '42,100 req/sec', latency: '15ms', cpu: '72%', memory: '81%' },
    { component: 'Database Cluster', throughput: '38,900 req/sec', latency: '6ms', cpu: '58%', memory: '74%' },
    { component: 'Cache Layer', throughput: '89,340 req/sec', latency: '1ms', cpu: '28%', memory: '45%' },
    { component: 'Message Queue', throughput: '125,600 req/sec', latency: '2ms', cpu: '31%', memory: '39%' }
  ];

  const testResults = [
    {
      timestamp: '14:30:00',
      throughput: 45200,
      latency: 12,
      errorRate: 0.02,
      cpu: 67,
      memory: 78
    },
    {
      timestamp: '14:31:00', 
      throughput: 47800,
      latency: 11,
      errorRate: 0.01,
      cpu: 69,
      memory: 79
    },
    {
      timestamp: '14:32:00',
      throughput: 50100,
      latency: 14,
      errorRate: 0.03,
      cpu: 73,
      memory: 82
    },
    {
      timestamp: '14:33:00',
      throughput: 48900,
      latency: 13,
      errorRate: 0.02,
      cpu: 71,
      memory: 80
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="text-primary" />
              Load Testing & Performance
            </h1>
            <p className="text-muted-foreground">System performance validation & capacity planning</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </div>

        {/* Test Status Alert */}
        {testStatus === 'running' && (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Load test "Real-time Dashboard Load" is currently running. Peak throughput: 25,000 req/sec
            </AlertDescription>
          </Alert>
        )}

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{metric.metric}</span>
                  {metric.status === 'pass' ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> :
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  }
                </div>
                <div className="text-lg font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">vs {metric.baseline}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tests">Load Tests</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="evidence">Test Evidence</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Test Suite</CardTitle>
                <CardDescription>Automated performance and stress testing scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadTests.map((test) => (
                    <div key={test.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{test.name}</span>
                          <Badge variant={
                            test.status === 'Completed' ? 'default' :
                            test.status === 'Running' ? 'secondary' : 'outline'
                          }>
                            {test.status}
                          </Badge>
                          <Badge variant="outline">{test.type}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">Duration: {test.duration}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Max Throughput:</span>
                          <div className="font-medium">{test.maxThroughput}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Avg Response:</span>
                          <div className="font-medium">{test.avgResponse}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Error Rate:</span>
                          <div className="font-medium">{test.errorRate}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Last Run:</span>
                          <div className="font-medium">{test.lastRun}</div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" disabled={test.status === 'Running'}>
                          <Play className="h-4 w-4 mr-2" />
                          Run Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Performance Metrics</CardTitle>
                  <CardDescription>Real-time system performance during load testing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">48,750</div>
                        <div className="text-sm text-muted-foreground">Current RPS</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">13ms</div>
                        <div className="text-sm text-muted-foreground">Avg Latency</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0.01%</div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">71%</div>
                        <div className="text-sm text-muted-foreground">CPU Usage</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Throughput vs Baseline</span>
                          <span className="text-sm">108%</span>
                        </div>
                        <Progress value={108} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Latency vs SLA</span>
                          <span className="text-sm">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Progress</CardTitle>
                  <CardDescription>Current load test execution status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Real-time Dashboard Load</h3>
                      <p className="text-sm text-muted-foreground">Running for 23 minutes</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Test Progress</span>
                          <span className="text-sm">38%</span>
                        </div>
                        <Progress value={38} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Virtual Users</span>
                          <span className="text-sm">2,500 / 5,000</span>
                        </div>
                        <Progress value={50} />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button variant="outline" size="sm">
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Performance</CardTitle>
                <CardDescription>Component-level performance metrics during load testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {infrastructureMetrics.map((component, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {component.component.includes('Database') && <Database className="h-4 w-4" />}
                          {component.component.includes('Network') && <Network className="h-4 w-4" />}
                          {!component.component.includes('Database') && !component.component.includes('Network') && <Cpu className="h-4 w-4" />}
                          <span className="font-medium">{component.component}</span>
                        </div>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Throughput:</span>
                          <div className="font-medium">{component.throughput}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Latency:</span>
                          <div className="font-medium">{component.latency}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">CPU:</span>
                          <div className="font-medium">{component.cpu}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Memory:</span>
                          <div className="font-medium">{component.memory}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Test Evidence</CardTitle>
                <CardDescription>Documented proof of system performance capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Peak Performance Achieved</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 border rounded">
                          <span>Maximum Throughput:</span>
                          <span className="font-medium">50,123 req/sec</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Sustained Load (1hr):</span>
                          <span className="font-medium">45,890 req/sec</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Zero Downtime:</span>
                          <span className="font-medium">99.99% uptime</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Auto-scaling Triggered:</span>
                          <span className="font-medium">@35K req/sec</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Compliance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 border rounded">
                          <span>P95 Latency:</span>
                          <span className="font-medium text-green-600">35ms (&lt;50ms SLA)</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>P99 Latency:</span>
                          <span className="font-medium text-green-600">89ms (&lt;100ms SLA)</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Error Rate:</span>
                          <span className="font-medium text-green-600">0.02% (&lt;0.1% SLA)</span>
                        </div>
                        <div className="flex justify-between p-2 border rounded">
                          <span>Recovery Time:</span>
                          <span className="font-medium text-green-600">&lt;30s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Test Execution Log</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      <div className="space-y-1">
                        <div>[2024-01-12 14:00:00] Test initiated: Real-time Dashboard Load</div>
                        <div>[2024-01-12 14:00:15] Ramping up virtual users: 0 → 1000</div>
                        <div>[2024-01-12 14:05:00] Target load reached: 25,000 req/sec</div>
                        <div>[2024-01-12 14:15:00] Peak achieved: 50,123 req/sec</div>
                        <div>[2024-01-12 14:15:30] Auto-scaling triggered: +3 instances</div>
                        <div>[2024-01-12 14:30:00] Sustained load maintained: 45,890 req/sec</div>
                        <div>[2024-01-12 14:45:00] <span className="text-green-600">All SLAs met ✓</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline">
                      Generate Certificate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                  <CardDescription>System behavior under load</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Bottleneck Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>API Gateway: Optimal performance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Database: Connection pooling effective</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>Application tier: CPU intensive at peak</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Cache layer: 98.7% hit rate</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Scaling Behavior</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Auto-scaling threshold: 35,000 req/sec</div>
                        <div>• Scale-up time: 45 seconds</div>
                        <div>• Scale-down delay: 10 minutes</div>
                        <div>• Maximum instances: 20 (reached 18)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Performance optimization suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Immediate Actions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 border rounded-lg">
                          <div className="font-medium">Optimize application CPU usage</div>
                          <div className="text-muted-foreground">Profile and optimize hot code paths</div>
                        </div>
                        <div className="p-2 border rounded-lg">
                          <div className="font-medium">Increase cache TTL</div>
                          <div className="text-muted-foreground">Reduce database load by 15%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Future Enhancements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 border rounded-lg">
                          <div className="font-medium">Implement read replicas</div>
                          <div className="text-muted-foreground">Scale reads to 100K+ req/sec</div>
                        </div>
                        <div className="p-2 border rounded-lg">
                          <div className="font-medium">Add CDN layer</div>
                          <div className="text-muted-foreground">Reduce latency for static assets</div>
                        </div>
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