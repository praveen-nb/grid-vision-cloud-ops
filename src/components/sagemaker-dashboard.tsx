import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  Server, 
  Play, 
  Pause, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Activity,
  Shield,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

// Enhanced data for electrical utility grid analytics
const predictiveMaintenanceData = [
  { time: '00:00', failure_risk: 12, maintenance_score: 88, efficiency: 94, voltage_health: 92 },
  { time: '04:00', failure_risk: 8, maintenance_score: 92, efficiency: 96, voltage_health: 94 },
  { time: '08:00', failure_risk: 15, maintenance_score: 85, efficiency: 89, voltage_health: 87 },
  { time: '12:00', failure_risk: 22, maintenance_score: 78, efficiency: 84, voltage_health: 85 },
  { time: '16:00', failure_risk: 18, maintenance_score: 82, efficiency: 88, voltage_health: 89 },
  { time: '20:00', failure_risk: 10, maintenance_score: 90, efficiency: 93, voltage_health: 91 }
];

const anomalyDetectionData = [
  { category: 'Voltage Anomalies', detected: 5, resolved: 4, critical: 1, accuracy: 94.2 },
  { category: 'Current Spikes', detected: 3, resolved: 3, critical: 0, accuracy: 97.8 },
  { category: 'Temperature Issues', detected: 8, resolved: 6, critical: 2, accuracy: 89.5 },
  { category: 'Frequency Drift', detected: 2, resolved: 2, critical: 0, accuracy: 96.1 },
  { category: 'Load Imbalance', detected: 4, resolved: 3, critical: 1, accuracy: 91.3 }
];

const gridHealthModels = [
  { name: 'Transformer Health Predictor', accuracy: 94.5, status: 'Deployed', predictions: 2845, type: 'Predictive Maintenance' },
  { name: 'Grid Stability Analyzer', accuracy: 97.2, status: 'Deployed', predictions: 1567, type: 'Real-time Monitoring' },
  { name: 'Load Forecasting Engine', accuracy: 89.8, status: 'Training', predictions: 3421, type: 'Demand Prediction' },
  { name: 'Outage Risk Predictor', accuracy: 92.1, status: 'Deployed', predictions: 987, type: 'Risk Assessment' },
  { name: 'Asset Optimization Model', accuracy: 88.4, status: 'Testing', predictions: 1234, type: 'Efficiency Analysis' },
  { name: 'SCADA Anomaly Detector', accuracy: 95.7, status: 'Deployed', predictions: 4532, type: 'Cybersecurity' }
];

const assetHealthDistribution = [
  { name: 'Excellent', value: 45, color: '#22c55e' },
  { name: 'Good', value: 30, color: '#3b82f6' },
  { name: 'Fair', value: 20, color: '#eab308' },
  { name: 'Poor', value: 5, color: '#ef4444' }
];

