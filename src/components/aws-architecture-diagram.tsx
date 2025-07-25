import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Database, 
  Shield, 
  Zap, 
  Brain, 
  Monitor,
  MapPin,
  Wifi,
  Server,
  BarChart3,
  Lock,
  AlertTriangle,
  Activity,
  ArrowDown
} from 'lucide-react';

const ArchitectureLayer = ({ title, items, color, icon: Icon }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, index) => (
        <Card key={index} className={`border-l-4 border-l-${color.replace('text-', '')} bg-gradient-subtle hover:shadow-md transition-shadow`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${color}`} />
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.service}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const FlowArrow = () => (
  <div className="flex justify-center my-4">
    <ArrowDown className="h-6 w-6 text-muted-foreground animate-pulse" />
  </div>
);

export function AwsArchitectureDiagram() {
  const inputLayer = [
    { name: "Smart Meters / IoT Sensors", service: "Real-time Data Collection", icon: Zap },
    { name: "SCADA Systems", service: "Control & Monitoring", icon: Monitor },
    { name: "OMS Logs", service: "Outage Management", icon: AlertTriangle },
    { name: "GIS Spatial Assets", service: "Geographic Infrastructure", icon: MapPin }
  ];

  const dataIngestionLayer = [
    { name: "AWS IoT Core", service: "Device Management & Connectivity", icon: Wifi },
    { name: "AWS GreenGrass", service: "Edge Computing & Local Processing", icon: Server },
    { name: "AWS Direct Connect", service: "Legacy SCADA Integration", icon: Activity }
  ];

  const processingLayer = [
    { name: "Amazon Kinesis", service: "Real-time Data Streaming", icon: BarChart3 },
    { name: "Amazon RDS/PostGIS", service: "Geospatial Database", icon: Database },
    { name: "Amazon S3", service: "Archival & Backup Storage", icon: Cloud }
  ];

  const aiAnalyticsLayer = [
    { name: "Amazon SageMaker", service: "Machine Learning Platform", icon: Brain },
    { name: "Anomaly Detection/Outage", service: "Real-time Monitoring", icon: AlertTriangle },
    { name: "Predictive Maintenance Engine", service: "Asset Optimization", icon: Activity }
  ];

  const visualizationLayer = [
    { name: "ArcGIS / ArcFM UI", service: "Geographic Information System", icon: MapPin },
    { name: "SCADA Dashboard", service: "Control Room Interface", icon: Monitor },
    { name: "Outage Management Interface", service: "Emergency Response", icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center gap-2 justify-center">
            <Cloud className="h-6 w-6 text-primary" />
            AWS-Based GIS Infrastructure Methodology Workflow
          </CardTitle>
          <CardDescription className="max-w-4xl mx-auto">
            Comprehensive cloud-native architecture for electrical utility grid operations, 
            ensuring NERC-CIP compliance with real-time analytics and predictive maintenance capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Input Layer */}
          <ArchitectureLayer
            title="Input Layer"
            items={inputLayer}
            color="text-utility-warning"
            icon={Zap}
          />

          <FlowArrow />

          {/* Data Ingestion Layer */}
          <ArchitectureLayer
            title="Data Ingestion Layer"
            items={dataIngestionLayer}
            color="text-utility-blue"
            icon={Wifi}
          />

          <FlowArrow />

          {/* Processing & Storage Layer */}
          <ArchitectureLayer
            title="Processing & Storage Layer"
            items={processingLayer}
            color="text-utility-teal"
            icon={Database}
          />

          {/* Utility Operators Branch */}
          <div className="flex justify-center items-center space-x-8 my-6">
            <div className="flex flex-col items-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground mb-2" />
              <Card className="bg-accent/10 border-accent">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Utility Operators</span>
                  </div>
                </CardContent>
              </Card>
              <ArrowDown className="h-6 w-6 text-muted-foreground mt-2" />
            </div>
          </div>

          {/* AI Analytics Layer */}
          <ArchitectureLayer
            title="AI Analytics Layer"
            items={aiAnalyticsLayer}
            color="text-primary"
            icon={Brain}
          />

          <FlowArrow />

          {/* Visualization and Control Layer */}
          <ArchitectureLayer
            title="Visualization and Control Layer"
            items={visualizationLayer}
            color="text-accent"
            icon={Monitor}
          />

        </CardContent>
      </Card>

      {/* Key Benefits & Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-utility-success bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-utility-success" />
              <h4 className="font-semibold">NERC-CIP & FERC Compliance</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive security controls through AWS IAM, Shield, and Security Hub ensuring regulatory compliance
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">AI-Powered Grid Analytics</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Machine learning-driven predictive maintenance and real-time anomaly detection for optimal grid performance
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-blue bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-5 w-5 text-utility-blue" />
              <h4 className="font-semibold">High Availability & DR</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Multi-region AWS deployment with automated backups, failover mechanisms, and 99.99% uptime guarantee
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specifications */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Technical Implementation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Cloud className="h-4 w-4 text-utility-blue" />
                Cloud Infrastructure
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Amazon EC2 for GIS applications (ArcGIS, ArcFM)</li>
                <li>• Amazon RDS (SQL Server/PostgreSQL)</li>
                <li>• Multi-AZ deployment for high availability</li>
                <li>• Auto-scaling based on demand</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-utility-teal" />
                Real-time Processing
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AWS IoT Core for device management</li>
                <li>• Kinesis for streaming analytics</li>
                <li>• Lambda for serverless processing</li>
                <li>• SageMaker for ML inference</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-utility-success" />
                Security & Compliance
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AWS Security Hub compliance monitoring</li>
                <li>• IAM role-based access control</li>
                <li>• VPC isolation and encryption</li>
                <li>• DDoS protection with AWS Shield</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}