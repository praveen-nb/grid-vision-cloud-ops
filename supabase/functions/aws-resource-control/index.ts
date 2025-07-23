import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { resourceId, action } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Executing ${action} on resource ${resourceId}`);

    // Simulate AWS API calls based on action type
    let result;
    switch (action) {
      case 'start':
        result = await startResource(resourceId);
        break;
      case 'stop':
        result = await stopResource(resourceId);
        break;
      case 'restart':
        result = await restartResource(resourceId);
        break;
      case 'monitor':
        result = await enableMonitoring(resourceId);
        break;
      case 'backup':
        result = await createBackup(resourceId);
        break;
      case 'scale':
        result = await scaleResource(resourceId);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Log the action in Supabase
    const { error: logError } = await supabaseClient
      .from('resource_actions')
      .insert({
        resource_id: resourceId,
        action_type: action,
        status: result.success ? 'completed' : 'failed',
        details: result,
        executed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging resource action:', logError);
    }

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        details: result.details,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error executing resource control:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function startResource(resourceId: string) {
  // Simulate AWS EC2 start instance or RDS start database
  console.log(`Starting resource ${resourceId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: `Resource ${resourceId} started successfully`,
    details: {
      previousState: 'stopped',
      currentState: 'running',
      startTime: new Date().toISOString()
    }
  };
}

async function stopResource(resourceId: string) {
  // Simulate AWS EC2 stop instance or RDS stop database
  console.log(`Stopping resource ${resourceId}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: `Resource ${resourceId} stopped successfully`,
    details: {
      previousState: 'running',
      currentState: 'stopped',
      stopTime: new Date().toISOString()
    }
  };
}

async function restartResource(resourceId: string) {
  // Simulate AWS EC2 reboot instance or RDS reboot database
  console.log(`Restarting resource ${resourceId}`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    message: `Resource ${resourceId} restarted successfully`,
    details: {
      action: 'restart',
      status: 'completed',
      restartTime: new Date().toISOString(),
      downtime: '30 seconds'
    }
  };
}

async function enableMonitoring(resourceId: string) {
  // Simulate enabling CloudWatch monitoring
  console.log(`Enabling monitoring for resource ${resourceId}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: `Monitoring enabled for resource ${resourceId}`,
    details: {
      monitoringLevel: 'detailed',
      metricsEnabled: ['CPU', 'Memory', 'Network', 'Disk'],
      dashboardUrl: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${resourceId}`,
      alertsConfigured: true
    }
  };
}

async function createBackup(resourceId: string) {
  // Simulate creating RDS snapshot or EBS snapshot
  console.log(`Creating backup for resource ${resourceId}`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const backupId = `backup-${resourceId}-${Date.now()}`;
  
  return {
    success: true,
    message: `Backup created for resource ${resourceId}`,
    details: {
      backupId,
      backupType: 'automated',
      size: '50 GB',
      retention: '30 days',
      encryption: 'enabled',
      status: 'in-progress'
    }
  };
}

async function scaleResource(resourceId: string) {
  // Simulate auto-scaling configuration or instance type change
  console.log(`Scaling resource ${resourceId}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: `Resource ${resourceId} scaled successfully`,
    details: {
      previousInstanceType: 't3.medium',
      newInstanceType: 't3.large',
      autoScaling: 'enabled',
      minInstances: 1,
      maxInstances: 5,
      targetUtilization: 70
    }
  };
}