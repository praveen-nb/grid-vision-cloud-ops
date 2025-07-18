import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Image, Database, Shield, BarChart3, MapPin, Settings } from 'lucide-react'

const deliverables = [
  {
    category: "System Design Documents",
    icon: FileText,
    items: [
      { name: "AWS-Based GIS Architecture Specification", author: "System Architect", type: "PDF", size: "2.4 MB", status: "Complete" },
      { name: "Technical Requirements Document", author: "Lead Engineer", type: "DOCX", size: "1.8 MB", status: "Complete" },
      { name: "Database Schema Design", author: "Database Designer", type: "PDF", size: "1.2 MB", status: "Complete" },
      { name: "API Documentation", author: "Software Developer", type: "HTML", size: "3.6 MB", status: "Complete" }
    ]
  },
  {
    category: "Architecture Diagrams",
    icon: MapPin,
    items: [
      { name: "AWS Cloud Architecture Diagram", author: "Cloud Architect", type: "PNG", size: "4.2 MB", status: "Complete" },
      { name: "Network Topology - RTAC Integration", author: "Network Engineer", type: "VSDX", size: "2.8 MB", status: "Complete" },
      { name: "Data Flow Architecture", author: "Data Engineer", type: "PNG", size: "3.1 MB", status: "Complete" },
      { name: "Security Architecture Layout", author: "Security Architect", type: "PDF", size: "2.9 MB", status: "Complete" }
    ]
  },
  {
    category: "Configuration & SOPs",
    icon: Settings,
    items: [
      { name: "AWS IoT Core Configuration Manual", author: "IoT Specialist", type: "PDF", size: "1.9 MB", status: "Complete" },
      { name: "Kinesis Data Stream Setup Guide", author: "Data Engineer", type: "DOCX", size: "1.5 MB", status: "Complete" },
      { name: "Emergency Response Procedures", author: "Operations Manager", type: "PDF", size: "2.2 MB", status: "Complete" },
      { name: "Maintenance Schedule & Protocols", author: "Maintenance Lead", type: "XLSX", size: "876 KB", status: "Complete" }
    ]
  },
  {
    category: "Real-Time Data Evidence",
    icon: Database,
    items: [
      { name: "Kinesis Stream Logs - Nov 2024", author: "System Monitor", type: "JSON", size: "15.2 MB", status: "Live" },
      { name: "IoT Data Ingestion Screenshots", author: "Field Technician", type: "PNG", size: "8.7 MB", status: "Complete" },
      { name: "SCADA Integration Logs", author: "SCADA Engineer", type: "LOG", size: "12.4 MB", status: "Live" },
      { name: "Real-Time Analytics Dashboard", author: "Data Analyst", type: "HTML", size: "2.1 MB", status: "Live" }
    ]
  },
  {
    category: "GIS Dashboard Screenshots",
    icon: Image,
    items: [
      { name: "Production GIS Dashboard - Main View", author: "GIS Analyst", type: "PNG", size: "6.3 MB", status: "Complete" },
      { name: "ArcGIS Portal on AWS - Screenshots", author: "GIS Administrator", type: "ZIP", size: "24.8 MB", status: "Complete" },
      { name: "Mobile GIS Application Views", author: "Mobile Developer", type: "PNG", size: "11.2 MB", status: "Complete" },
      { name: "Field Crew Interface Screenshots", author: "Field Operations", type: "PNG", size: "7.9 MB", status: "Complete" }
    ]
  },
  {
    category: "Analytics & ML Reports",
    icon: BarChart3,
    items: [
      { name: "SageMaker Predictive Maintenance Model", author: "ML Engineer", type: "IPYNB", size: "3.4 MB", status: "Complete" },
      { name: "Asset Failure Prediction Reports", author: "Data Scientist", type: "PDF", size: "4.7 MB", status: "Complete" },
      { name: "Redshift Analytics Performance", author: "Analytics Lead", type: "HTML", size: "2.8 MB", status: "Complete" },
      { name: "Grid Optimization Insights", author: "Operations Analyst", type: "XLSX", size: "1.9 MB", status: "Complete" }
    ]
  },
  {
    category: "Compliance & Audit Logs",
    icon: Shield,
    items: [
      { name: "NERC-CIP Compliance Configuration", author: "Compliance Officer", type: "PDF", size: "3.2 MB", status: "Complete" },
      { name: "AWS CloudTrail Audit Logs", author: "Security Auditor", type: "JSON", size: "18.7 MB", status: "Live" },
      { name: "Security Assessment Report", author: "Security Consultant", type: "PDF", size: "5.1 MB", status: "Complete" },
      { name: "Regulatory Compliance Checklist", author: "Regulatory Manager", type: "XLSX", size: "1.3 MB", status: "Complete" }
    ]
  }
]

export function ProjectDeliverables() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">IV. Documented Project Deliverables</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive documentation and evidence of the AWS-based GIS infrastructure implementation
          including system designs, real-time data, compliance reports, and operational procedures.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Deliverables</TabsTrigger>
          <TabsTrigger value="technical">Technical Docs</TabsTrigger>
          <TabsTrigger value="evidence">Data Evidence</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6">
            {deliverables.map((category, categoryIndex) => {
              const IconComponent = category.icon
              return (
                <Card key={categoryIndex} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      {category.category}
                    </CardTitle>
                    <CardDescription>
                      {category.items.length} documents and files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created by {item.author} • {item.type} • {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={item.status === 'Live' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                            <Button variant="outline" size="sm">
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

        <TabsContent value="technical">
          <div className="grid gap-6">
            {deliverables.filter(cat => 
              cat.category.includes('System Design') || 
              cat.category.includes('Architecture') || 
              cat.category.includes('Configuration')
            ).map((category, categoryIndex) => {
              const IconComponent = category.icon
              return (
                <Card key={categoryIndex} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created by {item.author} • {item.type} • {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{item.status}</Badge>
                            <Button variant="outline" size="sm">
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

        <TabsContent value="evidence">
          <div className="grid gap-6">
            {deliverables.filter(cat => 
              cat.category.includes('Real-Time') || 
              cat.category.includes('Screenshots') || 
              cat.category.includes('Analytics')
            ).map((category, categoryIndex) => {
              const IconComponent = category.icon
              return (
                <Card key={categoryIndex} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created by {item.author} • {item.type} • {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={item.status === 'Live' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                            <Button variant="outline" size="sm">
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

        <TabsContent value="compliance">
          <div className="grid gap-6">
            {deliverables.filter(cat => 
              cat.category.includes('Compliance')
            ).map((category, categoryIndex) => {
              const IconComponent = category.icon
              return (
                <Card key={categoryIndex} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created by {item.author} • {item.type} • {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={item.status === 'Live' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                            <Button variant="outline" size="sm">
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
      </Tabs>
    </div>
  )
}