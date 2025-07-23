-- Phase 3: Advanced Analytics and ML Tables

-- Create advanced_analytics table for ML predictions and insights
CREATE TABLE public.advanced_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  predictions JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  anomaly_detection JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  accuracy_score NUMERIC(5,4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create real_time_alerts table for advanced alerting
CREATE TABLE public.real_time_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID,
  alert_category TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
  detection_method TEXT NOT NULL,
  auto_resolution BOOLEAN NOT NULL DEFAULT false,
  escalation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolution_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create performance_metrics table for detailed system monitoring
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID,
  metric_category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  previous_value NUMERIC,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  unit_of_measure TEXT NOT NULL,
  trend_direction TEXT,
  percentage_change NUMERIC(5,2),
  data_source TEXT NOT NULL,
  collection_method TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_workflows table for process automation
CREATE TABLE public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  workflow_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_execution TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_trail table for comprehensive logging
CREATE TABLE public.audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  outcome TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.advanced_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Create policies for advanced_analytics
CREATE POLICY "System can manage advanced analytics" 
ON public.advanced_analytics 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view analytics for their connections" 
ON public.advanced_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM grid_connections 
  WHERE grid_connections.id = advanced_analytics.connection_id 
  AND grid_connections.user_id = auth.uid()
));

-- Create policies for real_time_alerts
CREATE POLICY "System can manage real-time alerts" 
ON public.real_time_alerts 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view alerts for their connections" 
ON public.real_time_alerts 
FOR SELECT 
USING (connection_id IS NULL OR EXISTS (
  SELECT 1 FROM grid_connections 
  WHERE grid_connections.id = real_time_alerts.connection_id 
  AND grid_connections.user_id = auth.uid()
));

-- Create policies for performance_metrics
CREATE POLICY "System can manage performance metrics" 
ON public.performance_metrics 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view metrics for their connections" 
ON public.performance_metrics 
FOR SELECT 
USING (connection_id IS NULL OR EXISTS (
  SELECT 1 FROM grid_connections 
  WHERE grid_connections.id = performance_metrics.connection_id 
  AND grid_connections.user_id = auth.uid()
));

-- Create policies for automation_workflows
CREATE POLICY "Users can manage their own workflows" 
ON public.automation_workflows 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for audit_trail
CREATE POLICY "System can insert audit records" 
ON public.audit_trail 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own audit records" 
ON public.audit_trail 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_advanced_analytics_connection_id ON public.advanced_analytics(connection_id);
CREATE INDEX idx_advanced_analytics_created_at ON public.advanced_analytics(created_at);
CREATE INDEX idx_real_time_alerts_severity ON public.real_time_alerts(severity_level);
CREATE INDEX idx_real_time_alerts_created_at ON public.real_time_alerts(created_at);
CREATE INDEX idx_performance_metrics_connection_id ON public.performance_metrics(connection_id);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX idx_automation_workflows_user_id ON public.automation_workflows(user_id);
CREATE INDEX idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX idx_audit_trail_created_at ON public.audit_trail(created_at);

-- Create updated_at triggers
CREATE TRIGGER update_advanced_analytics_updated_at
BEFORE UPDATE ON public.advanced_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at
BEFORE UPDATE ON public.automation_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();