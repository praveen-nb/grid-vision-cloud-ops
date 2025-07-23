import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRule {
  id: string;
  metricType: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  enabled: boolean;
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

    console.log('Starting intelligent alert management...');

    // Define smart alert rules
    const alertRules: AlertRule[] = [
      {
        id: 'voltage_high',
        metricType: 'voltage',
        condition: 'greater_than',
        threshold: 253,
        severity: 'high',
        message: 'Critical high voltage detected',
        enabled: true
      },
      {
        id: 'voltage_low',
        metricType: 'voltage',
        condition: 'less_than',
        threshold: 207,
        severity: 'high',
        message: 'Critical low voltage detected',
        enabled: true
      },
      {
        id: 'frequency_deviation',
        metricType: 'frequency',
        condition: 'deviation_from',
        threshold: 0.5, // ±0.5Hz from 50Hz
        severity: 'medium',
        message: 'Frequency deviation detected',
        enabled: true
      },
      {
        id: 'temperature_warning',
        metricType: 'temperature',
        condition: 'greater_than',
        threshold: 70,
        severity: 'medium',
        message: 'High temperature warning',
        enabled: true
      },
      {
        id: 'temperature_critical',
        metricType: 'temperature',
        condition: 'greater_than',
        threshold: 85,
        severity: 'high',
        message: 'Critical temperature - immediate action required',
        enabled: true
      },
      {
        id: 'power_factor_low',
        metricType: 'power_factor',
        condition: 'less_than',
        threshold: 0.8,
        severity: 'low',
        message: 'Low power factor detected',
        enabled: true
      }
    ];

    // Get recent metrics (last 10 minutes) for alert evaluation
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentMetrics, error: metricsError } = await supabase
      .from('grid_metrics')
      .select(`
        *,
        grid_connections!inner(id, name, type, status)
      `)
      .gte('timestamp', tenMinutesAgo)
      .order('timestamp', { ascending: false });

    if (metricsError) {
      throw new Error(`Failed to fetch recent metrics: ${metricsError.message}`);
    }

    if (!recentMetrics || recentMetrics.length === 0) {
      return new Response(JSON.stringify({
        message: 'No recent metrics found for alert evaluation',
        alertsGenerated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Evaluating ${recentMetrics.length} metrics against alert rules`);

    // Get existing alerts to avoid duplicates
    const { data: existingAlerts, error: alertsError } = await supabase
      .from('grid_alerts')
      .select('connection_id, alert_type, created_at')
      .eq('resolved', false)
      .gte('created_at', tenMinutesAgo);

    if (alertsError) {
      console.error('Error fetching existing alerts:', alertsError);
    }

    const existingAlertKeys = new Set(
      (existingAlerts || []).map(alert => `${alert.connection_id}_${alert.alert_type}`)
    );

    // Group metrics by connection for intelligent analysis
    const metricsByConnection = groupMetricsByConnection(recentMetrics);
    const newAlerts = [];

    for (const [connectionId, connectionMetrics] of Object.entries(metricsByConnection)) {
      const connectionName = connectionMetrics[0]?.grid_connections?.name || 'Unknown';
      
      // Evaluate each alert rule
      for (const rule of alertRules) {
        if (!rule.enabled) continue;

        const relevantMetrics = connectionMetrics.filter(m => m.metric_type === rule.metricType);
        if (relevantMetrics.length === 0) continue;

        const latestMetric = relevantMetrics[0]; // Most recent
        const alertKey = `${connectionId}_${rule.id}`;

        // Skip if we already have this alert
        if (existingAlertKeys.has(alertKey)) continue;

        const shouldAlert = evaluateAlertRule(rule, latestMetric.value);
        
        if (shouldAlert) {
          const alertMessage = `${rule.message} - ${latestMetric.value.toFixed(2)}${latestMetric.unit} at ${connectionName}`;
          
          const { error: insertError } = await supabase
            .from('grid_alerts')
            .insert({
              connection_id: connectionId,
              alert_type: rule.id,
              severity: rule.severity,
              message: alertMessage
            });

          if (insertError) {
            console.error('Error inserting alert:', insertError);
          } else {
            newAlerts.push({
              connectionId,
              connectionName,
              type: rule.id,
              severity: rule.severity,
              message: alertMessage,
              value: latestMetric.value,
              unit: latestMetric.unit
            });
            console.log(`Generated alert: ${rule.id} for ${connectionName}`);
          }
        }
      }

      // Advanced pattern detection
      const patternAlerts = detectAdvancedPatterns(connectionMetrics, connectionId, connectionName);
      for (const alert of patternAlerts) {
        const patternAlertKey = `${connectionId}_${alert.type}`;
        if (!existingAlertKeys.has(patternAlertKey)) {
          const { error: insertError } = await supabase
            .from('grid_alerts')
            .insert({
              connection_id: connectionId,
              alert_type: alert.type,
              severity: alert.severity,
              message: alert.message
            });

          if (!insertError) {
            newAlerts.push(alert);
          }
        }
      }
    }

    // Auto-resolve stale alerts
    const autoResolvedCount = await autoResolveStaleAlerts(supabase);

    console.log(`Alert management completed: ${newAlerts.length} new alerts, ${autoResolvedCount} auto-resolved`);

    return new Response(JSON.stringify({
      success: true,
      alertsGenerated: newAlerts.length,
      alertsAutoResolved: autoResolvedCount,
      newAlerts: newAlerts.map(alert => ({
        connection: alert.connectionName,
        type: alert.type,
        severity: alert.severity,
        message: alert.message
      })),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in alert-management-system:', error);
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

function evaluateAlertRule(rule: AlertRule, value: number): boolean {
  switch (rule.condition) {
    case 'greater_than':
      return value > rule.threshold;
    case 'less_than':
      return value < rule.threshold;
    case 'deviation_from':
      // For frequency, check deviation from 50Hz
      if (rule.metricType === 'frequency') {
        return Math.abs(value - 50.0) > rule.threshold;
      }
      return false;
    default:
      return false;
  }
}

function detectAdvancedPatterns(metrics: any[], connectionId: string, connectionName: string) {
  const alerts = [];
  const metricTypes = ['voltage', 'frequency', 'power', 'temperature'];

  for (const type of metricTypes) {
    const typeMetrics = metrics.filter(m => m.metric_type === type);
    if (typeMetrics.length < 3) continue; // Need at least 3 points for pattern detection

    const values = typeMetrics.map(m => m.value).slice(0, 10); // Last 10 readings
    
    // Detect rapid changes
    const rapidChange = detectRapidChange(values);
    if (rapidChange.detected) {
      alerts.push({
        connectionId,
        connectionName,
        type: `rapid_${type}_change`,
        severity: 'medium' as const,
        message: `Rapid ${type} change detected: ${rapidChange.changeRate.toFixed(2)}% change at ${connectionName}`
      });
    }

    // Detect oscillations
    const oscillation = detectOscillation(values);
    if (oscillation.detected) {
      alerts.push({
        connectionId,
        connectionName,
        type: `${type}_oscillation`,
        severity: 'medium' as const,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} oscillation detected at ${connectionName}`
      });
    }

    // Detect sustained deviation from normal
    const sustainedDeviation = detectSustainedDeviation(values, type);
    if (sustainedDeviation.detected) {
      alerts.push({
        connectionId,
        connectionName,
        type: `sustained_${type}_deviation`,
        severity: 'low' as const,
        message: `Sustained ${type} deviation from normal range at ${connectionName}`
      });
    }
  }

  return alerts;
}

