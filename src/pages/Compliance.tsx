import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Lock, Eye } from 'lucide-react'

const complianceStandards = [
  {
    standard: "NERC-CIP",
    status: "Compliant",
    score: "98%",
    lastAudit: "2024-11-20",
    requirements: [
      { id: "CIP-002", title: "Cyber Security — BES Cyber System Categorization", status: "Compliant" },
      { id: "CIP-003", title: "Cyber Security — Security Management Controls", status: "Compliant" },
      { id: "CIP-004", title: "Cyber Security — Personnel & Training", status: "Compliant" },
      { id: "CIP-005", title: "Cyber Security — Electronic Security Perimeters", status: "Compliant" },
      { id: "CIP-006", title: "Cyber Security — Physical Security", status: "Compliant" },
      { id: "CIP-007", title: "Cyber Security — System Security Management", status: "Compliant" },
      { id: "CIP-008", title: "Cyber Security — Incident Reporting", status: "Compliant" },
      { id: "CIP-009", title: "Cyber Security — Recovery Plans", status: "Under Review" },
      { id: "CIP-010", title: "Cyber Security — Configuration Change Management", status: "Compliant" },
      { id: "CIP-011", title: "Cyber Security — Information Protection", status: "Compliant" }
    ]
  },
  {
    standard: "FERC",
    status: "Compliant",
    score: "100%",
    lastAudit: "2024-11-18",
    requirements: [
      { id: "FERC-715", title: "Annual Transmission Planning and Evaluation Report", status: "Compliant" },
      { id: "FERC-714", title: "Annual Electric Balancing Authority Area Report", status: "Compliant" },
      { id: "FERC-730", title: "Monthly Report of Cost and Quality of Fuels", status: "Compliant" },
      { id: "FERC-EQR", title: "Electric Quarterly Report", status: "Compliant" }
    ]
  }
]

const auditLogs = [
  {
    timestamp: "2024-11-25 14:23:15",
    action: "User Login",
    user: "admin@utility.com",
    source: "192.168.1.100",
    status: "Success",
    details: "Multi-factor authentication successful"
  },
  {
    timestamp: "2024-11-25 14:15:42",
    action: "Configuration Change",
    user: "engineer@utility.com",
    source: "AWS Console",
    status: "Success",
    details: "Updated security group rules for EC2 instances"
  },
  {
    timestamp: "2024-11-25 13:58:33",
    action: "Data Access",
    user: "analyst@utility.com",
    source: "GIS Portal",
    status: "Success",
    details: "Accessed transformer maintenance records"
  },
  {
    timestamp: "2024-11-25 13:45:18",
    action: "Failed Login Attempt",
    user: "unknown",
    source: "185.220.101.5",
    status: "Blocked",
    details: "Multiple failed authentication attempts"
  },
  {
    timestamp: "2024-11-25 13:30:07",
    action: "Backup Completed",
    user: "system",
    source: "AWS S3",
    status: "Success",
    details: "Daily database backup completed successfully"
  }
]

const securityMetrics = [
  { metric: "Security Incidents", value: "0", period: "Last 30 days", trend: "stable" },
  { metric: "Failed Login Attempts", value: "23", period: "Last 24 hours", trend: "down" },
  { metric: "Patch Compliance", value: "100%", period: "Current", trend: "up" },
  { metric: "Vulnerability Score", value: "2.1", period: "CVSS Average", trend: "down" },
  { metric: "Backup Success Rate", value: "100%", period: "Last 30 days", trend: "stable" },
  { metric: "Access Reviews", value: "Monthly", period: "Frequency", trend: "stable" }
]

const complianceReports = [
  {
    title: "NERC-CIP Annual Assessment Report",
    date: "2024-11-20",
    type: "Annual",
    status: "Complete",
    findings: "No critical findings, 2 minor recommendations"
  },
  {
    title: "AWS Security Assessment",
    date: "2024-11-15",
    type: "Quarterly",
    status: "Complete",
    findings: "All security controls operating effectively"
  },
  {
    title: "Penetration Testing Report",
    date: "2024-11-10",
    type: "Semi-Annual",
    status: "Complete",
    findings: "No high-risk vulnerabilities identified"
  },
  {
    title: "Disaster Recovery Test Results",
    date: "2024-11-05",
    type: "Quarterly",
    status: "Complete",
    findings: "RTO and RPO objectives met successfully"
  }
]

export default function Compliance() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Security & Compliance</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive security monitoring, regulatory compliance tracking, and audit documentation
          for NERC-CIP and FERC requirements.
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm font-medium mb-1">{metric.metric}</div>
              <div className="text-xs text-muted-foreground">{metric.period}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="standards" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="standards">Compliance Standards</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
          <TabsTrigger value="configuration">Security Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="standards">
          <div className="space-y-6">
            {complianceStandards.map((standard, standardIndex) => (
              <Card key={standardIndex} className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-utility-success/10 rounded-lg">
                        <Shield className="h-6 w-6 text-utility-success" />
                      </div>
                      {standard.standard} Compliance
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-utility-success/10 text-utility-success">
                        {standard.status}
                      </Badge>
                      <Badge variant="outline">{standard.score}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Last audited: {standard.lastAudit}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {standard.requirements.map((req, reqIndex) => (
                      <div key={reqIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {req.status === "Compliant" ? (
                            <CheckCircle className="h-5 w-5 text-utility-success" />
                          ) : req.status === "Under Review" ? (
                            <Clock className="h-5 w-5 text-utility-warning" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-utility-danger" />
                          )}
                          <div>
                            <h4 className="font-medium">{req.id}</h4>
                            <p className="text-sm text-muted-foreground">{req.title}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={req.status === "Compliant" ? "default" : "secondary"}
                          className={req.status === "Compliant" ? "bg-utility-success/10 text-utility-success" : ""}
                        >
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit-logs">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Recent Audit Logs
              </CardTitle>
              <CardDescription>
                Real-time security and access audit trail from AWS CloudTrail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{log.action}</h4>
                        <Badge 
                          variant={log.status === "Success" ? "default" : log.status === "Blocked" ? "destructive" : "secondary"}
                          className={log.status === "Success" ? "bg-utility-success/10 text-utility-success" : ""}
                        >
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>User: {log.user}</span>
                        <span>Source: {log.source}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">
                  View Full Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Compliance Reports
              </CardTitle>
              <CardDescription>
                Generated compliance and security assessment reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{report.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{report.findings}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Date: {report.date}</span>
                        <span>Type: {report.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-utility-success/10 text-utility-success">
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  AWS Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Multi-Factor Authentication</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Encryption at Rest</span>
                    <Badge className="bg-utility-success/10 text-utility-success">AES-256</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VPC Security Groups</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CloudTrail Logging</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GuardDuty Threat Detection</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Config Compliance</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Monitoring</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  NERC-CIP Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Physical Security Perimeter</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Implemented</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Electronic Security Perimeter</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Security Management</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Personnel Training</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Incident Response Plan</span>
                    <Badge className="bg-utility-success/10 text-utility-success">Approved</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recovery Plans</span>
                    <Badge className="bg-utility-warning/10 text-utility-warning">Under Review</Badge>
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