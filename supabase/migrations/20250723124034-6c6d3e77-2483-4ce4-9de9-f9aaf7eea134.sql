-- Enhanced schema for full utility operations platform

-- User roles for access control
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'field_technician', 'analyst', 'compliance_officer');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enhanced GIS assets table
ALTER TABLE public.gis_assets ADD COLUMN IF NOT EXISTS 
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE;

ALTER TABLE public.gis_assets ADD COLUMN IF NOT EXISTS 
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE public.gis_assets ADD COLUMN IF NOT EXISTS 
    maintenance_schedule JSONB DEFAULT '{}';

-- Environmental data table
CREATE TABLE public.environmental_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE NOT NULL,
    data_type TEXT NOT NULL, -- 'weather', 'flood_risk', 'vegetation', 'wildlife'
    coordinates JSONB NOT NULL,
    severity_level TEXT DEFAULT 'low' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    source TEXT, -- 'satellite', 'drone', 'sensor', 'manual'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance tracking table
CREATE TABLE public.compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE NOT NULL,
    regulation_type TEXT NOT NULL, -- 'NERC_CIP', 'FERC', 'EPA', 'OSHA'
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending', 'reviewing')),
    last_audit_date TIMESTAMP WITH TIME ZONE,
    next_audit_date TIMESTAMP WITH TIME ZONE,
    findings JSONB DEFAULT '[]',
    corrective_actions JSONB DEFAULT '[]',
    responsible_person UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Predictive analytics table
CREATE TABLE public.predictive_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE NOT NULL,
    asset_id TEXT NOT NULL,
    prediction_type TEXT NOT NULL, -- 'failure', 'maintenance', 'performance'
    probability NUMERIC(5,4) CHECK (probability >= 0 AND probability <= 1),
    predicted_date TIMESTAMP WITH TIME ZONE,
    confidence_score NUMERIC(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    input_features JSONB NOT NULL,
    model_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile field operations table
CREATE TABLE public.field_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE NOT NULL,
    technician_id UUID REFERENCES auth.users(id) NOT NULL,
    operation_type TEXT NOT NULL, -- 'inspection', 'maintenance', 'repair', 'installation'
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    location JSONB NOT NULL,
    description TEXT,
    findings JSONB DEFAULT '{}',
    photos JSONB DEFAULT '[]',
    offline_data JSONB DEFAULT '{}', -- For offline mobile sync
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer service integration table
CREATE TABLE public.customer_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE NOT NULL,
    incident_type TEXT NOT NULL, -- 'outage', 'voltage_issue', 'billing_query', 'service_request'
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    customer_info JSONB NOT NULL,
    location JSONB,
    description TEXT NOT NULL,
    estimated_resolution TIMESTAMP WITH TIME ZONE,
    actual_resolution TIMESTAMP WITH TIME ZONE,
    affected_customers INTEGER DEFAULT 1,
    communication_log JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cyber security events table
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'intrusion_attempt', 'anomaly', 'policy_violation', 'malware'
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source_ip INET,
    target_system TEXT,
    event_details JSONB NOT NULL,
    status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'mitigated', 'resolved')),
    response_actions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Spatial ETL jobs table
CREATE TABLE public.etl_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE,
    job_name TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'CAD', 'SCADA', 'CIM', 'GIS', 'CSV'
    source_config JSONB NOT NULL,
    transformation_rules JSONB NOT NULL,
    target_format TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress_percentage INTEGER DEFAULT 0,
    records_processed INTEGER DEFAULT 0,
    error_log JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Digital twin topology table
CREATE TABLE public.grid_topology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE NOT NULL,
    node_id TEXT NOT NULL,
    node_type TEXT NOT NULL, -- 'substation', 'transformer', 'line', 'switch', 'breaker'
    properties JSONB NOT NULL,
    coordinates JSONB,
    connections JSONB DEFAULT '[]', -- Connected node IDs
    operational_status TEXT DEFAULT 'online' CHECK (operational_status IN ('online', 'offline', 'maintenance', 'fault')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (connection_id, node_id)
);

