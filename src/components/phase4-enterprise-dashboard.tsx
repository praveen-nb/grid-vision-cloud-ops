import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Key,
  Settings,
  BarChart3,
  Globe,
  Lock,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Phase4EnterpriseDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const fetchEnterpriseData = async () => {
    try {
      const { data } = await supabase.functions.invoke('enterprise-management', {
        body: { action: 'dashboard' }
      });
      setDashboardData(data.dashboard_data);
    } catch (error) {
      console.error('Error fetching enterprise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    try {
      const { data } = await supabase.functions.invoke('enterprise-management', {
        body: { 
          action: 'create_organization',
          organization_name: `New Organization ${Date.now()}`,
          subscription_tier: 'professional',
          max_users: 50
        }
      });
      fetchEnterpriseData(); // Refresh data
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Phase 4 Enterprise Dashboard...</div>;
  }

  const overview = dashboardData?.overview || {};
  const organizations = dashboardData?.organizations || [];
  const apiMetrics = dashboardData?.api_metrics || {};
  const securityOverview = dashboardData?.security_overview || {};
  const billingOverview = dashboardData?.billing_overview || {};
  const systemHealth = dashboardData?.system_health || {};
  const complianceStatus = dashboardData?.compliance_status || {};
  const recentActivities = dashboardData?.recent_activities || [];
  const alerts = dashboardData?.alerts || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 4: Enterprise Management</h1>
          <p className="text-muted-foreground">Multi-tenant architecture, advanced security, and enterprise integrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createOrganization} className="gap-2">
            <Building2 className="h-4 w-4" />
            Create Organization
          </Button>
          <Button onClick={fetchEnterpriseData} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_organizations}</div>
            <p className="text-xs text-muted-foreground">Multi-tenant clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.active_users}</div>
            <p className="text-xs text-muted-foreground">Across all orgs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_api_calls_today?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Platform usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.monthly_revenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Enterprise billing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.system_uptime?.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Infrastructure health</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.security_score}</div>
            <p className="text-xs text-muted-foreground">Security posture</p>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, index: number) => (
            <Alert key={index} className={alert.severity === 'high' ? 'border-red-500' : alert.severity === 'medium' ? 'border-orange-500' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{alert.title}</span>
                    <p className="text-sm">{alert.description}</p>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="organizations" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="api-management">API Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Organizations</CardTitle>
              <CardDescription>Multi-tenant organization management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.slice(0, 8).map((org: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{org.organization_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Code: {org.organization_code} | Tier: {org.subscription_tier} | 
                        Users: {Math.floor(Math.random() * org.max_users)}/{org.max_users}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Features: {Object.entries(org.features_enabled)
                          .filter(([_, enabled]) => enabled)
                          .map(([feature, _]) => feature.replace(/_/g, ' '))
                          .join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                        {org.status}
                      </Badge>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Calls</span>
                  <span className="font-bold">{apiMetrics.total_calls?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-bold">{((apiMetrics.successful_calls / apiMetrics.total_calls) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="font-bold">{apiMetrics.average_response_time?.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rate Limit Hits</span>
                  <span className="font-bold">{apiMetrics.rate_limit_hits}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiMetrics.top_endpoints?.map((endpoint: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate">{endpoint.endpoint}</span>
                      <span className="font-mono">{endpoint.calls.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Hourly Traffic Pattern</div>
                  <div className="h-20 flex items-end gap-1">
                    {apiMetrics.hourly_traffic?.slice(0, 12).map((hour: any, index: number) => (
                      <div
                        key={index}
                        className="bg-primary flex-1 rounded-t"
                        style={{ height: `${(hour.calls / 5000) * 100}%` }}
                        title={`${hour.hour}:00 - ${hour.calls} calls`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Security Score</span>
                    <span className="font-bold">{securityOverview.overall_score}/100</span>
                  </div>
                  <Progress value={securityOverview.overall_score} className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold">Threats Today</div>
                    <div className="text-2xl font-bold text-red-600">{securityOverview.threat_detections_today}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Blocked Attacks</div>
                    <div className="text-2xl font-bold text-green-600">{securityOverview.blocked_attacks}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Active Policies</div>
                    <div className="text-2xl font-bold">{securityOverview.security_policies_active}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Violations</div>
                    <div className="text-2xl font-bold text-orange-600">{securityOverview.compliance_violations}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Scan Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Last Scan</span>
                    <span className="text-sm">{new Date(securityOverview.vulnerability_scans?.last_scan).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Critical Issues</span>
                      <span className="font-bold">{securityOverview.vulnerability_scans?.critical_issues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-600">High Issues</span>
                      <span className="font-bold">{securityOverview.vulnerability_scans?.high_issues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-600">Medium Issues</span>
                      <span className="font-bold">{securityOverview.vulnerability_scans?.medium_issues}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">MFA Adoption Rate</div>
                    <Progress value={securityOverview.multi_factor_adoption} className="w-full" />
                    <div className="text-xs text-muted-foreground mt-1">{securityOverview.multi_factor_adoption?.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Revenue</span>
                  <span className="font-bold">${billingOverview.monthly_revenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Recurring</span>
                  <span className="font-bold">${billingOverview.annual_recurring_revenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Customer LTV</span>
                  <span className="font-bold">${billingOverview.customer_lifetime_value?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Churn Rate</span>
                  <span className="font-bold">{billingOverview.churn_rate?.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Basic</span>
                    <span className="font-bold">{billingOverview.subscription_breakdown?.basic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Professional</span>
                    <span className="font-bold">{billingOverview.subscription_breakdown?.professional}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Enterprise</span>
                    <span className="font-bold">{billingOverview.subscription_breakdown?.enterprise}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm">Upcoming Renewals</span>
                      <span className="font-bold">{billingOverview.upcoming_renewals}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span className="font-bold">{billingOverview.payment_success_rate?.toFixed(1)}%</span>
                    </div>
                    <Progress value={billingOverview.payment_success_rate} className="w-full" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overdue Invoices</span>
                    <span className="font-bold text-red-600">{billingOverview.overdue_invoices}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Compliance Score</span>
                      <span className="font-bold">{complianceStatus.overall_compliance_score}/100</span>
                    </div>
                    <Progress value={complianceStatus.overall_compliance_score} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    {Object.entries(complianceStatus.frameworks || {}).map(([framework, info]: [string, any]) => (
                      <div key={framework} className="flex justify-between">
                        <span className="text-sm">{framework}</span>
                        <Badge variant={info.status === 'compliant' ? 'default' : 'secondary'}>
                          {info.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(complianceStatus.data_classification || {}).map(([classification, count]: [string, any]) => (
                    <div key={classification} className="flex justify-between">
                      <span className="text-sm capitalize">{classification}</span>
                      <span className="font-bold">{count.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm">Audit Trail Completeness</span>
                      <span className="font-bold">{complianceStatus.audit_trail_completeness?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system-health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{systemHealth.infrastructure_status?.cpu_usage?.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.infrastructure_status?.cpu_usage} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{systemHealth.infrastructure_status?.memory_usage?.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.infrastructure_status?.memory_usage} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disk Usage</span>
                    <span>{systemHealth.infrastructure_status?.disk_usage?.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.infrastructure_status?.disk_usage} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Avg Query Time</span>
                  <span className="font-bold">{systemHealth.database_performance?.query_time_avg?.toFixed(1)}ms</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Connection Pool</span>
                    <span>{systemHealth.database_performance?.connection_pool_usage?.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.database_performance?.connection_pool_usage} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cache Hit Rate</span>
                    <span>{systemHealth.database_performance?.cache_hit_rate?.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.database_performance?.cache_hit_rate} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(systemHealth.service_status || {}).map(([service, status]: [string, any]) => (
                    <div key={service} className="flex justify-between">
                      <span className="text-sm capitalize">{service.replace('_', ' ')}</span>
                      <Badge variant={status === 'operational' ? 'default' : status === 'degraded' ? 'secondary' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()} | {activity.category}
                      </div>
                    </div>
                    <Badge variant={activity.severity === 'high' ? 'destructive' : activity.severity === 'medium' ? 'default' : 'secondary'}>
                      {activity.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};