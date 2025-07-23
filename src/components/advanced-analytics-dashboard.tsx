import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, BarChart, Bar } from "recharts"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Settings
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PredictiveAnalytics {
  id: string
  connection_id: string
  asset_id: string
  prediction_type: string
  probability: number
  confidence_score: number
  predicted_date: string
  input_features: any
  model_version: string
  created_at: string
}

interface AIAnalytics {
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

interface AnalyticsInsight {
  title: string
  description: string
  type: 'prediction' | 'anomaly' | 'optimization' | 'trend'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  recommendation: string
}

export function AdvancedAnalyticsDashboard() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<PredictiveAnalytics[]>([])
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics[]>([])
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [processingAnalytics, setProcessingAnalytics] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
      generateInsights()
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    try {
      // Get user's connections first
      const { data: connections, error: connError } = await supabase
        .from('grid_connections')
        .select('id')
        .eq('user_id', user?.id)

      if (connError) throw connError

      if (connections && connections.length > 0) {
        const connectionIds = connections.map(c => c.id)
        
        // Fetch predictive analytics
        const { data: predictionsData, error: predError } = await supabase
          .from('predictive_analytics')
          .select('*')
          .in('connection_id', connectionIds)
          .order('created_at', { ascending: false })
          .limit(50)

        if (predError) throw predError

        // Fetch AI analytics
        const { data: aiData, error: aiError } = await supabase
          .from('ai_analytics')
          .select('*')
          .in('connection_id', connectionIds)
          .order('created_at', { ascending: false })
          .limit(50)

        if (aiError) throw aiError

        setPredictions(predictionsData || [])
        setAiAnalytics(aiData || [])
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = () => {
    // Generate sample insights based on the data
    const sampleInsights: AnalyticsInsight[] = [
      {
        title: "Equipment Failure Risk Identified",
        description: "Transformer T-001 shows 85% probability of failure within 30 days based on thermal patterns",
        type: "prediction",
        severity: "critical",
        confidence: 85,
        recommendation: "Schedule immediate inspection and consider preventive maintenance"
      },
      {
        title: "Voltage Optimization Opportunity",
        description: "Substation load patterns suggest 12% efficiency improvement possible",
        type: "optimization",
        severity: "medium",
        confidence: 78,
        recommendation: "Implement dynamic voltage regulation during peak hours"
      },
      {
        title: "Anomalous Power Quality Detected",
        description: "Harmonic distortion levels exceeding normal ranges on feeder F-003",
        type: "anomaly",
        severity: "high",
        confidence: 92,
        recommendation: "Install power quality monitoring and investigate source"
      },
      {
        title: "Load Growth Trend Analysis",
        description: "15% increase in demand projected for next quarter based on historical patterns",
        type: "trend",
        severity: "medium",
        confidence: 71,
        recommendation: "Plan capacity expansion for Q3 to meet growing demand"
      }
    ]
    
    setInsights(sampleInsights)
  }

  const runAdvancedAnalytics = async () => {
    setProcessingAnalytics(true)
    try {
      const response = await supabase.functions.invoke('sagemaker-ai-analytics', {
        body: {
          action: 'run_advanced_analytics',
          user_id: user?.id,
          analysis_types: ['predictive', 'anomaly', 'optimization']
        }
      })

      if (response.error) throw response.error

      toast({
        title: "Analytics Complete",
        description: `Generated ${response.data.insights_count} new insights and ${response.data.predictions_count} predictions`
      })

      // Refresh data
      await fetchAnalyticsData()
      generateInsights()
    } catch (error) {
      console.error('Error running analytics:', error)
      toast({
        title: "Analytics Failed",
        description: "Failed to run advanced analytics",
        variant: "destructive"
      })
    } finally {
      setProcessingAnalytics(false)
    }
  }

  const exportAnalytics = () => {
    const analyticsData = {
      predictions,
      aiAnalytics,
      insights,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Analytics report downloaded successfully"
    })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <Target className="h-4 w-4" />
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />
      case 'optimization':
        return <Lightbulb className="h-4 w-4" />
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
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
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const generateChartData = () => {
    // Generate sample chart data for visualization
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - 29 + i)
      return {
        date: date.toISOString().split('T')[0],
        predictions: Math.floor(Math.random() * 10) + 1,
        anomalies: Math.floor(Math.random() * 5),
        confidence: Math.floor(Math.random() * 30) + 70,
        accuracy: Math.floor(Math.random() * 20) + 80
      }
    })
    return days
  }

  const chartData = generateChartData()
  const criticalInsights = insights.filter(i => i.severity === 'critical')
  const highConfidencePredictions = predictions.filter(p => p.confidence_score > 0.8)
  const anomalies = aiAnalytics.filter(a => a.is_anomaly)

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            AI-powered insights and predictive analytics for grid optimization
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          
          <Button onClick={runAdvancedAnalytics} disabled={processingAnalytics}>
            <RefreshCw className={`mr-2 h-4 w-4 ${processingAnalytics ? 'animate-spin' : ''}`} />
            {processingAnalytics ? 'Processing...' : 'Run Analytics'}
          </Button>
        </div>
      </div>

      {criticalInsights.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalInsights.length} critical insight(s) require immediate attention
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">
              {highConfidencePredictions.length} high confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring investigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalInsights.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">
              Average across all models
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Activity (30 Days)</CardTitle>
                <CardDescription>Daily predictions and anomaly detection</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate().toString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line type="monotone" dataKey="predictions" stroke="#8884d8" name="Predictions" />
                    <Line type="monotone" dataKey="anomalies" stroke="#ff7300" name="Anomalies" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Confidence and accuracy trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate().toString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Area type="monotone" dataKey="confidence" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Confidence %" />
                    <Area type="monotone" dataKey="accuracy" stackId="2" stroke="#8884d8" fill="#8884d8" name="Accuracy %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="space-y-4">
            {predictions.slice(0, 10).map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <div>
                        <CardTitle className="text-lg">
                          {prediction.prediction_type.replace('_', ' ').toUpperCase()}
                        </CardTitle>
                        <CardDescription>Asset: {prediction.asset_id}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={prediction.probability > 0.7 ? 'destructive' : 'secondary'}>
                        {(prediction.probability * 100).toFixed(1)}% probability
                      </Badge>
                      <Badge variant="outline">
                        {(prediction.confidence_score * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Predicted Date:</span>
                      <span>{new Date(prediction.predicted_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Model Version:</span>
                      <span>{prediction.model_version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Generated:</span>
                      <span>{new Date(prediction.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <Card key={anomaly.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <CardTitle className="text-lg">
                          {anomaly.model_type.toUpperCase()} Anomaly
                        </CardTitle>
                        <CardDescription>{anomaly.prediction_type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(anomaly.severity_level)}>
                      {anomaly.severity_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Confidence Score:</span>
                      <span>{(anomaly.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Detected:</span>
                      <span>{new Date(anomaly.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm">
                      <span className="font-medium">Recommendation:</span> {insight.recommendation}
                    </p>
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