import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Clock, 
  Server, 
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  RotateCcw,
  Eye,
  Settings,
  Cloud,
  MapPin
} from 'lucide-react';

const DrComponent = ({ component, rto, rpo, status, lastTested }) => (
  <Card className={`border-l-4 ${status === 'compliant' ? 'border-l-utility-success' : 'border-l-utility-warning'}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">{component}</CardTitle>
          <CardDescription className="text-sm">Last tested: {lastTested}</CardDescription>
        </div>
        <Badge variant={status === 'compliant' ? "default" : "secondary"}>
          {status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-2 bg-accent/10 rounded">
          <div className="text-lg font-bold text-primary">{rto}</div>
          <div className="text-xs text-muted-foreground">RTO Target</div>
        </div>
        <div className="text-center p-2 bg-accent/10 rounded">
          <div className="text-lg font-bold text-utility-blue">{rpo}</div>
          <div className="text-xs text-muted-foreground">RPO Target</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function DisasterRecoveryFramework() {
  const [selectedTab, setSelectedTab] = useState("rto-rpo");

  const drComponents = [
    {
      component: "Critical SCADA Systems",
      rto: "< 15min",
      rpo: "< 1min",
      status: "compliant",
      lastTested: "2024-01-15"
    },
    {
      component: "GIS Applications (ArcGIS)",
      rto: "< 4hrs",
      rpo: "< 1hr",
      status: "compliant", 
      lastTested: "2024-01-10"
    },
    {
      component: "Real-time Analytics",
      rto: "< 30min",
      rpo: "< 5min",
      status: "needs-testing",
      lastTested: "2023-12-20"
    },
    {
      component: "Customer Portal",
      rto: "< 8hrs",
      rpo: "< 4hrs",
      status: "compliant",
      lastTested: "2024-01-08"
    }
  ];

  const multiCloudStrategy = [
    {
      provider: "AWS Primary",
      region: "us-east-1",
      services: ["EC2", "RDS", "S3", "Lambda"],
      role: "Primary Production",
      uptime: "99.99%"
    },
    {
      provider: "AWS Secondary", 
      region: "us-west-2",
      services: ["EC2", "RDS", "S3"],
      role: "Disaster Recovery",
      uptime: "99.95%"
    },
    {
      provider: "Azure Backup",
      region: "Central US",
      services: ["Blob Storage", "VMs"],
      role: "Cross-Cloud Backup",
      uptime: "99.9%"
    },
    {
      provider: "On-Premise Edge",
      region: "Local DCs",
      services: ["Kubernetes", "Local Storage"],
      role: "Critical Failover",
      uptime: "99.5%"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Disaster Recovery & Multi-Cloud Framework
          </h2>
          <p className="text-muted-foreground">
            NERC CIP-009 compliant DR strategy with multi-cloud resilience
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-utility-success">
            98.5% DR Test Success
          </Badge>
          <Button variant="outline" size="sm">
            Execute DR Test
          </Button>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>CIP-009 Compliance:</strong> Recovery plans tested quarterly with documented RTO/RPO targets.
          Next scheduled test: February 15, 2024.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rto-rpo">RTO/RPO Targets</TabsTrigger>
          <TabsTrigger value="multi-cloud">Multi-Cloud Strategy</TabsTrigger>
          <TabsTrigger value="testing">DR Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="rto-rpo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {drComponents.map((component, index) => (
              <DrComponent key={index} {...component} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="multi-cloud" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {multiCloudStrategy.map((provider, index) => (
              <Card key={index} className="border-l-4 border-l-utility-blue">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{provider.provider}</CardTitle>
                      <CardDescription>{provider.region}</CardDescription>
                    </div>
                    <Badge variant="outline">{provider.uptime}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2 bg-accent/10 rounded">
                    <div className="text-sm font-medium text-utility-blue">Role: {provider.role}</div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                Automated DR Testing with AWS Fault Injection Simulator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-accent/10 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 text-utility-success mx-auto mb-2" />
                  <div className="text-lg font-bold">156</div>
                  <div className="text-xs text-muted-foreground">Tests Completed</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg text-center">
                  <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold">98.5%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg text-center">
                  <Clock className="h-6 w-6 text-utility-warning mx-auto mb-2" />
                  <div className="text-lg font-bold">12.3min</div>
                  <div className="text-xs text-muted-foreground">Avg Recovery Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}