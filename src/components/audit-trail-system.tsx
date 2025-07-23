import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Filter, Download, Eye, User, Clock, Shield, Database } from "lucide-react";

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  sessionId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditSummary {
  totalEvents: number;
  uniqueUsers: number;
  successfulActions: number;
  failedActions: number;
  highRiskEvents: number;
  lastAuditDate: string;
}

export function AuditTrailSystem() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    const fetchAuditData = async () => {
      setLoading(true);
      
      // Mock audit events
      const mockEvents: AuditEvent[] = [
        {
          id: "AUD-001",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          userId: "user-001",
          userName: "John Doe",
          action: "system.login",
          resource: "authentication",
          outcome: 'success',
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          details: { loginMethod: "password", mfa: true },
          sessionId: "sess-001",
          riskLevel: 'low'
        },
        {
          id: "AUD-002",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: "user-002",
          userName: "Jane Smith",
          action: "data.export",
          resource: "system_data",
          resourceId: "dataset-001",
          outcome: 'success',
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0...",
          details: { exportFormat: "csv", recordCount: 1500 },
          sessionId: "sess-002",
          riskLevel: 'medium'
        },
        {
          id: "AUD-003",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          userId: "user-003",
          userName: "Bob Johnson",
          action: "user.privilege_escalation",
          resource: "user_management",
          resourceId: "user-004",
          outcome: 'failure',
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0...",
          details: { targetRole: "admin", reason: "insufficient_permissions" },
          sessionId: "sess-003",
          riskLevel: 'high'
        },
        {
          id: "AUD-004",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          userId: "user-001",
          userName: "John Doe",
          action: "config.modify",
          resource: "system_configuration",
          resourceId: "config-security",
          outcome: 'success',
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          details: { configSection: "security", changedFields: ["passwordPolicy", "sessionTimeout"] },
          sessionId: "sess-004",
          riskLevel: 'high'
        },
        {
          id: "AUD-005",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          userId: "user-005",
          userName: "Alice Wilson",
          action: "data.access",
          resource: "sensitive_data",
          resourceId: "customer-data",
          outcome: 'warning',
          ipAddress: "192.168.1.103",
          userAgent: "Mozilla/5.0...",
          details: { accessType: "read", dataClassification: "confidential", outsideBusinessHours: true },
          sessionId: "sess-005",
          riskLevel: 'medium'
        }
      ];

      // Mock audit summary
      const mockSummary: AuditSummary = {
        totalEvents: mockEvents.length,
        uniqueUsers: new Set(mockEvents.map(e => e.userId)).size,
        successfulActions: mockEvents.filter(e => e.outcome === 'success').length,
        failedActions: mockEvents.filter(e => e.outcome === 'failure').length,
        highRiskEvents: mockEvents.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length,
        lastAuditDate: new Date().toISOString()
      };

      setAuditEvents(mockEvents);
      setAuditSummary(mockSummary);
      setLoading(false);
    };

    fetchAuditData();
  }, []);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || event.action.startsWith(filterAction);
    const matchesOutcome = filterOutcome === 'all' || event.outcome === filterOutcome;
    const matchesRisk = filterRisk === 'all' || event.riskLevel === filterRisk;

    return matchesSearch && matchesAction && matchesOutcome && matchesRisk;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold">Audit Trail System</h1>
          <p className="text-muted-foreground">Comprehensive logging and monitoring of all system activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Audit Summary Cards */}
      {auditSummary && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{auditSummary.successfulActions}</div>
              <p className="text-xs text-muted-foreground">Success rate: {((auditSummary.successfulActions / auditSummary.totalEvents) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{auditSummary.failedActions}</div>
              <p className="text-xs text-muted-foreground">Failure rate: {((auditSummary.failedActions / auditSummary.totalEvents) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{auditSummary.highRiskEvents}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Now</div>
              <p className="text-xs text-muted-foreground">Real-time logging</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Audit Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="settings">Audit Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users, actions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="config">Configuration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Outcome</label>
                  <Select value={filterOutcome} onValueChange={setFilterOutcome}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Level</label>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterAction('all');
                      setFilterOutcome('all');
                      setFilterRisk('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Events ({filteredEvents.length})</CardTitle>
              <CardDescription>Detailed log of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{event.action}</h4>
                            <Badge className={getRiskColor(event.riskLevel)}>
                              {event.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            User: <span className="font-medium">{event.userName}</span> | 
                            Resource: <span className="font-medium">{event.resource}</span>
                            {event.resourceId && ` (${event.resourceId})`}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Timestamp: {new Date(event.timestamp).toLocaleString()}</div>
                            <div>IP: {event.ipAddress} | Session: {event.sessionId}</div>
                          </div>
                        </div>
                      </div>
                      <Badge className={getOutcomeColor(event.outcome)}>
                        {event.outcome.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {Object.keys(event.details).length > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm font-medium mb-2">Event Details:</p>
                        <div className="text-xs space-y-1">
                          {Object.entries(event.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity by Action Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['system', 'data', 'user', 'config'].map((actionType) => {
                    const count = auditEvents.filter(e => e.action.startsWith(actionType)).length;
                    const percentage = (count / auditEvents.length) * 100;
                    return (
                      <div key={actionType} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{actionType}</span>
                          <span>{count} events ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['low', 'medium', 'high', 'critical'].map((riskLevel) => {
                    const count = auditEvents.filter(e => e.riskLevel === riskLevel).length;
                    const percentage = (count / auditEvents.length) * 100;
                    return (
                      <div key={riskLevel} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{riskLevel} Risk</span>
                          <span>{count} events ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              riskLevel === 'critical' ? 'bg-red-500' :
                              riskLevel === 'high' ? 'bg-orange-500' :
                              riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reporting</CardTitle>
              <CardDescription>Generate compliance reports for regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Available Reports</h3>
                  {[
                    { name: "NERC CIP Audit Report", period: "Monthly", lastGenerated: "2024-01-15" },
                    { name: "SOX Compliance Report", period: "Quarterly", lastGenerated: "2024-01-01" },
                    { name: "FERC Security Report", period: "Annual", lastGenerated: "2024-01-01" },
                    { name: "Access Control Review", period: "Monthly", lastGenerated: "2024-01-15" }
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.period} | Last: {report.lastGenerated}
                        </p>
                      </div>
                      <Button size="sm">Generate</Button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Retention Policies</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>System Events</span>
                      <Badge variant="outline">7 years</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Authentication Events</span>
                      <Badge variant="outline">3 years</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Configuration Changes</span>
                      <Badge variant="outline">10 years</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Data Access Events</span>
                      <Badge variant="outline">5 years</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit System Configuration</CardTitle>
              <CardDescription>Configure audit logging and retention settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Logging Configuration</h3>
                  <div className="space-y-2">
                    {[
                      { setting: "Authentication Events", enabled: true },
                      { setting: "Data Access Events", enabled: true },
                      { setting: "Configuration Changes", enabled: true },
                      { setting: "User Management Events", enabled: true },
                      { setting: "System Events", enabled: true },
                      { setting: "API Access Events", enabled: false }
                    ].map((setting, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{setting.setting}</span>
                        <Badge className={setting.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {setting.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Alert Configuration</h3>
                  <div className="space-y-2">
                    {[
                      { alert: "High-Risk Events", threshold: "Immediate" },
                      { alert: "Failed Login Attempts", threshold: "5 attempts" },
                      { alert: "Privilege Escalation", threshold: "Any attempt" },
                      { alert: "After-Hours Access", threshold: "Any access" }
                    ].map((alert, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{alert.alert}</span>
                        <span className="text-sm text-muted-foreground">{alert.threshold}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}