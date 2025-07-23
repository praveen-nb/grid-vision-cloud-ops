import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  WifiOff,
  Server,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { useGridConnections } from '@/hooks/useGridConnections';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EnhancedMonitoringRecommendations } from './enhanced-monitoring-recommendations';
import { SubstationManagement } from './substation-management';
import { SystemControlPanel } from './system-control-panel';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, trend, status, icon }) => {
  const statusColors = {
    normal: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  };

  const statusBgColors = {
    normal: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-red-50 border-red-200'
  };

  return (
    <Card className={`${statusBgColors[status]} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={statusColors[status]}>{icon}</div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {trend && (
            <div className="flex items-center">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              {trend === 'stable' && <div className="h-4 w-4 rounded-full bg-gray-400" />}
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-bold ${statusColors[status]}`}>
            {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function EnhancedLiveMonitoring() {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);

  const { connections, stats, loading: connectionsLoading } = useGridConnections();
  const { 
    metrics, 
    alerts, 
    analytics, 
    loading: metricsLoading, 
    resolveAlert 
  } = useRealTimeMetrics(selectedConnectionId || undefined);
  const { 
    events: securityEvents, 
    metrics: securityMetrics, 
    loading: securityLoading 
  } = useSecurityMonitoring();

  // Auto-select first connection if none selected
  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  // Process metrics for charts
  const processedMetrics = React.useMemo(() => {
    const grouped = metrics.reduce((acc, metric) => {
      const timestamp = new Date(metric.timestamp).toLocaleTimeString();
      const existing = acc.find(item => item.timestamp === timestamp);
      
      if (existing) {
        existing[metric.metric_type] = metric.value;
      } else {
        acc.push({
          timestamp,
          [metric.metric_type]: metric.value
        });
      }
      return acc;
    }, [] as any[]);

    return grouped.slice(-20); // Last 20 data points
  }, [metrics]);

  // Get latest metrics for display
  const latestMetrics = React.useMemo(() => {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_type] || new Date(metric.timestamp) > new Date(acc[metric.metric_type].timestamp)) {
        acc[metric.metric_type] = metric;
      }
      return acc;
    }, {} as Record<string, any>);
  }, [metrics]);

  const getMetricStatus = (type: string, value: number): 'normal' | 'warning' | 'critical' => {
    switch (type) {
      case 'voltage':
        if (value < 200 || value > 250) return 'critical';
        if (value < 210 || value > 240) return 'warning';
        return 'normal';
      case 'frequency':
        if (value < 49 || value > 51) return 'critical';
        if (value < 49.5 || value > 50.5) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 80) return 'critical';
        if (value > 60) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  if (connectionsLoading || metricsLoading || securityLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Live Monitoring</h1>
          <p className="text-muted-foreground">Real-time grid monitoring with AI analytics and security</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={monitoringEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setMonitoringEnabled(!monitoringEnabled)}
          >
            {monitoringEnabled ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {monitoringEnabled ? 'Monitoring On' : 'Monitoring Off'}
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Grid Connections</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{stats.connected}/{stats.total}</div>
              <div className="text-sm text-muted-foreground">Active connections</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Active Alerts</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-yellow-600">{alerts.length}</div>
              <div className="text-sm text-muted-foreground">Unresolved alerts</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span className="font-medium">Security Events</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-red-600">{securityMetrics.activeThreats}</div>
              <div className="text-sm text-muted-foreground">Active threats</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="font-medium">AI Analytics</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">{analytics.filter(a => a.is_anomaly).length}</div>
              <div className="text-sm text-muted-foreground">Anomalies detected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Selection */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grid Connections</CardTitle>
            <CardDescription>Select a connection to monitor in detail</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((connection) => (
                <Card 
                  key={connection.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedConnectionId === connection.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedConnectionId(connection.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{connection.name}</div>
                        <div className="text-sm text-muted-foreground">{connection.location}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {connection.status === 'connected' ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                          {connection.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="control">System Control</TabsTrigger>
          <TabsTrigger value="substations">Substation Management</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Total Substations</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Registered substations</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Operational</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
                  <div className="text-sm text-muted-foreground">Active connections</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Active Alerts</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-yellow-600">{alerts.length}</div>
                  <div className="text-sm text-muted-foreground">Unresolved issues</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">AI Insights</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-purple-600">{analytics.filter(a => a.is_anomaly).length}</div>
                  <div className="text-sm text-muted-foreground">Anomalies detected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{alert.alert_type.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">{alert.message}</div>
                      </div>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No recent alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(latestMetrics).slice(0, 4).map(([type, metric]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{metric.value.toFixed(1)} {metric.unit}</div>
                        <Badge variant="outline" className="text-xs">
                          {getMetricStatus(type, metric.value)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control">
          <SystemControlPanel />
        </TabsContent>

        <TabsContent value="substations">
          <SubstationManagement />
        </TabsContent>

        <TabsContent value="monitoring">
          {selectedConnectionId && monitoringEnabled ? (
            <Tabs defaultValue="metrics" className="space-y-6">
              <TabsList>
                <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
                <TabsTrigger value="alerts">Alerts & Events</TabsTrigger>
                <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
                <TabsTrigger value="security">Security Monitor</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(latestMetrics).map(([type, metric]) => (
                    <MetricCard
                      key={type}
                      title={type.charAt(0).toUpperCase() + type.slice(1)}
                      value={metric.value.toFixed(type === 'frequency' ? 2 : 1)}
                      unit={metric.unit}
                      status={getMetricStatus(type, metric.value)}
                      icon={<Zap className="h-4 w-4" />}
                    />
                  ))}
                </div>

                {/* Charts */}
                {processedMetrics.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Voltage & Frequency Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={processedMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="voltage" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              name="Voltage (V)"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="frequency" 
                              stroke="hsl(var(--accent))" 
                              strokeWidth={2}
                              name="Frequency (Hz)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Power & Temperature</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={processedMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="power" 
                              stackId="1" 
                              stroke="hsl(var(--destructive))" 
                              fill="hsl(var(--destructive))" 
                              fillOpacity={0.6}
                              name="Power (W)"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="temperature" 
                              stackId="2" 
                              stroke="hsl(var(--muted-foreground))" 
                              fill="hsl(var(--muted-foreground))" 
                              fillOpacity={0.6}
                              name="Temperature (°C)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="flex justify-between items-center">
                        <div>
                          <strong>{alert.alert_type.replace('_', ' ').toUpperCase()}</strong>: {alert.message}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No active alerts. All systems operating within normal parameters.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Model Predictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.slice(0, 5).map((analytic) => (
                          <div key={analytic.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{analytic.model_type.replace('_', ' ')}</div>
                                <div className="text-sm text-muted-foreground">{analytic.prediction_type}</div>
                              </div>
                              <Badge variant={analytic.is_anomaly ? 'destructive' : 'default'}>
                                {(analytic.confidence_score * 100).toFixed(1)}% confidence
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(analytic.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Anomaly Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: 'Normal', count: analytics.filter(a => !a.is_anomaly).length },
                          { name: 'Anomalies', count: analytics.filter(a => a.is_anomaly).length }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Total Events</span>
                      </div>
                      <div className="text-2xl font-bold">{securityMetrics.totalEvents}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Critical Events</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{securityMetrics.criticalEvents}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Resolved</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{securityMetrics.resolvedEvents}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Active Threats</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">{securityMetrics.activeThreats}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Security Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {securityEvents.slice(0, 10).map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{event.event_type.replace('_', ' ')}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.event_details?.description || 'Security event detected'}
                              </div>
                            </div>
                            <Badge variant={event.severity === 'critical' ? 'destructive' : 'default'}>
                              {event.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(event.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Connection</h3>
                <p className="text-muted-foreground">
                  Choose a grid connection above to view detailed monitoring data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Analytics Overview</CardTitle>
                <CardDescription>System-wide AI insights and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.slice(0, 8).map((analytic) => (
                    <div key={analytic.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{analytic.model_type.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">{analytic.prediction_type}</div>
                        </div>
                        <Badge variant={analytic.is_anomaly ? 'destructive' : 'default'}>
                          {(analytic.confidence_score * 100).toFixed(1)}% confidence
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(analytic.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Overall grid performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Normal Operations', count: analytics.filter(a => !a.is_anomaly).length },
                    { name: 'Anomalies Detected', count: analytics.filter(a => a.is_anomaly).length },
                    { name: 'High Confidence', count: analytics.filter(a => a.confidence_score > 0.8).length },
                    { name: 'Low Confidence', count: analytics.filter(a => a.confidence_score <= 0.8).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <EnhancedMonitoringRecommendations 
            substationData={{
              metrics,
              alerts,
              connectionStatus: selectedConnectionId ? 'connected' : 'disconnected',
              operatingHours: 24
            }}
          />
        </TabsContent>
      </Tabs>

      {connections.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Grid Connections</h3>
            <p className="text-muted-foreground">
              Configure grid connections to start monitoring real-time data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}