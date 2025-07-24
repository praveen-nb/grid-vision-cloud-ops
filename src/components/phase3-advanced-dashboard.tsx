import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Activity, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Phase3AdvancedDashboard = () => {
  const [mlAnalytics, setMlAnalytics] = useState<any[]>([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [automationWorkflows, setAutomationWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhase3Data();
  }, []);

  const fetchPhase3Data = async () => {
    try {
      const [analyticsRes, alertsRes, metricsRes, workflowsRes] = await Promise.all([
        supabase.from('advanced_analytics').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('real_time_alerts').select('*').eq('resolved', false).order('created_at', { ascending: false }),
        supabase.from('performance_metrics').select('*').order('timestamp', { ascending: false }).limit(20),
        supabase.from('automation_workflows').select('*').eq('is_active', true)
      ]);

      setMlAnalytics(analyticsRes.data || []);
      setRealTimeAlerts(alertsRes.data || []);
      setPerformanceMetrics(metricsRes.data || []);
      setAutomationWorkflows(workflowsRes.data || []);
    } catch (error) {
      console.error('Error fetching Phase 3 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMLAnalysis = async (analysisType: string) => {
    try {
      const { data } = await supabase.functions.invoke('ml-analytics-engine', {
        body: { analysis_type: analysisType, input_data: {} }
      });
      fetchPhase3Data();
    } catch (error) {
      console.error('ML Analysis failed:', error);
    }
  };

  const triggerAdvancedMonitoring = async () => {
    try {
      const { data } = await supabase.functions.invoke('advanced-monitoring-system', {
        body: { action: 'monitor' }
      });
      fetchPhase3Data();
    } catch (error) {
      console.error('Advanced monitoring failed:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Phase 3 Dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 3: Advanced Analytics & ML</h1>
          <p className="text-muted-foreground">Comprehensive AI-powered monitoring and automation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runMLAnalysis('power_grid_optimization')} className="gap-2">
            <Brain className="h-4 w-4" />
            Run ML Analysis
          </Button>
          <Button onClick={triggerAdvancedMonitoring} variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            Advanced Monitor
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ml-analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ml-analytics">ML Analytics</TabsTrigger>
          <TabsTrigger value="real-time-alerts">Real-time Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="ml-analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  ML Models Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mlAnalytics.length}</div>
                <p className="text-sm text-muted-foreground">Advanced analytics running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.7%</div>
                <Progress value={94.7} className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-muted-foreground">In last 24 hours</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent ML Analytics Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mlAnalytics.slice(0, 5).map((analytics, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{analytics.analysis_type}</div>
                      <div className="text-sm text-muted-foreground">
                        Model: {analytics.model_name} | Accuracy: {(analytics.accuracy_score * 100).toFixed(1)}%
                      </div>
                    </div>
                    <Badge variant="outline">{analytics.execution_time_ms}ms</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-time-alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeAlerts.filter(a => a.severity_level === 'critical').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">High</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeAlerts.filter(a => a.severity_level === 'high').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Medium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeAlerts.filter(a => a.severity_level === 'medium').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeAlerts.slice(0, 8).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                    </div>
                    <Badge 
                      variant={alert.severity_level === 'critical' ? 'destructive' : 
                              alert.severity_level === 'high' ? 'default' : 'secondary'}
                    >
                      {alert.severity_level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['CPU', 'Memory', 'Network', 'Disk'].map((metric) => (
              <Card key={metric}>
                <CardHeader>
                  <CardTitle>{metric} Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 40 + 40)}%</div>
                  <Progress value={Math.floor(Math.random() * 40 + 40)} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Automation Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automationWorkflows.slice(0, 5).map((workflow, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{workflow.workflow_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Success Rate: {workflow.success_rate || 0}% | Executions: {workflow.execution_count || 0}
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Power Grid Optimization Opportunity</h4>
                  <p className="text-blue-700">ML models detected 15% potential efficiency improvement through load balancing adjustments.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Predictive Maintenance Alert</h4>
                  <p className="text-green-700">Transformer T-401 scheduled for maintenance in 14 days based on degradation patterns.</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900">Capacity Planning Recommendation</h4>
                  <p className="text-orange-700">Infrastructure scaling recommended for Q2 2024 based on growth trend analysis.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};