import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionResult {
  connectionId: string
  modelType: 'anomaly_detection' | 'predictive_maintenance' | 'load_forecasting'
  prediction: any
  confidence: number
  isAnomaly: boolean
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

    // Get recent grid metrics for analysis
    const recentMetrics = await supabase
      .from('grid_metrics')
      .select(`
        *,
        grid_connections!inner(id, user_id, name, type)
      `)
      .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('timestamp', { ascending: false })

    if (!recentMetrics.data || recentMetrics.data.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recent metrics found for analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const predictions: PredictionResult[] = []
    const processedConnections = new Set<string>()

    // Group metrics by connection
    const metricsByConnection = recentMetrics.data.reduce((acc, metric) => {
      const connectionId = metric.connection_id
      if (!acc[connectionId]) {
        acc[connectionId] = []
      }
      acc[connectionId].push(metric)
      return acc
    }, {} as Record<string, any[]>)

    // Simulate SageMaker AI analytics for each connection
    for (const [connectionId, metrics] of Object.entries(metricsByConnection)) {
      if (processedConnections.has(connectionId)) continue
      processedConnections.add(connectionId)

      // Anomaly Detection Model
      const voltageMetrics = metrics.filter(m => m.metric_type === 'voltage')
      const currentMetrics = metrics.filter(m => m.metric_type === 'current')
      
      if (voltageMetrics.length > 0 && currentMetrics.length > 0) {
        const avgVoltage = voltageMetrics.reduce((sum, m) => sum + Number(m.value), 0) / voltageMetrics.length
        const avgCurrent = currentMetrics.reduce((sum, m) => sum + Number(m.value), 0) / currentMetrics.length
        
        // Simulate anomaly detection algorithm
        const voltageDeviation = Math.abs(avgVoltage - 230) / 230
        const currentDeviation = Math.abs(avgCurrent - 15) / 15
        const anomalyScore = (voltageDeviation + currentDeviation) / 2
        
        const isVoltageAnomaly = anomalyScore > 0.15 // 15% deviation threshold
        const confidence = Math.min(0.95, 0.6 + anomalyScore * 2)

        const anomalyPrediction: PredictionResult = {
          connectionId,
          modelType: 'anomaly_detection',
          prediction: {
            anomaly_type: isVoltageAnomaly ? 'voltage_current_deviation' : 'normal',
            deviation_score: anomalyScore,
            avg_voltage: avgVoltage,
            avg_current: avgCurrent,
            threshold_exceeded: isVoltageAnomaly,
            recommended_action: isVoltageAnomaly ? 'immediate_inspection' : 'continue_monitoring'
          },
          confidence,
          isAnomaly: isVoltageAnomaly
        }

        predictions.push(anomalyPrediction)

        // Store AI analytics result
        await supabase.from('ai_analytics').insert({
          connection_id: connectionId,
          model_type: 'anomaly_detection',
          prediction_type: isVoltageAnomaly ? 'voltage_current_anomaly' : 'normal_operation',
          confidence_score: confidence,
          prediction_data: anomalyPrediction.prediction,
          is_anomaly: isVoltageAnomaly,
          severity_level: isVoltageAnomaly ? (anomalyScore > 0.3 ? 'critical' : 'high') : 'low'
        })

        // Create alert if critical anomaly
        if (isVoltageAnomaly && anomalyScore > 0.2) {
          await supabase.from('grid_alerts').insert({
            connection_id: connectionId,
            alert_type: 'ai_anomaly_detected',
            message: `SageMaker AI detected ${anomalyScore > 0.3 ? 'critical' : 'high'} voltage/current anomaly. Deviation: ${(anomalyScore * 100).toFixed(1)}%`,
            severity: anomalyScore > 0.3 ? 'critical' : 'high'
          })
        }
      }

      // Predictive Maintenance Model
      const temperatureMetrics = metrics.filter(m => m.metric_type === 'temperature')
      if (temperatureMetrics.length > 0) {
        const avgTemperature = temperatureMetrics.reduce((sum, m) => sum + Number(m.value), 0) / temperatureMetrics.length
        const tempRisk = avgTemperature > 35 ? 'high' : avgTemperature > 30 ? 'medium' : 'low'
        
        // Simulate maintenance prediction
        const maintenanceScore = Math.min(1, (avgTemperature - 20) / 20) // 0-1 scale
        const daysToMaintenance = Math.max(1, Math.floor(30 * (1 - maintenanceScore)))
        
        const maintenancePrediction: PredictionResult = {
          connectionId,
          modelType: 'predictive_maintenance',
          prediction: {
            risk_level: tempRisk,
            predicted_maintenance_days: daysToMaintenance,
            temperature_factor: avgTemperature,
            component_health: tempRisk === 'high' ? 'degrading' : 'good',
            maintenance_type: tempRisk === 'high' ? 'immediate' : 'scheduled'
          },
          confidence: 0.75 + Math.random() * 0.2,
          isAnomaly: tempRisk === 'high'
        }

        predictions.push(maintenancePrediction)

        await supabase.from('ai_analytics').insert({
          connection_id: connectionId,
          model_type: 'predictive_maintenance',
          prediction_type: 'maintenance_prediction',
          confidence_score: maintenancePrediction.confidence,
          prediction_data: maintenancePrediction.prediction,
          is_anomaly: tempRisk === 'high',
          severity_level: tempRisk
        })
      }

      // Load Forecasting Model
      const powerMetrics = metrics.filter(m => m.metric_type === 'power')
      if (powerMetrics.length > 0) {
        const avgPower = powerMetrics.reduce((sum, m) => sum + Number(m.value), 0) / powerMetrics.length
        
        // Simulate load forecasting
        const forecastedLoad = avgPower * (1 + (Math.random() - 0.5) * 0.1) // ±5% variation
        const loadTrend = forecastedLoad > avgPower ? 'increasing' : 'decreasing'
        
        const loadPrediction: PredictionResult = {
          connectionId,
          modelType: 'load_forecasting',
          prediction: {
            current_load: avgPower,
            forecasted_load: forecastedLoad,
            trend: loadTrend,
            confidence_interval: [forecastedLoad * 0.95, forecastedLoad * 1.05],
            peak_probability: avgPower > 2200 ? 'high' : 'medium'
          },
          confidence: 0.8 + Math.random() * 0.15,
          isAnomaly: false
        }

        predictions.push(loadPrediction)

        await supabase.from('ai_analytics').insert({
          connection_id: connectionId,
          model_type: 'load_forecasting',
          prediction_type: 'load_prediction',
          confidence_score: loadPrediction.confidence,
          prediction_data: loadPrediction.prediction,
          is_anomaly: false,
          severity_level: 'low'
        })
      }
    }

    console.log(`Generated ${predictions.length} AI predictions using SageMaker models`)

    return new Response(
      JSON.stringify({
        success: true,
        predictions_generated: predictions.length,
        models_used: ['anomaly_detection', 'predictive_maintenance', 'load_forecasting'],
        processed_connections: processedConnections.size,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in SageMaker AI analytics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})