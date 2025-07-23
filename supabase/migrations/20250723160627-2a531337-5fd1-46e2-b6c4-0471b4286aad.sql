-- Add RLS Policies for Phase 4 Tables

-- RLS policies for multi_tenant_organizations
CREATE POLICY "Organization admins can manage their organization" 
ON public.multi_tenant_organizations 
FOR ALL
USING (auth.uid() IN (
  SELECT p.user_id FROM profiles p
  JOIN organization_memberships om ON p.id = om.profile_id
  WHERE om.organization_id = multi_tenant_organizations.id 
  AND om.role IN ('admin', 'owner')
));

-- RLS policies for organization_memberships
CREATE POLICY "Members can view their organization memberships" 
ON public.organization_memberships 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = organization_memberships.profile_id
));

-- RLS policies for enterprise_api_keys
CREATE POLICY "Organization members can manage API keys" 
ON public.enterprise_api_keys 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = enterprise_api_keys.organization_id
  AND om.role IN ('admin', 'developer')
));

-- RLS policies for advanced_security_policies
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

-- RLS policies for enterprise_integrations
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

-- RLS policies for deployment_pipelines
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

-- RLS policies for advanced_reporting_templates
CREATE POLICY "Organization members can access reporting templates" 
ON public.advanced_reporting_templates 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = advanced_reporting_templates.organization_id
));

-- RLS policies for enterprise_notifications
CREATE POLICY "Organization members can view relevant notifications" 
ON public.enterprise_notifications 
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organization_memberships om
  JOIN profiles p ON p.id = om.profile_id
  WHERE p.user_id = auth.uid() 
  AND om.organization_id = enterprise_notifications.organization_id
));

-- Create indexes and triggers
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

-- Create updated_at triggers
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