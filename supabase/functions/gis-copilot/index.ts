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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: ''
      })
    }

    const { query, connectionId } = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use OpenAI to convert natural language to SQL
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const systemPrompt = `You are a GIS and utility grid expert SQL generator. Convert natural language queries into safe PostgreSQL queries for a utility grid management system.

Available tables and their structures:
- grid_connections: id, user_id, name, type, location, status, voltage, frequency
- grid_metrics: id, connection_id, metric_type, value, unit, timestamp
- grid_alerts: id, connection_id, alert_type, severity, message, resolved
- gis_assets: id, user_id, connection_id, asset_id, asset_type, geometry, properties, status, risk_level
- environmental_data: id, connection_id, data_type, coordinates, severity_level, description, source
- predictive_analytics: id, connection_id, asset_id, prediction_type, probability, predicted_date
- field_operations: id, connection_id, technician_id, operation_type, status, priority, location
- customer_incidents: id, connection_id, incident_type, severity, status, customer_info, affected_customers

SECURITY RULES:
- ONLY generate SELECT statements
- ALWAYS include WHERE clauses to filter by user access
- Use connection_id filters when applicable
- Never use destructive operations (DROP, DELETE, UPDATE, INSERT)
- Limit results with LIMIT clause (max 1000)

Return only the SQL query, nothing else.`

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    })

    if (!openAIResponse.ok) {
      throw new Error('Failed to generate SQL query')
    }

    const openAIData = await openAIResponse.json()
    const generatedSQL = openAIData.choices[0].message.content.trim()

    // Execute the query safely using Supabase client
    const startTime = Date.now()
    let queryResult
    let executedSuccessfully = false

    try {
      // For security, we'll use the Supabase client's query builder instead of raw SQL
      // This is a simplified implementation - in production, you'd parse the SQL and convert to query builder
      queryResult = await supabase.rpc('execute_safe_query', {
        query_text: generatedSQL,
        connection_filter: connectionId
      })
      
      executedSuccessfully = !queryResult.error
    } catch (error) {
      console.error('Query execution error:', error)
      queryResult = { error: error.message, data: null }
    }

    const executionTime = Date.now() - startTime

    // Log the query for audit purposes
    const { data: user } = await supabase.auth.getUser()
    if (user.user) {
      await supabase.from('copilot_queries').insert({
        user_id: user.user.id,
        connection_id: connectionId,
        natural_query: query,
        generated_sql: generatedSQL,
        executed_successfully: executedSuccessfully,
        results_summary: queryResult.data ? {
          row_count: Array.isArray(queryResult.data) ? queryResult.data.length : 1,
          columns: queryResult.data && queryResult.data.length > 0 ? Object.keys(queryResult.data[0]) : []
        } : null,
        execution_time_ms: executionTime
      })
    }

    return new Response(
      JSON.stringify({
        query: generatedSQL,
        results: queryResult.data,
        error: queryResult.error,
        execution_time_ms: executionTime,
        row_count: Array.isArray(queryResult.data) ? queryResult.data.length : 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in GIS copilot:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})