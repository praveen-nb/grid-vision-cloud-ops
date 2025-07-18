import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AwsArchitectureDiagram } from "@/components/aws-architecture-diagram"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, Database, Shield, Cpu, Network, Zap } from 'lucide-react'

const architectureComponents = [
  {
    category: "Data Ingestion",
    icon: Network,
    services: [
      { name: "AWS IoT Core", description: "Secure device connectivity and data ingestion", status: "Active" },
      { name: "Amazon Kinesis", description: "Real-time data streaming and processing", status: "Active" },
      { name: "AWS Lambda", description: "Serverless data transformation", status: "Active" }
    ]
  },
  {
    category: "Computing & Storage",
    icon: Cpu,
    services: [
      { name: "Amazon EC2", description: "Scalable virtual servers for GIS applications", status: "Active" },
      { name: "Amazon RDS", description: "Managed PostgreSQL with PostGIS", status: "Active" },
      { name: "Amazon S3", description: "Object storage for backups and archives", status: "Active" }
    ]
  },
  {
    category: "Analytics & ML",
    icon: Zap,
    services: [
      { name: "Amazon SageMaker", description: "Machine learning for predictive analytics", status: "Active" },
      { name: "Amazon Redshift", description: "Data warehouse for analytics", status: "Active" },
      { name: "AWS Glue", description: "ETL service for data preparation", status: "Active" }
    ]
  },
  {
    category: "Security & Compliance",
    icon: Shield,
    services: [
      { name: "AWS IAM", description: "Identity and access management", status: "Active" },
      { name: "AWS Security Hub", description: "Centralized security findings", status: "Active" },
      { name: "AWS Shield", description: "DDoS protection", status: "Active" }
    ]
  }
]

const networkTopology = [
  { component: "Field Devices", connections: ["Smart Meters", "RTAC Units", "Protective Relays"] },
  { component: "Communication Layer", connections: ["Cellular", "Fiber Optic", "Microwave"] },
  { component: "Data Aggregation", connections: ["AWS IoT Core", "VPN Gateway", "Direct Connect"] },
  { component: "Processing Layer", connections: ["Kinesis Streams", "Lambda Functions", "EC2 Instances"] },
  { component: "Storage Layer", connections: ["RDS PostgreSQL", "S3 Buckets", "Redshift Warehouse"] },
  { component: "Application Layer", connections: ["GIS Portal", "SCADA HMI", "OMS Interface"] }
]

export default function Architecture() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AWS-Based GIS Architecture</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive cloud infrastructure designed for electrical utility grid operations,
          featuring real-time data processing, predictive analytics, and enterprise security.
        </p>
      </div>

      {/* Architecture Diagram */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            System Architecture Overview
          </CardTitle>
          <CardDescription>
            Interactive diagram showing the complete AWS infrastructure and data flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AwsArchitectureDiagram />
        </CardContent>
      </Card>

      {/* Detailed Components */}
      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="components">AWS Components</TabsTrigger>
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
          <TabsTrigger value="integration">System Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="grid gap-6">
            {architectureComponents.map((category, categoryIndex) => {
              const IconComponent = category.icon
              return (
                <Card key={categoryIndex} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge className="bg-utility-success/10 text-utility-success">
                              {service.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="topology">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-6 w-6 text-primary" />
                Network Topology for RTAC, Relay, and GIS Systems
              </CardTitle>
              <CardDescription>
                End-to-end network architecture from field devices to cloud applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {networkTopology.map((layer, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-gradient-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{layer.component}</h3>
                      <Badge variant="outline">{layer.connections.length} Components</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {layer.connections.map((connection, connIndex) => (
                        <div key={connIndex} className="p-3 bg-background rounded border text-sm text-center">
                          {connection}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>SCADA Integration</CardTitle>
                <CardDescription>Real-time operational data integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-success rounded-full"></div>
                    <span className="text-sm">Real-time telemetry data streaming</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-success rounded-full"></div>
                    <span className="text-sm">Alarm and event synchronization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-success rounded-full"></div>
                    <span className="text-sm">Historical data archival</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-success rounded-full"></div>
                    <span className="text-sm">Control command execution</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>OMS Integration</CardTitle>
                <CardDescription>Outage management system connectivity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-teal rounded-full"></div>
                    <span className="text-sm">Outage detection and reporting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-teal rounded-full"></div>
                    <span className="text-sm">Crew dispatch optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-teal rounded-full"></div>
                    <span className="text-sm">Customer notification automation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-utility-teal rounded-full"></div>
                    <span className="text-sm">Restoration progress tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Flow Architecture
                </CardTitle>
                <CardDescription>
                  How data flows through the system from field devices to applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl">📡</div>
                    <div>
                      <h4 className="font-medium">Field Data Collection</h4>
                      <p className="text-sm text-muted-foreground">Smart meters, RTACs, and protective relays collect operational data</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <h4 className="font-medium">Real-Time Processing</h4>
                      <p className="text-sm text-muted-foreground">AWS IoT Core and Kinesis process streaming data in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl">🧠</div>
                    <div>
                      <h4 className="font-medium">AI Analytics</h4>
                      <p className="text-sm text-muted-foreground">SageMaker models analyze patterns and predict equipment failures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="font-medium">Visualization & Actions</h4>
                      <p className="text-sm text-muted-foreground">GIS portal and dashboards provide insights and enable operational decisions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}