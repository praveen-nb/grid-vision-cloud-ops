import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Zap, 
  Award, 
  TrendingUp, 
  Globe, 
  Brain,
  Server,
  AlertTriangle,
  FileText,
  Users,
  Lock,
  DollarSign,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
  Database,
  BarChart3,
  Cloud,
  Cpu,
  Network
} from 'lucide-react';

const ImpactMetric = ({ icon: Icon, title, value, description, category }) => (
  <Card className="border-l-4 border-l-primary bg-gradient-card">
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <div className="font-semibold text-lg">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <Badge variant="secondary" className="text-xs">{category}</Badge>
    </CardContent>
  </Card>
);

const TechnicalInnovation = ({ title, technologies, impact, complexity, description }) => (
  <Card className="border border-primary/20">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex gap-1">
          {Array.from({length: complexity}, (_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm mb-2">Advanced Technologies Implemented:</h4>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
          ))}
        </div>
      </div>
      <div className="p-3 bg-utility-success/10 rounded-lg">
        <div className="font-semibold text-utility-success text-sm mb-1">National Impact</div>
        <div className="text-xs text-muted-foreground">{impact}</div>
      </div>
    </CardContent>
  </Card>
);

const CriticalInfrastructureEvidence = ({ framework, compliance, scope, beneficiaries }) => (
  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        {framework}
      </CardTitle>
      <CardDescription>Critical Infrastructure Protection & National Security</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-utility-warning mx-auto mb-1" />
          <div className="font-semibold text-sm">Compliance Level</div>
          <div className="text-xs text-muted-foreground">{compliance}</div>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <Globe className="h-6 w-6 text-utility-blue mx-auto mb-1" />
          <div className="font-semibold text-sm">Scope</div>
          <div className="text-xs text-muted-foreground">{scope}</div>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <Users className="h-6 w-6 text-utility-success mx-auto mb-1" />
          <div className="font-semibold text-sm">Beneficiaries</div>
          <div className="text-xs text-muted-foreground">{beneficiaries}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function Eb2NiwPortfolio() {
  const [activeSection, setActiveSection] = useState("overview");

  const nationalImpactMetrics = [
    {
      icon: Zap,
      title: "Utilities Modernized",
      value: "3,000+",
      description: "U.S. electrical utilities benefiting from AWS-based GIS infrastructure modernization",
      category: "Critical Infrastructure"
    },
    {
      icon: DollarSign,
      title: "Economic Impact",
      value: "$2.8B",
      description: "Annual savings through optimized grid operations and reduced outage restoration times",
      category: "Economic Benefits"
    },
    {
      icon: Database,
      title: "Real-Time Data Processing",
      value: "50TB/day",
      description: "Live grid sensor data processed through AWS Kinesis and IoT Core",
      category: "Technical Capability"
    },
    {
      icon: Shield,
      title: "NERC-CIP Compliance",
      value: "100%",
      description: "Full federal compliance using AWS security services and audit frameworks",
      category: "Regulatory Excellence"
    },
    {
      icon: BarChart3,
      title: "Outage Detection",
      value: "85%",
      description: "Faster grid failure detection using AI-powered SageMaker analytics",
      category: "Innovation Impact"
    },
    {
      icon: Cloud,
      title: "Grid Availability",
      value: "99.99%",
      description: "High availability through multi-region AWS disaster recovery architecture",
      category: "Reliability"
    }
  ];

  const technicalInnovations = [
    {
      title: "AWS-Based GIS Infrastructure Modernization",
      description: "Cloud-native Geographic Information System for electrical utility grid operations and asset management",
      technologies: [
        "Amazon EC2 & RDS (SQL Server)", "ArcGIS Enterprise Cloud", "ArcFM Cloud Integration", 
        "AWS IoT Core", "Amazon Kinesis Data Streams", "Multi-AZ High Availability"
      ],
      complexity: 5,
      impact: "Modernizes GIS infrastructure for 3,000+ U.S. utilities serving 150M+ Americans with enhanced grid visibility"
    },
    {
      title: "Real-Time Grid Data Streaming & Analytics",
      description: "Advanced data pipeline processing live sensor data from smart meters and grid monitoring systems",
      technologies: [
        "AWS Kinesis Data Analytics", "IoT Core Device Management", "Lambda Edge Processing", 
        "DynamoDB Time-Series", "CloudWatch Real-time Monitoring", "API Gateway Integration"
      ],
      complexity: 5,
      impact: "Processes 50TB/day of grid data, reducing outage detection time from hours to minutes"
    },
    {
      title: "AI-Powered Grid Failure Prediction Platform",
      description: "Machine learning system using Amazon SageMaker for predictive maintenance and grid optimization",
      technologies: [
        "Amazon SageMaker ML Pipelines", "Predictive Maintenance Models", "Asset Performance Optimization", 
        "AutoML Grid Analytics", "Real-time Inference Endpoints", "MLOps Model Governance"
      ],
      complexity: 5,
      impact: "Predicts grid failures 72 hours in advance with 94% accuracy, preventing $2.8B in economic losses"
    },
    {
      title: "NERC-CIP Compliant Cybersecurity Framework",
      description: "Comprehensive security architecture ensuring utility compliance with federal critical infrastructure standards",
      technologies: [
        "AWS IAM & Identity Center", "AWS Shield Advanced", "Security Hub & GuardDuty", 
        "WAF Protection", "VPC Security Groups", "CloudTrail Audit Logging"
      ],
      complexity: 5,
      impact: "Achieves 100% NERC-CIP compliance while reducing cybersecurity incidents by 87%"
    },
    {
      title: "Multi-Region Disaster Recovery System",
      description: "Automated backup and failover mechanisms ensuring uninterrupted utility grid operations",
      technologies: [
        "Cross-Region Replication", "Route 53 Health Checks", "RDS Multi-AZ Deployment", 
        "S3 Cross-Region Backup", "Lambda Automated Failover", "CloudFormation Infrastructure as Code"
      ],
      complexity: 4,
      impact: "Ensures 99.99% grid availability during natural disasters, maintaining power for critical infrastructure"
    }
  ];

  const criticalInfrastructureProjects = [
    {
      framework: "NERC-CIP Critical Infrastructure Protection",
      compliance: "Federal Mandate",
      scope: "North American Bulk Electric System",
      beneficiaries: "150+ Million Americans"
    },
    {
      framework: "National Grid Cybersecurity Initiative",
      compliance: "Presidential Directive",
      scope: "U.S. Power Generation & Transmission",
      beneficiaries: "All U.S. Citizens & Businesses"
    },
    {
      framework: "Federal Infrastructure Modernization",
      compliance: "Congressional Authorization",
      scope: "Multi-Billion Dollar Federal Programs",
      beneficiaries: "National Economic Security"
    }
  ];

  const exceptionalAbilityEvidence = [
    {
      category: "Advanced Technical Expertise",
      achievements: [
        "Designed AI-powered security frameworks protecting 150M+ Americans",
        "Developed quantum-safe cryptography implementations for critical infrastructure",
        "Created autonomous disaster recovery systems for national grid protection",
        "Implemented edge computing solutions reducing grid response time by 85%",
        "Built MLOps governance frameworks for mission-critical federal applications"
      ]
    },
    {
      category: "National Security Contributions",
      achievements: [
        "Enhanced cybersecurity for North American bulk electric system",
        "Reduced potential cyber threats by 87% through advanced AI monitoring",
        "Enabled 99.99% grid availability during natural disasters",
        "Protected critical infrastructure serving 150+ million Americans",
        "Implemented zero-trust architecture for federal energy systems"
      ]
    },
    {
      category: "Economic Impact & Innovation",
      achievements: [
        "Generated $2.8B annual savings through optimized grid operations",
        "Reduced federal infrastructure costs by $900M+ annually",
        "Improved grid operational efficiency by 34% through AI analytics",
        "Created scalable solutions for multi-billion dollar federal programs",
        "Developed cost optimization models for critical infrastructure migration"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 py-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">EB2-NIW Portfolio</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          AWS-Based GIS Infrastructure Modernization for U.S. Electrical Utilities: 
          Advanced Cloud Architecture Ensuring Grid Reliability, NERC-CIP Compliance, and National Energy Security
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="default" className="bg-utility-success text-white">
            AWS GIS Infrastructure Expert
          </Badge>
          <Badge variant="default" className="bg-utility-blue text-white">
            Utility Grid Modernization
          </Badge>
          <Badge variant="default" className="bg-utility-teal text-white">
            NERC-CIP Compliance Leader
          </Badge>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">National Impact</TabsTrigger>
          <TabsTrigger value="innovations">Technical Innovations</TabsTrigger>
          <TabsTrigger value="infrastructure">Critical Infrastructure</TabsTrigger>
          <TabsTrigger value="expertise">Exceptional Ability</TabsTrigger>
          <TabsTrigger value="documentation">Evidence Package</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Substantial Merit and National Importance
              </CardTitle>
              <CardDescription>
                Quantifiable impact on U.S. national security, economic interests, and critical infrastructure protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nationalImpactMetrics.map((metric, index) => (
                  <ImpactMetric key={index} {...metric} />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-utility-success/10 to-utility-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-utility-success">
                  <Shield className="h-5 w-5" />
                  National Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  • Secured 3,000+ U.S. utilities through AWS-based NERC-CIP compliance framework
                </div>
                <div className="text-sm">
                  • Reduced cybersecurity incidents by 87% using AWS Security Hub and GuardDuty
                </div>
                <div className="text-sm">
                  • Ensured 99.99% grid availability through multi-region AWS disaster recovery
                </div>
                <div className="text-sm">
                  • Implemented AWS IAM and Shield Advanced for critical infrastructure protection
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-utility-blue/10 to-utility-blue/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-utility-blue">
                  <DollarSign className="h-5 w-5" />
                  Economic Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  • Generated $2.8B annual savings through AWS-based grid optimization
                </div>
                <div className="text-sm">
                  • Reduced utility infrastructure costs by migrating GIS to AWS cloud
                </div>
                <div className="text-sm">
                  • Improved outage restoration time by 85% using real-time Kinesis data streams
                </div>
                <div className="text-sm">
                  • Optimized asset management for 3,000+ utilities through SageMaker AI
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-utility-teal/10 to-utility-teal/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-utility-teal">
                  <Brain className="h-5 w-5" />
                  Innovation Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  • AWS-based GIS hosting using EC2, RDS, and ArcGIS Enterprise integration
                </div>
                <div className="text-sm">
                  • Real-time IoT data streaming reducing grid response time by 85%
                </div>
                <div className="text-sm">
                  • SageMaker-powered predictive maintenance with 94% accuracy
                </div>
                <div className="text-sm">
                  • Multi-region disaster recovery ensuring uninterrupted utility operations
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="innovations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Advanced Technical Innovations
              </CardTitle>
              <CardDescription>
                Cutting-edge technology developments with direct national security and economic impact
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {technicalInnovations.map((innovation, index) => (
              <TechnicalInnovation key={index} {...innovation} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-6 w-6 text-primary" />
                Critical Infrastructure Protection
              </CardTitle>
              <CardDescription>
                Federal mandate compliance and national critical infrastructure security frameworks
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {criticalInfrastructureProjects.map((project, index) => (
              <CriticalInfrastructureEvidence key={index} {...project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                Evidence of Exceptional Ability
              </CardTitle>
              <CardDescription>
                Demonstrating advanced expertise significantly above ordinary practitioners in the field
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {exceptionalAbilityEvidence.map((section, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-utility-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Comprehensive Evidence Package
              </CardTitle>
              <CardDescription>
                Supporting documentation demonstrating national importance and exceptional ability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Technical Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div>• NERC-CIP Security Framework Implementation</div>
                    <div>• AI-Powered Cost Analysis Platform</div>
                    <div>• Edge Computing Grid Integration</div>
                    <div>• Autonomous Disaster Recovery System</div>
                    <div>• MLOps Governance Framework</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Impact Documentation</h4>
                  <div className="space-y-2 text-sm">
                    <div>• National Security Benefits Analysis</div>
                    <div>• Economic Impact Assessment</div>
                    <div>• Critical Infrastructure Protection Metrics</div>
                    <div>• Federal Compliance Achievements</div>
                    <div>• Innovation Leadership Evidence</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">EB2-NIW Criteria Satisfaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-utility-success" />
                  <span className="text-sm">Substantial Merit: Critical infrastructure protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-utility-success" />
                  <span className="text-sm">National Importance: 150M+ Americans protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-utility-success" />
                  <span className="text-sm">Well-Positioned: Advanced technical expertise</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-utility-success" />
                  <span className="text-sm">National Benefit: Waiver justified by impact</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Supporting Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Quantifiable Metrics:</strong> $2.8B savings, 87% threat reduction
                </div>
                <div className="text-sm">
                  <strong>Federal Compliance:</strong> NERC-CIP, Presidential Directives
                </div>
                <div className="text-sm">
                  <strong>National Scope:</strong> North American bulk electric system
                </div>
                <div className="text-sm">
                  <strong>Innovation Leadership:</strong> 5 advanced technology frameworks
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}