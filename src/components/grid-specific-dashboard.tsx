import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  MapPin, 
  Users, 
  TrendingUp,
  Shield,
  Wrench,
  Eye,
  MessageSquare,
  Camera,
  Smartphone,
  Trash2,
  Power,
  PowerOff
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { GridMetricsChart } from "./dashboard/GridMetricsChart"
import { LoadingSkeleton } from "./ui/loading-skeleton"
import { ErrorState, EmptyState } from "./ui/error-state"

interface GridSpecificDashboardProps {
  connection: any
  onDeleteConnection?: (connectionId: string) => void
  connections?: any[]
}

export function GridSpecificDashboard({ connection, onDeleteConnection, connections }: GridSpecificDashboardProps) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [fieldOperations, setFieldOperations] = useState<any[]>([])
  const [environmentalData, setEnvironmentalData] = useState<any[]>([])
  const [customerIncidents, setCustomerIncidents] = useState<any[]>([])
  const [securityEvents, setSecurityEvents] = useState<any[]>([])
  const [complianceRecords, setComplianceRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connection?.id) {
      loadDashboardData()
      
      // Set up real-time subscriptions
      const metricsChannel = supabase
        .channel('grid-metrics-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'grid_metrics',
          filter: `connection_id=eq.${connection.id}`
        }, () => {
          loadDashboardData()
        })
        .subscribe()

      const alertsChannel = supabase
        .channel('grid-alerts-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'grid_alerts',
          filter: `connection_id=eq.${connection.id}`
        }, () => {
          loadDashboardData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(metricsChannel)
        supabase.removeChannel(alertsChannel)
      }
    }
  }, [connection])

  const loadDashboardData = async () => {
    if (!connection?.id) return

    setLoading(true)
    try {
      // Load all data in parallel
      const [
        metricsResult,
        alertsResult,
        predictionsResult,
        fieldOpsResult,
        envDataResult,
        incidentsResult,
        securityResult,
        complianceResult
      ] = await Promise.all([
        supabase.from('grid_metrics').select('*').eq('connection_id', connection.id).order('timestamp', { ascending: false }).limit(50),
        supabase.from('grid_alerts').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('predictive_analytics').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('field_operations').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('environmental_data').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('customer_incidents').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('security_events').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('compliance_records').select('*').eq('connection_id', connection.id).order('created_at', { ascending: false }).limit(5)
      ])

      setMetrics(metricsResult.data || [])
      setAlerts(alertsResult.data || [])
      setPredictions(predictionsResult.data || [])
      setFieldOperations(fieldOpsResult.data || [])
      setEnvironmentalData(envDataResult.data || [])
      setCustomerIncidents(incidentsResult.data || [])
      setSecurityEvents(securityResult.data || [])
      setComplianceRecords(complianceResult.data || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const runPredictiveAnalysis = async () => {
    try {
      const { error } = await supabase.functions.invoke('predictive-analytics-engine', {
        body: { connectionId: connection.id, analysisType: 'all' }
      })

      if (error) throw error
      
      toast.success('Predictive analysis completed')
      loadDashboardData()
    } catch (error) {
      console.error('Error running analysis:', error)
      toast.error('Failed to run predictive analysis')
    }
  }

  const processEnvironmentalData = async () => {
    try {
      const { error } = await supabase.functions.invoke('environmental-data-processor', {
        body: { connectionId: connection.id, dataType: 'weather', source: 'weather_api' }
      })

      if (error) throw error
      
      toast.success('Environmental data processed')
      loadDashboardData()
    } catch (error) {
      console.error('Error processing environmental data:', error)
      toast.error('Failed to process environmental data')
    }
  }

  const handleConnect = async () => {
    try {
      const { error } = await supabase
        .from('grid_connections')
        .update({ 
          status: 'connected',
          last_update: new Date().toISOString()
        })
        .eq('id', connection.id);

      if (error) throw error;
      
      toast.success(`${connection.name} connected successfully`);
      loadDashboardData();
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect to grid');
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('grid_connections')
        .update({ 
          status: 'disconnected',
          last_update: new Date().toISOString()
        })
        .eq('id', connection.id);

      if (error) throw error;
      
      toast.success(`${connection.name} disconnected`);
      loadDashboardData();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect from grid');
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />
  }

  // Calculate key metrics
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length
  const activeFieldOps = fieldOperations.filter(op => op.status === 'in_progress').length
  const highRiskPredictions = predictions.filter(p => p.probability > 0.7).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{connection.name}</h1>
          <p className="text-muted-foreground">
            {connection.type} • {connection.location} • Status: {connection.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleConnect}
            disabled={connection.status === 'connected'}
            variant={connection.status === 'connected' ? 'secondary' : 'default'}
          >
            <Power className="h-4 w-4 mr-2" />
            Connect
          </Button>
          <Button 
            onClick={handleDisconnect}
            disabled={connection.status === 'disconnected'}
            variant="outline"
          >
            <PowerOff className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
          <Button onClick={runPredictiveAnalysis} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
          <Button onClick={processEnvironmentalData} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Process Env Data
          </Button>
          {onDeleteConnection && connections && connections.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Grid
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Grid Connection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{connection.name}"? This action cannot be undone and will remove all associated data including metrics, alerts, and field operations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeleteConnection(connection.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{unresolvedAlerts}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="mt-2">
                {criticalAlerts} Critical
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Field Operations</p>
                <p className="text-2xl font-bold">{activeFieldOps}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {fieldOperations.length} total operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Predictions</p>
                <p className="text-2xl font-bold">{highRiskPredictions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {predictions.length} total predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grid Status</p>
                <p className="text-2xl font-bold">{connection.status}</p>
              </div>
              <Zap className={`h-8 w-8 ${connection.status === 'connected' ? 'text-green-500' : 'text-orange-500'}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {connection.voltage}V • {connection.frequency}Hz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="real-time" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="real-time" className="flex items-center gap-1 sm:gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Real-Time</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="field-ops" className="flex items-center gap-1 sm:gap-2">
            <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Field Ops</span>
            <span className="sm:hidden">Field</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1 sm:gap-2">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Compliance</span>
            <span className="lg:hidden">Comp</span>
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-1 sm:gap-2">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Customer</span>
            <span className="lg:hidden">Cust</span>
          </TabsTrigger>
          <TabsTrigger value="environmental" className="flex items-center gap-1 sm:gap-2">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Environmental</span>
            <span className="lg:hidden">Env</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="real-time" className="space-y-4">
          {/* Grid Metrics Chart */}
          <GridMetricsChart metrics={metrics} loading={loading} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Metrics</CardTitle>
                <CardDescription>Latest grid performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.slice(0, 5).map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{metric.metric_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {metric.value} {metric.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Unresolved system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.filter(a => !a.resolved).slice(0, 5).map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{alert.alert_type}</p>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>AI-powered failure and maintenance predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{prediction.asset_id}</p>
                        <Badge variant={prediction.probability > 0.7 ? 'destructive' : 'secondary'}>
                          {prediction.prediction_type}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Probability</span>
                          <span>{(prediction.probability * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={prediction.probability * 100} className="h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Predicted: {new Date(prediction.predicted_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Historical performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">98.5%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">85%</p>
                      <p className="text-sm text-muted-foreground">Efficiency</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Last 30 days performance summary
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="field-ops" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Field Operations</CardTitle>
                <CardDescription>Active maintenance and inspection tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fieldOperations.slice(0, 5).map((operation, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{operation.operation_type}</p>
                        <p className="text-sm text-muted-foreground">{operation.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {operation.scheduled_start ? new Date(operation.scheduled_start).toLocaleDateString() : 'No date scheduled'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          operation.status === 'completed' ? 'default' :
                          operation.status === 'in_progress' ? 'secondary' :
                          operation.priority === 'emergency' ? 'destructive' : 'outline'
                        }>
                          {operation.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {operation.priority}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mobile Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Mobile Integration</CardTitle>
                <CardDescription>Field crew mobile app data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Photos Uploaded</p>
                      <p className="text-sm text-muted-foreground">
                        {fieldOperations.reduce((total, op) => total + (op.photos?.length || 0), 0)} total photos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Offline Data Synced</p>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Active Technicians</p>
                      <p className="text-sm text-muted-foreground">
                        {new Set(fieldOperations.filter(op => op.status === 'in_progress').map(op => op.technician_id)).size} technicians
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>NERC-CIP, FERC, and other regulatory compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceRecords.map((record, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{record.regulation_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Next audit: {record.next_audit_date ? new Date(record.next_audit_date).toLocaleDateString() : 'Not scheduled'}
                        </p>
                      </div>
                      <Badge variant={
                        record.compliance_status === 'compliant' ? 'default' :
                        record.compliance_status === 'non_compliant' ? 'destructive' :
                        'secondary'
                      }>
                        {record.compliance_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>Cybersecurity alerts and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{event.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.target_system}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={
                        event.severity === 'critical' ? 'destructive' :
                        event.severity === 'high' ? 'secondary' : 'outline'
                      }>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Incidents */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Incidents</CardTitle>
                <CardDescription>Service requests and outage reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerIncidents.slice(0, 5).map((incident, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{incident.incident_type}</p>
                        <p className="text-sm text-muted-foreground">{incident.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Affects {incident.affected_customers} customers
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          incident.status === 'resolved' ? 'default' :
                          incident.severity === 'critical' ? 'destructive' : 'secondary'
                        }>
                          {incident.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {incident.severity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Service Metrics</CardTitle>
                <CardDescription>Customer service performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {customerIncidents.filter(i => i.status === 'resolved').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {customerIncidents.filter(i => i.status === 'open').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Open</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Avg resolution time: 2.5 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Environmental Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Conditions</CardTitle>
                <CardDescription>Weather, vegetation, and hazard monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {environmentalData.slice(0, 5).map((data, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{data.data_type}</p>
                        <p className="text-sm text-muted-foreground">{data.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Source: {data.source}
                        </p>
                      </div>
                      <Badge variant={
                        data.severity_level === 'critical' ? 'destructive' :
                        data.severity_level === 'high' ? 'secondary' : 'outline'
                      }>
                        {data.severity_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Environmental risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {environmentalData.filter(d => d.severity_level === 'high' || d.severity_level === 'critical').length}
                      </p>
                      <p className="text-sm text-muted-foreground">High Risk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {environmentalData.filter(d => d.severity_level === 'medium').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Medium Risk</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Last assessment: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}