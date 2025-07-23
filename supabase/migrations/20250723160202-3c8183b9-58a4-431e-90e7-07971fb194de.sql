-- Phase 4: Enterprise Integration & Advanced Security Tables

-- Create multi_tenant_organizations table for enterprise multi-tenancy
CREATE TABLE public.multi_tenant_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL UNIQUE,
  organization_code TEXT NOT NULL UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  max_users INTEGER NOT NULL DEFAULT 10,
  max_connections INTEGER NOT NULL DEFAULT 5,
  features_enabled JSONB NOT NULL DEFAULT '{}'::jsonb,
  billing_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enterprise_api_keys table for API management
CREATE TABLE public.enterprise_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rate_limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_whitelist JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advanced_security_policies table for enterprise security
CREATE TABLE public.advanced_security_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  policy_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  enforcement_level TEXT NOT NULL DEFAULT 'warn',
  affected_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  compliance_frameworks JSONB NOT NULL DEFAULT '[]'::jsonb,
  violation_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_evaluation TIMESTAMP WITH TIME ZONE,
  violations_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enterprise_integrations table for external system integrations
CREATE TABLE public.enterprise_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  authentication_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  sync_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployment_pipelines table for DevOps automation
CREATE TABLE public.deployment_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  pipeline_name TEXT NOT NULL,
  pipeline_type TEXT NOT NULL,
  source_repository JSONB NOT NULL DEFAULT '{}'::jsonb,
  deployment_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  environment_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  deployment_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_version TEXT,
  last_deployment TIMESTAMP WITH TIME ZONE,
  deployment_status TEXT NOT NULL DEFAULT 'idle',
  auto_deploy_enabled BOOLEAN NOT NULL DEFAULT false,
  rollback_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  monitoring_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advanced_reporting_templates table for enterprise reporting
CREATE TABLE public.advanced_reporting_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  query_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  visualization_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  distribution_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_generated TIMESTAMP WITH TIME ZONE,
  generation_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enterprise_notifications table for advanced notification management
CREATE TABLE public.enterprise_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  priority_level TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_audience JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions_taken JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all Phase 4 tables
ALTER TABLE public.multi_tenant_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_reporting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi_tenant_organizations
CREATE POLICY "Organization admins can manage their organization" 
ON public.multi_tenant_organizations 
FOR ALL
USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE role = 'admin' 
  AND id IN (SELECT profile_id FROM organization_memberships WHERE organization_id = multi_tenant_organizations.id)
));

-- Create RLS policies for enterprise_api_keys
CREATE POLICY "Organization members can manage API keys" 
ON public.enterprise_api_keys 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = enterprise_api_keys.organization_id
));

-- Create RLS policies for advanced_security_policies
CREATE POLICY "Organization security admins can manage policies" 
ON public.advanced_security_policies 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = advanced_security_policies.organization_id
  AND om.role IN ('admin', 'security_admin')
));

-- Create RLS policies for enterprise_integrations
CREATE POLICY "Organization admins can manage integrations" 
ON public.enterprise_integrations 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = enterprise_integrations.organization_id
  AND om.role IN ('admin', 'integration_admin')
));

-- Create RLS policies for deployment_pipelines
CREATE POLICY "Organization devops can manage pipelines" 
ON public.deployment_pipelines 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = deployment_pipelines.organization_id
  AND om.role IN ('admin', 'devops', 'developer')
));

-- Create RLS policies for advanced_reporting_templates
CREATE POLICY "Organization members can access reporting templates" 
ON public.advanced_reporting_templates 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = advanced_reporting_templates.organization_id
));

-- Create RLS policies for enterprise_notifications
CREATE POLICY "Organization members can view relevant notifications" 
ON public.enterprise_notifications 
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = enterprise_notifications.organization_id
));

-- Create supporting tables for organization membership
CREATE TABLE public.organization_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES multi_tenant_organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(organization_id, profile_id)
);

ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organization memberships" 
ON public.organization_memberships 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = organization_memberships.profile_id
));

-- Create indexes for better performance
CREATE INDEX idx_multi_tenant_organizations_code ON public.multi_tenant_organizations(organization_code);
CREATE INDEX idx_enterprise_api_keys_organization ON public.enterprise_api_keys(organization_id);
CREATE INDEX idx_enterprise_api_keys_hash ON public.enterprise_api_keys(api_key_hash);
CREATE INDEX idx_advanced_security_policies_org ON public.advanced_security_policies(organization_id);
CREATE INDEX idx_enterprise_integrations_org ON public.enterprise_integrations(organization_id);
CREATE INDEX idx_deployment_pipelines_org ON public.deployment_pipelines(organization_id);
CREATE INDEX idx_advanced_reporting_templates_org ON public.advanced_reporting_templates(organization_id);
CREATE INDEX idx_enterprise_notifications_org ON public.enterprise_notifications(organization_id);
CREATE INDEX idx_organization_memberships_org ON public.organization_memberships(organization_id);
CREATE INDEX idx_organization_memberships_profile ON public.organization_memberships(profile_id);

-- Create updated_at triggers for all Phase 4 tables
CREATE TRIGGER update_multi_tenant_organizations_updated_at
BEFORE UPDATE ON public.multi_tenant_organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_api_keys_updated_at
BEFORE UPDATE ON public.enterprise_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advanced_security_policies_updated_at
BEFORE UPDATE ON public.advanced_security_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_integrations_updated_at
BEFORE UPDATE ON public.enterprise_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deployment_pipelines_updated_at
BEFORE UPDATE ON public.deployment_pipelines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advanced_reporting_templates_updated_at
BEFORE UPDATE ON public.advanced_reporting_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();