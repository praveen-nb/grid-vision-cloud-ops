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
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SageMakerDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchSageMakerData();
  }, []);

  const fetchSageMakerData = async () => {
    try {
      const { data } = await supabase.functions.invoke('sagemaker-dashboard', {
        body: { action: 'dashboard' }
      });
      setDashboardData(data.dashboard_data);
    } catch (error) {
      console.error('Error fetching SageMaker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deployModel = async (modelName: string) => {
    try {
      const { data } = await supabase.functions.invoke('sagemaker-dashboard', {
        body: { 
          action: 'deploy_model',
          model_name: modelName,
          instance_type: 'ml.m5.large',
          instance_count: 1
        }
      });
      console.log('Model deployment started:', data);
      fetchSageMakerData(); // Refresh data
    } catch (error) {
      console.error('Error deploying model:', error);
    }
  };

  const startTrainingJob = async () => {
    try {
      const { data } = await supabase.functions.invoke('sagemaker-dashboard', {
        body: { 
          action: 'start_training',
          job_name: `training-job-${Date.now()}`,
          algorithm: 'XGBoost',
          instance_type: 'ml.m5.large',
          instance_count: 1,
          hyperparameters: { max_depth: 6, num_round: 100 }
        }
      });
      console.log('Training job started:', data);
      fetchSageMakerData(); // Refresh data
    } catch (error) {
      console.error('Error starting training job:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading SageMaker Dashboard...</div>;
  }

  const overview = dashboardData?.overview || {};
  const models = dashboardData?.models || [];
  const endpoints = dashboardData?.endpoints || [];
  const trainingJobs = dashboardData?.training_jobs || [];
  const costAnalysis = dashboardData?.cost_analysis || {};
  const recommendations = dashboardData?.recommendations || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Amazon SageMaker Dashboard</h1>
          <p className="text-muted-foreground">Machine Learning model management and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={startTrainingJob} className="gap-2">
            <Play className="h-4 w-4" />
            Start Training
          </Button>
          <Button onClick={fetchSageMakerData} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_models}</div>
            <p className="text-xs text-muted-foreground">Machine learning models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.active_endpoints}</div>
            <p className="text-xs text-muted-foreground">Inference endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.cost_today?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Today's spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overview.average_accuracy * 100)?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Model performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ML Models</CardTitle>
              <CardDescription>Trained machine learning models available for deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.slice(0, 8).map((model: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{model.modelName}</div>
                      <div className="text-sm text-muted-foreground">
                        Accuracy: {(model.accuracy * 100).toFixed(1)}% | 
                        Instance: {model.instanceType} | 
                        Cost: ${model.costPerHour.toFixed(2)}/hr
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Predictions: {model.predictions.toLocaleString()} | 
                        Data: {model.dataProcessed.toFixed(1)}GB
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={model.status === 'InService' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                      {model.status === 'InService' && (
                        <Button 
                          size="sm" 
                          onClick={() => deployModel(model.modelName)}
                          className="gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Deploy
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inference Endpoints</CardTitle>
              <CardDescription>Real-time prediction endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{endpoint.endpointName}</div>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.instanceType} × {endpoint.instanceCount} | 
                        Latency: {endpoint.averageLatency.toFixed(0)}ms | 
                        RPS: {endpoint.invocationsPerMinute}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Error Rate: {endpoint.errorRate.toFixed(2)}% | 
                        Last Invoked: {new Date(endpoint.lastInvoked).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          endpoint.status === 'InService' ? 'default' : 
                          endpoint.status === 'Creating' ? 'secondary' : 'outline'
                        }
                      >
                        {endpoint.status}
                      </Badge>
                      {endpoint.status === 'InService' && endpoint.averageLatency > 200 && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>Model training job history and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingJobs.map((job: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{job.trainingJobName}</div>
                      <div className="text-sm text-muted-foreground">
                        Algorithm: {job.algorithm} | 
                        Instance: {job.instanceType} × {job.instanceCount} | 
                        Duration: {job.duration}min
                      </div>
                      {job.status === 'Completed' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Accuracy: {(job.accuracy * 100).toFixed(1)}% | 
                          Cost: ${job.cost.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          job.status === 'Completed' ? 'default' : 
                          job.status === 'InProgress' ? 'secondary' : 'destructive'
                        }
                      >
                        {job.status}
                      </Badge>
                      {job.status === 'Completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {job.status === 'InProgress' && <Clock className="h-4 w-4 text-blue-500" />}
                      {job.status === 'Failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Training</span>
                    <span>${costAnalysis.cost_by_service?.training?.toFixed(2)}</span>
                  </div>
                  <Progress value={40} className="w-full mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Inference</span>
                    <span>${costAnalysis.cost_by_service?.inference?.toFixed(2)}</span>
                  </div>
                  <Progress value={45} className="w-full mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>${costAnalysis.cost_by_service?.storage?.toFixed(2)}</span>
                  </div>
                  <Progress value={10} className="w-full mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Data Transfer</span>
                    <span>${costAnalysis.cost_by_service?.data_transfer?.toFixed(2)}</span>
                  </div>
                  <Progress value={5} className="w-full mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Projection</span>
                    <span className="font-bold">${costAnalysis.monthly_projection?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quarterly Projection</span>
                    <span className="font-bold">${costAnalysis.quarterly_projection?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Potential Savings</span>
                    <span className="font-bold">${costAnalysis.potential_monthly_savings?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {costAnalysis.cost_optimization_opportunities?.map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{opportunity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {recommendations.map((rec: any, index: number) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                      <span className="font-semibold">{rec.title}</span>
                    </div>
                    <p className="text-sm">{rec.description}</p>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};