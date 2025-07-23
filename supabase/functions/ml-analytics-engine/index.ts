import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MLPrediction {
  model_name: string;
  prediction_type: string;
  input_features: Record<string, any>;
  prediction_result: any;
  confidence_score: number;
  anomaly_detected: boolean;
  recommendations: string[];
}

interface AnalyticsRequest {
  connection_id?: string;
  analysis_type: string;
  input_data: Record<string, any>;
  model_preferences?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { connection_id, analysis_type, input_data, model_preferences }: AnalyticsRequest = await req.json();

    console.log(`Processing ML analytics for type: ${analysis_type}`);

    // Run multiple ML models based on analysis type
    const predictions = await runMLAnalysis(analysis_type, input_data, model_preferences);
    
    // Detect anomalies across all predictions
    const anomalies = detectAnomalies(predictions, input_data);
    
    // Generate recommendations
    const recommendations = generateRecommendations(predictions, anomalies, analysis_type);
    
    // Calculate execution metrics
    const executionStartTime = Date.now();
    const confidence_scores = calculateConfidenceScores(predictions);
    const executionTime = Date.now() - executionStartTime;

    // Store advanced analytics results
    const { data: analyticsResult, error: analyticsError } = await supabase
      .from('advanced_analytics')
      .insert({
        connection_id,
        analysis_type,
        model_name: predictions.map(p => p.model_name).join(', '),
        input_data,
        predictions: predictions.map(p => p.prediction_result),
        confidence_scores,
        anomaly_detection: anomalies,
        recommendations,
        execution_time_ms: executionTime,
        accuracy_score: calculateOverallAccuracy(predictions)
      })
      .select()
      .single();

    if (analyticsError) {
      console.error('Error storing analytics result:', analyticsError);
    }

    // Generate real-time alerts if critical anomalies detected
    if (anomalies.critical_anomalies?.length > 0) {
      await generateCriticalAlert(supabase, connection_id, anomalies, analysis_type);
    }

    // Store performance metrics
    await storePerformanceMetrics(supabase, connection_id, predictions, input_data);

    console.log(`ML analytics completed. Models run: ${predictions.length}, Anomalies: ${anomalies.anomaly_count}`);

