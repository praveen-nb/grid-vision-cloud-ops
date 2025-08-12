import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Server, 
  Network, 
  Shield, 
  Database,
  Zap,
  Globe,
  CheckCircle,
  AlertTriangle,
  Activity,
  Settings
} from 'lucide-react';

export const HybridArchitectureDashboard = () => {
  const [selectedCloud, setSelectedCloud] = useState('aws');

  const cloudProviders = [
    { id: 'aws', name: 'Amazon Web Services', workloads: 12, status: 'healthy', utilization: 78 },
    { id: 'azure', name: 'Microsoft Azure', workloads: 8, status: 'healthy', utilization: 65 },
    { id: 'gcp', name: 'Google Cloud Platform', workloads: 4, status: 'maintenance', utilization: 23 },
    { id: 'onprem', name: 'On-Premises', workloads: 15, status: 'healthy', utilization: 82 }
  ];

  const directConnections = [
    { name: 'AWS Direct Connect', bandwidth: '10 Gbps', latency: '2.1ms', status: 'active', usage: 67 },
    { name: 'Azure ExpressRoute', bandwidth: '5 Gbps', latency: '3.4ms', status: 'active', usage: 45 },
    { name: 'GCP Cloud Interconnect', bandwidth: '1 Gbps', latency: '5.2ms', status: 'maintenance', usage: 12 },
    { name: 'MPLS Network', bandwidth: '1 Gbps', latency: '8.7ms', status: 'active', usage: 78 }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Cloud className="text-primary" />
              Hybrid Cloud Architecture
            </h1>
            <p className="text-muted-foreground">Multi-cloud hybrid infrastructure management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Network className="h-4 w-4 mr-2" />
              Network Map
            </Button>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cloudProviders.map((provider) => (
            <Card key={provider.id} className={selectedCloud === provider.id ? 'ring-2 ring-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Cloud className="h-4 w-4" />
                  <Badge variant={provider.status === 'healthy' ? 'default' : 'secondary'}>
                    {provider.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold">{provider.name}</div>
                <div className="text-sm text-muted-foreground">{provider.workloads} workloads</div>
                <Progress value={provider.utilization} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{provider.utilization}% utilized</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connections">Direct Connect</TabsTrigger>
            <TabsTrigger value="workloads">Workload Distribution</TabsTrigger>
            <TabsTrigger value="security">Security Posture</TabsTrigger>
            <TabsTrigger value="costs">Cost Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Private Network Connections</CardTitle>
                <CardDescription>Dedicated connections to cloud providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {directConnections.map((conn, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4" />
                          <span className="font-medium">{conn.name}</span>
                        </div>
                        <Badge variant={conn.status === 'active' ? 'default' : 'secondary'}>
                          {conn.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Bandwidth:</span>
                          <div className="font-medium">{conn.bandwidth}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Latency:</span>
                          <div className="font-medium">{conn.latency}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Usage:</span>
                          <div className="font-medium">{conn.usage}%</div>
                        </div>
                        <div>
                          <Progress value={conn.usage} className="mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workloads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>Application deployment across cloud environments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Production Workloads</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border rounded">
                        <span>SCADA Control:</span>
                        <span className="font-medium">On-Premises</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Real-time Analytics:</span>
                        <span className="font-medium">AWS (us-east-1)</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>GIS Services:</span>
                        <span className="font-medium">Azure (East US)</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Backup Storage:</span>
                        <span className="font-medium">Multi-cloud</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Development/Testing</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border rounded">
                        <span>Development:</span>
                        <span className="font-medium">GCP (us-central1)</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Testing/QA:</span>
                        <span className="font-medium">AWS (us-west-2)</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Staging:</span>
                        <span className="font-medium">Azure (West US)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>Cross-cloud security posture and compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Identity & Access</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• Federated SSO across clouds</div>
                      <div>• Zero-trust networking</div>
                      <div>• Multi-factor authentication</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Data Protection</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• End-to-end encryption</div>
                      <div>• Data sovereignty compliance</div>
                      <div>• Cross-region replication</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Monitoring</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• Unified SIEM across clouds</div>
                      <div>• Threat detection & response</div>
                      <div>• Compliance automation</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Cloud Cost Analysis</CardTitle>
                <CardDescription>Cost optimization across hybrid infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Monthly Costs by Provider</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border rounded">
                        <span>AWS:</span>
                        <span className="font-medium">$45,230</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Azure:</span>
                        <span className="font-medium">$28,650</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>GCP:</span>
                        <span className="font-medium">$12,340</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>On-Premises:</span>
                        <span className="font-medium">$15,780</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Cost Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div>• Reserved instances: 35% savings</div>
                      <div>• Spot instances for dev: 60% savings</div>
                      <div>• Data transfer optimization</div>
                      <div>• Automated resource scaling</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};