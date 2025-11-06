-- ============================================
-- COMPREHENSIVE MULTI-TENANT UTILITY GRID PLATFORM
-- ============================================

-- 1. ENHANCED TENANT/UTILITY TABLE
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS tenant_id TEXT UNIQUE;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS integration_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS custom_workflows JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS alert_thresholds JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.multi_tenant_organizations ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 365;

-- Generate tenant_id for existing organizations
UPDATE public.multi_tenant_organizations 
SET tenant_id = LOWER(REGEXP_REPLACE(organization_code, '[^a-zA-Z0-9]', '', 'g'))
WHERE tenant_id IS NULL;

ALTER TABLE public.multi_tenant_organizations ALTER COLUMN tenant_id SET NOT NULL;

-- 2. TENANT-AWARE GRID ASSETS
CREATE TABLE IF NOT EXISTS public.tenant_grid_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- substation, transformer, breaker, line, meter
  asset_name TEXT NOT NULL,
  location JSONB NOT NULL,
  geometry JSONB,
  properties JSONB DEFAULT '{}'::jsonb,
  parent_asset_id UUID REFERENCES public.tenant_grid_assets(id),
  voltage_level NUMERIC,
  capacity_rating NUMERIC,
  installation_date TIMESTAMPTZ,
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  operational_status TEXT DEFAULT 'operational',
  health_score NUMERIC DEFAULT 100,
  risk_level TEXT DEFAULT 'low',
  scada_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, asset_id)
);

CREATE INDEX idx_tenant_grid_assets_tenant ON public.tenant_grid_assets(tenant_id);
CREATE INDEX idx_tenant_grid_assets_type ON public.tenant_grid_assets(asset_type);
CREATE INDEX idx_tenant_grid_assets_status ON public.tenant_grid_assets(operational_status);

-- 3. TENANT-AWARE SUBSTATIONS
CREATE TABLE IF NOT EXISTS public.tenant_substations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  substation_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location JSONB NOT NULL,
  voltage_levels JSONB NOT NULL,
  transformer_count INTEGER DEFAULT 0,
  breaker_count INTEGER DEFAULT 0,
  total_capacity_mva NUMERIC,
  current_load_mva NUMERIC,
  operational_status TEXT DEFAULT 'online',
  scada_system TEXT,
  control_mode TEXT DEFAULT 'automatic',
  alarm_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, substation_id)
);

CREATE INDEX idx_tenant_substations_tenant ON public.tenant_substations(tenant_id);
CREATE INDEX idx_tenant_substations_status ON public.tenant_substations(operational_status);

-- 4. TENANT-AWARE OUTAGES
CREATE TABLE IF NOT EXISTS public.tenant_outages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  outage_id TEXT NOT NULL,
  outage_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  affected_area JSONB NOT NULL,
  affected_customers INTEGER DEFAULT 0,
  affected_assets JSONB DEFAULT '[]'::jsonb,
  cause TEXT,
  reported_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  estimated_restoration TIMESTAMPTZ,
  actual_restoration TIMESTAMPTZ,
  crew_assigned JSONB DEFAULT '[]'::jsonb,
  customer_communications JSONB DEFAULT '[]'::jsonb,
  restoration_priority INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, outage_id)
);

CREATE INDEX idx_tenant_outages_tenant ON public.tenant_outages(tenant_id);
CREATE INDEX idx_tenant_outages_status ON public.tenant_outages(status);
CREATE INDEX idx_tenant_outages_severity ON public.tenant_outages(severity);

-- 5. TENANT-AWARE SCADA DATA
CREATE TABLE IF NOT EXISTS public.tenant_scada_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.tenant_grid_assets(id),
  tag_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  quality TEXT DEFAULT 'good',
  timestamp TIMESTAMPTZ DEFAULT now(),
  data_type TEXT NOT NULL,
  unit TEXT,
  alarm_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tenant_scada_tenant ON public.tenant_scada_data(tenant_id);
CREATE INDEX idx_tenant_scada_asset ON public.tenant_scada_data(asset_id);
CREATE INDEX idx_tenant_scada_timestamp ON public.tenant_scada_data(timestamp DESC);

-- Enable realtime for SCADA data
ALTER TABLE public.tenant_scada_data REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_scada_data;

-- 6. TENANT-AWARE CIRCUITS
CREATE TABLE IF NOT EXISTS public.tenant_circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  circuit_id TEXT NOT NULL,
  name TEXT NOT NULL,
  substation_id UUID REFERENCES public.tenant_substations(id),
  voltage_level NUMERIC NOT NULL,
  circuit_type TEXT NOT NULL,
  length_miles NUMERIC,
  conductor_type TEXT,
  protection_scheme JSONB,
  topology JSONB,
  status TEXT DEFAULT 'energized',
  load_current_amps NUMERIC,
  capacity_amps NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, circuit_id)
);

CREATE INDEX idx_tenant_circuits_tenant ON public.tenant_circuits(tenant_id);
CREATE INDEX idx_tenant_circuits_substation ON public.tenant_circuits(substation_id);

