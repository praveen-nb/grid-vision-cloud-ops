import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cpu, 
  Zap, 
  Network, 
  Clock, 
  Server, 
  Monitor,
  AlertTriangle,
  CheckCircle,
  Activity,
  MapPin,
  Wifi,
  HardDrive,
  BarChart3,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EdgeLocation = ({ location, latency, capacity, status, workloads }) => (
  <Card className={`border-l-4 ${status === 'operational' ? 'border-l-utility-success' : 'border-l-utility-warning'}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">{location}</CardTitle>
            <CardDescription className="text-sm">{capacity} processing units</CardDescription>
          </div>
        </div>
        <div className="text-right">
          <Badge variant={status === 'operational' ? "default" : "secondary"}>
            {status}
          </Badge>
          <div className="text-sm text-muted-foreground mt-1">
            {latency}ms avg latency
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Active Workloads:</h4>
        {workloads.map((workload, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/10">
            <div className="flex items-center gap-2">
              <workload.icon className={`h-4 w-4 ${workload.critical ? 'text-utility-warning' : 'text-utility-success'}`} />
              <span className="text-sm font-medium">{workload.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{workload.latency}ms</span>
              <Badge variant={workload.critical ? "destructive" : "default"} className="text-xs">
                {workload.critical ? 'Critical' : 'Normal'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const LatencyChart = ({ data, title }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}ms`, '']} />
          <Line 
            type="monotone" 
            dataKey="latency" 
            stroke="#059669" 
            strokeWidth={2}
            dot={{ fill: '#059669', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export function EdgeComputingIntegration() {
  const [selectedTab, setSelectedTab] = useState("locations");

  const edgeLocations = [
    {
      location: "Substation Alpha - Downtown",
      latency: 2.3,
      capacity: "16 Edge Computing Units",
      status: "operational",
      workloads: [
        { name: "SCADA Real-time Processing", icon: Monitor, latency: 1.8, critical: true },
        { name: "Protective Relay Coordination", icon: Zap, latency: 2.1, critical: true },
        { name: "Local GIS Data Caching", icon: MapPin, latency: 4.2, critical: false },
        { name: "Predictive Maintenance", icon: Settings, latency: 5.8, critical: false }
      ]
    },
    {
      location: "Transmission Hub - North",
      latency: 1.9,
      capacity: "24 Edge Computing Units",
      status: "operational", 
      workloads: [
        { name: "Load Balancing Control", icon: Activity, latency: 1.5, critical: true },
        { name: "Fault Detection & Isolation", icon: AlertTriangle, latency: 2.2, critical: true },
        { name: "Weather Station Integration", icon: BarChart3, latency: 8.5, critical: false }
      ]
    },
    {
      location: "Distribution Center - West",
      latency: 3.1,
      capacity: "12 Edge Computing Units",
      status: "maintenance",
      workloads: [
        { name: "Smart Meter Aggregation", icon: Wifi, latency: 2.8, critical: false },
        { name: "Outage Detection", icon: AlertTriangle, latency: 3.4, critical: true },
        { name: "Voltage Regulation", icon: Zap, latency: 2.9, critical: true }
      ]
    }
  ];

  const latencyData = [
    { time: '00:00', edge: 2.1, cloud: 45.2, hybrid: 8.3 },
    { time: '04:00', edge: 1.9, cloud: 42.8, hybrid: 7.9 },
    { time: '08:00', edge: 2.3, cloud: 48.1, hybrid: 9.1 },
    { time: '12:00', edge: 2.7, cloud: 52.3, hybrid: 10.2 },
    { time: '16:00', edge: 2.4, cloud: 49.7, hybrid: 9.6 },
    { time: '20:00', edge: 2.2, cloud: 46.5, hybrid: 8.8 },
    { time: '24:00', edge: 2.0, cloud: 44.1, hybrid: 8.2 }
  ];

  const awsEdgeServices = [
    {
      service: "AWS IoT Greengrass",
      description: "Local compute, messaging, and ML inference at the edge",
      deployment: "All Substations",
      features: [
        "Local Lambda execution",
        "ML model inference",
        "Device shadow sync",
        "Secure connectivity"
      ],
      latency: "< 5ms",
      availability: "99.9%"
    },
    {
      service: "AWS Wavelength",
      description: "Ultra-low latency compute for 5G applications",
      deployment: "Critical Control Centers",
      features: [
        "5G edge locations",
        "Sub-10ms latency",
        "EC2 instances at edge",
        "Direct carrier integration"
      ],
      latency: "< 10ms",
      availability: "99.95%"
    },
    {
      service: "AWS Snow Family",
      description: "Edge computing and data transfer in disconnected environments",
      deployment: "Remote Locations",
      features: [
        "Local compute capacity",
        "Rugged hardware design",
        "Data migration support",
        "Offline operation"
      ],
      latency: "< 1ms",
      availability: "99.5%"
    },
    {
      service: "AWS Outposts",
      description: "Fully managed AWS infrastructure on-premises",
      deployment: "Primary Control Centers",
      features: [
        "Native AWS services",
        "Hybrid connectivity",
        "Local data residency",
        "Consistent APIs"
      ],
      latency: "< 2ms",
      availability: "99.99%"
    }
  ];

  const hybridWorkflows = [
    {
      workflow: "Real-time Grid Protection",
      edgeProcessing: "Instantaneous fault detection and isolation",
      cloudProcessing: "Historical analysis and predictive modeling",
      coordination: "Event correlation and system-wide optimization",
      sla: "< 4ms end-to-end"
    },
    {
      workflow: "Predictive Maintenance",
      edgeProcessing: "Sensor data aggregation and anomaly detection",
      cloudProcessing: "ML model training and optimization",
      coordination: "Model deployment and feedback loop",
      sla: "< 100ms analysis"
    },
    {
      workflow: "Load Forecasting",
      edgeProcessing: "Real-time load measurement and local adjustments",
      cloudProcessing: "Regional demand prediction and optimization",
      coordination: "Distributed load balancing coordination",
      sla: "< 50ms updates"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            Edge Computing Integration
          </h2>
          <p className="text-muted-foreground">
            Hybrid edge-cloud architecture for ultra-low latency grid operations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-utility-success">
            2.1ms Avg Edge Latency
          </Badge>
          <Button variant="outline" size="sm">
            Deploy Edge Services
          </Button>
        </div>
      </div>

      {/* Critical Latency Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Sub-10ms Requirement:</strong> SCADA and protective relay systems require sub-10ms response times.
          Current edge deployment achieves 2.1ms average latency across all critical control points.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="locations">Edge Locations</TabsTrigger>
          <TabsTrigger value="services">AWS Edge Services</TabsTrigger>
          <TabsTrigger value="latency">Latency Analysis</TabsTrigger>
          <TabsTrigger value="workflows">Hybrid Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {edgeLocations.map((location, index) => (
              <EdgeLocation key={index} {...location} />
            ))}
          </div>
          
          {/* Edge Infrastructure Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Edge Infrastructure Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-utility-success">52</div>
                  <div className="text-sm text-muted-foreground">Total Edge Units</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">2.1ms</div>
                  <div className="text-sm text-muted-foreground">Avg Latency</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-utility-success">99.7%</div>
                  <div className="text-sm text-muted-foreground">Availability</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-utility-warning">13</div>
                  <div className="text-sm text-muted-foreground">Critical Workloads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {awsEdgeServices.map((service, index) => (
              <Card key={index} className="border-l-4 border-l-utility-blue">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.service}</CardTitle>
                      <CardDescription className="text-sm">{service.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{service.latency}</Badge>
                      <div className="text-xs text-muted-foreground">{service.availability} uptime</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2 bg-accent/10 rounded">
                    <div className="text-sm font-medium text-utility-blue">Deployment: {service.deployment}</div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-utility-success" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="latency" className="space-y-6">
          {/* Latency Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Latency Comparison: Edge vs Cloud vs Hybrid
              </CardTitle>
              <CardDescription>
                Response times throughout the day for different processing approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}ms`, '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="edge" 
                    stroke="#059669" 
                    strokeWidth={2}
                    name="Edge Processing"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cloud" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Cloud Only"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hybrid" 
                    stroke="#0891b2" 
                    strokeWidth={2}
                    name="Hybrid Model"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Latency SLA Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-card">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-utility-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-utility-warning">&lt; 4ms</div>
                <div className="text-xs text-muted-foreground">Critical Control SLA</div>
                <Progress value={95} className="h-2 mt-2" />
                <div className="text-xs text-utility-success mt-1">95% Compliance</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card">
              <CardContent className="p-4 text-center">
                <Monitor className="h-8 w-8 text-utility-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-utility-blue">&lt; 10ms</div>
                <div className="text-xs text-muted-foreground">SCADA Operations SLA</div>
                <Progress value={98} className="h-2 mt-2" />
                <div className="text-xs text-utility-success mt-1">98% Compliance</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-utility-teal mx-auto mb-2" />
                <div className="text-2xl font-bold text-utility-teal">&lt; 50ms</div>
                <div className="text-xs text-muted-foreground">Analytics SLA</div>
                <Progress value={99} className="h-2 mt-2" />
                <div className="text-xs text-utility-success mt-1">99% Compliance</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Hybrid Edge-Cloud Coordination Workflows
              </CardTitle>
              <CardDescription>
                Optimized processing distribution between edge and cloud infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {hybridWorkflows.map((workflow, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-subtle">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{workflow.workflow}</h4>
                      <Badge variant="outline" className="bg-utility-success/10 text-utility-success border-utility-success">
                        {workflow.sla}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-background/50 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="h-4 w-4 text-utility-success" />
                          <strong className="text-sm">Edge Processing</strong>
                        </div>
                        <p className="text-xs text-muted-foreground">{workflow.edgeProcessing}</p>
                      </div>
                      <div className="p-3 bg-background/50 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="h-4 w-4 text-utility-blue" />
                          <strong className="text-sm">Cloud Processing</strong>
                        </div>
                        <p className="text-xs text-muted-foreground">{workflow.cloudProcessing}</p>
                      </div>
                      <div className="p-3 bg-background/50 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Network className="h-4 w-4 text-primary" />
                          <strong className="text-sm">Coordination</strong>
                        </div>
                        <p className="text-xs text-muted-foreground">{workflow.coordination}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}