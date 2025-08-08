import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Network, 
  Shield, 
  Server, 
  Database, 
  Cloud, 
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Lock,
  Globe,
  Zap,
  Brain,
  GitBranch,
  Users,
  FileCode,
  Monitor
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Enhanced architecture metrics
const networkLatencyData = [
  { time: '00:00', iot_ingestion: 7, kinesis_processing: 35, lambda_execution: 78, end_to_end: 387 },
  { time: '04:00', iot_ingestion: 6, kinesis_processing: 32, lambda_execution: 65, end_to_end: 298 },
  { time: '08:00', iot_ingestion: 9, kinesis_processing: 45, lambda_execution: 89, end_to_end: 456 },
  { time: '12:00', iot_ingestion: 8, kinesis_processing: 38, lambda_execution: 72, end_to_end: 367 },
  { time: '16:00', iot_ingestion: 7, kinesis_processing: 33, lambda_execution: 68, end_to_end: 334 },
  { time: '20:00', iot_ingestion: 6, kinesis_processing: 30, lambda_execution: 61, end_to_end: 289 }
];

const throughputMetrics = [
  { component: 'IoT Core', current: 28500, target: 30000, utilization: 95 },
  { component: 'Kinesis Streams', current: 87000, target: 100000, utilization: 87 },
  { component: 'Lambda Functions', current: 42000, target: 50000, utilization: 84 },
  { component: 'DynamoDB Writes', current: 35000, target: 40000, utilization: 88 },
  { component: 'SageMaker Inference', current: 920, target: 1000, utilization: 92 }
];

const securityZones = [
  { name: 'DMZ Zone', status: 'Secure', threats: 0, connections: 3, compliance: 100 },
  { name: 'Application Zone', status: 'Secure', threats: 0, connections: 12, compliance: 98 },
  { name: 'Data Zone', status: 'Secure', threats: 0, connections: 6, compliance: 100 },
  { name: 'Management Zone', status: 'Secure', threats: 0, connections: 4, compliance: 97 }
];

const costBreakdown = [
  { service: 'EC2 Instances', monthly: 2800, category: 'Compute', percentage: 28 },
  { service: 'RDS Database', monthly: 1200, category: 'Database', percentage: 12 },
  { service: 'SageMaker', monthly: 1800, category: 'ML/AI', percentage: 18 },
  { service: 'S3 Storage', monthly: 450, category: 'Storage', percentage: 4.5 },
  { service: 'Data Transfer', monthly: 300, category: 'Network', percentage: 3 },
  { service: 'VPC Endpoints', monthly: 200, category: 'Network', percentage: 2 },
  { service: 'CloudWatch', monthly: 150, category: 'Monitoring', percentage: 1.5 },
  { service: 'ArcGIS Licensing', monthly: 3100, category: 'Software', percentage: 31 }
];

const mlopsMetrics = [
  { model: 'Grid Anomaly Detection', version: 'v2.1', accuracy: 94.3, latency: 156, deployments: 4, status: 'Production' },
  { model: 'Predictive Maintenance', version: 'v1.8', accuracy: 88.7, latency: 210, deployments: 2, status: 'Production' },
  { model: 'Load Forecasting', version: 'v3.2', accuracy: 91.2, latency: 89, deployments: 3, status: 'Production' },
  { model: 'Outage Risk Predictor', version: 'v1.5', accuracy: 92.1, latency: 134, deployments: 1, status: 'Staging' }
];

const trainingDataMetrics = [
  { dataset: 'Grid Sensor Data', size: '2.4 TB', records: '45M', quality: 96, freshness: 'Real-time' },
  { dataset: 'SCADA Operations', size: '890 GB', records: '12M', quality: 94, freshness: '5 min' },
  { dataset: 'Weather Data', size: '156 GB', records: '3.2M', quality: 98, freshness: '15 min' },
  { dataset: 'Historical Maintenance', size: '67 GB', records: '890K', quality: 92, freshness: 'Daily' }
];

