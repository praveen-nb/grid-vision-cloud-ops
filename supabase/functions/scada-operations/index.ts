import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScadaCommand {
  connectionId: string
  operationType: 'switch_open' | 'switch_close' | 'breaker_trip' | 'load_shed' | 'voltage_regulate'
  targetDevice: string
  commandData: any
  priority: 'low' | 'medium' | 'high' | 'critical'
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

    if (req.method === 'POST') {
      // Execute SCADA command
      const { command }: { command: ScadaCommand } = await req.json()
      
      // Validate command
      if (!command.connectionId || !command.operationType || !command.targetDevice) {
        return new Response(
          JSON.stringify({ error: 'Missing required command parameters' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Insert SCADA operation
      const { data: operation, error } = await supabase
        .from('scada_operations')
        .insert({
          connection_id: command.connectionId,
          operation_type: command.operationType,
          target_device: command.targetDevice,
          command_data: command.commandData || {},
          status: 'executing'
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create SCADA operation: ${error.message}`)
      }

      // Simulate command execution delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Simulate success/failure (95% success rate)
      const isSuccessful = Math.random() > 0.05
      const newStatus = isSuccessful ? 'completed' : 'failed'

      // Update operation status
      await supabase
        .from('scada_operations')
        .update({
          status: newStatus,
          executed_at: new Date().toISOString()
        })
        .eq('id', operation.id)

      // Create alert for the operation
      const alertMessage = isSuccessful 
        ? `SCADA operation ${command.operationType} completed successfully on ${command.targetDevice}`
        : `SCADA operation ${command.operationType} failed on ${command.targetDevice}`

      await supabase.from('grid_alerts').insert({
        connection_id: command.connectionId,
        alert_type: 'scada_operation',
        message: alertMessage,
        severity: isSuccessful ? 'info' : 'high'
      })

      // If operation affects grid metrics, simulate the change
      if (isSuccessful && command.operationType === 'voltage_regulate') {
        const targetVoltage = command.commandData?.target_voltage || 230
        await supabase.from('grid_metrics').insert({
          connection_id: command.connectionId,
          metric_type: 'voltage',
          value: targetVoltage + (Math.random() - 0.5) * 2, // Small variance
          unit: 'V'
        })
      }

      return new Response(
        JSON.stringify({
          success: isSuccessful,
          operation_id: operation.id,
          status: newStatus,
          message: alertMessage,
          execution_time: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get pending operations or operation status
      const url = new URL(req.url)
      const connectionId = url.searchParams.get('connection_id')
      const operationId = url.searchParams.get('operation_id')

      let query = supabase.from('scada_operations').select('*')

      if (operationId) {
        query = query.eq('id', operationId)
      } else if (connectionId) {
        query = query.eq('connection_id', connectionId)
      }

      const { data: operations, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw new Error(`Failed to fetch operations: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          operations: operations || [],
          count: operations?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Auto-generate SCADA operations based on AI alerts
    if (req.method === 'PUT') {
      // Check for recent high-severity alerts that need automated response
      const recentAlerts = await supabase
        .from('grid_alerts')
        .select(`
          *,
          grid_connections!inner(id, name, type)
        `)
        .eq('severity', 'high')
        .eq('resolved', false)
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes

      if (!recentAlerts.data || recentAlerts.data.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No high-severity alerts requiring automated response' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const automatedOperations = []

      for (const alert of recentAlerts.data) {
        // Determine appropriate automated response
        let operationType: ScadaCommand['operationType'] = 'voltage_regulate'
        let targetDevice = `${alert.grid_connections.type}_controller`
        let commandData = {}

        if (alert.alert_type === 'anomaly_detected' || alert.alert_type === 'ai_anomaly_detected') {
          if (alert.message.includes('voltage')) {
            operationType = 'voltage_regulate'
            commandData = { target_voltage: 230, tolerance: 5 }
          } else if (alert.message.includes('overload')) {
            operationType = 'load_shed'
            commandData = { shed_percentage: 10, duration_minutes: 15 }
          }
        }

        // Create automated SCADA operation
        const { data: operation } = await supabase
          .from('scada_operations')
          .insert({
            connection_id: alert.connection_id,
            operation_type: operationType,
            target_device: targetDevice,
            command_data: commandData,
            status: 'pending'
          })
          .select()
          .single()

        if (operation) {
          automatedOperations.push(operation)
          
          // Mark alert as having automated response
          await supabase
            .from('grid_alerts')
            .update({ resolved: true, resolved_at: new Date().toISOString() })
            .eq('id', alert.id)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          automated_operations: automatedOperations.length,
          operations: automatedOperations
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )

  } catch (error) {
    console.error('Error in SCADA operations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})