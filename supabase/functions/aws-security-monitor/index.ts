import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  sourceIp?: string;
  targetResource?: string;
  actions?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulate AWS CloudTrail and Security Hub API calls
    const securityEvents = await getSecurityEvents();
    const complianceStatus = await getComplianceStatus();
    const threatIntelligence = await getThreatIntelligence();

    // Store security events in Supabase
    for (const event of securityEvents) {
      const { error } = await supabaseClient
        .from('security_events')
        .upsert({
          event_type: event.type,
          severity: event.severity,
          event_details: {
            message: event.message,
            sourceIp: event.sourceIp,
            targetResource: event.targetResource,
            actions: event.actions
          },
          status: event.resolved ? 'resolved' : 'detected',
          target_system: event.targetResource || 'aws-infrastructure',
          source_ip: event.sourceIp || null
        });

      if (error) {
        console.error('Error storing security event:', error);
      }
    }

    console.log(`Processed ${securityEvents.length} security events`);

    return new Response(
      JSON.stringify({
        success: true,
        events: securityEvents,
        compliance: complianceStatus,
        threats: threatIntelligence,
        summary: {
          totalEvents: securityEvents.length,
          criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
          unresolvedEvents: securityEvents.filter(e => !e.resolved).length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error monitoring AWS security:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getSecurityEvents(): Promise<SecurityEvent[]> {
  // Simulate CloudTrail and Security Hub events
  const events: SecurityEvent[] = [];
  
  // Generate some realistic security events
  const eventTypes = [
    'Unauthorized Access Attempt',
    'Configuration Change',
    'Suspicious API Activity',
    'Failed Authentication',
    'Data Access Anomaly',
    'Resource Modification',
    'Network Traffic Anomaly',
    'Privilege Escalation Attempt'
  ];

  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    events.push({
      id: `evt-${Date.now()}-${i}`,
      type: eventType,
      severity,
      message: generateEventMessage(eventType, severity),
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      resolved: Math.random() > 0.6,
      sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetResource: `i-${Math.random().toString(36).substr(2, 9)}`,
      actions: generateRecommendedActions(eventType, severity)
    });
  }

  return events;
}

function generateEventMessage(eventType: string, severity: string): string {
  const messages = {
    'Unauthorized Access Attempt': [
      'Multiple failed login attempts detected',
      'Access denied for unauthorized user',
      'Brute force attack pattern identified'
    ],
    'Configuration Change': [
      'Security group rules modified',
      'IAM policy updated',
      'Network ACL configuration changed'
    ],
    'Suspicious API Activity': [
      'Unusual API call patterns detected',
      'High volume of API requests from single source',
      'API calls from unknown geographic location'
    ],
    'Failed Authentication': [
      'Invalid credentials provided',
      'MFA challenge failed',
      'Authentication timeout exceeded'
    ],
    'Data Access Anomaly': [
      'Unusual data access pattern detected',
      'Large volume data download attempted',
      'Access to sensitive data outside business hours'
    ],
    'Resource Modification': [
      'Critical resource configuration changed',
      'Unexpected resource deletion attempt',
      'Resource tags modified without authorization'
    ],
    'Network Traffic Anomaly': [
      'Unusual network traffic pattern detected',
      'Traffic from blacklisted IP addresses',
      'Potential data exfiltration attempt'
    ],
    'Privilege Escalation Attempt': [
      'Attempt to assume higher privileges detected',
      'Unauthorized role assumption',
      'Admin action from non-admin account'
    ]
  };

  const eventMessages = messages[eventType as keyof typeof messages] || ['Unknown security event'];
  return eventMessages[Math.floor(Math.random() * eventMessages.length)];
}

function generateRecommendedActions(eventType: string, severity: string): string[] {
  const baseActions = ['Review logs', 'Monitor activity'];
  
  const specificActions = {
    'Unauthorized Access Attempt': ['Block source IP', 'Reset affected passwords', 'Enable MFA'],
    'Configuration Change': ['Review change approval', 'Verify authorization', 'Audit permissions'],
    'Suspicious API Activity': ['Rate limit API calls', 'Investigate source', 'Update API keys'],
    'Failed Authentication': ['Lock account temporarily', 'Notify user', 'Check for compromise'],
    'Data Access Anomaly': ['Restrict data access', 'Investigate user activity', 'Review permissions'],
    'Resource Modification': ['Rollback changes', 'Review approval process', 'Audit access'],
    'Network Traffic Anomaly': ['Block suspicious traffic', 'Update firewall rules', 'Investigate endpoint'],
    'Privilege Escalation Attempt': ['Revoke elevated access', 'Audit role assignments', 'Investigate account']
  };

  const actions = [...baseActions];
  const specific = specificActions[eventType as keyof typeof specificActions];
  if (specific) {
    actions.push(...specific);
  }

  if (severity === 'critical' || severity === 'high') {
    actions.push('Immediate escalation required', 'Contact security team');
  }

  return actions;
}

async function getComplianceStatus() {
  // Simulate compliance checks
  return {
    overall: 'compliant',
    frameworks: {
      'SOC 2': { status: 'compliant', score: 95 },
      'NIST': { status: 'non-compliant', score: 78 },
      'ISO 27001': { status: 'compliant', score: 88 }
    }
  };
}

async function getThreatIntelligence() {
  // Simulate threat intelligence data
  return {
    activeThreatIndicators: Math.floor(Math.random() * 10),
    blockedIPs: Math.floor(Math.random() * 50) + 10,
    malwareDetections: Math.floor(Math.random() * 5),
    lastUpdate: new Date().toISOString()
  };
}