    return new Response(
      JSON.stringify({
        success: true,
        analytics_id: analyticsResult?.id,
        analysis_type,
        model_results: predictions,
        anomaly_detection: anomalies,
        recommendations,
        confidence_scores,
        execution_time_ms: executionTime,
        overall_accuracy: calculateOverallAccuracy(predictions),
        alerts_generated: anomalies.critical_anomalies?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ML Analytics Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process ML analytics',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function runMLAnalysis(
  analysisType: string, 
  inputData: Record<string, any>,
  modelPreferences?: string[]
): Promise<MLPrediction[]> {
  const predictions: MLPrediction[] = [];
  
  // Simulate advanced ML models based on analysis type
  switch (analysisType) {
    case 'power_grid_optimization':
      predictions.push(
        await runLoadForecastingModel(inputData),
        await runDemandPredictionModel(inputData),
        await runGridStabilityModel(inputData)
      );
      break;
      
    case 'predictive_maintenance':
      predictions.push(
        await runEquipmentFailureModel(inputData),
        await runMaintenanceSchedulingModel(inputData),
        await runLifespanPredictionModel(inputData)
      );
      break;
      
    case 'energy_optimization':
      predictions.push(
        await runEnergyEfficiencyModel(inputData),
        await runCostOptimizationModel(inputData),
        await runRenewableIntegrationModel(inputData)
      );
      break;
      
    case 'fault_detection':
      predictions.push(
        await runAnomalyDetectionModel(inputData),
        await runFaultClassificationModel(inputData),
        await runRootCauseAnalysisModel(inputData)
      );
      break;
      
    default:
      predictions.push(await runGeneralAnalyticsModel(inputData, analysisType));
  }
  
  return predictions;
}

async function runLoadForecastingModel(inputData: Record<string, any>): Promise<MLPrediction> {
  // Simulate advanced load forecasting with time series analysis
  const baseLoad = inputData.current_load || 1000;
  const timeHour = new Date().getHours();
  const seasonalFactor = Math.sin((timeHour / 24) * 2 * Math.PI) * 0.3 + 1;
  
  return {
    model_name: "LSTM_Load_Forecaster_v3.2",
    prediction_type: "load_forecasting",
    input_features: inputData,
    prediction_result: {
      next_hour_load: Math.round(baseLoad * seasonalFactor * (0.95 + Math.random() * 0.1)),
      next_day_peak: Math.round(baseLoad * 1.4 * (0.95 + Math.random() * 0.1)),
      weekly_trend: Math.random() > 0.5 ? "increasing" : "stable",
      confidence_interval: [baseLoad * 0.9, baseLoad * 1.1]
    },
    confidence_score: 0.87 + Math.random() * 0.1,
    anomaly_detected: Math.random() < 0.15,
    recommendations: [
      "Consider load balancing during peak hours",
      "Monitor transformer capacity utilization",
      "Implement demand response programs"
    ]
  };
}

async function runDemandPredictionModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Demand_Prophet_v2.1",
    prediction_type: "demand_prediction",
    input_features: inputData,
    prediction_result: {
      peak_demand_time: `${Math.floor(Math.random() * 4) + 17}:00`,
      demand_magnitude: Math.floor(Math.random() * 500) + 800,
      demand_duration: Math.floor(Math.random() * 120) + 60,
      probability_of_overload: Math.random() * 0.3
    },
    confidence_score: 0.82 + Math.random() * 0.15,
    anomaly_detected: Math.random() < 0.1,
    recommendations: [
      "Prepare backup generators for peak period",
      "Activate demand response protocols",
      "Monitor critical infrastructure closely"
    ]
  };
}

async function runGridStabilityModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Grid_Stability_Neural_Net_v4.0",
    prediction_type: "stability_analysis",
    input_features: inputData,
    prediction_result: {
      stability_score: Math.random() * 40 + 60,
      frequency_deviation: (Math.random() - 0.5) * 0.1,
      voltage_stability: Math.random() * 30 + 70,
      risk_level: Math.random() < 0.8 ? "low" : Math.random() < 0.95 ? "medium" : "high"
    },
    confidence_score: 0.91 + Math.random() * 0.08,
    anomaly_detected: Math.random() < 0.08,
    recommendations: [
      "Maintain reactive power reserves",
      "Monitor critical transmission lines",
      "Verify protective relay settings"
    ]
  };
}

async function runEquipmentFailureModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Equipment_Failure_XGBoost_v2.8",
    prediction_type: "failure_prediction",
    input_features: inputData,
    prediction_result: {
      failure_probability: Math.random() * 0.3,
      time_to_failure_days: Math.floor(Math.random() * 200) + 30,
      critical_components: ["transformer_oil", "cooling_system", "insulation"],
      maintenance_urgency: Math.random() < 0.7 ? "scheduled" : "immediate"
    },
    confidence_score: 0.78 + Math.random() * 0.2,
    anomaly_detected: Math.random() < 0.12,
    recommendations: [
      "Schedule preventive maintenance",
      "Order replacement components",
      "Increase monitoring frequency"
    ]
  };
}

async function runMaintenanceSchedulingModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Maintenance_Optimizer_v1.9",
    prediction_type: "maintenance_scheduling",
    input_features: inputData,
    prediction_result: {
      optimal_schedule: generateMaintenanceSchedule(),
      cost_savings: Math.floor(Math.random() * 50000) + 10000,
      downtime_reduction: Math.floor(Math.random() * 30) + 10,
      resource_allocation: generateResourceAllocation()
    },
    confidence_score: 0.84 + Math.random() * 0.12,
    anomaly_detected: false,
    recommendations: [
      "Coordinate with operations team",
      "Ensure spare parts availability",
      "Plan backup power arrangements"
    ]
  };
}

