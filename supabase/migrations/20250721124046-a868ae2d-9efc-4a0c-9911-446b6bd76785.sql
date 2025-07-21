-- Add IoT device management and spatial capabilities
CREATE TABLE public.iot_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  device_type TEXT NOT NULL, -- 'smart_meter', 'sensor', 'scada_unit'
  name TEXT NOT NULL,
  location JSONB NOT NULL, -- GIS coordinates and spatial data
  status TEXT NOT NULL DEFAULT 'offline',
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Kinesis stream metrics table
CREATE TABLE public.kinesis_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_name TEXT NOT NULL,
  shard_id TEXT NOT NULL,
  records_per_second NUMERIC NOT NULL DEFAULT 0,
  bytes_per_second NUMERIC NOT NULL DEFAULT 0,
  iterator_age_ms NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add SageMaker AI analytics results
CREATE TABLE public.ai_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL,
  model_type TEXT NOT NULL, -- 'anomaly_detection', 'predictive_maintenance', 'load_forecasting'
  prediction_type TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  prediction_data JSONB NOT NULL,
  actual_outcome JSONB,
  is_anomaly BOOLEAN DEFAULT false,
  severity_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add SCADA operations table
CREATE TABLE public.scada_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL,
  operation_type TEXT NOT NULL, -- 'switch_open', 'switch_close', 'breaker_trip', 'load_shed'
  target_device TEXT NOT NULL,
  command_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'executing', 'completed', 'failed'
  executed_by UUID,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add spatial asset management
CREATE TABLE public.gis_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL, -- 'substation', 'transformer', 'power_line', 'switch'
  asset_id TEXT NOT NULL,
  geometry JSONB NOT NULL, -- GeoJSON geometry
  properties JSONB NOT NULL, -- Asset properties and metadata
  status TEXT NOT NULL DEFAULT 'operational',
  last_inspection TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kinesis_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scada_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for iot_devices
CREATE POLICY "Users can manage their own IoT devices" 
ON public.iot_devices 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for kinesis_metrics (system level, read-only for authenticated users)
CREATE POLICY "Authenticated users can view Kinesis metrics" 
ON public.kinesis_metrics 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert Kinesis metrics" 
ON public.kinesis_metrics 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for ai_analytics
CREATE POLICY "Users can view AI analytics for their connections" 
ON public.ai_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM grid_connections 
  WHERE grid_connections.id = ai_analytics.connection_id 
  AND grid_connections.user_id = auth.uid()
));

CREATE POLICY "System can insert AI analytics" 
ON public.ai_analytics 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for scada_operations
CREATE POLICY "Users can manage SCADA operations for their connections" 
ON public.scada_operations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM grid_connections 
  WHERE grid_connections.id = scada_operations.connection_id 
  AND grid_connections.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM grid_connections 
  WHERE grid_connections.id = scada_operations.connection_id 
  AND grid_connections.user_id = auth.uid()
));

-- RLS policies for gis_assets
CREATE POLICY "Users can manage their own GIS assets" 
ON public.gis_assets 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_iot_devices_updated_at
BEFORE UPDATE ON public.iot_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gis_assets_updated_at
BEFORE UPDATE ON public.gis_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_iot_devices_user_id ON public.iot_devices(user_id);
CREATE INDEX idx_iot_devices_device_id ON public.iot_devices(device_id);
CREATE INDEX idx_kinesis_metrics_timestamp ON public.kinesis_metrics(timestamp);
CREATE INDEX idx_ai_analytics_connection_id ON public.ai_analytics(connection_id);
CREATE INDEX idx_ai_analytics_timestamp ON public.ai_analytics(created_at);
CREATE INDEX idx_scada_operations_connection_id ON public.scada_operations(connection_id);
CREATE INDEX idx_gis_assets_user_id ON public.gis_assets(user_id);