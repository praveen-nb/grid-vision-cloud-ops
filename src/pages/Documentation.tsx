import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, BookOpen, Settings, Shield, Code } from 'lucide-react'
import { downloadDocument, generateRandom2025Date } from "@/lib/documentDownload"

const documentationSections = [
  {
    category: "Implementation Guide",
    icon: BookOpen,
    documents: [
      { 
        title: "Phase 1: Assessment and Planning", 
        description: "Comprehensive audit of existing GIS, SCADA, and OMS systems",
        pages: 24,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Phase 2: Cloud Infrastructure Setup", 
        description: "AWS EC2, RDS, and S3 configuration with security controls",
        pages: 32,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Phase 3: Data Integration", 
        description: "IoT Core and Kinesis setup for real-time data streaming",
        pages: 28,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Phase 4: AI/ML Analytics", 
        description: "SageMaker model deployment for predictive maintenance",
        pages: 35,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Phase 5: Security & Compliance", 
        description: "NERC-CIP compliance configuration and audit procedures",
        pages: 41,
        lastUpdated: generateRandom2025Date()
      }
    ]
  },
  {
    category: "Technical Documentation",
    icon: Code,
    documents: [
      { 
        title: "API Reference Guide", 
        description: "Complete REST API documentation for all system endpoints",
        pages: 156,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Database Schema Documentation", 
        description: "PostgreSQL/PostGIS schema with relationships and indexes",
        pages: 67,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Integration Specifications", 
        description: "SCADA, OMS, and AMS integration protocols and standards",
        pages: 89,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Performance Tuning Guide", 
        description: "Optimization strategies for high-volume data processing",
        pages: 43,
        lastUpdated: generateRandom2025Date()
      }
    ]
  },
  {
    category: "Operations Manuals",
    icon: Settings,
    documents: [
      { 
        title: "System Administration Guide", 
        description: "Daily operations, monitoring, and maintenance procedures",
        pages: 78,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Incident Response Procedures", 
        description: "Emergency response protocols and escalation procedures",
        pages: 52,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Backup and Recovery Manual", 
        description: "Data backup strategies and disaster recovery procedures",
        pages: 34,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "User Training Materials", 
        description: "Training guides for GIS portal and dashboard users",
        pages: 95,
        lastUpdated: generateRandom2025Date()
      }
    ]
  },
  {
    category: "Security & Compliance",
    icon: Shield,
    documents: [
      { 
        title: "NERC-CIP Compliance Manual", 
        description: "Complete guide to meeting NERC-CIP standards",
        pages: 112,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Security Configuration Guide", 
        description: "AWS security services configuration and best practices",
        pages: 87,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Audit and Monitoring Procedures", 
        description: "Continuous monitoring and audit log management",
        pages: 61,
        lastUpdated: generateRandom2025Date()
      },
      { 
        title: "Risk Assessment Report", 
        description: "Comprehensive security risk analysis and mitigation strategies",
        pages: 73,
        lastUpdated: generateRandom2025Date()
      }
    ]
  }
]

const quickLinks = [
  { title: "Getting Started", description: "Begin with system overview and prerequisites" },
  { title: "Installation Guide", description: "Step-by-step deployment instructions" },
  { title: "Configuration Reference", description: "All configuration parameters and options" },
  { title: "Troubleshooting", description: "Common issues and resolution steps" },
  { title: "FAQ", description: "Frequently asked questions and answers" },
  { title: "Support", description: "Contact information and support procedures" }
]

export default function Documentation() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">System Documentation</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive documentation covering implementation, operations, security, and compliance
          for the AWS-based GIS infrastructure.
        </p>
      </div>

      {/* Quick Links */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Jump to commonly accessed documentation sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Button key={index} variant="outline" className="h-auto p-4 justify-start">
                <div className="text-left">
                  <div className="font-medium">{link.title}</div>
                  <div className="text-xs text-muted-foreground">{link.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6">
            {documentationSections.map((section, sectionIndex) => {
              const IconComponent = section.icon
              return (
                <Card key={sectionIndex} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      {section.category}
                    </CardTitle>
                    <CardDescription>
                      {section.documents.length} documents available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.documents.map((doc, docIndex) => (
                        <div key={docIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{doc.pages} pages</span>
                              <span>Updated: {doc.lastUpdated}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">PDF</Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadDocument(doc.title, "PDF")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Individual category tabs */}
        {documentationSections.map((section, sectionIndex) => {
          const tabValue = section.category.toLowerCase().split(' ')[0]
          const IconComponent = section.icon
          return (
            <TabsContent key={sectionIndex} value={tabValue}>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.documents.map((doc, docIndex) => (
                      <div key={docIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{doc.pages} pages</span>
                            <span>Updated: {doc.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">PDF</Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadDocument(doc.title, "PDF")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}