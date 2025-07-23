import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('GIS Copilot request received');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Upgrade WebSocket connection
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;
    let isConnected = false;
    
    socket.onopen = () => {
      console.log('Client WebSocket connected');
      
      // Connect to OpenAI Realtime API
      openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", [], {
        headers: {
          "Authorization": `Bearer ${openAIApiKey}`,
          "OpenAI-Beta": "realtime=v1",
        },
      });

      openAISocket.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
        isConnected = true;
      };

      openAISocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('OpenAI event received:', data.type);
          
          // Handle session creation
          if (data.type === 'session.created') {
            console.log('Session created, sending configuration');
            
            // Send session configuration
            const sessionConfig = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: `You are an expert Grid Operations AI Assistant for electrical power grid monitoring and management. 

Your capabilities include:
- Analyzing real-time grid metrics (voltage, frequency, power, temperature)
- Providing insights on grid performance and anomalies
- Explaining electrical grid concepts and operations
- Helping with maintenance scheduling and procedures
- Interpreting alert conditions and recommending actions
- Assisting with compliance and safety protocols

You have access to tools to:
- Query grid connection data
- Retrieve real-time metrics
- Check system alerts
- Get predictive analytics insights

Always provide clear, actionable guidance for grid operators. When discussing safety or critical operations, emphasize proper procedures and safety protocols.`,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                tools: [
                  {
                    type: "function",
                    name: "get_grid_connections",
                    description: "Get all grid connections for the current user",
                    parameters: {
                      type: "object",
                      properties: {},
                      required: []
                    }
                  },
                  {
                    type: "function", 
                    name: "get_connection_metrics",
                    description: "Get real-time metrics for a specific grid connection",
                    parameters: {
                      type: "object",
                      properties: {
                        connection_id: { 
                          type: "string",
                          description: "The ID of the grid connection"
                        }
                      },
                      required: ["connection_id"]
                    }
                  },
                  {
                    type: "function",
                    name: "get_active_alerts",
                    description: "Get active alerts for grid connections",
                    parameters: {
                      type: "object",
                      properties: {
                        connection_id: {
                          type: "string",
                          description: "Optional connection ID to filter alerts"
                        }
                      },
                      required: []
                    }
                  },
                  {
                    type: "function",
                    name: "get_ai_analytics",
                    description: "Get AI analytics and anomaly detection results",
                    parameters: {
                      type: "object",
                      properties: {
                        connection_id: {
                          type: "string",
                          description: "Optional connection ID to filter analytics"
                        }
                      },
                      required: []
                    }
                  }
                ],
                tool_choice: "auto",
                temperature: 0.7,
                max_response_output_tokens: "inf"
              }
            };
            
            openAISocket?.send(JSON.stringify(sessionConfig));
          }
          
          // Handle function calls
          if (data.type === 'response.function_call_arguments.done') {
            console.log('Function call:', data);
            await handleFunctionCall(data, supabase, authHeader);
          }
          
          // Forward all messages to client
          socket.send(JSON.stringify(data));
          
        } catch (error) {
          console.error('Error processing OpenAI message:', error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Connection to AI service failed' 
        }));
      };

      openAISocket.onclose = () => {
        console.log('OpenAI WebSocket closed');
        isConnected = false;
      };
    };

    socket.onmessage = (event) => {
      if (isConnected && openAISocket) {
        console.log('Forwarding client message to OpenAI');
        openAISocket.send(event.data);
      }
    };

    socket.onclose = () => {
      console.log('Client WebSocket closed');
      if (openAISocket) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
    };

    return response;

  } catch (error) {
    console.error('Error in GIS Copilot:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleFunctionCall(data: any, supabase: any, authHeader: string) {
  try {
    const { name, arguments: args } = data;
    const parsedArgs = JSON.parse(args);
    
    console.log(`Executing function: ${name} with args:`, parsedArgs);
    
    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    let result = {};

    switch (name) {
      case 'get_grid_connections':
        const { data: connections, error: connError } = await supabase
          .from('grid_connections')
          .select('*')
          .eq('user_id', user.id);
        
        if (connError) throw connError;
        result = { connections };
        break;

      case 'get_connection_metrics':
        const { connection_id } = parsedArgs;
        const { data: metrics, error: metricsError } = await supabase
          .from('grid_metrics')
          .select('*')
          .eq('connection_id', connection_id)
          .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false })
          .limit(10);
        
        if (metricsError) throw metricsError;
        result = { metrics };
        break;

      case 'get_active_alerts':
        let alertsQuery = supabase
          .from('grid_alerts')
          .select(`
            *,
            grid_connections!inner(user_id)
          `)
          .eq('grid_connections.user_id', user.id)
          .eq('resolved', false);
        
        if (parsedArgs.connection_id) {
          alertsQuery = alertsQuery.eq('connection_id', parsedArgs.connection_id);
        }
        
        const { data: alerts, error: alertsError } = await alertsQuery;
        if (alertsError) throw alertsError;
        result = { alerts };
        break;

      case 'get_ai_analytics':
        let analyticsQuery = supabase
          .from('ai_analytics')
          .select(`
            *,
            grid_connections!inner(user_id)
          `)
          .eq('grid_connections.user_id', user.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });
        
        if (parsedArgs.connection_id) {
          analyticsQuery = analyticsQuery.eq('connection_id', parsedArgs.connection_id);
        }
        
        const { data: analytics, error: analyticsError } = await analyticsQuery;
        if (analyticsError) throw analyticsError;
        result = { analytics };
        break;

      default:
        throw new Error(`Unknown function: ${name}`);
    }

    console.log(`Function ${name} result:`, result);
    return result;

  } catch (error) {
    console.error('Function call error:', error);
    return { error: error.message };
  }
}