async function runLifespanPredictionModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Asset_Lifespan_Predictor_v3.1",
    prediction_type: "lifespan_prediction",
    input_features: inputData,
    prediction_result: {
      remaining_lifespan_years: Math.floor(Math.random() * 15) + 5,
      degradation_rate: Math.random() * 0.05 + 0.02,
      replacement_timeline: `Q${Math.floor(Math.random() * 4) + 1} ${new Date().getFullYear() + Math.floor(Math.random() * 3) + 2}`,
      condition_score: Math.random() * 40 + 60
    },
    confidence_score: 0.76 + Math.random() * 0.2,
    anomaly_detected: Math.random() < 0.05,
    recommendations: [
      "Plan for asset replacement",
      "Budget for future upgrades",
      "Consider technology improvements"
    ]
  };
}

async function runEnergyEfficiencyModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Energy_Efficiency_Optimizer_v2.3",
    prediction_type: "efficiency_optimization",
    input_features: inputData,
    prediction_result: {
      efficiency_score: Math.random() * 30 + 70,
      potential_savings: Math.floor(Math.random() * 25) + 5,
      optimization_opportunities: [
        "Smart grid integration",
        "Load balancing improvements",
        "Renewable energy integration"
      ],
      payback_period_months: Math.floor(Math.random() * 18) + 12
    },
    confidence_score: 0.89 + Math.random() * 0.1,
    anomaly_detected: Math.random() < 0.1,
    recommendations: [
      "Implement smart metering",
      "Optimize peak load management",
      "Enhance energy storage systems"
    ]
  };
}

async function runCostOptimizationModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Cost_Optimization_Engine_v1.7",
    prediction_type: "cost_optimization",
    input_features: inputData,
    prediction_result: {
      current_cost_per_kwh: (Math.random() * 0.05 + 0.08).toFixed(4),
      optimized_cost_per_kwh: (Math.random() * 0.03 + 0.06).toFixed(4),
      annual_savings: Math.floor(Math.random() * 100000) + 25000,
      roi_percentage: Math.floor(Math.random() * 25) + 15
    },
    confidence_score: 0.85 + Math.random() * 0.12,
    anomaly_detected: false,
    recommendations: [
      "Negotiate better energy contracts",
      "Implement time-of-use pricing",
      "Invest in energy storage"
    ]
  };
}

async function runRenewableIntegrationModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Renewable_Integration_AI_v2.0",
    prediction_type: "renewable_integration",
    input_features: inputData,
    prediction_result: {
      renewable_capacity_percentage: Math.floor(Math.random() * 40) + 30,
      grid_stability_impact: Math.random() < 0.8 ? "positive" : "neutral",
      integration_feasibility: Math.random() * 30 + 70,
      carbon_reduction_tons: Math.floor(Math.random() * 500) + 200
    },
    confidence_score: 0.82 + Math.random() * 0.15,
    anomaly_detected: Math.random() < 0.06,
    recommendations: [
      "Install battery storage systems",
      "Implement smart inverters",
      "Develop forecasting capabilities"
    ]
  };
}

async function runAnomalyDetectionModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Anomaly_Detection_Autoencoder_v3.4",
    prediction_type: "anomaly_detection",
    input_features: inputData,
    prediction_result: {
      anomaly_score: Math.random(),
      anomaly_type: ["voltage_spike", "frequency_deviation", "load_imbalance", "normal"][Math.floor(Math.random() * 4)],
      severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
      affected_components: generateAffectedComponents()
    },
    confidence_score: 0.93 + Math.random() * 0.06,
    anomaly_detected: Math.random() < 0.25,
    recommendations: [
      "Investigate root cause immediately",
      "Check protective devices",
      "Monitor system closely"
    ]
  };
}

