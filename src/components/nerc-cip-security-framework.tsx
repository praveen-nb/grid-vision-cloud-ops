import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  Network, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Key,
  Monitor,
  FileText,
  Settings
} from 'lucide-react';

const ComplianceStandard = ({ standard, title, description, compliance, controls }) => (
  <Card className="border-l-4 border-l-utility-success">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-utility-success" />
          <div>
            <CardTitle className="text-lg">{standard}: {title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
        <Badge variant={compliance >= 90 ? "default" : "destructive"}>
          {compliance}% Compliant
        </Badge>
      </div>
      <Progress value={compliance} className="h-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      {controls.map((control, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/10">
          <div className="flex items-center gap-2">
            <control.icon className={`h-4 w-4 ${control.status === 'compliant' ? 'text-utility-success' : 'text-utility-warning'}`} />
            <span className="text-sm font-medium">{control.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{control.awsService}</span>
            <Badge variant={control.status === 'compliant' ? "default" : "secondary"} className="text-xs">
              {control.status}
            </Badge>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const ZeroTrustComponent = ({ component, description, implementation, status }) => (
  <Card className="bg-gradient-subtle">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{component}</h4>
        <Badge variant={status === 'implemented' ? "default" : "secondary"}>
          {status}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="space-y-1">
        {implementation.map((impl, index) => (
          <div key={index} className="text-xs bg-background/50 p-2 rounded">
            <strong>{impl.service}:</strong> {impl.detail}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function NercCipSecurityFramework() {
  const [selectedTab, setSelectedTab] = useState("cip-005");

  const complianceStandards = {
    "cip-005": {
      title: "Electronic Security Perimeters",
      description: "Cyber security controls for electronic access points to the BES Cyber System network",
      compliance: 94,
      controls: [
        { 
          name: "ESP Identification & Documentation", 
          icon: Network, 
          status: "compliant",
          awsService: "VPC, Security Groups"
        },
        { 
          name: "Electronic Access Control", 
          icon: Lock, 
          status: "compliant",
          awsService: "WAF, NACLs"
        },
        { 
          name: "Monitoring Electronic Access", 
          icon: Eye, 
          status: "compliant",
          awsService: "GuardDuty, CloudTrail"
        },
        { 
          name: "Remote Access Management", 
          icon: Key, 
          status: "in-progress",
          awsService: "SSM Session Manager"
        }
      ]
    },
    "cip-007": {
      title: "Systems Security Management",
      description: "Cyber security controls for BES Cyber Systems",
      compliance: 87,
      controls: [
        { 
          name: "Ports & Services Management", 
          icon: Server, 
          status: "compliant",
          awsService: "Security Groups, Systems Manager"
        },
        { 
          name: "Patch Management", 
          icon: Settings, 
          status: "compliant",
          awsService: "Patch Manager, Inspector"
        },
        { 
          name: "Malware Prevention", 
          icon: Shield, 
          status: "compliant",
          awsService: "GuardDuty Malware Protection"
        },
        { 
          name: "Security Event Monitoring", 
          icon: Monitor, 
          status: "in-progress",
          awsService: "Security Hub, CloudWatch"
        }
      ]
    },
    "cip-009": {
      title: "Recovery Plans for BES Cyber Systems",
      description: "Recovery plans for the continuation of BES Cyber System functionality",
      compliance: 78,
      controls: [
        { 
          name: "Recovery Plan Documentation", 
          icon: FileText, 
          status: "compliant",
          awsService: "S3, Document DB"
        },
        { 
          name: "Backup & Restore Procedures", 
          icon: Database, 
          status: "in-progress",
          awsService: "EBS Snapshots, RDS Backups"
        },
        { 
          name: "Testing Recovery Plans", 
          icon: CheckCircle, 
          status: "in-progress",
          awsService: "Fault Injection Simulator"
        },
        { 
          name: "Recovery Plan Updates", 
          icon: Clock, 
          status: "compliant",
          awsService: "Systems Manager Documents"
        }
      ]
    }
  };

  const zeroTrustComponents = [
    {
      component: "Identity Verification",
      description: "Verify every user and device before granting access",
      status: "implemented",
      implementation: [
        { service: "AWS IAM Identity Center", detail: "Centralized identity management with MFA enforcement" },
        { service: "AWS Cognito", detail: "User authentication with adaptive authentication" },
        { service: "Certificate Manager", detail: "Mutual TLS authentication for services" }
      ]
    },
    {
      component: "Device Security",
      description: "Ensure all devices meet security requirements",
      status: "implemented",
      implementation: [
        { service: "AWS IoT Device Defender", detail: "Continuous device security monitoring" },
        { service: "Systems Manager", detail: "Device compliance and patch management" },
        { service: "GuardDuty", detail: "Threat detection for compromised devices" }
      ]
    },
    {
      component: "Network Segmentation",
      description: "Micro-segmentation to limit lateral movement",
      status: "implemented",
      implementation: [
        { service: "VPC Security Groups", detail: "Application-level network controls" },
        { service: "AWS Network Firewall", detail: "Stateful network filtering" },
        { service: "PrivateLink", detail: "Private connectivity without internet exposure" }
      ]
    },
    {
      component: "Application Security",
      description: "Secure applications and APIs",
      status: "partial",
      implementation: [
        { service: "AWS WAF", detail: "Web application firewall with OWASP rules" },
        { service: "API Gateway", detail: "API throttling and authorization" },
        { service: "CloudFront", detail: "DDoS protection and secure content delivery" }
      ]
    },
    {
      component: "Data Protection",
      description: "Encrypt and protect data at rest and in transit",
      status: "implemented",
      implementation: [
        { service: "AWS KMS", detail: "Customer-managed encryption keys" },
        { service: "S3 Encryption", detail: "Server-side encryption with S3-KMS" },
        { service: "RDS Encryption", detail: "Database encryption at rest and in transit" }
      ]
    },
    {
      component: "Analytics & Visibility",
      description: "Monitor and analyze all network traffic",
      status: "implemented",
      implementation: [
        { service: "VPC Flow Logs", detail: "Network traffic analysis and monitoring" },
        { service: "CloudTrail", detail: "API call logging and governance" },
        { service: "Security Hub", detail: "Centralized security findings management" }
      ]
    }
  ];

  const automationRules = [
    {
      rule: "CIP-005 Perimeter Monitoring",
      trigger: "Unauthorized network access attempt",
      response: "Automatic IP blocking via WAF + SNS alert to SOC",
      service: "EventBridge + Lambda + WAF"
    },
    {
      rule: "CIP-007 Patch Compliance",
      trigger: "Critical vulnerability detected",
      response: "Auto-patch non-production, alert for production systems",
      service: "Inspector + Patch Manager + SNS"
    },
    {
      rule: "CIP-009 Backup Validation",
      trigger: "Daily backup completion",
      response: "Automated backup integrity check + compliance reporting",
      service: "Lambda + RDS + S3 + Config"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            NERC-CIP Compliance Framework
          </h2>
          <p className="text-muted-foreground">
            Comprehensive security controls mapping AWS services to NERC-CIP standards
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-utility-success">
            86% Overall Compliance
          </Badge>
          <Button variant="outline" size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cip-005">CIP-005</TabsTrigger>
          <TabsTrigger value="cip-007">CIP-007</TabsTrigger>
          <TabsTrigger value="cip-009">CIP-009</TabsTrigger>
          <TabsTrigger value="zero-trust">Zero Trust</TabsTrigger>
        </TabsList>

        <TabsContent value="cip-005" className="space-y-4">
          <ComplianceStandard 
            standard="CIP-005"
            {...complianceStandards["cip-005"]}
          />
        </TabsContent>

        <TabsContent value="cip-007" className="space-y-4">
          <ComplianceStandard 
            standard="CIP-007"
            {...complianceStandards["cip-007"]}
          />
        </TabsContent>

        <TabsContent value="cip-009" className="space-y-4">
          <ComplianceStandard 
            standard="CIP-009"
            {...complianceStandards["cip-009"]}
          />
        </TabsContent>

        <TabsContent value="zero-trust" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Zero Trust Architecture Implementation
              </CardTitle>
              <CardDescription>
                Never trust, always verify - implementing Zero Trust principles across AWS infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zeroTrustComponents.map((component, index) => (
                  <ZeroTrustComponent key={index} {...component} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Continuous Compliance Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-utility-blue" />
            Continuous Compliance Automation
          </CardTitle>
          <CardDescription>
            Real-time compliance monitoring and automated remediation workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-subtle">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{rule.rule}</h4>
                  <Badge variant="outline" className="text-xs">{rule.service}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-utility-warning">Trigger:</strong>
                    <p className="text-muted-foreground">{rule.trigger}</p>
                  </div>
                  <div>
                    <strong className="text-utility-success">Response:</strong>
                    <p className="text-muted-foreground">{rule.response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Action Required:</strong> CIP-007 Security Event Monitoring requires immediate attention. 
          Configure CloudWatch custom metrics for real-time BES Cyber System monitoring.
        </AlertDescription>
      </Alert>
    </div>
  );
}