import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRequest {
  connectionId: string;
  assetId?: string;
  predictionType: 'failure' | 'maintenance' | 'load_forecast' | 'anomaly';
  timeHorizon?: number; // days
  includeConfidence?: boolean;
}

interface MetricData {
  timestamp: string;
  value: number;
  metric_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Predictive Analytics Engine request received');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const predictionRequest: PredictionRequest = await req.json();
    console.log('Prediction request:', predictionRequest);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Verify user owns the connection
    const { data: connection, error: connError } = await supabase
      .from('grid_connections')
      .select('*')
      .eq('id', predictionRequest.connectionId)
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      throw new Error('Connection not found or access denied');
    }

    // Gather historical data for prediction
    const historicalData = await gatherHistoricalData(supabase, predictionRequest);
    console.log(`Gathered ${historicalData.length} historical data points`);

    // Generate prediction using OpenAI
    const prediction = await generatePrediction(openAIApiKey, predictionRequest, historicalData, connection);

    // Store prediction in database
    const { data: storedPrediction, error: storeError } = await supabase
      .from('predictive_analytics')
      .insert({
        connection_id: predictionRequest.connectionId,
        asset_id: predictionRequest.assetId || connection.name,
        prediction_type: predictionRequest.predictionType,
        probability: prediction.probability,
        confidence_score: prediction.confidence,
        predicted_date: prediction.predictedDate,
        input_features: prediction.inputFeatures,
        model_version: 'gpt-4o-analytics-v1'
      })
      .select()
      .single();

    if (storeError) {
      console.error('Error storing prediction:', storeError);
    }

    // Start background task for additional analysis
    EdgeRuntime.waitUntil(runBackgroundAnalysis(supabase, predictionRequest, prediction));

    return new Response(JSON.stringify({
      success: true,
      prediction: {
        id: storedPrediction?.id,
        type: predictionRequest.predictionType,
        probability: prediction.probability,
        confidence: prediction.confidence,
        predictedDate: prediction.predictedDate,
        recommendations: prediction.recommendations,
        riskLevel: prediction.riskLevel,
        insights: prediction.insights
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in Predictive Analytics Engine:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function gatherHistoricalData(supabase: any, request: PredictionRequest): Promise<MetricData[]> {
  const timeRange = new Date(Date.now() - (request.timeHorizon || 30) * 24 * 60 * 60 * 1000);
  
  const { data: metrics, error } = await supabase
    .from('grid_metrics')
    .select('timestamp, value, metric_type')
    .eq('connection_id', request.connectionId)
    .gte('timestamp', timeRange.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }

  return metrics || [];
}

async function generatePrediction(
  apiKey: string, 
  request: PredictionRequest, 
  historicalData: MetricData[],
  connection: any
) {
  const systemPrompt = `You are an expert electrical grid analytics AI specialized in predictive maintenance and failure analysis. 

Analyze the provided grid metrics data and generate accurate predictions for ${request.predictionType}.

Historical Data Summary:
- Connection: ${connection.name} (${connection.type})
- Location: ${connection.location}
- Voltage Rating: ${connection.voltage}V
- Frequency: ${connection.frequency}Hz
- Data Points: ${historicalData.length}

For ${request.predictionType} prediction, consider:
- Voltage fluctuations and stability
- Temperature trends and thermal stress
- Power quality indicators
- Historical failure patterns
- Seasonal variations
- Equipment age and maintenance history

Provide probability as a decimal (0.0-1.0), confidence as percentage, and specific actionable recommendations.

Response format:
{
  "probability": 0.0-1.0,
  "confidence": 0-100,
  "predicted_date": "ISO date string",
  "risk_level": "low|medium|high|critical",
  "recommendations": ["action1", "action2"],
  "insights": ["insight1", "insight2"]
}`;

  const dataAnalysis = analyzeHistoricalData(historicalData);
  
  const userPrompt = `Analyze this grid data for ${request.predictionType} prediction:

Connection Details:
- Type: ${connection.type}
- Status: ${connection.status}
- Current Voltage: ${connection.voltage}V
- Current Frequency: ${connection.frequency}Hz

Data Analysis:
${JSON.stringify(dataAnalysis, null, 2)}

Recent Trends:
${formatRecentTrends(historicalData.slice(-20))}

Please provide your analysis in the specified JSON format.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate prediction');
  }

  const result = await response.json();
  const analysis = JSON.parse(result.choices[0].message.content);

  return {
    probability: analysis.probability || 0.1,
    confidence: analysis.confidence || 60,
    predictedDate: analysis.predicted_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    recommendations: analysis.recommendations || [],
    riskLevel: analysis.risk_level || 'medium',
    insights: analysis.insights || [],
    inputFeatures: dataAnalysis
  };
}

function analyzeHistoricalData(data: MetricData[]) {
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.metric_type]) acc[item.metric_type] = [];
    acc[item.metric_type].push(item.value);
    return acc;
  }, {} as Record<string, number[]>);

  const analysis: any = {};

  for (const [metricType, values] of Object.entries(groupedData)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    analysis[metricType] = {
      average: avg,
      standardDeviation: stdDev,
      minimum: min,
      maximum: max,
      trend: calculateTrend(values),
      volatility: stdDev / avg,
      dataPoints: values.length
    };
  }

  return analysis;
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'insufficient_data';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = (secondAvg - firstAvg) / firstAvg;
  
  if (change > 0.05) return 'increasing';
  if (change < -0.05) return 'decreasing';
  return 'stable';
}

function formatRecentTrends(recentData: MetricData[]): string {
  if (recentData.length === 0) return 'No recent data available';
  
  const trends = recentData.reduce((acc, item) => {
    if (!acc[item.metric_type]) acc[item.metric_type] = [];
    acc[item.metric_type].push(item.value);
    return acc;
  }, {} as Record<string, number[]>);

  return Object.entries(trends)
    .map(([type, values]) => {
      const trend = calculateTrend(values);
      const latest = values[values.length - 1];
      return `${type}: ${latest} (${trend})`;
    })
    .join('\n');
}

async function runBackgroundAnalysis(supabase: any, request: PredictionRequest, prediction: any) {
  try {
    console.log('Running background analysis...');
    
    // Generate AI analytics entry
    await supabase.from('ai_analytics').insert({
      connection_id: request.connectionId,
      model_type: 'predictive_maintenance',
      prediction_type: request.predictionType,
      confidence_score: prediction.confidence / 100,
      prediction_data: prediction,
      is_anomaly: prediction.riskLevel === 'critical' || prediction.probability > 0.7,
      severity_level: prediction.riskLevel
    });

    // Create alert if high risk
    if (prediction.riskLevel === 'critical' || prediction.probability > 0.8) {
      await supabase.from('grid_alerts').insert({
        connection_id: request.connectionId,
        alert_type: 'predictive_maintenance',
        severity: prediction.riskLevel === 'critical' ? 'high' : 'medium',
        message: `Predictive analytics detected high ${request.predictionType} risk: ${(prediction.probability * 100).toFixed(1)}% probability`,
        resolved: false
      });
    }

    console.log('Background analysis completed');
  } catch (error) {
    console.error('Background analysis error:', error);
  }
}