async function runFaultClassificationModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Fault_Classifier_CNN_v2.6",
    prediction_type: "fault_classification",
    input_features: inputData,
    prediction_result: {
      fault_type: ["line_fault", "transformer_fault", "generator_fault", "no_fault"][Math.floor(Math.random() * 4)],
      fault_location: `Bus_${Math.floor(Math.random() * 10) + 1}`,
      fault_impedance: Math.random() * 5,
      clearing_time_ms: Math.floor(Math.random() * 100) + 50
    },
    confidence_score: 0.88 + Math.random() * 0.1,
    anomaly_detected: Math.random() < 0.2,
    recommendations: [
      "Dispatch maintenance crew",
      "Isolate affected section",
      "Restore service via alternate path"
    ]
  };
}

async function runRootCauseAnalysisModel(inputData: Record<string, any>): Promise<MLPrediction> {
  return {
    model_name: "Root_Cause_Analysis_v1.8",
    prediction_type: "root_cause_analysis",
    input_features: inputData,
    prediction_result: {
      primary_cause: ["equipment_aging", "overload", "weather", "maintenance_issue"][Math.floor(Math.random() * 4)],
      contributing_factors: ["high_demand", "temperature", "humidity", "vibration"],
      causality_score: Math.random() * 40 + 60,
      corrective_actions: generateCorrectiveActions()
    },
    confidence_score: 0.79 + Math.random() * 0.18,
    anomaly_detected: Math.random() < 0.15,
    recommendations: [
      "Address root cause systematically",
      "Implement preventive measures",
      "Update maintenance procedures"
    ]
  };
}

async function runGeneralAnalyticsModel(inputData: Record<string, any>, analysisType: string): Promise<MLPrediction> {
  return {
    model_name: "General_Analytics_v1.0",
    prediction_type: analysisType,
    input_features: inputData,
    prediction_result: {
      analysis_score: Math.random() * 100,
      trend: Math.random() > 0.5 ? "improving" : "declining",
      key_insights: [
        "Performance metrics within normal range",
        "Minor optimization opportunities identified",
        "System operating efficiently"
      ]
    },
    confidence_score: 0.75 + Math.random() * 0.2,
    anomaly_detected: Math.random() < 0.1,
    recommendations: [
      "Continue monitoring",
      "Review periodically",
      "Maintain current settings"
    ]
  };
}

function detectAnomalies(predictions: MLPrediction[], inputData: Record<string, any>) {
  const anomalies = predictions.filter(p => p.anomaly_detected);
  const criticalAnomalies = anomalies.filter(a => 
    a.prediction_result.severity === "critical" || 
    a.confidence_score > 0.9
  );
  
  return {
    anomaly_count: anomalies.length,
    critical_anomalies: criticalAnomalies.map(a => ({
      model: a.model_name,
      type: a.prediction_result.anomaly_type || "unknown",
      severity: a.prediction_result.severity || "medium",
      confidence: a.confidence_score
    })),
    anomaly_details: anomalies.map(a => a.prediction_result),
    risk_level: criticalAnomalies.length > 0 ? "high" : 
                anomalies.length > 2 ? "medium" : "low"
  };
}

function generateRecommendations(
  predictions: MLPrediction[], 
  anomalies: any, 
  analysisType: string
): string[] {
  const allRecommendations = predictions.flatMap(p => p.recommendations);
  const uniqueRecommendations = [...new Set(allRecommendations)];
  
  // Add context-specific recommendations
  if (anomalies.critical_anomalies?.length > 0) {
    uniqueRecommendations.unshift("URGENT: Investigate critical anomalies immediately");
  }
  
  if (analysisType === "power_grid_optimization") {
    uniqueRecommendations.push("Consider implementing advanced grid automation");
  }
  
  return uniqueRecommendations.slice(0, 8); // Limit to top 8 recommendations
}

function calculateConfidenceScores(predictions: MLPrediction[]) {
  return {
    average_confidence: predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length,
    min_confidence: Math.min(...predictions.map(p => p.confidence_score)),
    max_confidence: Math.max(...predictions.map(p => p.confidence_score)),
    confidence_distribution: predictions.map(p => ({
      model: p.model_name,
      confidence: p.confidence_score
    }))
  };
}

