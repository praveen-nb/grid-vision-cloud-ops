import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IoTMessage {
  deviceId: string
  timestamp: string
  metrics: {
    voltage: number
    current: number
    frequency: number
    power: number
    temperature: number
    humidity: number
  }
  location: {
    lat: number
    lng: number
  }
  status: string
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

    // Simulate AWS IoT Core data ingestion
    const devices = await supabase
      .from('iot_devices')
      .select('*')
      .eq('status', 'online')

    if (!devices.data) {
      throw new Error('Failed to fetch devices')
    }

    const simulatedMessages: IoTMessage[] = []

    // Generate realistic IoT data for each active device
    for (const device of devices.data) {
      const message: IoTMessage = {
        deviceId: device.device_id,
        timestamp: new Date().toISOString(),
        metrics: {
          voltage: 230 + (Math.random() - 0.5) * 20, // 220-240V range
          current: 15 + (Math.random() - 0.5) * 10, // 10-20A range
          frequency: 50 + (Math.random() - 0.5) * 2, // 49-51Hz range
          power: 2000 + (Math.random() - 0.5) * 1000, // 1.5-2.5kW range
          temperature: 25 + (Math.random() - 0.5) * 10, // 20-30°C range
          humidity: 60 + (Math.random() - 0.5) * 20, // 50-70% range
        },
        location: device.location,
        status: device.status
      }

      simulatedMessages.push(message)

      // Store metrics in grid_metrics table
      const connection = await supabase
        .from('grid_connections')
        .select('id')
        .eq('user_id', device.user_id)
        .single()

      if (connection.data) {
        // Insert multiple metrics for this device
        const metricInserts = [
          {
            connection_id: connection.data.id,
            metric_type: 'voltage',
            value: message.metrics.voltage,
            unit: 'V'
          },
          {
            connection_id: connection.data.id,
            metric_type: 'current',
            value: message.metrics.current,
            unit: 'A'
          },
          {
            connection_id: connection.data.id,
            metric_type: 'frequency',
            value: message.metrics.frequency,
            unit: 'Hz'
          },
          {
            connection_id: connection.data.id,
            metric_type: 'power',
            value: message.metrics.power,
            unit: 'W'
          },
          {
            connection_id: connection.data.id,
            metric_type: 'temperature',
            value: message.metrics.temperature,
            unit: '°C'
          }
        ]

        await supabase.from('grid_metrics').insert(metricInserts)
      }
    }

    // Simulate Kinesis stream metrics
    const kinesisMetrics = [
      {
        stream_name: 'grid-telemetry-stream',
        shard_id: 'shardId-000000000000',
        records_per_second: Math.floor(Math.random() * 1000) + 500,
        bytes_per_second: Math.floor(Math.random() * 50000) + 25000,
        iterator_age_ms: Math.floor(Math.random() * 1000) + 100
      },
      {
        stream_name: 'scada-events-stream',
        shard_id: 'shardId-000000000001',
        records_per_second: Math.floor(Math.random() * 200) + 100,
        bytes_per_second: Math.floor(Math.random() * 10000) + 5000,
        iterator_age_ms: Math.floor(Math.random() * 500) + 50
      }
    ]

    await supabase.from('kinesis_metrics').insert(kinesisMetrics)

    // Simulate AI analytics (anomaly detection)
    for (const device of devices.data) {
      const connection = await supabase
        .from('grid_connections')
        .select('id')
        .eq('user_id', device.user_id)
        .single()

      if (connection.data && Math.random() > 0.7) { // 30% chance of generating AI insight
        const isAnomaly = Math.random() > 0.8 // 20% chance of anomaly
        
        const aiAnalytic = {
          connection_id: connection.data.id,
          model_type: Math.random() > 0.5 ? 'anomaly_detection' : 'predictive_maintenance',
          prediction_type: isAnomaly ? 'voltage_anomaly' : 'normal_operation',
          confidence_score: 0.7 + Math.random() * 0.3, // 70-100% confidence
          prediction_data: {
            predicted_voltage: 230 + (Math.random() - 0.5) * 20,
            risk_level: isAnomaly ? 'high' : 'low',
            maintenance_window: isAnomaly ? '24_hours' : '30_days'
          },
          is_anomaly: isAnomaly,
          severity_level: isAnomaly ? 'high' : 'low'
        }

        await supabase.from('ai_analytics').insert(aiAnalytic)

        // Create alert if anomaly detected
        if (isAnomaly) {
          await supabase.from('grid_alerts').insert({
            connection_id: connection.data.id,
            alert_type: 'anomaly_detected',
            message: `AI model detected voltage anomaly on device ${device.name}`,
            severity: 'high'
          })
        }
      }
    }

    console.log(`Processed ${simulatedMessages.length} IoT messages and ${kinesisMetrics.length} Kinesis metrics`)

    return new Response(
      JSON.stringify({
        success: true,
        processed_messages: simulatedMessages.length,
        kinesis_metrics: kinesisMetrics.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in AWS IoT simulator:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})