-- GIS Copilot query history
CREATE TABLE public.copilot_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    connection_id UUID REFERENCES public.grid_connections(id) ON DELETE CASCADE,
    natural_query TEXT NOT NULL,
    generated_sql TEXT,
    executed_successfully BOOLEAN DEFAULT false,
    results_summary JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_topology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_queries ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies
CREATE POLICY "Users can manage their own roles" ON public.user_roles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view environmental data for their connections" ON public.environmental_data
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM grid_connections 
        WHERE grid_connections.id = environmental_data.connection_id 
        AND grid_connections.user_id = auth.uid()
    ));

CREATE POLICY "System can insert environmental data" ON public.environmental_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage compliance for their connections" ON public.compliance_records
    FOR ALL USING (EXISTS (
        SELECT 1 FROM grid_connections 
        WHERE grid_connections.id = compliance_records.connection_id 
        AND grid_connections.user_id = auth.uid()
    ));

CREATE POLICY "Users can view analytics for their connections" ON public.predictive_analytics
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM grid_connections 
        WHERE grid_connections.id = predictive_analytics.connection_id 
        AND grid_connections.user_id = auth.uid()
    ));

CREATE POLICY "System can insert analytics" ON public.predictive_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage field operations for their connections" ON public.field_operations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM grid_connections 
        WHERE grid_connections.id = field_operations.connection_id 
        AND grid_connections.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage customer incidents for their connections" ON public.customer_incidents
    FOR ALL USING (EXISTS (
        SELECT 1 FROM grid_connections 
        WHERE grid_connections.id = customer_incidents.connection_id 
        AND grid_connections.user_id = auth.uid()
    ));

CREATE POLICY "Users can view security events for their connections" ON public.security_events
    FOR SELECT USING (
        connection_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM grid_connections 
            WHERE grid_connections.id = security_events.connection_id 
            AND grid_connections.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert security events" ON public.security_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage ETL jobs for their connections" ON public.etl_jobs
    FOR ALL USING (
        connection_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM grid_connections 
            WHERE grid_connections.id = etl_jobs.connection_id 
            AND grid_connections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage topology for their connections" ON public.grid_topology
    FOR ALL USING (EXISTS (
        SELECT 1 FROM grid_connections 
        WHERE grid_connections.id = grid_topology.connection_id 
        AND grid_connections.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own copilot queries" ON public.copilot_queries
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_environmental_data_connection_id ON public.environmental_data(connection_id);
CREATE INDEX idx_environmental_data_type ON public.environmental_data(data_type);
CREATE INDEX idx_compliance_records_connection_id ON public.compliance_records(connection_id);
CREATE INDEX idx_compliance_records_regulation ON public.compliance_records(regulation_type);
CREATE INDEX idx_predictive_analytics_connection_id ON public.predictive_analytics(connection_id);
CREATE INDEX idx_field_operations_connection_id ON public.field_operations(connection_id);
CREATE INDEX idx_field_operations_technician ON public.field_operations(technician_id);
CREATE INDEX idx_customer_incidents_connection_id ON public.customer_incidents(connection_id);
CREATE INDEX idx_security_events_connection_id ON public.security_events(connection_id);
CREATE INDEX idx_etl_jobs_connection_id ON public.etl_jobs(connection_id);
CREATE INDEX idx_grid_topology_connection_id ON public.grid_topology(connection_id);
CREATE INDEX idx_copilot_queries_user_id ON public.copilot_queries(user_id);

-- Add update triggers for updated_at columns
CREATE TRIGGER update_environmental_data_updated_at
    BEFORE UPDATE ON public.environmental_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at
    BEFORE UPDATE ON public.compliance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_field_operations_updated_at
    BEFORE UPDATE ON public.field_operations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_incidents_updated_at
    BEFORE UPDATE ON public.customer_incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_etl_jobs_updated_at
    BEFORE UPDATE ON public.etl_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grid_topology_updated_at
    BEFORE UPDATE ON public.grid_topology
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();