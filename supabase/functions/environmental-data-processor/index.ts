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

    const { connectionId, dataType, source } = await req.json()

    let environmentalData = []

    // Simulate different data sources
    switch (source) {
      case 'weather_api':
        environmentalData = await fetchWeatherData(connectionId)
        break
      case 'satellite':
        environmentalData = await processSatelliteImagery(connectionId)
        break
      case 'drone':
        environmentalData = await processDroneData(connectionId)
        break
      case 'sensor':
        environmentalData = await processSensorData(connectionId)
        break
      default:
        environmentalData = await generateMockEnvironmentalData(connectionId, dataType)
    }

    // Insert processed data into database
    const { data, error } = await supabase
      .from('environmental_data')
      .insert(environmentalData)
      .select()

    if (error) {
      throw error
    }

    // Generate alerts for high-risk environmental conditions
    const alerts = []
    for (const envData of data) {
      if (envData.severity_level === 'high' || envData.severity_level === 'critical') {
        alerts.push({
          connection_id: envData.connection_id,
          alert_type: 'environmental_risk',
          severity: envData.severity_level,
          message: `${envData.data_type} risk detected: ${envData.description}`,
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
        processed_records: data.length,
        alerts_generated: alerts.length,
        data: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing environmental data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process environmental data', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function fetchWeatherData(connectionId: string) {
  // Mock weather data - in production, integrate with weather APIs
  return [{
    connection_id: connectionId,
    data_type: 'weather',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    severity_level: Math.random() > 0.8 ? 'high' : 'low',
    description: 'High wind conditions detected - potential impact on transmission lines',
    source: 'weather_api',
    metadata: {
      wind_speed: Math.random() * 50 + 10,
      temperature: Math.random() * 40 - 10,
      humidity: Math.random() * 100,
      precipitation: Math.random() * 50
    }
  }]
}

async function processSatelliteImagery(connectionId: string) {
  // Mock satellite analysis - in production, integrate with satellite imagery APIs
  return [{
    connection_id: connectionId,
    data_type: 'vegetation',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    severity_level: Math.random() > 0.7 ? 'medium' : 'low',
    description: 'Vegetation encroachment detected near transmission lines',
    source: 'satellite',
    metadata: {
      vegetation_height: Math.random() * 10 + 2,
      distance_to_line: Math.random() * 20 + 5,
      growth_rate: Math.random() * 0.5 + 0.1
    }
  }]
}

async function processDroneData(connectionId: string) {
  // Mock drone inspection data
  return [{
    connection_id: connectionId,
    data_type: 'equipment_condition',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    severity_level: Math.random() > 0.9 ? 'critical' : 'low',
    description: 'Equipment wear detected during drone inspection',
    source: 'drone',
    metadata: {
      inspection_date: new Date().toISOString(),
      equipment_id: `EQ_${Math.random().toString(36).substr(2, 9)}`,
      wear_percentage: Math.random() * 100
    }
  }]
}

async function processSensorData(connectionId: string) {
  // Mock sensor data
  return [{
    connection_id: connectionId,
    data_type: 'flood_risk',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    severity_level: Math.random() > 0.85 ? 'high' : 'low',
    description: 'Water level monitoring indicates potential flood risk',
    source: 'sensor',
    metadata: {
      water_level: Math.random() * 5 + 1,
      flow_rate: Math.random() * 100 + 10,
      rainfall: Math.random() * 50
    }
  }]
}

async function generateMockEnvironmentalData(connectionId: string, dataType: string) {
  return [{
    connection_id: connectionId,
    data_type: dataType || 'general',
    coordinates: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.0060 + (Math.random() - 0.5) * 0.1 },
    severity_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    description: `${dataType || 'Environmental'} monitoring data point`,
    source: 'manual',
    metadata: {
      timestamp: new Date().toISOString(),
      confidence: Math.random()
    }
  }]
}