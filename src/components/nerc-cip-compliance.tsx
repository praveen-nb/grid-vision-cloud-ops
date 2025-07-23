import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, FileText, Clock, Users, Database, Lock } from "lucide-react";

interface ComplianceMetric {
  standard: string;
  score: number;
  status: 'compliant' | 'warning' | 'non-compliant';
  lastAudit: string;
  nextAudit: string;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'met' | 'partial' | 'not-met';
  evidence: string[];
  lastVerified: string;
}

export function NERCCIPCompliance() {
  const [complianceData, setComplianceData] = useState<ComplianceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching NERC CIP compliance data
    const fetchComplianceData = async () => {
      setLoading(true);
      // In real implementation, this would fetch from backend
      const mockData: ComplianceMetric[] = [
        {
          standard: "CIP-002-5.1a",
          score: 95,
          status: 'compliant',
          lastAudit: "2024-01-15",
          nextAudit: "2024-07-15",
          requirements: [
            {
              id: "CIP-002-R1",
              title: "BES Cyber System Categorization",
              description: "Each Responsible Entity shall implement a process to identify and categorize BES Cyber Systems",
              status: 'met',
              evidence: ["Asset inventory", "Risk assessment", "Categorization matrix"],
              lastVerified: "2024-01-15"
            }
          ]
        },
        {
          standard: "CIP-003-8",
          score: 88,
          status: 'warning',
          lastAudit: "2024-01-10",
          nextAudit: "2024-07-10",
          requirements: [
            {
              id: "CIP-003-R1",
              title: "Security Management Controls",
              description: "Each Responsible Entity shall implement security management controls",
              status: 'partial',
              evidence: ["Security policies", "Procedures documentation"],
              lastVerified: "2024-01-10"
            }
          ]
        },
        {
          standard: "CIP-004-6",
          score: 92,
          status: 'compliant',
          lastAudit: "2024-01-20",
          nextAudit: "2024-07-20",
          requirements: [
            {
              id: "CIP-004-R1",
              title: "Personnel & Training",
              description: "Each Responsible Entity shall implement personnel risk assessment programs",
              status: 'met',
              evidence: ["Background checks", "Training records", "Access reviews"],
              lastVerified: "2024-01-20"
            }
          ]
        },
        {
          standard: "CIP-005-6",
          score: 85,
          status: 'warning',
          lastAudit: "2024-01-12",
          nextAudit: "2024-07-12",
          requirements: [
            {
              id: "CIP-005-R1",
              title: "Electronic Security Perimeter",
              description: "Each Responsible Entity shall implement Electronic Security Perimeter(s)",
              status: 'partial',
              evidence: ["Firewall configurations", "Network diagrams"],
              lastVerified: "2024-01-12"
            }
          ]
        }
      ];
      
      setComplianceData(mockData);
      setLoading(false);
    };

    fetchComplianceData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'non-compliant':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallScore = complianceData.length > 0 
    ? complianceData.reduce((acc, metric) => acc + metric.score, 0) / complianceData.length 
    : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NERC CIP Compliance</h1>
          <p className="text-muted-foreground">Critical Infrastructure Protection Standards Monitoring</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallScore.toFixed(1)}%</span>
              <Badge className={getStatusColor(overallScore >= 95 ? 'compliant' : overallScore >= 85 ? 'warning' : 'non-compliant')}>
                {overallScore >= 95 ? 'Fully Compliant' : overallScore >= 85 ? 'Minor Issues' : 'Action Required'}
              </Badge>
            </div>
            <Progress value={overallScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Based on {complianceData.length} NERC CIP standards assessments
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="standards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standards">Standards Overview</TabsTrigger>
          <TabsTrigger value="requirements">Detailed Requirements</TabsTrigger>
          <TabsTrigger value="audit">Audit Schedule</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="standards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {complianceData.map((metric) => (
              <Card key={metric.standard}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.standard}</CardTitle>
                    {getStatusIcon(metric.status)}
                  </div>
                  <CardDescription>
                    Score: {metric.score}% | Last Audit: {new Date(metric.lastAudit).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={metric.score} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Next Audit: {new Date(metric.nextAudit).toLocaleDateString()}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          {complianceData.map((metric) => (
            <Card key={metric.standard}>
              <CardHeader>
                <CardTitle>{metric.standard} Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metric.requirements.map((req) => (
                    <div key={req.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{req.id}: {req.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                        </div>
                        <Badge className={getStatusColor(req.status === 'met' ? 'compliant' : req.status === 'partial' ? 'warning' : 'non-compliant')}>
                          {req.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Evidence:</p>
                        <div className="flex flex-wrap gap-1">
                          {req.evidence.map((evidence, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {evidence}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last Verified: {new Date(req.lastVerified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Audit Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.map((metric) => (
                  <div key={metric.standard} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{metric.standard}</p>
                      <p className="text-sm text-muted-foreground">
                        Last: {new Date(metric.lastAudit).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Next: {new Date(metric.nextAudit).toLocaleDateString()}</p>
                      <Badge variant={new Date(metric.nextAudit) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "destructive" : "secondary"}>
                        {new Date(metric.nextAudit) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "Due Soon" : "Scheduled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Items Required</AlertTitle>
            <AlertDescription>
              The following items require immediate attention to maintain compliance.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {complianceData
              .filter(metric => metric.status !== 'compliant')
              .map((metric) => (
                <Card key={metric.standard}>
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-700">{metric.standard}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {metric.requirements
                        .filter(req => req.status !== 'met')
                        .map((req) => (
                          <div key={req.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                            <span className="text-sm">{req.title}</span>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}