-- 7. TENANT CONFIGURATION & CUSTOMIZATION
CREATE TABLE IF NOT EXISTS public.tenant_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT UNIQUE NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  dashboard_layout JSONB DEFAULT '{}'::jsonb,
  enabled_features JSONB DEFAULT '[]'::jsonb,
  alert_rules JSONB DEFAULT '[]'::jsonb,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  data_refresh_interval INTEGER DEFAULT 30,
  map_default_view JSONB,
  custom_metrics JSONB DEFAULT '[]'::jsonb,
  integration_endpoints JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TENANT USER ROLES (Enhanced)
CREATE TYPE public.tenant_role AS ENUM (
  'super_admin',
  'tenant_admin', 
  'grid_operator',
  'field_technician',
  'analyst',
  'viewer'
);

CREATE TABLE IF NOT EXISTS public.tenant_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  role public.tenant_role NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tenant_id, role)
);

CREATE INDEX idx_tenant_user_roles_user ON public.tenant_user_roles(user_id);
CREATE INDEX idx_tenant_user_roles_tenant ON public.tenant_user_roles(tenant_id);

-- 9. SECURITY DEFINER FUNCTIONS FOR TENANT ACCESS
CREATE OR REPLACE FUNCTION public.get_user_tenants(user_uuid UUID)
RETURNS TABLE(tenant_id TEXT, role TEXT) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id, role::text
  FROM public.tenant_user_roles
  WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.user_has_tenant_access(user_uuid UUID, check_tenant_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_user_roles
    WHERE user_id = user_uuid
      AND tenant_id = check_tenant_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_tenant_role(user_uuid UUID, check_tenant_id TEXT, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_user_roles
    WHERE user_id = user_uuid
      AND tenant_id = check_tenant_id
      AND role::text = check_role
  );
$$;

-- 10. ROW LEVEL SECURITY POLICIES

-- Tenant Grid Assets RLS
ALTER TABLE public.tenant_grid_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets for their tenants"
ON public.tenant_grid_assets FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

CREATE POLICY "Operators can manage assets for their tenants"
ON public.tenant_grid_assets FOR ALL
USING (
  public.user_has_tenant_role(auth.uid(), tenant_id, 'tenant_admin') OR
  public.user_has_tenant_role(auth.uid(), tenant_id, 'grid_operator')
);

-- Tenant Substations RLS
ALTER TABLE public.tenant_substations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view substations for their tenants"
ON public.tenant_substations FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

CREATE POLICY "Operators can manage substations for their tenants"
ON public.tenant_substations FOR ALL
USING (
  public.user_has_tenant_role(auth.uid(), tenant_id, 'tenant_admin') OR
  public.user_has_tenant_role(auth.uid(), tenant_id, 'grid_operator')
);

-- Tenant Outages RLS
ALTER TABLE public.tenant_outages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view outages for their tenants"
ON public.tenant_outages FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

CREATE POLICY "Operators can manage outages for their tenants"
ON public.tenant_outages FOR ALL
USING (
  public.user_has_tenant_role(auth.uid(), tenant_id, 'tenant_admin') OR
  public.user_has_tenant_role(auth.uid(), tenant_id, 'grid_operator') OR
  public.user_has_tenant_role(auth.uid(), tenant_id, 'field_technician')
);

-- Tenant SCADA Data RLS
ALTER TABLE public.tenant_scada_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SCADA data for their tenants"
ON public.tenant_scada_data FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

CREATE POLICY "System can insert SCADA data"
ON public.tenant_scada_data FOR INSERT
WITH CHECK (true);

-- Tenant Circuits RLS
ALTER TABLE public.tenant_circuits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view circuits for their tenants"
ON public.tenant_circuits FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

CREATE POLICY "Operators can manage circuits for their tenants"
ON public.tenant_circuits FOR ALL
USING (
  public.user_has_tenant_role(auth.uid(), tenant_id, 'tenant_admin') OR
  public.user_has_tenant_role(auth.uid(), tenant_id, 'grid_operator')
);

-- Tenant Configurations RLS
ALTER TABLE public.tenant_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view config for their tenants"
ON public.tenant_configurations FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

CREATE POLICY "Admins can manage config for their tenants"
ON public.tenant_configurations FOR ALL
USING (public.user_has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

-- Tenant User Roles RLS
ALTER TABLE public.tenant_user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tenant roles"
ON public.tenant_user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Tenant admins can manage roles"
ON public.tenant_user_roles FOR ALL
USING (public.user_has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

-- 11. DATA INGESTION LOGS
CREATE TABLE IF NOT EXISTS public.tenant_data_ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES public.multi_tenant_organizations(tenant_id) ON DELETE CASCADE,
  source_system TEXT NOT NULL,
  data_type TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  error_details JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ingestion_logs_tenant ON public.tenant_data_ingestion_logs(tenant_id);
CREATE INDEX idx_ingestion_logs_status ON public.tenant_data_ingestion_logs(status);

ALTER TABLE public.tenant_data_ingestion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ingestion logs for their tenants"
ON public.tenant_data_ingestion_logs FOR SELECT
USING (public.user_has_tenant_access(auth.uid(), tenant_id));

-- 12. AUTOMATED TIMESTAMP UPDATES
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_grid_assets_updated_at
  BEFORE UPDATE ON public.tenant_grid_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_substations_updated_at
  BEFORE UPDATE ON public.tenant_substations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_outages_updated_at
  BEFORE UPDATE ON public.tenant_outages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_circuits_updated_at
  BEFORE UPDATE ON public.tenant_circuits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_configurations_updated_at
  BEFORE UPDATE ON public.tenant_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();