-- Create infrastructure_status table for tracking AWS resources
CREATE TABLE public.infrastructure_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  provider TEXT NOT NULL DEFAULT 'aws',
  total_resources INTEGER NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_actions table for logging AWS resource operations
CREATE TABLE public.resource_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on infrastructure tables
ALTER TABLE public.infrastructure_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for infrastructure_status (system can manage, authenticated users can view)
CREATE POLICY "System can manage infrastructure status" 
ON public.infrastructure_status 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view infrastructure status" 
ON public.infrastructure_status 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policies for resource_actions (system can manage, authenticated users can view)
CREATE POLICY "System can manage resource actions" 
ON public.resource_actions 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view resource actions" 
ON public.resource_actions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_infrastructure_status_timestamp ON public.infrastructure_status(timestamp);
CREATE INDEX idx_infrastructure_status_provider ON public.infrastructure_status(provider);
CREATE INDEX idx_resource_actions_resource_id ON public.resource_actions(resource_id);
CREATE INDEX idx_resource_actions_executed_at ON public.resource_actions(executed_at);