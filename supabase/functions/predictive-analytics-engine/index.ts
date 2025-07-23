import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { connectionId, analysisType = 'all' } = await req.json()

    // Get historical metrics for analysis
    const { data: metrics, error: metricsError } = await supabase
      .from('grid_metrics')
      .select('*')
      .eq('connection_id', connectionId)
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (metricsError) {
      throw metricsError
    }

    // Get asset information
    const { data: assets, error: assetsError } = await supabase
      .from('gis_assets')
      .select('*')
      .eq('connection_id', connectionId)

    if (assetsError) {
      throw assetsError
    }

    const predictions = []

    // Generate predictions for each asset
    for (const asset of assets || []) {
      // Failure prediction
      if (analysisType === 'all' || analysisType === 'failure') {
        const failurePrediction = generateFailurePrediction(asset, metrics)
        predictions.push(failurePrediction)
      }

      // Maintenance prediction
      if (analysisType === 'all' || analysisType === 'maintenance') {
        const maintenancePrediction = generateMaintenancePrediction(asset, metrics)
        predictions.push(maintenancePrediction)
      }

      // Performance prediction
      if (analysisType === 'all' || analysisType === 'performance') {
        const performancePrediction = generatePerformancePrediction(asset, metrics)
        predictions.push(performancePrediction)
      }
    }

    // Insert predictions into database
    const { data: insertedPredictions, error: insertError } = await supabase
      .from('predictive_analytics')
      .insert(predictions)
      .select()

    if (insertError) {
      throw insertError
    }

    // Generate alerts for high-risk predictions
    const alerts = []
    for (const prediction of insertedPredictions) {
      if (prediction.probability > 0.7 && prediction.prediction_type === 'failure') {
        alerts.push({
          connection_id: prediction.connection_id,
          alert_type: 'predictive_failure',
          severity: prediction.probability > 0.9 ? 'critical' : 'high',
          message: `High failure probability (${(prediction.probability * 100).toFixed(1)}%) predicted for asset ${prediction.asset_id}`,
          resolved: false
        })
      }
    }

    if (alerts.length > 0) {
      await supabase.from('grid_alerts').insert(alerts)
    }

    return new Response(
      JSON.stringify({
        success: true,
        predictions_generated: insertedPredictions.length,
        alerts_generated: alerts.length,
        predictions: insertedPredictions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in predictive analytics:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate predictions', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateFailurePrediction(asset: any, metrics: any[]) {
  // Simplified failure prediction algorithm
  const relevantMetrics = metrics.filter(m => 
    m.metric_type === 'temperature' || 
    m.metric_type === 'vibration' || 
    m.metric_type === 'current'
  )

  let riskFactors = 0
  const features: any = {
    asset_age: calculateAssetAge(asset.created_at),
    recent_alerts: 0,
    maintenance_overdue: false
  }

  // Analyze recent metrics for anomalies
  if (relevantMetrics.length > 10) {
    const recentMetrics = relevantMetrics.slice(0, 10)
    const avgValue = recentMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / recentMetrics.length
    const threshold = avgValue * 1.2 // 20% above average

    const anomalies = recentMetrics.filter(m => parseFloat(m.value) > threshold).length
    features.anomaly_ratio = anomalies / recentMetrics.length
    
    if (features.anomaly_ratio > 0.3) riskFactors++
  }

  // Check asset age
  if (features.asset_age > 15) riskFactors++
  if (features.asset_age > 25) riskFactors++

  // Calculate probability based on risk factors
  const baseProbability = 0.05 // 5% base failure rate
  const probability = Math.min(0.95, baseProbability + (riskFactors * 0.15) + Math.random() * 0.1)

  const predictedDate = new Date()
  predictedDate.setDate(predictedDate.getDate() + Math.floor((1 - probability) * 365))

  return {
    connection_id: asset.connection_id,
    asset_id: asset.asset_id,
    prediction_type: 'failure',
    probability: parseFloat(probability.toFixed(4)),
    predicted_date: predictedDate.toISOString(),
    confidence_score: 0.75 + Math.random() * 0.2,
    input_features: features,
    model_version: 'v1.0.0'
  }
}

function generateMaintenancePrediction(asset: any, metrics: any[]) {
  const features = {
    asset_age: calculateAssetAge(asset.created_at),
    usage_intensity: calculateUsageIntensity(metrics),
    last_maintenance: asset.last_inspection || asset.created_at
  }

  const maintenanceInterval = getMaintenanceInterval(asset.asset_type)
  const daysSinceLastMaintenance = Math.floor(
    (new Date().getTime() - new Date(features.last_maintenance).getTime()) / (1000 * 60 * 60 * 24)
  )

  const probability = Math.min(0.99, daysSinceLastMaintenance / maintenanceInterval)
  
  const predictedDate = new Date()
  predictedDate.setDate(predictedDate.getDate() + Math.max(1, maintenanceInterval - daysSinceLastMaintenance))

  return {
    connection_id: asset.connection_id,
    asset_id: asset.asset_id,
    prediction_type: 'maintenance',
    probability: parseFloat(probability.toFixed(4)),
    predicted_date: predictedDate.toISOString(),
    confidence_score: 0.85 + Math.random() * 0.1,
    input_features: features,
    model_version: 'v1.0.0'
  }
}

function generatePerformancePrediction(asset: any, metrics: any[]) {
  const features = {
    efficiency_trend: calculateEfficiencyTrend(metrics),
    load_factor: calculateLoadFactor(metrics),
    environmental_stress: Math.random() * 0.5 // Simplified
  }

  // Performance degradation probability
  const probability = Math.max(0.1, features.efficiency_trend * 0.8 + features.environmental_stress * 0.2)
  
  const predictedDate = new Date()
  predictedDate.setDate(predictedDate.getDate() + Math.floor((1 - probability) * 180))

  return {
    connection_id: asset.connection_id,
    asset_id: asset.asset_id,
    prediction_type: 'performance',
    probability: parseFloat(probability.toFixed(4)),
    predicted_date: predictedDate.toISOString(),
    confidence_score: 0.70 + Math.random() * 0.25,
    input_features: features,
    model_version: 'v1.0.0'
  }
}

function calculateAssetAge(createdAt: string): number {
  const ageMs = new Date().getTime() - new Date(createdAt).getTime()
  return Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25))
}

