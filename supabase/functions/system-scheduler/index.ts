import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting system scheduler...');

    const results = {
      dataSimulation: null as any,
      aiAnalytics: null as any,
      alertManagement: null as any,
      timestamp: new Date().toISOString()
    };

    // Run all systems in parallel for efficiency
    const [dataSimResult, aiAnalyticsResult, alertMgmtResult] = await Promise.allSettled([
      // 1. Generate real-time data
      supabase.functions.invoke('realtime-data-simulator'),
      
      // 2. Process AI analytics
      supabase.functions.invoke('ai-analytics-processor'),
      
      // 3. Manage alerts
      supabase.functions.invoke('alert-management-system')
    ]);

    // Process results
    if (dataSimResult.status === 'fulfilled') {
      const response = dataSimResult.value.data;
      results.dataSimulation = response;
      console.log('Data simulation completed:', response);
    } else {
      console.error('Data simulation failed:', dataSimResult.reason);
      results.dataSimulation = { error: dataSimResult.reason.message };
    }

    if (aiAnalyticsResult.status === 'fulfilled') {
      const response = aiAnalyticsResult.value.data;
      results.aiAnalytics = response;
      console.log('AI analytics completed:', response);
    } else {
      console.error('AI analytics failed:', aiAnalyticsResult.reason);
      results.aiAnalytics = { error: aiAnalyticsResult.reason.message };
    }

    if (alertMgmtResult.status === 'fulfilled') {
      const response = alertMgmtResult.value.data;
      results.alertManagement = response;
      console.log('Alert management completed:', response);
    } else {
      console.error('Alert management failed:', alertMgmtResult.reason);
      results.alertManagement = { error: alertMgmtResult.reason.message };
    }

    // Calculate summary statistics
    const summary = {
      totalConnections: results.dataSimulation?.connectionsProcessed || 0,
      metricsGenerated: results.dataSimulation?.metricsGenerated || 0,
      alertsGenerated: (results.dataSimulation?.alertsGenerated || 0) + 
                      (results.alertManagement?.alertsGenerated || 0),
      aiPredictions: results.aiAnalytics?.totalPredictions || 0,
      anomaliesDetected: results.aiAnalytics?.totalAnomalies || 0,
      alertsResolved: results.alertManagement?.alertsAutoResolved || 0
    };

    console.log('System scheduler completed:', summary);

    return new Response(JSON.stringify({
      success: true,
      summary,
      details: results,
      nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Next run in 5 minutes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in system-scheduler:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});