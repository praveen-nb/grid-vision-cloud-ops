import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Zap, 
  Gauge, 
  Camera, 
  Wifi, 
  Bot,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MonitoringRecommendation {
  id: string;
  category: 'efficiency' | 'security' | 'predictive' | 'automation' | 'compliance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  benefits: string[];
  icon: React.ReactNode;
  priority: number;
}

interface EnhancedMonitoringRecommendationsProps {
  substationData: {
    metrics: any[];
    alerts: any[];
    connectionStatus: string;
    operatingHours: number;
  };
}

export function EnhancedMonitoringRecommendations({ substationData }: EnhancedMonitoringRecommendationsProps) {
  const generateRecommendations = (): MonitoringRecommendation[] => {
    const recommendations: MonitoringRecommendation[] = [
      {
        id: 'predictive-maintenance',
        category: 'predictive',
        title: 'AI-Powered Predictive Maintenance',
        description: 'Implement machine learning models to predict equipment failures before they occur',
        impact: 'high',
        effort: 'medium',
        benefits: [
          'Reduce unplanned downtime by 40-60%',
          'Extend equipment lifespan by 15-25%',
          'Optimize maintenance scheduling',
          'Lower operational costs'
        ],
        icon: <Bot className="h-5 w-5 text-blue-500" />,
        priority: 1
      },
      {
        id: 'thermal-monitoring',
        category: 'efficiency',
        title: 'Advanced Thermal Imaging',
        description: 'Deploy thermal cameras for real-time hot spot detection and thermal analysis',
        impact: 'high',
        effort: 'medium',
        benefits: [
          'Early fire risk detection',
          'Equipment overheating prevention',
          'Energy efficiency optimization',
          'Automated thermal mapping'
        ],
        icon: <Camera className="h-5 w-5 text-red-500" />,
        priority: 2
      },
      {
        id: 'vibration-analysis',
        category: 'predictive',
        title: 'Vibration & Acoustic Monitoring',
        description: 'Install sensors for continuous vibration and sound pattern analysis',
        impact: 'medium',
        effort: 'low',
        benefits: [
          'Detect mechanical wear early',
          'Monitor bearing conditions',
          'Identify loose connections',
          'Prevent catastrophic failures'
        ],
        icon: <Gauge className="h-5 w-5 text-orange-500" />,
        priority: 3
      },
      {
        id: 'cybersecurity-enhancement',
        category: 'security',
        title: 'Enhanced Cybersecurity Layer',
        description: 'Implement advanced threat detection and network segmentation',
        impact: 'high',
        effort: 'high',
        benefits: [
          'Real-time threat detection',
          'Network anomaly identification',
          'Secure remote access',
          'Compliance with industry standards'
        ],
        icon: <Shield className="h-5 w-5 text-purple-500" />,
        priority: 4
      },
      {
        id: 'smart-grid-integration',
        category: 'automation',
        title: 'Smart Grid Communication',
        description: 'Enable bidirectional communication with grid management systems',
        impact: 'high',
        effort: 'high',
        benefits: [
          'Real-time demand response',
          'Automated load balancing',
          'Grid stability improvement',
          'Energy trading capabilities'
        ],
        icon: <Wifi className="h-5 w-5 text-green-500" />,
        priority: 5
      },
      {
        id: 'environmental-monitoring',
        category: 'compliance',
        title: 'Environmental Condition Tracking',
        description: 'Monitor air quality, humidity, and environmental factors',
        impact: 'medium',
        effort: 'low',
        benefits: [
          'Equipment protection from environmental damage',
          'Regulatory compliance',
          'Air quality monitoring',
          'Weather impact assessment'
        ],
        icon: <TrendingUp className="h-5 w-5 text-teal-500" />,
        priority: 6
      },
      {
        id: 'mobile-workforce',
        category: 'efficiency',
        title: 'Mobile Workforce Management',
        description: 'Equip field teams with mobile apps for real-time data access',
        impact: 'medium',
        effort: 'medium',
        benefits: [
          'Faster incident response',
          'Real-time data collection',
          'Improved communication',
          'Digital work order management'
        ],
        icon: <Users className="h-5 w-5 text-indigo-500" />,
        priority: 7
      },
      {
        id: 'historical-analytics',
        category: 'efficiency',
        title: 'Advanced Historical Analytics',
        description: 'Implement deep data mining and pattern recognition systems',
        impact: 'medium',
        effort: 'medium',
        benefits: [
          'Long-term trend analysis',
          'Performance optimization insights',
          'Capacity planning support',
          'Regulatory reporting automation'
        ],
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        priority: 8
      }
    ];

    // Customize recommendations based on current substation data
    if (substationData.alerts.length > 5) {
      recommendations[0].priority = 0; // Boost predictive maintenance priority
    }
    
    if (substationData.connectionStatus === 'unstable') {
      recommendations.find(r => r.id === 'cybersecurity-enhancement')!.priority = 1;
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  };

  const recommendations = generateRecommendations();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Enhanced Monitoring Recommendations</h2>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Based on your current substation monitoring data, we've identified {recommendations.length} opportunities 
          to enhance your monitoring capabilities and improve operational efficiency.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={rec.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {rec.icon}
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">{rec.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  #{index + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Impact and Effort indicators */}
                <div className="flex gap-2">
                  <Badge className={getImpactColor(rec.impact)}>
                    {rec.impact.toUpperCase()} IMPACT
                  </Badge>
                  <Badge variant="outline" className={getEffortColor(rec.effort)}>
                    {rec.effort.toUpperCase()} EFFORT
                  </Badge>
                  <Badge variant="secondary">
                    {rec.category.toUpperCase()}
                  </Badge>
                </div>

                {/* Benefits list */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {rec.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Learn More
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Get Quote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Implementation Timeline</CardTitle>
          <CardDescription>
            Prioritized roadmap for implementing enhanced monitoring capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-green-600 mb-2">Phase 1 (0-3 months)</h4>
                <ul className="space-y-1 text-sm">
                  {recommendations.slice(0, 2).map(rec => (
                    <li key={rec.id} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {rec.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-yellow-600 mb-2">Phase 2 (3-9 months)</h4>
                <ul className="space-y-1 text-sm">
                  {recommendations.slice(2, 5).map(rec => (
                    <li key={rec.id} className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      {rec.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-blue-600 mb-2">Phase 3 (9+ months)</h4>
                <ul className="space-y-1 text-sm">
                  {recommendations.slice(5).map(rec => (
                    <li key={rec.id} className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      {rec.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}