function calculateUsageIntensity(metrics: any[]): number {
  if (metrics.length === 0) return 0.5
  
  const powerMetrics = metrics.filter(m => m.metric_type === 'power' || m.metric_type === 'current')
  if (powerMetrics.length === 0) return 0.5
  
  const avgValue = powerMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / powerMetrics.length
  return Math.min(1.0, avgValue / 1000) // Normalize to 0-1 scale
}

function getMaintenanceInterval(assetType: string): number {
  const intervals: { [key: string]: number } = {
    'transformer': 365,
    'generator': 180,
    'transmission_line': 730,
    'switch': 365,
    'breaker': 365,
    'default': 365
  }
  
  return intervals[assetType] || intervals.default
}

function calculateEfficiencyTrend(metrics: any[]): number {
  if (metrics.length < 2) return 0.5
  
  const efficiencyMetrics = metrics.filter(m => m.metric_type === 'efficiency').slice(0, 30)
  if (efficiencyMetrics.length < 2) return 0.5
  
  const recent = efficiencyMetrics.slice(0, 10)
  const older = efficiencyMetrics.slice(10, 20)
  
  const recentAvg = recent.reduce((sum, m) => sum + parseFloat(m.value), 0) / recent.length
  const olderAvg = older.reduce((sum, m) => sum + parseFloat(m.value), 0) / older.length
  
  // Return degradation ratio (0 = no degradation, 1 = significant degradation)
  return Math.max(0, (olderAvg - recentAvg) / olderAvg)
}

function calculateLoadFactor(metrics: any[]): number {
  const loadMetrics = metrics.filter(m => m.metric_type === 'load').slice(0, 24)
  if (loadMetrics.length === 0) return 0.5
  
  const maxLoad = Math.max(...loadMetrics.map(m => parseFloat(m.value)))
  const avgLoad = loadMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / loadMetrics.length
  
  return maxLoad > 0 ? avgLoad / maxLoad : 0.5
}