function calculateOverallAccuracy(predictions: MLPrediction[]): number {
  // Simulate accuracy based on confidence scores and model types
  const weightedAccuracy = predictions.reduce((acc, pred) => {
    const modelWeight = pred.model_name.includes("v3") || pred.model_name.includes("v4") ? 1.1 : 1.0;
    return acc + (pred.confidence_score * modelWeight);
  }, 0) / predictions.length;
  
  return Math.min(0.99, weightedAccuracy);
}

async function generateCriticalAlert(
  supabase: any, 
  connectionId: string | undefined, 
  anomalies: any, 
  analysisType: string
) {
  const criticalAnomaly = anomalies.critical_anomalies[0];
  
  await supabase.from('real_time_alerts').insert({
    connection_id: connectionId,
    alert_category: 'ml_analytics',
    severity_level: 'critical',
    title: `Critical Anomaly Detected - ${criticalAnomaly.type}`,
    description: `ML model ${criticalAnomaly.model} detected a critical anomaly with ${(criticalAnomaly.confidence * 100).toFixed(1)}% confidence during ${analysisType} analysis.`,
    affected_systems: [criticalAnomaly.model],
    detection_method: 'ml_analytics_engine',
    auto_resolution: false,
    escalation_rules: {
      escalate_after_minutes: 5,
      notification_levels: ['email', 'sms', 'dashboard']
    },
    notification_channels: ['dashboard', 'email']
  });
}

async function storePerformanceMetrics(
  supabase: any, 
  connectionId: string | undefined, 
  predictions: MLPrediction[], 
  inputData: Record<string, any>
) {
  const metrics = [
    {
      connection_id: connectionId,
      metric_category: 'ml_performance',
      metric_name: 'model_accuracy',
      current_value: calculateOverallAccuracy(predictions),
      unit_of_measure: 'percentage',
      data_source: 'ml_analytics_engine',
      collection_method: 'automated'
    },
    {
      connection_id: connectionId,
      metric_category: 'ml_performance',
      metric_name: 'prediction_confidence',
      current_value: predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length,
      unit_of_measure: 'score',
      data_source: 'ml_analytics_engine',
      collection_method: 'automated'
    },
    {
      connection_id: connectionId,
      metric_category: 'ml_performance',
      metric_name: 'anomaly_detection_rate',
      current_value: (predictions.filter(p => p.anomaly_detected).length / predictions.length) * 100,
      unit_of_measure: 'percentage',
      data_source: 'ml_analytics_engine',
      collection_method: 'automated'
    }
  ];

  await supabase.from('performance_metrics').insert(metrics);
}

function generateMaintenanceSchedule() {
  return {
    next_maintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    maintenance_type: ["preventive", "predictive", "corrective"][Math.floor(Math.random() * 3)],
    estimated_duration_hours: Math.floor(Math.random() * 8) + 2,
    required_crew_size: Math.floor(Math.random() * 4) + 2
  };
}

function generateResourceAllocation() {
  return {
    technicians_required: Math.floor(Math.random() * 4) + 2,
    equipment_needed: ["multimeter", "oscilloscope", "thermal_camera"],
    estimated_cost: Math.floor(Math.random() * 5000) + 1000,
    priority_level: ["low", "medium", "high"][Math.floor(Math.random() * 3)]
  };
}

function generateAffectedComponents() {
  const components = [
    "transformer_primary", "transformer_secondary", "cooling_system", 
    "protection_relay", "circuit_breaker", "busbar", "transmission_line"
  ];
  return components.slice(0, Math.floor(Math.random() * 3) + 1);
}

function generateCorrectiveActions() {
  return [
    "Replace aging components",
    "Adjust protection settings",
    "Improve cooling efficiency",
    "Update maintenance schedule",
    "Enhance monitoring systems"
  ].slice(0, Math.floor(Math.random() * 3) + 2);
}