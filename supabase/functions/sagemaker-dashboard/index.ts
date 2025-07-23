import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SageMakerModel {
  modelName: string;
  modelArn: string;
  status: string;
  creationTime: string;
  lastUpdated: string;
  instanceType: string;
  accuracy: number;
  trainingJobs: number;
  predictions: number;
  costPerHour: number;
  dataProcessed: number;
}

interface SageMakerEndpoint {
  endpointName: string;
  endpointArn: string;
  status: string;
  instanceType: string;
  instanceCount: number;
  lastInvoked: string;
  invocationsPerMinute: number;
  averageLatency: number;
  errorRate: number;
}

interface TrainingJob {
  trainingJobName: string;
  status: string;
  algorithm: string;
  instanceType: string;
  instanceCount: number;
  startTime: string;
  endTime?: string;
  duration: number;
  accuracy: number;
  cost: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard':
        return await getSageMakerDashboard(req, supabase);
      case 'models':
        return await getSageMakerModels(req, supabase);
      case 'endpoints':
        return await getSageMakerEndpoints(req, supabase);
      case 'training':
        return await getTrainingJobs(req, supabase);
      case 'deploy_model':
        return await deployModel(req, supabase);
      case 'create_endpoint':
        return await createEndpoint(req, supabase);
      case 'start_training':
        return await startTrainingJob(req, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('SageMaker Dashboard Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process SageMaker request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getSageMakerDashboard(req: Request, supabase: any) {
  console.log('Fetching SageMaker dashboard data...');

  // Simulate comprehensive SageMaker dashboard data
  const models = await generateSageMakerModels();
  const endpoints = await generateSageMakerEndpoints();
  const trainingJobs = await generateTrainingJobs();
  const analytics = await generateSageMakerAnalytics();
  const costs = await generateCostAnalysis();
  const performance = await generatePerformanceMetrics();

  const dashboardData = {
    overview: {
      total_models: models.length,
      active_endpoints: endpoints.filter(e => e.status === 'InService').length,
      running_training_jobs: trainingJobs.filter(t => t.status === 'InProgress').length,
      total_predictions_today: analytics.total_predictions,
      cost_today: costs.daily_cost,
      average_accuracy: models.reduce((sum, m) => sum + m.accuracy, 0) / models.length
    },
    models: models,
    endpoints: endpoints,
    training_jobs: trainingJobs.slice(0, 10), // Recent training jobs
    analytics: analytics,
    cost_analysis: costs,
    performance_metrics: performance,
    recommendations: generateRecommendations(models, endpoints, trainingJobs)
  };

  // Store analytics data
  await storeSageMakerAnalytics(supabase, dashboardData);

  console.log(`SageMaker dashboard generated. Models: ${models.length}, Endpoints: ${endpoints.length}`);

  return new Response(
    JSON.stringify({
      success: true,
      dashboard_data: dashboardData,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateSageMakerModels(): Promise<SageMakerModel[]> {
  const modelTypes = [
    'power-grid-forecasting-lstm',
    'equipment-failure-prediction-xgb',
    'energy-optimization-neural-net',
    'load-balancing-autoencoder',
    'anomaly-detection-isolation-forest',
    'demand-prediction-prophet',
    'maintenance-scheduling-rf',
    'grid-stability-svm'
  ];

  return modelTypes.map((modelType, index) => ({
    modelName: modelType,
    modelArn: `arn:aws:sagemaker:us-east-1:123456789012:model/${modelType}`,
    status: Math.random() > 0.1 ? 'InService' : 'Creating',
    creationTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    instanceType: ['ml.m5.large', 'ml.m5.xlarge', 'ml.c5.2xlarge'][Math.floor(Math.random() * 3)],
    accuracy: Math.random() * 0.15 + 0.85, // 85-100% accuracy
    trainingJobs: Math.floor(Math.random() * 10) + 1,
    predictions: Math.floor(Math.random() * 10000) + 1000,
    costPerHour: Math.random() * 2 + 0.5, // $0.5-$2.5 per hour
    dataProcessed: Math.random() * 1000 + 100 // GB
  }));
}

async function generateSageMakerEndpoints(): Promise<SageMakerEndpoint[]> {
  const endpointNames = [
    'power-forecasting-endpoint',
    'failure-prediction-endpoint',
    'anomaly-detection-endpoint',
    'load-optimization-endpoint',
    'energy-efficiency-endpoint'
  ];

  return endpointNames.map(name => ({
    endpointName: name,
    endpointArn: `arn:aws:sagemaker:us-east-1:123456789012:endpoint/${name}`,
    status: Math.random() > 0.15 ? 'InService' : Math.random() > 0.5 ? 'Creating' : 'Updating',
    instanceType: ['ml.m5.large', 'ml.m5.xlarge', 'ml.c5.xlarge'][Math.floor(Math.random() * 3)],
    instanceCount: Math.floor(Math.random() * 3) + 1,
    lastInvoked: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
    invocationsPerMinute: Math.floor(Math.random() * 100) + 10,
    averageLatency: Math.random() * 200 + 50, // 50-250ms
    errorRate: Math.random() * 5 // 0-5% error rate
  }));
}

async function generateTrainingJobs(): Promise<TrainingJob[]> {
  const algorithms = [
    'XGBoost', 'Linear Learner', 'DeepAR', 'BlazingText', 
    'Object2Vec', 'Random Cut Forest', 'K-Means', 'PCA'
  ];

  return Array.from({ length: 15 }, (_, index) => {
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const duration = Math.random() * 180 + 30; // 30-210 minutes
    const status = Math.random() > 0.8 ? 'InProgress' : Math.random() > 0.1 ? 'Completed' : 'Failed';
    
    return {
      trainingJobName: `training-job-${index + 1}-${Date.now()}`,
      status,
      algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
      instanceType: ['ml.m5.large', 'ml.m5.xlarge', 'ml.p3.2xlarge'][Math.floor(Math.random() * 3)],
      instanceCount: Math.floor(Math.random() * 4) + 1,
      startTime: startTime.toISOString(),
      endTime: status === 'Completed' ? new Date(startTime.getTime() + duration * 60 * 1000).toISOString() : undefined,
      duration: Math.floor(duration),
      accuracy: status === 'Completed' ? Math.random() * 0.2 + 0.8 : 0,
      cost: Math.random() * 50 + 10 // $10-$60
    };
  });
}

async function generateSageMakerAnalytics() {
  return {
    total_predictions: Math.floor(Math.random() * 50000) + 10000,
    successful_predictions: Math.floor(Math.random() * 48000) + 9500,
    failed_predictions: Math.floor(Math.random() * 500) + 50,
    average_response_time: Math.random() * 100 + 75, // 75-175ms
    peak_usage_hour: Math.floor(Math.random() * 24),
    data_processed_gb: Math.random() * 500 + 100,
    model_accuracy_trend: 'improving',
    usage_trend: 'increasing',
    cost_efficiency_score: Math.random() * 20 + 80 // 80-100
  };
}

async function generateCostAnalysis() {
  const dailyCost = Math.random() * 200 + 100; // $100-$300 per day
  
  return {
    daily_cost: dailyCost,
    monthly_projection: dailyCost * 30,
    quarterly_projection: dailyCost * 90,
    cost_by_service: {
      training: dailyCost * 0.4,
      inference: dailyCost * 0.45,
      storage: dailyCost * 0.1,
      data_transfer: dailyCost * 0.05
    },
    cost_optimization_opportunities: [
      'Switch to Spot instances for training jobs',
      'Use multi-model endpoints for similar models',
      'Implement auto-scaling for inference endpoints',
      'Archive old model artifacts to cheaper storage'
    ],
    potential_monthly_savings: Math.random() * 500 + 200
  };
}

async function generatePerformanceMetrics() {
  return {
    inference_latency: {
      p50: Math.random() * 50 + 25,
      p95: Math.random() * 100 + 75,
      p99: Math.random() * 200 + 150
    },
    throughput: {
      requests_per_second: Math.random() * 100 + 50,
      peak_rps: Math.random() * 200 + 150
    },
    error_rates: {
      client_errors: Math.random() * 2,
      server_errors: Math.random() * 1,
      timeout_errors: Math.random() * 0.5
    },
    resource_utilization: {
      cpu_usage: Math.random() * 40 + 40, // 40-80%
      memory_usage: Math.random() * 30 + 50, // 50-80%
      gpu_usage: Math.random() * 60 + 20 // 20-80%
    }
  };
}

function generateRecommendations(models: SageMakerModel[], endpoints: SageMakerEndpoint[], trainingJobs: TrainingJob[]) {
  const recommendations = [];
  
  // Performance recommendations
  if (models.some(m => m.accuracy < 0.9)) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Improve Model Accuracy',
      description: 'Some models have accuracy below 90%. Consider retraining with more data or feature engineering.',
      action: 'Retrain low-performing models'
    });
  }

  // Cost optimization
  if (endpoints.some(e => e.invocationsPerMinute < 10)) {
    recommendations.push({
      type: 'cost',
      priority: 'medium',
      title: 'Optimize Underutilized Endpoints',
      description: 'Some endpoints have low usage. Consider using multi-model endpoints or serverless inference.',
      action: 'Review endpoint utilization'
    });
  }

  // Infrastructure recommendations
  if (endpoints.some(e => e.averageLatency > 200)) {
    recommendations.push({
      type: 'infrastructure',
      priority: 'high',
      title: 'Reduce Inference Latency',
      description: 'High latency detected on some endpoints. Consider upgrading instance types or optimizing models.',
      action: 'Upgrade instance types'
    });
  }

  // Training optimization
  const recentFailures = trainingJobs.filter(t => t.status === 'Failed').length;
  if (recentFailures > 2) {
    recommendations.push({
      type: 'training',
      priority: 'medium',
      title: 'Address Training Job Failures',
      description: `${recentFailures} training jobs failed recently. Review logs and adjust hyperparameters.`,
      action: 'Debug failed training jobs'
    });
  }

  // Security recommendations
  recommendations.push({
    type: 'security',
    priority: 'medium',
    title: 'Enable Model Monitoring',
    description: 'Implement model monitoring to detect data drift and model degradation.',
    action: 'Set up Amazon SageMaker Model Monitor'
  });

  return recommendations;
}

async function storeSageMakerAnalytics(supabase: any, dashboardData: any) {
  // Store key metrics in performance_metrics table
  const metrics = [
    {
      metric_category: 'sagemaker',
      metric_name: 'total_models',
      current_value: dashboardData.overview.total_models,
      unit_of_measure: 'count',
      data_source: 'sagemaker_dashboard',
      collection_method: 'automated'
    },
    {
      metric_category: 'sagemaker',
      metric_name: 'active_endpoints',
      current_value: dashboardData.overview.active_endpoints,
      unit_of_measure: 'count',
      data_source: 'sagemaker_dashboard',
      collection_method: 'automated'
    },
    {
      metric_category: 'sagemaker',
      metric_name: 'average_accuracy',
      current_value: dashboardData.overview.average_accuracy,
      unit_of_measure: 'percentage',
      data_source: 'sagemaker_dashboard',
      collection_method: 'automated'
    },
    {
      metric_category: 'sagemaker',
      metric_name: 'daily_cost',
      current_value: dashboardData.cost_analysis.daily_cost,
      unit_of_measure: 'usd',
      data_source: 'sagemaker_dashboard',
      collection_method: 'automated'
    }
  ];

  await supabase.from('performance_metrics').insert(metrics);
}

async function getSageMakerModels(req: Request, supabase: any) {
  const models = await generateSageMakerModels();
  
  return new Response(
    JSON.stringify({
      success: true,
      models: models,
      total_models: models.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSageMakerEndpoints(req: Request, supabase: any) {
  const endpoints = await generateSageMakerEndpoints();
  
  return new Response(
    JSON.stringify({
      success: true,
      endpoints: endpoints,
      total_endpoints: endpoints.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTrainingJobs(req: Request, supabase: any) {
  const trainingJobs = await generateTrainingJobs();
  
  return new Response(
    JSON.stringify({
      success: true,
      training_jobs: trainingJobs,
      total_jobs: trainingJobs.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deployModel(req: Request, supabase: any) {
  const { model_name, instance_type, instance_count } = await req.json();
  
  console.log(`Deploying model ${model_name} to ${instance_type} instances...`);
  
  // Simulate model deployment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const endpointName = `${model_name}-endpoint-${Date.now()}`;
  
  // Log the deployment action
  await supabase.from('audit_trail').insert({
    action_type: 'model_deployment',
    resource_type: 'sagemaker_model',
    resource_id: model_name,
    action_details: {
      endpoint_name: endpointName,
      instance_type,
      instance_count,
      deployment_time: new Date().toISOString()
    },
    outcome: 'success'
  });

  return new Response(
    JSON.stringify({
      success: true,
      endpoint_name: endpointName,
      status: 'Creating',
      estimated_ready_time: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createEndpoint(req: Request, supabase: any) {
  const { endpoint_name, model_name, instance_type, instance_count } = await req.json();
  
  console.log(`Creating endpoint ${endpoint_name} for model ${model_name}...`);
  
  // Simulate endpoint creation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Log the creation action
  await supabase.from('audit_trail').insert({
    action_type: 'endpoint_creation',
    resource_type: 'sagemaker_endpoint',
    resource_id: endpoint_name,
    action_details: {
      model_name,
      instance_type,
      instance_count,
      creation_time: new Date().toISOString()
    },
    outcome: 'success'
  });

  return new Response(
    JSON.stringify({
      success: true,
      endpoint_name,
      endpoint_arn: `arn:aws:sagemaker:us-east-1:123456789012:endpoint/${endpoint_name}`,
      status: 'Creating',
      estimated_ready_time: new Date(Date.now() + 8 * 60 * 1000).toISOString() // 8 minutes
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function startTrainingJob(req: Request, supabase: any) {
  const { job_name, algorithm, instance_type, instance_count, hyperparameters } = await req.json();
  
  console.log(`Starting training job ${job_name} with ${algorithm}...`);
  
  // Simulate training job start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const trainingJobArn = `arn:aws:sagemaker:us-east-1:123456789012:training-job/${job_name}`;
  
  // Log the training job
  await supabase.from('audit_trail').insert({
    action_type: 'training_job_start',
    resource_type: 'sagemaker_training_job',
    resource_id: job_name,
    action_details: {
      algorithm,
      instance_type,
      instance_count,
      hyperparameters,
      start_time: new Date().toISOString()
    },
    outcome: 'success'
  });

  return new Response(
    JSON.stringify({
      success: true,
      training_job_name: job_name,
      training_job_arn: trainingJobArn,
      status: 'InProgress',
      estimated_completion_time: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}