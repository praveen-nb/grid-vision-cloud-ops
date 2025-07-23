import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricGeneration {
  connectionId: string;
  baseVoltage: number;
  baseFrequency: number;
  basePower: number;
  baseTemperature: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting real-time data simulation...');

    // Get all active grid connections
    const { data: connections, error: connectionsError } = await supabase
      .from('grid_connections')
      .select('id, name, voltage, status, type')
      .eq('status', 'connected');

    if (connectionsError) {
      throw new Error(`Failed to fetch connections: ${connectionsError.message}`);
    }

    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active connections found',
        generated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${connections.length} active connections`);

    const generatedMetrics = [];
    const generatedAlerts = [];
    const now = new Date().toISOString();

    for (const connection of connections) {
      const baseVoltage = connection.voltage || 230;
      const metrics = generateRealisticMetrics({
        connectionId: connection.id,
        baseVoltage,
        baseFrequency: 50.0,
        basePower: 1000,
        baseTemperature: 25
      });

      // Insert metrics
      for (const metric of metrics) {
        const { error: metricError } = await supabase
          .from('grid_metrics')
          .insert({
            connection_id: connection.id,
            metric_type: metric.type,
            value: metric.value,
            unit: metric.unit,
            timestamp: now
          });

        if (metricError) {
          console.error('Error inserting metric:', metricError);
        } else {
          generatedMetrics.push(metric);
        }
      }

      // Generate alerts based on metrics
      const alerts = generateAlertsFromMetrics(metrics, connection);
      for (const alert of alerts) {
        const { error: alertError } = await supabase
          .from('grid_alerts')
          .insert({
            connection_id: connection.id,
            alert_type: alert.type,
            severity: alert.severity,
            message: alert.message
          });

        if (alertError) {
          console.error('Error inserting alert:', alertError);
        } else {
          generatedAlerts.push(alert);
        }
      }
    }

    console.log(`Generated ${generatedMetrics.length} metrics and ${generatedAlerts.length} alerts`);

    return new Response(JSON.stringify({
      success: true,
      connectionsProcessed: connections.length,
      metricsGenerated: generatedMetrics.length,
      alertsGenerated: generatedAlerts.length,
      timestamp: now
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime-data-simulator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateRealisticMetrics(config: MetricGeneration) {
  const now = Date.now();
  const hourOfDay = new Date().getHours();
  
  // Create realistic variations based on time of day
  const loadFactor = getLoadFactor(hourOfDay);
  const randomVariation = () => 0.95 + Math.random() * 0.1; // ±5% variation
  
  return [
    {
      type: 'voltage',
      value: config.baseVoltage * randomVariation() * (0.98 + loadFactor * 0.04),
      unit: 'V'
    },
    {
      type: 'frequency',
      value: config.baseFrequency * (0.999 + Math.random() * 0.002), // ±0.1% variation
      unit: 'Hz'
    },
    {
      type: 'power',
      value: config.basePower * loadFactor * randomVariation(),
      unit: 'kW'
    },
    {
      type: 'current',
      value: (config.basePower * loadFactor * randomVariation()) / (config.baseVoltage * 1.732), // 3-phase
      unit: 'A'
    },
    {
      type: 'temperature',
      value: config.baseTemperature + loadFactor * 15 + (Math.random() * 10 - 5), // Load affects temperature
      unit: '°C'
    },
    {
      type: 'power_factor',
      value: 0.85 + Math.random() * 0.1, // 0.85-0.95
      unit: ''
    }
  ];
}

function getLoadFactor(hour: number): number {
  // Simulate realistic daily load curve
  const loadCurve = [
    0.6, 0.55, 0.5, 0.5, 0.55, 0.65, // 0-5 AM: Low overnight load
    0.75, 0.85, 0.9, 0.95, 1.0, 1.0, // 6-11 AM: Morning peak
    0.95, 0.9, 0.85, 0.8, 0.85, 0.95, // 12-5 PM: Afternoon
    1.0, 0.95, 0.85, 0.75, 0.7, 0.65  // 6-11 PM: Evening peak declining
  ];
  return loadCurve[hour] || 0.7;
}

function generateAlertsFromMetrics(metrics: any[], connection: any) {
  const alerts = [];
  
  for (const metric of metrics) {
    let alert = null;
    
    switch (metric.type) {
      case 'voltage':
        if (metric.value < 207 || metric.value > 253) { // ±10% of 230V
          alert = {
            type: 'voltage_deviation',
            severity: metric.value < 200 || metric.value > 260 ? 'high' : 'medium',
            message: `Voltage out of range: ${metric.value.toFixed(1)}V at ${connection.name}`
          };
        }
        break;
        
      case 'frequency':
        if (metric.value < 49.5 || metric.value > 50.5) {
          alert = {
            type: 'frequency_deviation',
            severity: metric.value < 49 || metric.value > 51 ? 'high' : 'medium',
            message: `Frequency deviation detected: ${metric.value.toFixed(2)}Hz at ${connection.name}`
          };
        }
        break;
        
      case 'temperature':
        if (metric.value > 70) {
          alert = {
            type: 'high_temperature',
            severity: metric.value > 85 ? 'high' : 'medium',
            message: `High temperature detected: ${metric.value.toFixed(1)}°C at ${connection.name}`
          };
        }
        break;
        
      case 'power_factor':
        if (metric.value < 0.8) {
          alert = {
            type: 'low_power_factor',
            severity: 'low',
            message: `Low power factor: ${metric.value.toFixed(2)} at ${connection.name}`
          };
        }
        break;
    }
    
    if (alert) {
      alerts.push(alert);
    }
  }
  
  return alerts;
}