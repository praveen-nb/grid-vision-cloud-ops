import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowStep {
  step_id: string;
  step_type: string;
  action: string;
  parameters: Record<string, any>;
  conditions?: Record<string, any>;
  timeout_seconds?: number;
}

interface TriggerCondition {
  condition_type: string;
  parameters: Record<string, any>;
  threshold?: number;
  comparison?: string;
}

interface WorkflowExecution {
  workflow_id: string;
  user_id: string;
  trigger_type?: string;
  manual_execution?: boolean;
  execution_context?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'execute';

    switch (action) {
      case 'execute':
        return await executeWorkflow(req, supabase);
      case 'schedule':
        return await scheduleWorkflows(req, supabase);
      case 'trigger_check':
        return await checkTriggerConditions(req, supabase);
      case 'create_workflow':
        return await createWorkflow(req, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Automation Engine Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process automation request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function executeWorkflow(req: Request, supabase: any) {
  const { workflow_id, user_id, trigger_type, execution_context }: WorkflowExecution = await req.json();
  
  console.log(`Executing workflow ${workflow_id} for user ${user_id}`);
  
  // Fetch workflow details
  const { data: workflow, error: workflowError } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('id', workflow_id)
    .eq('user_id', user_id)
    .eq('is_active', true)
    .single();

  if (workflowError || !workflow) {
    throw new Error('Workflow not found or inactive');
  }

  const executionStartTime = Date.now();
  const stepResults: any[] = [];
  let overallSuccess = true;

  try {
    // Execute workflow steps sequentially
    for (const step of workflow.workflow_steps) {
      console.log(`Executing step: ${step.step_id} - ${step.action}`);
      
      const stepResult = await executeWorkflowStep(step, execution_context, supabase);
      stepResults.push({
        step_id: step.step_id,
        action: step.action,
        success: stepResult.success,
        result: stepResult.result,
        execution_time_ms: stepResult.execution_time_ms,
        error: stepResult.error
      });

      if (!stepResult.success) {
        overallSuccess = false;
        console.error(`Step ${step.step_id} failed:`, stepResult.error);
        
        // Check if workflow should continue on error
        if (!step.parameters?.continue_on_error) {
          break;
        }
      }
    }

    const executionTime = Date.now() - executionStartTime;

    // Update workflow execution statistics
    await updateWorkflowStats(supabase, workflow_id, overallSuccess, executionTime);

    // Log execution to audit trail
    await logAuditTrail(supabase, user_id, 'workflow_execution', workflow_id, {
      trigger_type,
      execution_context,
      step_results,
      overall_success: overallSuccess,
      execution_time_ms: executionTime
    });

    // Generate alerts if workflow failed
    if (!overallSuccess) {
      await generateWorkflowFailureAlert(supabase, workflow, stepResults);
    }

    console.log(`Workflow execution completed. Success: ${overallSuccess}, Duration: ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: overallSuccess,
        workflow_id,
        execution_time_ms: executionTime,
        step_results: stepResults,
        trigger_type,
        steps_executed: stepResults.length,
        steps_successful: stepResults.filter(r => r.success).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Workflow execution failed:', error);
    
    await logAuditTrail(supabase, user_id, 'workflow_execution_error', workflow_id, {
      error: error.message,
      execution_context
    });

    throw error;
  }
}

async function executeWorkflowStep(
  step: WorkflowStep, 
  context: Record<string, any> = {}, 
  supabase: any
) {
  const stepStartTime = Date.now();
  
  try {
    let result: any = {};

    switch (step.step_type) {
      case 'data_collection':
        result = await executeDataCollection(step, context, supabase);
        break;
      case 'analysis':
        result = await executeAnalysis(step, context, supabase);
        break;
      case 'notification':
        result = await executeNotification(step, context, supabase);
        break;
      case 'system_control':
        result = await executeSystemControl(step, context, supabase);
        break;
      case 'reporting':
        result = await executeReporting(step, context, supabase);
        break;
      case 'ml_prediction':
        result = await executeMLPrediction(step, context, supabase);
        break;
      case 'maintenance_scheduling':
        result = await executeMaintenanceScheduling(step, context, supabase);
        break;
      case 'api_call':
        result = await executeAPICall(step, context, supabase);
        break;
      case 'database_operation':
        result = await executeDatabaseOperation(step, context, supabase);
        break;
      case 'conditional':
        result = await executeConditional(step, context, supabase);
        break;
      default:
        throw new Error(`Unknown step type: ${step.step_type}`);
    }

    return {
      success: true,
      result,
      execution_time_ms: Date.now() - stepStartTime
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      execution_time_ms: Date.now() - stepStartTime
    };
  }
}

async function executeDataCollection(step: WorkflowStep, context: any, supabase: any) {
  const { data_source, query_parameters, collection_type } = step.parameters;
  
  switch (collection_type) {
    case 'metrics':
      const { data: metrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(query_parameters?.limit || 1000);
      return { collected_records: metrics?.length || 0, data: metrics };

    case 'alerts':
      const { data: alerts } = await supabase
        .from('real_time_alerts')
        .select('*')
        .eq('resolved', false)
        .limit(query_parameters?.limit || 100);
      return { collected_records: alerts?.length || 0, data: alerts };

    case 'infrastructure_status':
      const { data: infrastructure } = await supabase
        .from('infrastructure_status')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);
      return { collected_records: infrastructure?.length || 0, data: infrastructure };

    default:
      throw new Error(`Unknown collection type: ${collection_type}`);
  }
}

async function executeAnalysis(step: WorkflowStep, context: any, supabase: any) {
  const { analysis_type, input_data } = step.parameters;
  
  // Call ML Analytics Engine
  const response = await supabase.functions.invoke('ml-analytics-engine', {
    body: {
      analysis_type,
      input_data: input_data || context,
      connection_id: context.connection_id
    }
  });

  if (response.error) {
    throw new Error(`Analysis failed: ${response.error.message}`);
  }

  return response.data;
}

async function executeNotification(step: WorkflowStep, context: any, supabase: any) {
  const { notification_type, recipients, message_template, channels } = step.parameters;
  
  // Create notification record
  const notification = {
    type: notification_type,
    title: evaluateTemplate(message_template.title, context),
    message: evaluateTemplate(message_template.body, context),
    recipients: recipients,
    channels: channels || ['dashboard'],
    delivery_status: 'sent',
    created_at: new Date().toISOString()
  };

  // For demo purposes, we'll just log the notification
  console.log('Notification sent:', notification);
  
  return {
    notification_sent: true,
    recipients_count: recipients.length,
    channels_used: channels?.length || 1,
    notification_id: crypto.randomUUID()
  };
}

async function executeSystemControl(step: WorkflowStep, context: any, supabase: any) {
  const { control_action, target_system, parameters } = step.parameters;
  
  // Log the control action
  await supabase.from('scada_operations').insert({
    operation_type: control_action,
    target_device: target_system,
    command_data: parameters,
    status: 'completed',
    connection_id: context.connection_id,
    executed_by: context.user_id,
    executed_at: new Date().toISOString()
  });

  // Simulate system control execution
  return {
    control_executed: true,
    target_system,
    action: control_action,
    result: 'success',
    execution_timestamp: new Date().toISOString()
  };
}

async function executeReporting(step: WorkflowStep, context: any, supabase: any) {
  const { report_type, data_range, output_format } = step.parameters;
  
  // Generate report data based on type
  let reportData: any = {};
  
  switch (report_type) {
    case 'performance_summary':
      const { data: performanceData } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - (data_range?.days || 7) * 24 * 60 * 60 * 1000).toISOString());
      
      reportData = {
        total_metrics: performanceData?.length || 0,
        avg_performance: calculateAveragePerformance(performanceData),
        trends: analyzeTrends(performanceData)
      };
      break;

    case 'security_summary':
      const { data: securityEvents } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - (data_range?.days || 7) * 24 * 60 * 60 * 1000).toISOString());
      
      reportData = {
        total_events: securityEvents?.length || 0,
        critical_events: securityEvents?.filter(e => e.severity === 'critical').length || 0,
        resolved_events: securityEvents?.filter(e => e.status === 'resolved').length || 0
      };
      break;

    default:
      reportData = { message: `Report type ${report_type} generated successfully` };
  }

  return {
    report_generated: true,
    report_type,
    output_format: output_format || 'json',
    data: reportData,
    generation_timestamp: new Date().toISOString()
  };
}

async function executeMLPrediction(step: WorkflowStep, context: any, supabase: any) {
  const { model_type, prediction_parameters } = step.parameters;
  
  // Call ML Analytics Engine for predictions
  const response = await supabase.functions.invoke('ml-analytics-engine', {
    body: {
      analysis_type: model_type,
      input_data: prediction_parameters || context,
      connection_id: context.connection_id
    }
  });

  if (response.error) {
    throw new Error(`ML Prediction failed: ${response.error.message}`);
  }

  return {
    prediction_completed: true,
    model_type,
    predictions: response.data.model_results,
    confidence_scores: response.data.confidence_scores,
    anomalies_detected: response.data.anomaly_detection?.anomaly_count || 0
  };
}

async function executeMaintenanceScheduling(step: WorkflowStep, context: any, supabase: any) {
  const { scheduling_type, equipment_list, priority_level } = step.parameters;
  
  // Create maintenance operation records
  const maintenanceOperations = equipment_list.map((equipment: string) => ({
    operation_type: scheduling_type,
    description: `Automated ${scheduling_type} maintenance for ${equipment}`,
    priority: priority_level || 'medium',
    status: 'assigned',
    connection_id: context.connection_id,
    location: { equipment_id: equipment },
    scheduled_start: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));

  const { data: operations } = await supabase
    .from('field_operations')
    .insert(maintenanceOperations)
    .select();

  return {
    maintenance_scheduled: true,
    operations_created: operations?.length || 0,
    scheduling_type,
    equipment_count: equipment_list.length
  };
}

async function executeAPICall(step: WorkflowStep, context: any, supabase: any) {
  const { url, method, headers, body, timeout } = step.parameters;
  
  const requestOptions: RequestInit = {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.body = JSON.stringify(evaluateTemplate(body, context));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout || 30000);

  try {
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseData = await response.text();
    
    return {
      api_call_completed: true,
      status_code: response.status,
      response_data: responseData,
      success: response.ok
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(`API call failed: ${error.message}`);
  }
}

async function executeDatabaseOperation(step: WorkflowStep, context: any, supabase: any) {
  const { operation_type, table_name, data, conditions } = step.parameters;
  
  switch (operation_type) {
    case 'insert':
      const { data: insertResult } = await supabase
        .from(table_name)
        .insert(evaluateTemplate(data, context))
        .select();
      return { operation: 'insert', records_affected: insertResult?.length || 0 };

    case 'update':
      let updateQuery = supabase.from(table_name).update(evaluateTemplate(data, context));
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          updateQuery = updateQuery.eq(key, value);
        });
      }
      
      const { data: updateResult } = await updateQuery.select();
      return { operation: 'update', records_affected: updateResult?.length || 0 };

    case 'select':
      let selectQuery = supabase.from(table_name).select('*');
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          selectQuery = selectQuery.eq(key, value);
        });
      }
      
      const { data: selectResult } = await selectQuery;
      return { operation: 'select', records_found: selectResult?.length || 0, data: selectResult };

    default:
      throw new Error(`Unknown database operation: ${operation_type}`);
  }
}

async function executeConditional(step: WorkflowStep, context: any, supabase: any) {
  const { condition, true_action, false_action } = step.parameters;
  
  const conditionMet = evaluateCondition(condition, context);
  const actionToExecute = conditionMet ? true_action : false_action;
  
  if (actionToExecute) {
    const result = await executeWorkflowStep(actionToExecute, context, supabase);
    return {
      condition_evaluated: true,
      condition_met: conditionMet,
      action_executed: actionToExecute.action,
      result: result
    };
  }
  
  return {
    condition_evaluated: true,
    condition_met: conditionMet,
    action_executed: 'none'
  };
}

async function scheduleWorkflows(req: Request, supabase: any) {
  // Get all active workflows with schedules
  const { data: workflows } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('is_active', true)
    .not('execution_schedule', 'is', null);

  let scheduledCount = 0;

  for (const workflow of workflows || []) {
    const schedule = workflow.execution_schedule;
    const shouldExecute = checkSchedule(schedule, workflow.last_execution);

    if (shouldExecute) {
      // Execute workflow asynchronously
      supabase.functions.invoke('automation-engine', {
        body: {
          workflow_id: workflow.id,
          user_id: workflow.user_id,
          trigger_type: 'scheduled'
        }
      });
      
      scheduledCount++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      workflows_checked: workflows?.length || 0,
      workflows_scheduled: scheduledCount,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkTriggerConditions(req: Request, supabase: any) {
  const { data: workflows } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('is_active', true)
    .not('trigger_conditions', 'is', null);

  let triggeredCount = 0;

  for (const workflow of workflows || []) {
    const triggerMet = await evaluateTriggerConditions(workflow.trigger_conditions, supabase);

    if (triggerMet) {
      // Execute workflow
      supabase.functions.invoke('automation-engine', {
        body: {
          workflow_id: workflow.id,
          user_id: workflow.user_id,
          trigger_type: 'condition_based'
        }
      });
      
      triggeredCount++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      workflows_checked: workflows?.length || 0,
      workflows_triggered: triggeredCount,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createWorkflow(req: Request, supabase: any) {
  const workflowData = await req.json();
  
  const { data: workflow, error } = await supabase
    .from('automation_workflows')
    .insert(workflowData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create workflow: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      workflow_id: workflow.id,
      workflow_name: workflow.workflow_name,
      created_at: workflow.created_at
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function evaluateTemplate(template: any, context: Record<string, any>): any {
  if (typeof template === 'string') {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => context[key] || match);
  }
  
  if (typeof template === 'object' && template !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(template)) {
      result[key] = evaluateTemplate(value, context);
    }
    return result;
  }
  
  return template;
}

function evaluateCondition(condition: any, context: Record<string, any>): boolean {
  const { field, operator, value } = condition;
  const fieldValue = context[field];
  
  switch (operator) {
    case 'equals': return fieldValue === value;
    case 'not_equals': return fieldValue !== value;
    case 'greater_than': return fieldValue > value;
    case 'less_than': return fieldValue < value;
    case 'greater_equal': return fieldValue >= value;
    case 'less_equal': return fieldValue <= value;
    case 'contains': return String(fieldValue).includes(value);
    case 'exists': return fieldValue !== undefined && fieldValue !== null;
    default: return false;
  }
}

function checkSchedule(schedule: any, lastExecution: string | null): boolean {
  const now = new Date();
  const lastExec = lastExecution ? new Date(lastExecution) : null;
  
  switch (schedule.type) {
    case 'interval':
      if (!lastExec) return true;
      const intervalMs = schedule.interval_minutes * 60 * 1000;
      return (now.getTime() - lastExec.getTime()) >= intervalMs;
      
    case 'daily':
      if (!lastExec) return true;
      const lastExecDay = lastExec.toDateString();
      const todayDay = now.toDateString();
      return lastExecDay !== todayDay && now.getHours() >= (schedule.hour || 0);
      
    case 'weekly':
      if (!lastExec) return true;
      const daysSinceLastExec = Math.floor((now.getTime() - lastExec.getTime()) / (24 * 60 * 60 * 1000));
      return daysSinceLastExec >= 7 && now.getDay() === (schedule.day_of_week || 0);
      
    default:
      return false;
  }
}

async function evaluateTriggerConditions(conditions: any, supabase: any): Promise<boolean> {
  // Evaluate trigger conditions based on current system state
  for (const condition of conditions.conditions || []) {
    switch (condition.type) {
      case 'metric_threshold':
        const { data: metrics } = await supabase
          .from('performance_metrics')
          .select('current_value')
          .eq('metric_name', condition.metric_name)
          .order('timestamp', { ascending: false })
          .limit(1);
        
        if (metrics?.length > 0) {
          const currentValue = metrics[0].current_value;
          if (condition.comparison === 'greater_than' && currentValue > condition.threshold) {
            return true;
          }
          if (condition.comparison === 'less_than' && currentValue < condition.threshold) {
            return true;
          }
        }
        break;
        
      case 'alert_count':
        const { data: alerts } = await supabase
          .from('real_time_alerts')
          .select('id')
          .eq('severity_level', condition.severity)
          .eq('resolved', false);
        
        if ((alerts?.length || 0) >= condition.count_threshold) {
          return true;
        }
        break;
    }
  }
  
  return false;
}

async function updateWorkflowStats(supabase: any, workflowId: string, success: boolean, executionTime: number) {
  const { data: workflow } = await supabase
    .from('automation_workflows')
    .select('execution_count, success_rate')
    .eq('id', workflowId)
    .single();

  if (workflow) {
    const newExecutionCount = workflow.execution_count + 1;
    const currentSuccessRate = workflow.success_rate || 0;
    const newSuccessRate = ((currentSuccessRate * workflow.execution_count) + (success ? 100 : 0)) / newExecutionCount;

    await supabase
      .from('automation_workflows')
      .update({
        execution_count: newExecutionCount,
        success_rate: Math.round(newSuccessRate * 100) / 100,
        last_execution: new Date().toISOString()
      })
      .eq('id', workflowId);
  }
}

async function logAuditTrail(
  supabase: any,
  userId: string,
  actionType: string,
  resourceId: string,
  details: Record<string, any>
) {
  await supabase.from('audit_trail').insert({
    user_id: userId,
    action_type: actionType,
    resource_type: 'automation_workflow',
    resource_id: resourceId,
    action_details: details,
    outcome: details.overall_success !== false ? 'success' : 'failure',
    duration_ms: details.execution_time_ms
  });
}

async function generateWorkflowFailureAlert(supabase: any, workflow: any, stepResults: any[]) {
  const failedSteps = stepResults.filter(r => !r.success);
  
  await supabase.from('real_time_alerts').insert({
    alert_category: 'automation',
    severity_level: 'high',
    title: `Workflow Execution Failed - ${workflow.workflow_name}`,
    description: `Workflow "${workflow.workflow_name}" failed during execution. ${failedSteps.length} out of ${stepResults.length} steps failed.`,
    affected_systems: [workflow.workflow_name],
    detection_method: 'automation_engine',
    auto_resolution: false,
    notification_channels: ['dashboard', 'email']
  });
}

function calculateAveragePerformance(data: any[]): number {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (item.current_value || 0), 0);
  return Math.round((sum / data.length) * 100) / 100;
}

function analyzeTrends(data: any[]): string {
  if (!data || data.length < 2) return 'insufficient_data';
  
  const recent = data.slice(-5);
  const older = data.slice(-10, -5);
  
  const recentAvg = calculateAveragePerformance(recent);
  const olderAvg = calculateAveragePerformance(older);
  
  if (recentAvg > olderAvg * 1.05) return 'improving';
  if (recentAvg < olderAvg * 0.95) return 'declining';
  return 'stable';
}