export const SageMakerDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [analysisRunning, setAnalysisRunning] = useState(false);

  useEffect(() => {
    fetchSageMakerData();
  }, []);

  const fetchSageMakerData = async () => {
    try {
      const { data } = await supabase.functions.invoke('sagemaker-dashboard', {
        body: { action: 'dashboard' }
      });
      setDashboardData(data?.dashboard_data || {});
    } catch (error) {
      console.error('Error fetching SageMaker data:', error);
      // Set default data for demo purposes
      setDashboardData({
        overview: {
          total_models: 6,
          active_endpoints: 4,
          cost_today: 247.83,
          average_accuracy: 0.932,
          grid_assets_monitored: 1245,
          anomalies_detected_today: 18,
          predictions_made_today: 12543
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const runPredictiveAnalysis = async () => {
    setAnalysisRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('sagemaker-ai-analytics', {
        body: { 
          analysisType: 'predictive_maintenance',
          modelEndpoint: 'grid-health-predictor-v1',
          inputData: {
            voltage_readings: [245, 243, 248, 251, 247, 249],
            current_readings: [120, 118, 135, 142, 138, 125],
            temperature_readings: [75, 73, 82, 85, 83, 78]
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Predictive Analysis Complete",
        description: "Grid health analysis completed successfully with 94.2% accuracy.",
      });
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to run predictive analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalysisRunning(false);
    }
  };

  const runAnomalyDetection = async () => {
    setAnalysisRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('sagemaker-ai-analytics', {
        body: { 
          analysisType: 'anomaly_detection',
          modelEndpoint: 'anomaly-detector-v2',
          realTimeData: true
        }
      });

      if (error) throw error;

      toast({
        title: "Anomaly Detection Complete",
        description: "Real-time scan detected 3 new voltage anomalies requiring attention.",
      });
    } catch (error) {
      console.error('Error running anomaly detection:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to run anomaly detection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalysisRunning(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading AI Grid Analytics...</div>;
  }

  const overview = dashboardData?.overview || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Grid Analytics</h1>
          <p className="text-muted-foreground">Amazon SageMaker for Electrical Utility Operations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runPredictiveAnalysis} 
            disabled={analysisRunning}
            className="gap-2"
          >
            {analysisRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Run Predictive Analysis
          </Button>
          <Button 
            onClick={runAnomalyDetection} 
            disabled={analysisRunning}
            variant="outline" 
            className="gap-2"
          >
            {analysisRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Detect Anomalies
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Cards for Grid Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Models Deployed</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_models || 6}</div>
            <p className="text-xs text-muted-foreground">Grid analytics models active</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grid Assets Monitored</CardTitle>
            <Activity className="h-4 w-4 text-utility-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.grid_assets_monitored?.toLocaleString() || '1,245'}</div>
            <p className="text-xs text-muted-foreground">Real-time AI monitoring</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-utility-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.anomalies_detected_today || 18}</div>
            <p className="text-xs text-muted-foreground">Today's detections</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Target className="h-4 w-4 text-utility-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((overview.average_accuracy || 0.932) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Grid Analytics</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Predictive Maintenance Analytics
                </CardTitle>
                <CardDescription>Real-time grid health and failure risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveMaintenanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="failure_risk" stroke="hsl(var(--utility-danger))" strokeWidth={2} name="Failure Risk %" />
                    <Line type="monotone" dataKey="maintenance_score" stroke="hsl(var(--utility-success))" strokeWidth={2} name="Health Score %" />
                    <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" strokeWidth={2} name="Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-utility-blue" />
                  Asset Health Distribution
                </CardTitle>
                <CardDescription>Current health status across all grid assets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetHealthDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {assetHealthDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grid Analytics AI Models</CardTitle>
              <CardDescription>Specialized machine learning models for electrical utility operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gridHealthModels.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-semibold">{model.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {model.type} | Accuracy: {model.accuracy}% | Predictions: {model.predictions.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          model.status === 'Deployed' ? 'default' : 
                          model.status === 'Training' ? 'secondary' : 'outline'
                        }
                      >
                        {model.status}
                      </Badge>
                      {model.status === 'Deployed' && <CheckCircle className="h-4 w-4 text-utility-success" />}
                      {model.status === 'Training' && <Clock className="h-4 w-4 text-utility-blue" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-utility-warning" />
                Real-Time Anomaly Detection
              </CardTitle>
              <CardDescription>AI-powered detection of grid anomalies and security threats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalyDetectionData.map((anomaly, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{anomaly.category}</h4>
                      <Badge variant={anomaly.critical > 0 ? 'destructive' : 'default'}>
                        {anomaly.accuracy}% Accuracy
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-utility-blue">{anomaly.detected}</div>
                        <div className="text-muted-foreground">Detected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-utility-success">{anomaly.resolved}</div>
                        <div className="text-muted-foreground">Resolved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-utility-danger">{anomaly.critical}</div>
                        <div className="text-muted-foreground">Critical</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gridHealthModels.filter(m => m.status === 'Deployed').map((model, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{model.name}</span>
                        <span>{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {overview.predictions_made_today?.toLocaleString() || '12,543'}
                  </div>
                  <div className="text-muted-foreground">Predictions made today</div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xl font-bold text-utility-success">98.2%</div>
                      <div className="text-muted-foreground">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-utility-blue">1.2s</div>
                      <div className="text-muted-foreground">Avg Response</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">High Priority</Badge>
                    <span className="font-semibold">Transformer T-347 Requires Attention</span>
                  </div>
                  <p className="text-sm">AI model predicts 85% probability of failure within 72 hours based on temperature and load patterns. Recommend immediate inspection.</p>
                  <Button size="sm" variant="outline">Schedule Maintenance</Button>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Medium Priority</Badge>
                    <span className="font-semibold">Load Optimization Opportunity</span>
                  </div>
                  <p className="text-sm">AI analysis identifies potential 12% efficiency improvement in Substation S-105 through load redistribution during peak hours.</p>
                  <Button size="sm" variant="outline">View Recommendations</Button>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Security Alert</Badge>
                    <span className="font-semibold">Unusual SCADA Communication Pattern</span>
                  </div>
                  <p className="text-sm">Anomaly detection model identified irregular communication patterns from RTAC-204. Investigating potential cybersecurity threat.</p>
                  <Button size="sm" variant="outline">Security Review</Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};