import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Eye, Lock, Activity, Users, Database, Network, Clock } from "lucide-react";

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'authentication' | 'access' | 'network' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  assignee?: string;
}

interface SecurityMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  incidents: number;
  lastUpdate: string;
}

export function SecurityMonitoringDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityData = async () => {
      setLoading(true);
      
      // Mock security events
      const mockEvents: SecurityEvent[] = [
        {
          id: "SEC-001",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'authentication',
          severity: 'high',
          source: "Authentication System",
          description: "Multiple failed login attempts detected from IP 192.168.1.100",
          status: 'investigating',
          assignee: "Security Team"
        },
        {
          id: "SEC-002",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'network',
          severity: 'medium',
          source: "Network Firewall",
          description: "Unusual traffic pattern detected on port 443",
          status: 'active'
        },
        {
          id: "SEC-003",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'access',
          severity: 'low',
          source: "Access Control",
          description: "User privilege escalation request",
          status: 'resolved',
          assignee: "Admin Team"
        }
      ];

      // Mock security metrics
      const mockMetrics: SecurityMetric[] = [
        {
          category: "Authentication Security",
          score: 92,
          trend: 'up',
          incidents: 3,
          lastUpdate: new Date().toISOString()
        },
        {
          category: "Network Security",
          score: 88,
          trend: 'stable',
          incidents: 1,
          lastUpdate: new Date().toISOString()
        },
        {
          category: "Data Protection",
          score: 95,
          trend: 'up',
          incidents: 0,
          lastUpdate: new Date().toISOString()
        },
        {
          category: "Access Control",
          score: 90,
          trend: 'down',
          incidents: 2,
          lastUpdate: new Date().toISOString()
        }
      ];

      setSecurityEvents(mockEvents);
      setSecurityMetrics(mockMetrics);
      setLoading(false);
    };

    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication':
        return <Users className="h-4 w-4" />;
      case 'access':
        return <Lock className="h-4 w-4" />;
      case 'network':
        return <Network className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'system':
        return <Activity className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const overallSecurityScore = securityMetrics.length > 0 
    ? securityMetrics.reduce((acc, metric) => acc + metric.score, 0) / securityMetrics.length 
    : 0;

  const activeThreats = securityEvents.filter(event => event.status === 'active').length;
  const investigatingThreats = securityEvents.filter(event => event.status === 'investigating').length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring</h1>
          <p className="text-muted-foreground">Real-time security threat detection and response</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Logs
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Report
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSecurityScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall security posture</p>
            <Progress value={overallSecurityScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeThreats}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Eye className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{investigatingThreats}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m ago</div>
            <p className="text-xs text-muted-foreground">Continuous monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {(activeThreats > 0 || investigatingThreats > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alerts Active</AlertTitle>
          <AlertDescription>
            {activeThreats > 0 && `${activeThreats} active threats require immediate attention. `}
            {investigatingThreats > 0 && `${investigatingThreats} threats are currently under investigation.`}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="metrics">Security Metrics</TabsTrigger>
          <TabsTrigger value="controls">Security Controls</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security incidents and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(event.type)}
                        <div>
                          <h4 className="font-semibold">{event.id}: {event.source}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                      {event.assignee && (
                        <span>Assigned to: {event.assignee}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {securityMetrics.map((metric) => (
              <Card key={metric.category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.category}</CardTitle>
                    <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}>
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                    </Badge>
                  </div>
                  <CardDescription>
                    Score: {metric.score}% | Incidents: {metric.incidents}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={metric.score} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Last Update: {new Date(metric.lastUpdate).toLocaleString()}</span>
                      <span>{metric.incidents === 0 ? 'No incidents' : `${metric.incidents} incident${metric.incidents > 1 ? 's' : ''}`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Access Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Multi-Factor Authentication</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Role-Based Access Control</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Session Management</span>
                    <Badge className="bg-green-100 text-green-800">Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Intrusion Detection</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Firewall Protection</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>VPN Security</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Review Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Encryption at Rest</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Encryption in Transit</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Backup Security</span>
                    <Badge className="bg-green-100 text-green-800">Secured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Monitoring Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Real-time Monitoring</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Audit Logging</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Threat Intelligence</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Updating</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies Status</CardTitle>
              <CardDescription>Current status of security policies and procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Information Security Policy", status: "Current", lastReview: "2024-01-15", nextReview: "2024-07-15" },
                  { name: "Access Control Policy", status: "Current", lastReview: "2024-01-10", nextReview: "2024-07-10" },
                  { name: "Incident Response Plan", status: "Review Due", lastReview: "2023-12-01", nextReview: "2024-06-01" },
                  { name: "Data Classification Policy", status: "Current", lastReview: "2024-01-20", nextReview: "2024-07-20" }
                ].map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last Review: {policy.lastReview}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={policy.status === "Current" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {policy.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Next: {policy.nextReview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}