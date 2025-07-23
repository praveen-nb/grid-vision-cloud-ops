import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AWSResource {
  id: string;
  name: string;
  type: 'ec2' | 'rds' | 's3' | 'security';
  status: 'running' | 'stopped' | 'pending' | 'error';
  region: string;
  cost: number;
  lastUpdate: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    storage?: number;
    connections?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulate AWS API calls - in production, you would use AWS SDK
    const ec2Instances = await getEC2Instances();
    const rdsInstances = await getRDSInstances();
    const s3Buckets = await getS3Buckets();

    const resources: AWSResource[] = [
      ...ec2Instances,
      ...rdsInstances,
      ...s3Buckets
    ];

    const totalCost = resources.reduce((sum, resource) => sum + resource.cost, 0);

    // Store infrastructure status in Supabase for tracking
    const { error: insertError } = await supabaseClient
      .from('infrastructure_status')
      .upsert({
        timestamp: new Date().toISOString(),
        total_resources: resources.length,
        total_cost: totalCost,
        status_data: resources,
        provider: 'aws'
      });

    if (insertError) {
      console.error('Error storing infrastructure status:', insertError);
    }

    console.log(`Monitored ${resources.length} AWS resources, total cost: $${totalCost}`);

    return new Response(
      JSON.stringify({
        success: true,
        resources,
        totalCost,
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error monitoring AWS infrastructure:', error);
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

async function getEC2Instances(): Promise<AWSResource[]> {
  // Simulate EC2 API call
  return [
    {
      id: 'i-1234567890abcdef0',
      name: 'Grid-Monitor-Web-Server',
      type: 'ec2',
      status: 'running',
      region: 'us-east-1',
      cost: 45.60,
      lastUpdate: new Date().toISOString(),
      metrics: {
        cpu: Math.floor(Math.random() * 80) + 10,
        memory: Math.floor(Math.random() * 70) + 20,
        storage: Math.floor(Math.random() * 60) + 30
      }
    },
    {
      id: 'i-0987654321fedcba0',
      name: 'Grid-Analytics-Server',
      type: 'ec2',
      status: 'running',
      region: 'us-east-1',
      cost: 89.20,
      lastUpdate: new Date().toISOString(),
      metrics: {
        cpu: Math.floor(Math.random() * 90) + 5,
        memory: Math.floor(Math.random() * 80) + 15,
        storage: Math.floor(Math.random() * 50) + 40
      }
    }
  ];
}

async function getRDSInstances(): Promise<AWSResource[]> {
  // Simulate RDS API call
  return [
    {
      id: 'db-instance-1',
      name: 'Grid-Metrics-Database',
      type: 'rds',
      status: 'running',
      region: 'us-east-1',
      cost: 127.80,
      lastUpdate: new Date().toISOString(),
      metrics: {
        cpu: Math.floor(Math.random() * 50) + 10,
        memory: Math.floor(Math.random() * 60) + 20,
        connections: Math.floor(Math.random() * 50) + 10
      }
    },
    {
      id: 'db-replica-1',
      name: 'Grid-Metrics-Replica',
      type: 'rds',
      status: 'running',
      region: 'us-west-2',
      cost: 89.45,
      lastUpdate: new Date().toISOString(),
      metrics: {
        cpu: Math.floor(Math.random() * 30) + 5,
        memory: Math.floor(Math.random() * 40) + 15,
        connections: Math.floor(Math.random() * 30) + 5
      }
    }
  ];
}

async function getS3Buckets(): Promise<AWSResource[]> {
  // Simulate S3 API call
  return [
    {
      id: 'grid-data-bucket',
      name: 'Grid-Data-Storage',
      type: 's3',
      status: 'running',
      region: 'us-east-1',
      cost: 23.45,
      lastUpdate: new Date().toISOString(),
      metrics: {
        storage: Math.floor(Math.random() * 80) + 10
      }
    },
    {
      id: 'grid-backups-bucket',
      name: 'Grid-Backups-Storage',
      type: 's3',
      status: 'running',
      region: 'us-east-1',
      cost: 45.67,
      lastUpdate: new Date().toISOString(),
      metrics: {
        storage: Math.floor(Math.random() * 90) + 5
      }
    },
    {
      id: 'grid-logs-bucket',
      name: 'Grid-Logs-Archive',
      type: 's3',
      status: 'running',
      region: 'us-east-1',
      cost: 12.30,
      lastUpdate: new Date().toISOString(),
      metrics: {
        storage: Math.floor(Math.random() * 60) + 20
      }
    }
  ];
}