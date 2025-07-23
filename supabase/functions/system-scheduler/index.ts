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
    try {
      console.log('Invoking realtime-data-simulator...');
      const dataSimResult = await supabase.functions.invoke('realtime-data-simulator');
      console.log('Data simulation response:', dataSimResult);
      
      if (dataSimResult.error) {
        console.error('Data simulation error:', dataSimResult.error);
        results.dataSimulation = { error: dataSimResult.error.message };
      } else {
        results.dataSimulation = dataSimResult.data;
      }
    } catch (error) {
      console.error('Data simulation failed:', error);
      results.dataSimulation = { error: error.message };
    }

    try {
      console.log('Invoking ai-analytics-processor...');
      const aiAnalyticsResult = await supabase.functions.invoke('ai-analytics-processor');
      console.log('AI analytics response:', aiAnalyticsResult);
      
      if (aiAnalyticsResult.error) {
        console.error('AI analytics error:', aiAnalyticsResult.error);
        results.aiAnalytics = { error: aiAnalyticsResult.error.message };
      } else {
        results.aiAnalytics = aiAnalyticsResult.data;
      }
    } catch (error) {
      console.error('AI analytics failed:', error);
      results.aiAnalytics = { error: error.message };
    }

    try {
      console.log('Invoking alert-management-system...');
      const alertMgmtResult = await supabase.functions.invoke('alert-management-system');
      console.log('Alert management response:', alertMgmtResult);
      
      if (alertMgmtResult.error) {
        console.error('Alert management error:', alertMgmtResult.error);
        results.alertManagement = { error: alertMgmtResult.error.message };
      } else {
        results.alertManagement = alertMgmtResult.data;
      }
    } catch (error) {
      console.error('Alert management failed:', error);
      results.alertManagement = { error: error.message };
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