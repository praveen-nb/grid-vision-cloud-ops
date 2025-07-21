import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Brain, TrendingUp, AlertTriangle, Wrench, Zap, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

interface AIAnalytic {
  id: string
  connection_id: string
  model_type: string
  prediction_type: string
  confidence_score: number
  prediction_data: any
  is_anomaly: boolean
  severity_level: string
  created_at: string
}

interface KinesisMetric {
  id: string
  stream_name: string
  shard_id: string
  records_per_second: number
  bytes_per_second: number
  iterator_age_ms: number
  timestamp: string
}

export function AIAnalyticsDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AIAnalytic[]>([])
  const [kinesisMetrics, setKinesisMetrics] = useState<KinesisMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [processingAI, setProcessingAI] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAnalytics()
      fetchKinesisMetrics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_analytics')
        .select(`
          *,
          grid_connections!inner(name, type, user_id)
        `)
        .eq('grid_connections.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setAnalytics(data || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "Error",
        description: "Failed to fetch AI analytics",
        variant: "destructive"
      })
    }
  }

  const fetchKinesisMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('kinesis_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)

      if (error) throw error
      setKinesisMetrics(data || [])
    } catch (error) {
      console.error('Error fetching Kinesis metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerAIAnalysis = async () => {
    setProcessingAI(true)
    try {
      const response = await supabase.functions.invoke('sagemaker-ai-analytics')
      
      if (response.error) throw response.error

      toast({
        title: "Success",
        description: "AI analysis completed successfully"
      })

      // Refresh data
      await fetchAnalytics()
    } catch (error) {
      console.error('Error triggering AI analysis:', error)
      toast({
        title: "Error",
        description: "Failed to trigger AI analysis",
        variant: "destructive"
      })
    } finally {
      setProcessingAI(false)
    }
  }

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'anomaly_detection':
        return <AlertTriangle className="h-4 w-4" />
      case 'predictive_maintenance':
        return <Wrench className="h-4 w-4" />
      case 'load_forecasting':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Prepare chart data
  const anomalyData = analytics
    .filter(a => a.model_type === 'anomaly_detection')
    .slice(-10)
    .map(a => ({
      time: new Date(a.created_at).toLocaleTimeString(),
      confidence: (a.confidence_score * 100).toFixed(1),
      anomaly: a.is_anomaly ? 100 : 0
    }))

  const kinesisChartData = kinesisMetrics.slice(-10).map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    records: m.records_per_second,
    bytes: Math.round(m.bytes_per_second / 1000), // Convert to KB
    latency: m.iterator_age_ms
  }))

  const modelTypeStats = analytics.reduce((acc, analytic) => {
    acc[analytic.model_type] = (acc[analytic.model_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(modelTypeStats).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  if (loading) {
    return <div className="flex justify-center p-8">Loading AI analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            SageMaker-powered insights for anomaly detection, predictive maintenance, and load forecasting
          </p>
        </div>
        
        <Button 
          onClick={triggerAIAnalysis} 
          disabled={processingAI}
          className="min-w-[140px]"
        >
          {processingAI ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="maintenance">Predictive Maintenance</TabsTrigger>
          <TabsTrigger value="kinesis">Kinesis Streams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all AI models
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.filter(a => a.is_anomaly).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.length > 0 
                    ? Math.round(analytics.reduce((sum, a) => sum + a.confidence_score, 0) / analytics.length * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Model accuracy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kinesis Records/sec</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kinesisMetrics.length > 0 
                    ? Math.round(kinesisMetrics[0]?.records_per_second || 0)
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time throughput
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Model Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent AI Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {analytics.slice(0, 8).map((analytic) => (
                    <div key={analytic.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getModelIcon(analytic.model_type)}
                        <div>
                          <div className="font-medium text-sm">
                            {analytic.prediction_type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(analytic.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(analytic.severity_level)}>
                          {analytic.severity_level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(analytic.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection Trends</CardTitle>
              <CardDescription>Real-time anomaly detection confidence and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={anomalyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#8884d8" 
                    name="Confidence %" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="anomaly" 
                    stroke="#ff4444" 
                    name="Anomaly Detected" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {analytics.filter(a => a.model_type === 'anomaly_detection').slice(0, 5).map((analytic) => (
              <Card key={analytic.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{analytic.prediction_type.replace('_', ' ')}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {Math.round(analytic.confidence_score * 100)}%
                      </p>
                      {analytic.prediction_data && (
                        <div className="mt-2 text-sm">
                          {Object.entries(analytic.prediction_data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key.replace('_', ' ')}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={analytic.is_anomaly ? 'destructive' : 'default'}>
                        {analytic.is_anomaly ? 'Anomaly' : 'Normal'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(analytic.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-4">
            {analytics.filter(a => a.model_type === 'predictive_maintenance').slice(0, 5).map((analytic) => (
              <Card key={analytic.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Maintenance Prediction
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {Math.round(analytic.confidence_score * 100)}%
                      </p>
                      {analytic.prediction_data && (
                        <div className="mt-3 grid gap-2">
                          {analytic.prediction_data.risk_level && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Risk Level:</span>
                              <Badge variant={analytic.prediction_data.risk_level === 'high' ? 'destructive' : 'secondary'}>
                                {analytic.prediction_data.risk_level}
                              </Badge>
                            </div>
                          )}
                          {analytic.prediction_data.predicted_maintenance_days && (
                            <div>
                              <span className="font-medium">Maintenance in:</span> {analytic.prediction_data.predicted_maintenance_days} days
                            </div>
                          )}
                          {analytic.prediction_data.component_health && (
                            <div>
                              <span className="font-medium">Component Health:</span> {analytic.prediction_data.component_health}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(analytic.created_at).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kinesis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kinesis Stream Performance</CardTitle>
              <CardDescription>Real-time data streaming metrics from AWS Kinesis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={kinesisChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="records" fill="#8884d8" name="Records/sec" />
                  <Bar yAxisId="right" dataKey="bytes" fill="#82ca9d" name="KB/sec" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {kinesisMetrics.slice(0, 4).map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.stream_name}</CardTitle>
                  <CardDescription>Shard: {metric.shard_id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Records/sec:</span>
                    <span className="font-bold">{metric.records_per_second}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bytes/sec:</span>
                    <span className="font-bold">{Math.round(metric.bytes_per_second / 1000)}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Iterator Age:</span>
                    <span className="font-bold">{metric.iterator_age_ms}ms</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(metric.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}