export const EnhancedArchitectureDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState(true);

  const toggleRealTime = () => {
    setRealTimeData(!realTimeData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Enhanced AWS Architecture Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive view of VPC design, security zones, MLOps pipeline, and cost optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={realTimeData ? "default" : "secondary"} className="px-3 py-1">
            {realTimeData ? "Live" : "Static"} Data
          </Badge>
          <Button onClick={toggleRealTime} variant="outline" size="sm">
            {realTimeData ? <Activity className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            Toggle Feed
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Network className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">387ms</div>
            <p className="text-xs text-muted-foreground">End-to-end sensor to dashboard</p>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-success shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Zones</CardTitle>
            <Shield className="h-4 w-4 text-utility-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/4</div>
            <p className="text-xs text-muted-foreground">All zones secure</p>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-blue shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Models</CardTitle>
            <Brain className="h-4 w-4 text-utility-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Production models active</p>
            <Progress value={92} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-warning shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-utility-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$10,000</div>
            <p className="text-xs text-muted-foreground">15% under budget</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="mlops">MLOps</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="data">Training Data</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Infrastructure Performance
                </CardTitle>
                <CardDescription>Real-time latency and throughput metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={networkLatencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="end_to_end" stroke="hsl(var(--primary))" strokeWidth={2} name="End-to-End (ms)" />
                    <Line type="monotone" dataKey="lambda_execution" stroke="hsl(var(--utility-blue))" strokeWidth={2} name="Lambda (ms)" />
                    <Line type="monotone" dataKey="kinesis_processing" stroke="hsl(var(--utility-teal))" strokeWidth={2} name="Kinesis (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-utility-blue" />
                  Throughput Utilization
                </CardTitle>
                <CardDescription>Current vs. target throughput across components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {throughputMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.component}</span>
                        <span>{metric.current.toLocaleString()} / {metric.target.toLocaleString()}</span>
                      </div>
                      <Progress value={metric.utilization} className="w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  VPC Security Zones
                </CardTitle>
                <CardDescription>Multi-tier network segmentation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityZones.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-utility-success"></div>
                        <div>
                          <div className="font-medium">{zone.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {zone.connections} active connections
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">{zone.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {zone.compliance}% compliant
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-utility-warning" />
                  Latency Benchmarks
                </CardTitle>
                <CardDescription>Component-level performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={networkLatencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="iot_ingestion" fill="hsl(var(--utility-success))" name="IoT Core (ms)" />
                    <Bar dataKey="kinesis_processing" fill="hsl(var(--utility-blue))" name="Kinesis (ms)" />
                    <Bar dataKey="lambda_execution" fill="hsl(var(--utility-warning))" name="Lambda (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Network className="h-4 w-4" />
            <AlertDescription>
              <strong>Network Architecture:</strong> Zero-egress design with VPC endpoints eliminates NAT Gateway costs for AWS services. 
              Direct Connect provides hybrid connectivity to on-premises SCADA systems with 10 Gbps dedicated bandwidth.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-utility-success" />
                  IAM Trust Boundaries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Production Account</span>
                  <Badge variant="default">Secure</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>ML Account</span>
                  <Badge variant="default">Secure</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Partner Access</span>
                  <Badge variant="secondary">Limited</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cross-Account Roles</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-utility-blue" />
                  WAF & GuardDuty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Blocked Requests</span>
                  <span className="font-mono">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Threat Detections</span>
                  <span className="font-mono">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Geographic Blocks</span>
                  <span className="font-mono">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rate Limit Hits</span>
                  <span className="font-mono">156</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-utility-teal" />
                  Direct Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Connection Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bandwidth</span>
                  <span className="font-mono">10 Gbps</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilization</span>
                  <span className="font-mono">34%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>BGP Sessions</span>
                  <span className="font-mono">2/2</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Zero Trust Architecture:</strong> All traffic is verified, encrypted, and monitored. 
              Network segmentation prevents lateral movement. Multi-factor authentication required for all privileged access.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="mlops" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Model Registry & Deployment
                </CardTitle>
                <CardDescription>SageMaker model versions and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mlopsMetrics.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{model.model}</div>
                          <div className="text-sm text-muted-foreground">{model.version}</div>
                        </div>
                        <Badge variant={model.status === 'Production' ? 'default' : 'secondary'}>
                          {model.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Accuracy</div>
                          <div className="font-mono">{model.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Latency</div>
                          <div className="font-mono">{model.latency}ms</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Deployments</div>
                          <div className="font-mono">{model.deployments}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-utility-blue" />
                  Model Flagging System
                </CardTitle>
                <CardDescription>Automated risk assessment and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-utility-success/10 rounded-lg border border-utility-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-utility-success" />
                      <span className="font-medium">Grid Anomaly Detection</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      All metrics within normal parameters
                    </div>
                  </div>
                  
                  <div className="p-3 bg-utility-warning/10 rounded-lg border border-utility-warning/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-utility-warning" />
                      <span className="font-medium">Load Forecasting</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Minor data drift detected - retraining scheduled
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">High Risk Models</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Active Alerts</div>
                      <div className="text-2xl font-bold">1</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-utility-warning" />
                  Monthly Cost Breakdown
                </CardTitle>
                <CardDescription>Detailed infrastructure and licensing costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({service, percentage}) => `${service}: ${percentage}%`}
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--utility-blue))'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-utility-success" />
                  Cost Optimization
                </CardTitle>
                <CardDescription>Savings opportunities and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-utility-success/10 rounded-lg">
                    <div className="font-medium text-utility-success">Reserved Instances</div>
                    <div className="text-sm text-muted-foreground">$1,680/month savings (60% discount)</div>
                  </div>
                  
                  <div className="p-3 bg-utility-blue/10 rounded-lg">
                    <div className="font-medium text-utility-blue">VPC Endpoints</div>
                    <div className="text-sm text-muted-foreground">$200/month savings (NAT Gateway elimination)</div>
                  </div>
                  
                  <div className="p-3 bg-utility-teal/10 rounded-lg">
                    <div className="font-medium text-utility-teal">S3 Intelligent Tiering</div>
                    <div className="text-sm text-muted-foreground">$1,200/month savings (storage optimization)</div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Monthly Savings</span>
                      <span className="text-xl font-bold text-utility-success">$3,080</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>ArcGIS Enterprise Licensing on AWS</CardTitle>
              <CardDescription>Complete licensing breakdown for GIS capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Base Licensing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ArcGIS Enterprise Advanced</span>
                      <span>$12,000/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Named Users (70)</span>
                      <span>$59,000/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Extensions</span>
                      <span>$62,500/year</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">AWS Infrastructure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>EC2 Instances</span>
                      <span>$4,400/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage (EBS + S3)</span>
                      <span>$450/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network & Monitoring</span>
                      <span>$325/month</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Total Annual Cost</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Software Licensing</span>
                        <span>$133,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AWS Infrastructure</span>
                        <span>$62,100</span>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Grand Total</span>
                        <span>$195,600</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Training Data Repository
              </CardTitle>
              <CardDescription>GitHub schemas and data quality metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingDataMetrics.map((dataset, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{dataset.dataset}</div>
                        <div className="text-sm text-muted-foreground">
                          {dataset.size} • {dataset.records} records • {dataset.freshness}
                        </div>
                      </div>
                      <Badge variant={dataset.quality >= 95 ? 'default' : 'secondary'}>
                        {dataset.quality}% Quality
                      </Badge>
                    </div>
                    <Progress value={dataset.quality} className="w-full" />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">GitHub Repository Structure</h4>
                <div className="text-sm font-mono space-y-1">
                  <div>├── training-data/</div>
                  <div>│   ├── grid-anomaly-detection/</div>
                  <div>│   │   ├── schemas/sensor_data_schema.json</div>
                  <div>│   │   └── samples/normal_operation_sample.csv</div>
                  <div>│   ├── predictive-maintenance/</div>
                  <div>│   └── load-forecasting/</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-utility-success" />
                  NERC CIP Compliance
                </CardTitle>
                <CardDescription>Regulatory compliance status across all standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { standard: 'CIP-002', name: 'Asset Categorization', compliance: 100 },
                    { standard: 'CIP-003', name: 'Security Management', compliance: 98 },
                    { standard: 'CIP-005', name: 'Electronic Perimeters', compliance: 100 },
                    { standard: 'CIP-007', name: 'System Security', compliance: 97 },
                    { standard: 'CIP-010', name: 'Change Management', compliance: 99 },
                    { standard: 'CIP-011', name: 'Information Protection', compliance: 100 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.standard}</div>
                        <div className="text-sm text-muted-foreground">{item.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">{item.compliance}%</div>
                        <Progress value={item.compliance} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-utility-blue" />
                  Continuous Monitoring
                </CardTitle>
                <CardDescription>Real-time compliance and security monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-utility-success/10 rounded-lg">
                    <div className="font-medium text-utility-success">AWS Config</div>
                    <div className="text-sm text-muted-foreground">
                      147 rules active • 0 non-compliant resources
                    </div>
                  </div>
                  
                  <div className="p-3 bg-utility-blue/10 rounded-lg">
                    <div className="font-medium text-utility-blue">CloudTrail</div>
                    <div className="text-sm text-muted-foreground">
                      API calls logged • Integrity verified
                    </div>
                  </div>
                  
                  <div className="p-3 bg-utility-teal/10 rounded-lg">
                    <div className="font-medium text-utility-teal">GuardDuty</div>
                    <div className="text-sm text-muted-foreground">
                      Threat detection active • 0 findings
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      All systems are operating within NERC CIP compliance parameters. 
                      Automated monitoring ensures continuous adherence to security standards.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};