function detectRapidChange(values: number[]): { detected: boolean; changeRate: number } {
  if (values.length < 2) return { detected: false, changeRate: 0 };

  const latest = values[0];
  const previous = values[1];
  const changeRate = Math.abs((latest - previous) / previous) * 100;

  return {
    detected: changeRate > 15, // 15% change threshold
    changeRate
  };
}

function detectOscillation(values: number[]): { detected: boolean } {
  if (values.length < 5) return { detected: false };

  // Simple oscillation detection: check for alternating increases/decreases
  let directionChanges = 0;
  for (let i = 1; i < values.length - 1; i++) {
    const prevDirection = values[i] > values[i + 1];
    const currentDirection = values[i - 1] > values[i];
    if (prevDirection !== currentDirection) {
      directionChanges++;
    }
  }

  return {
    detected: directionChanges >= 3 // At least 3 direction changes indicates oscillation
  };
}

function detectSustainedDeviation(values: number[], metricType: string): { detected: boolean } {
  if (values.length < 5) return { detected: false };

  // Define normal ranges for different metrics
  const normalRanges: Record<string, { min: number; max: number }> = {
    voltage: { min: 220, max: 240 },
    frequency: { min: 49.8, max: 50.2 },
    temperature: { min: 20, max: 50 },
    power: { min: 0, max: Infinity } // Dynamic based on capacity
  };

  const range = normalRanges[metricType];
  if (!range) return { detected: false };

  // Check if all recent values are outside normal range
  const outsideNormalCount = values.filter(v => v < range.min || v > range.max).length;
  
  return {
    detected: outsideNormalCount >= Math.floor(values.length * 0.8) // 80% of readings outside normal
  };
}

async function autoResolveStaleAlerts(supabase: any): Promise<number> {
  // Auto-resolve alerts older than 24 hours that are likely resolved
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  try {
    const { data, error } = await supabase
      .from('grid_alerts')
      .update({ 
        resolved: true, 
        resolved_at: new Date().toISOString() 
      })
      .eq('resolved', false)
      .lt('created_at', oneDayAgo)
      .in('severity', ['low', 'medium']) // Only auto-resolve non-critical alerts
      .select('id');

    if (error) {
      console.error('Error auto-resolving alerts:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in auto-resolve:', error);
    return 0;
  }
}