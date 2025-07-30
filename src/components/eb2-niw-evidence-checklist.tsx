import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Award, 
  Shield, 
  TrendingUp, 
  Users,
  Building,
  CheckCircle,
  AlertCircle,
  Star,
  Briefcase,
  GraduationCap,
  Newspaper,
  Globe,
  DollarSign,
  Zap,
  Database,
  Cloud,
  Lock,
  BarChart3,
  BookOpen,
  Trophy,
  Medal,
  BadgeCheck,
  UserCheck,
  Handshake,
  Github,
  Code,
  GitFork,
  Eye,
  Play,
  Settings,
  Workflow,
  MonitorCheck
} from 'lucide-react';

const EvidenceItem = ({ icon: Icon, title, description, priority, examples, isChecked, onCheck }) => (
  <Card className={`border-l-4 ${priority === 'Critical' ? 'border-l-red-500' : priority === 'High' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isChecked} 
          onCheckedChange={onCheck}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">{title}</h4>
            <Badge variant={priority === 'Critical' ? 'destructive' : priority === 'High' ? 'default' : 'secondary'} className="text-xs">
              {priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-muted-foreground">Examples to Include:</h5>
            {examples.map((example, index) => (
              <div key={index} className="text-xs text-muted-foreground pl-2 border-l-2 border-accent">
                • {example}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CriteriaSection = ({ title, icon: Icon, description, evidence }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const completionRate = Object.values(checkedItems).filter(Boolean).length / evidence.length * 100;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-6 w-6 text-primary" />
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(completionRate)}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        {evidence.map((item, index) => (
          <EvidenceItem 
            key={index} 
            {...item} 
            isChecked={checkedItems[index] || false}
            onCheck={() => handleCheck(index)}
          />
        ))}
      </div>
    </div>
  );
};

export function Eb2NiwEvidenceChecklist() {
  const [activeTab, setActiveTab] = useState("exceptional-ability");

  const githubPortfolioEvidence = [
    {
      icon: Cloud,
      title: "Infrastructure as Code (IaC) Scripts",
      description: "CloudFormation/Terraform scripts demonstrating advanced AWS infrastructure automation",
      priority: "Critical",
      examples: [
        "Terraform modules for multi-tier AWS utility infrastructure",
        "CloudFormation templates for NERC-CIP compliant environments",
        "Infrastructure automation scripts showing complexity and scale",
        "Version-controlled IaC with proper documentation and examples"
      ]
    },
    {
      icon: Code,
      title: "Architecture Diagrams & Documentation",
      description: "Visual documentation of complex AWS GIS system architectures",
      priority: "Critical",
      examples: [
        "Comprehensive README with system architecture diagrams",
        "Technical documentation in docs/ folder explaining design decisions",
        "Network topology diagrams showing multi-AZ deployments",
        "Data flow diagrams for real-time processing pipelines"
      ]
    },
    {
      icon: Database,
      title: "SageMaker ML Training Implementation",
      description: "Machine learning notebooks and training pipelines for utility applications",
      priority: "High",
      examples: [
        "Jupyter notebooks (.ipynb) with ML model training code",
        "SageMaker pipeline configurations for automated training",
        "Model training logs and performance metrics",
        "ML inference endpoints for real-time grid monitoring"
      ]
    },
    {
      icon: Settings,
      title: "SCADA/OMS/GIS Integration Code",
      description: "API connectors and integration code for utility operational systems",
      priority: "High",
      examples: [
        "REST API connectors for SCADA system integration",
        "Real-time data ingestion from OMS (Outage Management Systems)",
        "GIS data transformation and mapping utilities",
        "Protocol adapters for DNP3, IEC 61850, or Modbus communications"
      ]
    },
    {
      icon: MonitorCheck,
      title: "Dashboard & UI Source Code",
      description: "Real-time monitoring dashboards and user interfaces for utility operations",
      priority: "High",
      examples: [
        "React/Angular dashboard components with real-time data visualization",
        "Responsive UI designs for utility control room environments",
        "Interactive maps and grid topology visualization components",
        "Real-time alerting and notification systems"
      ]
    },
    {
      icon: Github,
      title: "GitHub Repository Metrics & Community",
      description: "Evidence of community recognition and project adoption",
      priority: "Medium",
      examples: [
        "Repository with significant stars (50+ for niche utility software)",
        "Active forks indicating adoption by other developers/organizations",
        "Comprehensive README with clear project description and use cases",
        "Issue tracking and community contributions demonstrating impact"
      ]
    },
    {
      icon: Play,
      title: "Tutorials & Demo Walkthroughs",
      description: "Educational content demonstrating technical expertise and knowledge sharing",
      priority: "Medium",
      examples: [
        "Video demonstrations of system capabilities and setup",
        "Step-by-step markdown tutorials for complex integrations",
        "Live demo environments or sandbox implementations",
        "Conference presentation materials and technical talks"
      ]
    },
    {
      icon: Database,
      title: "Real-time Data Pipeline Implementation",
      description: "Code for high-volume, real-time data processing using AWS services",
      priority: "High",
      examples: [
        "Kinesis Data Streams configuration for utility telemetry",
        "IoT Core device management and data routing rules",
        "Lambda functions for real-time data transformation",
        "DynamoDB or RDS configurations for time-series data storage"
      ]
    },
    {
      icon: Lock,
      title: "Compliance & Security Audit Scripts",
      description: "Automated compliance checking and security monitoring implementations",
      priority: "High",
      examples: [
        "AWS Security Hub custom rules for utility compliance",
        "IAM policy templates following least-privilege principles",
        "CloudTrail analysis scripts for audit trail monitoring",
        "Config rules for NERC-CIP compliance validation"
      ]
    },
    {
      icon: Workflow,
      title: "CI/CD Pipeline & Deployment Automation",
      description: "Production-ready deployment pipelines demonstrating DevOps maturity",
      priority: "Medium",
      examples: [
        "GitHub Actions workflows in .github/workflows/ directory",
        "Multi-environment deployment strategies (dev/staging/prod)",
        "Automated testing and security scanning in pipelines",
        "Infrastructure deployment logs showing successful production releases"
      ]
    }
  ];

  const exceptionalAbilityEvidence = [
    {
      icon: GraduationCap,
      title: "Advanced Degree Documentation",
      description: "Proof of education qualifying you for the EB-2 category",
      priority: "Critical",
      examples: [
        "Master's degree in Computer Science, Engineering, or related field",
        "Official transcripts from accredited universities",
        "Credential evaluation if degree is from outside the U.S.",
        "Any relevant certifications (AWS, Microsoft, Cisco, etc.)"
      ]
    },
    {
      icon: Briefcase,
      title: "Progressive Experience Documentation",
      description: "Evidence of increasing responsibility and expertise in AWS/GIS infrastructure",
      priority: "Critical",
      examples: [
        "Detailed employment letters describing your specific AWS GIS work",
        "Project portfolios showing progression from basic to advanced implementations",
        "Letters from supervisors detailing your unique contributions",
        "Performance evaluations highlighting exceptional technical achievements"
      ]
    },
    {
      icon: BadgeCheck,
      title: "Professional Recognition & Awards",
      description: "Industry recognition for your technical achievements",
      priority: "High",
      examples: [
        "AWS technical certifications (Solutions Architect, DevOps, Security)",
        "Industry awards for GIS or utility infrastructure projects",
        "Patent applications for innovative AWS/GIS solutions",
        "Professional society memberships and leadership roles"
      ]
    },
    {
      icon: DollarSign,
      title: "High Salary/Compensation Evidence",
      description: "Proof that your compensation reflects exceptional ability",
      priority: "High",
      examples: [
        "Salary statements showing compensation above industry average",
        "Comparison with Bureau of Labor Statistics data for your field",
        "Stock options or equity compensation reflecting your value",
        "Consulting fees demonstrating market recognition of expertise"
      ]
    },
    {
      icon: Newspaper,
      title: "Media Coverage & Publications",
      description: "Public recognition of your technical contributions",
      priority: "Medium",
      examples: [
        "Technical articles about your AWS GIS implementations",
        "Conference presentations on utility infrastructure modernization",
        "Media coverage of your projects' impact on grid reliability",
        "White papers or case studies featuring your work"
      ]
    },
    {
      icon: Users,
      title: "Professional Association Memberships",
      description: "Membership in organizations requiring outstanding achievements",
      priority: "Medium",
      examples: [
        "IEEE Power & Energy Society membership",
        "AWS Community Builder or Hero recognition",
        "ESRI Technical Certification Program participation",
        "Utility industry professional organization leadership"
      ]
    }
  ];

  const substantialMeritEvidence = [
    {
      icon: Shield,
      title: "Critical Infrastructure Impact Documentation",
      description: "Proof that your work directly affects national critical infrastructure",
      priority: "Critical",
      examples: [
        "Documentation showing 3,000+ utilities benefiting from your AWS GIS solutions",
        "NERC-CIP compliance certificates for systems you designed",
        "Utility company testimonials about improved grid reliability",
        "Federal agency letters acknowledging your infrastructure contributions"
      ]
    },
    {
      icon: BarChart3,
      title: "Quantifiable Impact Metrics",
      description: "Measurable benefits of your AWS GIS infrastructure work",
      priority: "Critical",
      examples: [
        "Reports showing $2.8B in economic savings from your implementations",
        "Grid reliability improvements (99.99% availability statistics)",
        "Outage reduction metrics (85% faster detection/restoration)",
        "Cybersecurity incident reduction data (87% fewer security breaches)"
      ]
    },
    {
      icon: Lock,
      title: "National Security Contributions",
      description: "Evidence of your work's impact on national security",
      priority: "High",
      examples: [
        "NERC-CIP compliance implementation documentation",
        "Cybersecurity framework designs protecting critical infrastructure",
        "Letters from utility security officers about threat reduction",
        "Federal compliance audit reports showing your security implementations"
      ]
    },
    {
      icon: Database,
      title: "Technical Innovation Documentation",
      description: "Proof of advanced technical solutions you've developed",
      priority: "High",
      examples: [
        "AWS architecture diagrams for complex GIS implementations",
        "Technical specifications for real-time data processing (50TB/day)",
        "SageMaker ML model documentation for predictive maintenance",
        "IoT integration designs for smart grid monitoring"
      ]
    },
    {
      icon: Trophy,
      title: "Industry Recognition of Merit",
      description: "Third-party validation of your work's substantial merit",
      priority: "Medium",
      examples: [
        "Industry awards for utility infrastructure modernization",
        "Case studies published by AWS or utility companies",
        "Speaking invitations at major industry conferences",
        "Peer-reviewed publications on your technical contributions"
      ]
    }
  ];

  const nationalImportanceEvidence = [
    {
      icon: Zap,
      title: "U.S. Power Grid Impact Documentation",
      description: "Evidence that your work benefits the entire U.S. electrical grid",
      priority: "Critical",
      examples: [
        "Documentation showing your solutions protect 150M+ Americans",
        "Multi-state utility implementations of your AWS GIS architecture",
        "Federal energy agency acknowledgment of your contributions",
        "Grid interconnection reliability improvements across regions"
      ]
    },
    {
      icon: Globe,
      title: "National Economic Impact Evidence",
      description: "Proof of widespread economic benefits from your work",
      priority: "Critical",
      examples: [
        "Economic impact studies showing billions in savings",
        "Department of Energy reports citing your technical contributions",
        "Utility industry analysis of cost reductions from your solutions",
        "Federal infrastructure investment returns attributable to your work"
      ]
    },
    {
      icon: AlertCircle,
      title: "National Security Importance",
      description: "Evidence that your work is critical to U.S. national security",
      priority: "High",
      examples: [
        "DHS or DOE letters acknowledging critical infrastructure protection",
        "FERC compliance improvements from your security implementations",
        "Cybersecurity threat reduction metrics for national grid",
        "National resilience improvements during natural disasters"
      ]
    },
    {
      icon: BookOpen,
      title: "Federal Regulatory Compliance",
      description: "Proof of helping utilities meet federal mandates",
      priority: "High",
      examples: [
        "NERC-CIP audit results showing 100% compliance rates",
        "FERC Order compliance documentation from your implementations",
        "Federal cybersecurity framework adherence certificates",
        "Presidential directive compliance evidence"
      ]
    },
    {
      icon: Building,
      title: "Utility Industry Transformation",
      description: "Evidence of transforming the entire utility sector",
      priority: "Medium",
      examples: [
        "Industry adoption rates of your AWS GIS methodologies",
        "Utility industry association endorsements of your approaches",
        "Standardization of your technical solutions across the sector",
        "Industry conference presentations on your transformation impact"
      ]
    }
  ];

  const wellPositionedEvidence = [
    {
      icon: Star,
      title: "Unique Expertise Documentation",
      description: "Proof that you are uniquely qualified to advance this work",
      priority: "Critical",
      examples: [
        "Exclusive AWS utility partnerships or consulting arrangements",
        "Proprietary methodologies you've developed for GIS cloud migration",
        "Specialized knowledge in both utility operations and AWS architecture",
        "Track record of successful large-scale utility modernization projects"
      ]
    },
    {
      icon: TrendingUp,
      title: "Future Impact Potential",
      description: "Evidence of your ability to continue advancing the national interest",
      priority: "High",
      examples: [
        "Ongoing projects with national scope and impact",
        "Research and development initiatives for next-generation grid technology",
        "Strategic partnerships with major utilities and technology companies",
        "Vision papers outlining future contributions to grid modernization"
      ]
    },
    {
      icon: UserCheck,
      title: "Leadership & Influence",
      description: "Proof of your leadership in utility infrastructure modernization",
      priority: "High",
      examples: [
        "Advisory roles with federal agencies or major utilities",
        "Technical committee leadership in industry organizations",
        "Mentorship of other professionals in AWS utility implementations",
        "Influence on industry standards and best practices"
      ]
    },
    {
      icon: Handshake,
      title: "Strategic Relationships",
      description: "Evidence of relationships that enable continued national benefit",
      priority: "Medium",
      examples: [
        "Letters of support from utility CEOs or federal officials",
        "Collaborative agreements with research institutions",
        "Industry partnership agreements for technology development",
        "Government consulting contracts for critical infrastructure projects"
      ]
    }
  ];

  const supportingDocuments = [
    {
      category: "Personal Documentation",
      items: [
        "Passport and visa history",
        "Birth certificate",
        "Marriage certificate (if applicable)",
        "Police clearance certificates"
      ]
    },
    {
      category: "Professional Portfolio",
      items: [
        "Comprehensive CV highlighting AWS GIS achievements",
        "Project portfolio with before/after metrics",
        "Technical architecture diagrams and documentation",
        "Client testimonials and success stories"
      ]
    },
    {
      category: "Financial Documentation",
      items: [
        "Tax returns for past 3 years",
        "Employment verification letters",
        "Salary statements and compensation history",
        "Consulting contract documentation"
      ]
    },
    {
      category: "Expert Letters",
      items: [
        "Recommendation letters from utility industry leaders",
        "Expert opinion letters from AWS technical leaders",
        "Academic references from university professors",
        "Federal agency officials acknowledging your contributions"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 py-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">EB2-NIW Evidence Checklist</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive documentation guide for AWS-based GIS infrastructure modernization EB2-NIW petition
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="default" className="bg-utility-success text-white">
            Critical Infrastructure
          </Badge>
          <Badge variant="default" className="bg-utility-blue text-white">
            National Importance
          </Badge>
          <Badge variant="default" className="bg-utility-teal text-white">
            Exceptional Ability
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="exceptional-ability">Exceptional Ability</TabsTrigger>
          <TabsTrigger value="substantial-merit">Substantial Merit</TabsTrigger>
          <TabsTrigger value="national-importance">National Importance</TabsTrigger>
          <TabsTrigger value="well-positioned">Well-Positioned</TabsTrigger>
          <TabsTrigger value="github-portfolio">GitHub Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="exceptional-ability">
          <CriteriaSection
            title="Exceptional Ability Evidence"
            icon={Star}
            description="Documentation proving degree of expertise significantly above that ordinarily encountered in AWS/GIS infrastructure"
            evidence={exceptionalAbilityEvidence}
          />
        </TabsContent>

        <TabsContent value="substantial-merit">
          <CriteriaSection
            title="Substantial Merit Evidence"
            icon={Award}
            description="Proof that your AWS GIS infrastructure work has substantial intrinsic merit"
            evidence={substantialMeritEvidence}
          />
        </TabsContent>

        <TabsContent value="national-importance">
          <CriteriaSection
            title="National Importance Evidence"
            icon={Globe}
            description="Documentation showing your work benefits the United States as a whole"
            evidence={nationalImportanceEvidence}
          />
        </TabsContent>

        <TabsContent value="well-positioned">
          <CriteriaSection
            title="Well-Positioned Evidence"
            icon={TrendingUp}
            description="Proof that you are well-positioned to advance the proposed endeavor"
            evidence={wellPositionedEvidence}
          />
        </TabsContent>

        <TabsContent value="github-portfolio">
          <CriteriaSection
            title="GitHub Portfolio Evidence"
            icon={Github}
            description="Technical portfolio demonstrating your AWS GIS infrastructure expertise through code"
            evidence={githubPortfolioEvidence}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Additional Supporting Documents
          </CardTitle>
          <CardDescription>
            Essential documentation to include with your EB2-NIW petition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportingDocuments.map((category, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-semibold text-lg">{category.category}</h4>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-utility-success" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-utility-warning" />
            Critical Success Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-utility-success/10 rounded-lg">
              <h4 className="font-semibold text-utility-success mb-2">Quantifiable Impact</h4>
              <p className="text-sm text-muted-foreground">
                Include specific metrics: $2.8B savings, 3,000+ utilities, 150M+ Americans protected
              </p>
            </div>
            <div className="p-4 bg-utility-blue/10 rounded-lg">
              <h4 className="font-semibold text-utility-blue mb-2">Federal Recognition</h4>
              <p className="text-sm text-muted-foreground">
                Obtain letters from federal agencies acknowledging your critical infrastructure contributions
              </p>
            </div>
            <div className="p-4 bg-utility-teal/10 rounded-lg">
              <h4 className="font-semibold text-utility-teal mb-2">Expert Validation</h4>
              <p className="text-sm text-muted-foreground">
                Secure expert opinion letters from recognized leaders in utility and AWS fields
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}