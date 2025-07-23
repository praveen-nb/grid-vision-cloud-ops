import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Play, Save, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WorkflowStep {
  id: string;
  step_type: string;
  action: string;
  parameters: Record<string, any>;
  conditions?: Record<string, any>;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  trigger_conditions: any;
  execution_schedule: any;
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: "Predictive Maintenance Alert",
    description: "Automatically trigger maintenance when equipment failure probability exceeds threshold",
    category: "maintenance",
    steps: [
      {
        id: "1",
        step_type: "ml_prediction",
        action: "predict_equipment_failure",
        parameters: { model_type: "predictive_maintenance" }
      },
      {
        id: "2",
        step_type: "conditional",
        action: "check_failure_probability",
        parameters: {
          condition: { field: "failure_probability", operator: "greater_than", value: 0.7 },
          true_action: {
            step_type: "maintenance_scheduling",
            action: "schedule_maintenance",
            parameters: { priority_level: "urgent" }
          }
        }
      },
      {
        id: "3",
        step_type: "notification",
        action: "send_alert",
        parameters: {
          notification_type: "maintenance_alert",
          channels: ["email", "dashboard"],
          message_template: {
            title: "Urgent Maintenance Required",
            body: "Equipment {{equipment_id}} requires immediate maintenance - failure probability: {{failure_probability}}%"
          }
        }
      }
    ],
    trigger_conditions: {
      conditions: [
        { type: "metric_threshold", metric_name: "equipment_degradation", threshold: 80, comparison: "greater_than" }
      ]
    },
    execution_schedule: { type: "interval", interval_minutes: 60 }
  },
  {
    name: "Energy Optimization Workflow",
    description: "Optimize energy consumption based on demand patterns and grid conditions",
    category: "energy",
    steps: [
      {
        id: "1",
        step_type: "data_collection",
        action: "collect_energy_data",
        parameters: { collection_type: "metrics", data_range: { hours: 24 } }
      },
      {
        id: "2",
        step_type: "ml_prediction",
        action: "optimize_energy_usage",
        parameters: { model_type: "energy_optimization" }
      },
      {
        id: "3",
        step_type: "system_control",
        action: "adjust_load_balancing",
        parameters: { control_action: "optimize_load_distribution" }
      },
      {
        id: "4",
        step_type: "reporting",
        action: "generate_optimization_report",
        parameters: { report_type: "energy_optimization", output_format: "json" }
      }
    ],
    trigger_conditions: {
      conditions: [
        { type: "alert_count", severity: "high", count_threshold: 3 }
      ]
    },
    execution_schedule: { type: "daily", hour: 2 }
  },
  {
    name: "Security Incident Response",
    description: "Automated response to security threats and anomalies",
    category: "security",
    steps: [
      {
        id: "1",
        step_type: "data_collection",
        action: "collect_security_events",
        parameters: { collection_type: "alerts", severity_filter: "critical" }
      },
      {
        id: "2",
        step_type: "analysis",
        action: "analyze_security_threat",
        parameters: { analysis_type: "fault_detection" }
      },
      {
        id: "3",
        step_type: "conditional",
        action: "assess_threat_level",
        parameters: {
          condition: { field: "threat_score", operator: "greater_than", value: 0.8 },
          true_action: {
            step_type: "system_control",
            action: "isolate_affected_systems",
            parameters: { isolation_mode: "automatic" }
          }
        }
      },
      {
        id: "4",
        step_type: "notification",
        action: "alert_security_team",
        parameters: {
          notification_type: "security_incident",
          channels: ["email", "sms", "dashboard"],
          message_template: {
            title: "Critical Security Incident Detected",
            body: "Threat level {{threat_score}} detected. Automated response initiated."
          }
        }
      }
    ],
    trigger_conditions: {
      conditions: [
        { type: "metric_threshold", metric_name: "security_anomaly_score", threshold: 0.7, comparison: "greater_than" }
      ]
    },
    execution_schedule: { type: "continuous" }
  }
];

const STEP_TYPES = [
  { value: "data_collection", label: "Data Collection" },
  { value: "analysis", label: "Analysis" },
  { value: "ml_prediction", label: "ML Prediction" },
  { value: "notification", label: "Notification" },
  { value: "system_control", label: "System Control" },
  { value: "reporting", label: "Reporting" },
  { value: "maintenance_scheduling", label: "Maintenance Scheduling" },
  { value: "api_call", label: "API Call" },
  { value: "database_operation", label: "Database Operation" },
  { value: "conditional", label: "Conditional Logic" }
];

export const AutomationWorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowTemplate | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const { toast } = useToast();

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      step_type: 'data_collection',
      action: 'collect_data',
      parameters: {}
    };
    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setWorkflowSteps(workflowSteps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, updatedStep: Partial<WorkflowStep>) => {
    setWorkflowSteps(workflowSteps.map(step => 
      step.id === stepId ? { ...step, ...updatedStep } : step
    ));
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive"
      });
      return;
    }

    if (workflowSteps.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one workflow step",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('automation-engine', {
        body: {
          action: 'create_workflow',
          workflow_name: workflowName,
          description: workflowDescription,
          workflow_steps: workflowSteps,
          trigger_conditions: {},
          execution_schedule: { type: 'manual' },
          is_active: true
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow saved successfully"
      });

      // Reset form
      setWorkflowName('');
      setWorkflowDescription('');
      setWorkflowSteps([]);

    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive"
      });
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-engine', {
        body: {
          workflow_id: workflowId,
          user_id: 'current-user',
          trigger_type: 'manual'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow execution started"
      });

    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: "Error", 
        description: "Failed to execute workflow",
        variant: "destructive"
      });
    }
  };

  const loadTemplate = (template: WorkflowTemplate) => {
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setWorkflowSteps(template.steps);
    setActiveWorkflow(template);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Automation Workflow Builder</h1>
          <p className="text-muted-foreground">Create and manage automated workflows</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveWorkflow} className="gap-2">
            <Save className="h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="existing">Existing Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label>Active Template</Label>
                  <div className="mt-2">
                    {activeWorkflow ? (
                      <Badge variant="outline">{activeWorkflow.name}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No template selected</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Workflow Steps
                <Button onClick={addStep} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Step {index + 1}</Badge>
                      <Button
                        onClick={() => removeStep(step.id)}
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Step Type</Label>
                        <Select
                          value={step.step_type}
                          onValueChange={(value) => updateStep(step.id, { step_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STEP_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Action</Label>
                        <Input
                          value={step.action}
                          onChange={(e) => updateStep(step.id, { action: e.target.value })}
                          placeholder="Action name"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Parameters (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(step.parameters, null, 2)}
                        onChange={(e) => {
                          try {
                            const params = JSON.parse(e.target.value);
                            updateStep(step.id, { parameters: params });
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        placeholder='{"key": "value"}'
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}

                {workflowSteps.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No workflow steps added yet. Click "Add Step" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKFLOW_TEMPLATES.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{template.category}</Badge>
                    <div className="text-sm text-muted-foreground">
                      {template.steps.length} steps
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadTemplate(template)}
                        size="sm"
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Manage your existing automation workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No existing workflows found. Create your first workflow using the builder or templates.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};