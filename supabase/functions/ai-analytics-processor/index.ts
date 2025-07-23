import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricAnalysis {
  connectionId: string;
  metrics: any[];
  predictions: any[];
  anomalies: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('OpenAI API key not found, using simulated AI analytics');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting AI analytics processing...');

    // Get recent metrics for analysis (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recentMetrics, error: metricsError } = await supabase
      .from('grid_metrics')
      .select(`
        *,
        grid_connections!inner(id, name, type, status)
      `)
      .gte('timestamp', thirtyMinutesAgo)
      .order('timestamp', { ascending: false });

    if (metricsError) {
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
    }

    if (!recentMetrics || recentMetrics.length === 0) {
      return new Response(JSON.stringify({
        message: 'No recent metrics found for analysis',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing ${recentMetrics.length} recent metrics`);

    // Group metrics by connection
    const metricsByConnection = groupMetricsByConnection(recentMetrics);
    const analysisResults = [];

    for (const [connectionId, connectionMetrics] of Object.entries(metricsByConnection)) {
      const analysis = await performAIAnalysis(connectionMetrics, openAIApiKey);
      
      // Store AI analytics results
      for (const prediction of analysis.predictions) {
        const { error: analyticsError } = await supabase
          .from('ai_analytics')
          .insert({
            connection_id: connectionId,
            model_type: prediction.modelType,
            prediction_type: prediction.predictionType,
            confidence_score: prediction.confidence,
            prediction_data: prediction.data,
            is_anomaly: prediction.isAnomaly,
            severity_level: prediction.severity
          });

        if (analyticsError) {
          console.error('Error inserting AI analytics:', analyticsError);
        }
      }

      // Generate high-severity alerts for critical predictions
      for (const prediction of analysis.predictions) {
        if (prediction.isAnomaly && prediction.severity === 'high') {
          const { error: alertError } = await supabase
            .from('grid_alerts')
            .insert({
              connection_id: connectionId,
              alert_type: 'ai_anomaly_detected',
              severity: 'high',
              message: `AI detected ${prediction.predictionType}: ${prediction.data.summary || 'Critical anomaly detected'}`
            });

          if (alertError) {
            console.error('Error inserting AI alert:', alertError);
          }
        }
      }

      analysisResults.push({
        connectionId,
        predictionsGenerated: analysis.predictions.length,
        anomaliesDetected: analysis.predictions.filter(p => p.isAnomaly).length
      });
    }

    console.log(`AI analysis completed for ${analysisResults.length} connections`);

    return new Response(JSON.stringify({
      success: true,
      connectionsAnalyzed: analysisResults.length,
      totalPredictions: analysisResults.reduce((sum, r) => sum + r.predictionsGenerated, 0),
      totalAnomalies: analysisResults.reduce((sum, r) => sum + r.anomaliesDetected, 0),
      results: analysisResults,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-analytics-processor:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function groupMetricsByConnection(metrics: any[]) {
  return metrics.reduce((acc, metric) => {
    const connectionId = metric.connection_id;
    if (!acc[connectionId]) {
      acc[connectionId] = [];
    }
    acc[connectionId].push(metric);
    return acc;
  }, {} as Record<string, any[]>);
}

async function performAIAnalysis(metrics: any[], openAIApiKey?: string): Promise<MetricAnalysis> {
  const connectionId = metrics[0]?.connection_id;
  const connectionName = metrics[0]?.grid_connections?.name || 'Unknown';
  
  // Prepare data for analysis
  const analysisData = prepareMetricsForAnalysis(metrics);
  
  let predictions = [];
  
  if (openAIApiKey) {
    try {
      // Use OpenAI for enhanced analysis
      predictions = await generateAIPredictions(analysisData, openAIApiKey, connectionName);
    } catch (error) {
      console.error('OpenAI analysis failed, falling back to rule-based:', error);
      predictions = generateRuleBasedPredictions(analysisData, connectionName);
    }
  } else {
    // Use rule-based analysis
    predictions = generateRuleBasedPredictions(analysisData, connectionName);
  }

  return {
    connectionId,
    metrics,
    predictions,
    anomalies: predictions.filter(p => p.isAnomaly)
  };
}

function prepareMetricsForAnalysis(metrics: any[]) {
  const metricTypes = ['voltage', 'frequency', 'power', 'current', 'temperature', 'power_factor'];
  const analysis: Record<string, any> = {};

  for (const type of metricTypes) {
    const typeMetrics = metrics.filter(m => m.metric_type === type);
    if (typeMetrics.length > 0) {
      const values = typeMetrics.map(m => m.value);
      analysis[type] = {
        count: values.length,
        latest: values[0],
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        stdDev: calculateStandardDeviation(values),
        trend: calculateTrend(values),
        unit: typeMetrics[0].unit
      };
    }
  }

  return analysis;
}

async function generateAIPredictions(analysisData: any, apiKey: string, connectionName: string) {
  const prompt = `
You are an expert electrical grid analyst. Analyze this substation data and provide predictions:

Connection: ${connectionName}
Data Summary:
${JSON.stringify(analysisData, null, 2)}

Provide predictions for:
1. Equipment failure risk (next 7 days)
2. Maintenance needs assessment
3. Load forecasting (next 24 hours)
4. Anomaly detection

Format response as JSON array with objects containing:
- modelType: string
- predictionType: string
- confidence: number (0-1)
- isAnomaly: boolean
- severity: "low" | "medium" | "high"
- data: object with summary and details

Keep responses concise and actionable.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an AI analytics engine for electrical grid monitoring. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content);
    return generateRuleBasedPredictions(analysisData, connectionName);
  }
}

function generateRuleBasedPredictions(analysisData: any, connectionName: string) {
  const predictions = [];

  // Equipment failure prediction based on temperature and voltage
  if (analysisData.temperature && analysisData.voltage) {
    const tempRisk = analysisData.temperature.latest > 60 ? 0.8 : 0.2;
    const voltageRisk = Math.abs(analysisData.voltage.latest - 230) > 20 ? 0.7 : 0.1;
    const overallRisk = Math.max(tempRisk, voltageRisk);

    predictions.push({
      modelType: 'equipment_failure_prediction',
      predictionType: 'failure_risk_7_days',
      confidence: 0.75,
      isAnomaly: overallRisk > 0.6,
      severity: overallRisk > 0.7 ? 'high' : overallRisk > 0.4 ? 'medium' : 'low',
      data: {
        summary: `Equipment failure risk: ${(overallRisk * 100).toFixed(1)}%`,
        riskFactors: {
          temperature: tempRisk,
          voltage: voltageRisk
        },
        recommendation: overallRisk > 0.6 ? 'Schedule immediate inspection' : 'Normal monitoring'
      }
    });
  }

  // Load forecasting
  if (analysisData.power) {
    const currentLoad = analysisData.power.latest;
    const avgLoad = analysisData.power.average;
    const forecastLoad = avgLoad * (1 + Math.sin(Date.now() / 86400000) * 0.2); // Simple sinusoidal forecast

    predictions.push({
      modelType: 'load_forecasting',
      predictionType: 'load_forecast_24h',
      confidence: 0.65,
      isAnomaly: Math.abs(currentLoad - avgLoad) > avgLoad * 0.3,
      severity: 'low',
      data: {
        summary: `24h forecast: ${forecastLoad.toFixed(1)}kW`,
        currentLoad,
        forecastLoad,
        trend: analysisData.power.trend
      }
    });
  }

  // Frequency stability analysis
  if (analysisData.frequency) {
    const freqDeviation = Math.abs(analysisData.frequency.latest - 50.0);
    const isUnstable = freqDeviation > 0.2;

    predictions.push({
      modelType: 'frequency_stability',
      predictionType: 'grid_stability_assessment',
      confidence: 0.85,
      isAnomaly: isUnstable,
      severity: isUnstable ? 'medium' : 'low',
      data: {
        summary: `Grid frequency: ${analysisData.frequency.latest.toFixed(2)}Hz`,
        deviation: freqDeviation,
        stability: isUnstable ? 'Unstable' : 'Stable'
      }
    });
  }

  return predictions;
}

function calculateStandardDeviation(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(Math.floor(values.length / 2));
  const secondHalf = values.slice(0, Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = (firstAvg - secondAvg) / secondAvg;
  
  if (change > 0.05) return 'increasing';
  if (change < -0.05) return 'decreasing';
  return 'stable';
}