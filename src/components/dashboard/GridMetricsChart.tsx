import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface GridMetricsChartProps {
  metrics: any[]
  loading?: boolean
}

export function GridMetricsChart({ metrics, loading }: GridMetricsChartProps) {
  if (loading || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grid Metrics</CardTitle>
          <CardDescription>Real-time performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {loading ? "Loading metrics..." : "No metrics data available"}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process metrics for different chart types
  const processedData = metrics.reduce((acc, metric) => {
    const timestamp = new Date(metric.timestamp).toLocaleTimeString()
    const existing = acc.find(item => item.timestamp === timestamp)
    
    if (existing) {
      existing[metric.metric_type] = metric.value
    } else {
      acc.push({
        timestamp,
        [metric.metric_type]: metric.value
      })
    }
    return acc
  }, [])

  // Latest values for current status
  const latestMetrics = metrics.reduce((acc, metric) => {
    acc[metric.metric_type] = {
      value: metric.value,
      unit: metric.unit,
      timestamp: metric.timestamp
    }
    return acc
  }, {})

  const getStatusColor = (metricType: string, value: number) => {
    switch (metricType) {
      case 'voltage':
        return value > 45000 && value < 50000 ? 'success' : 'warning'
      case 'frequency':
        return value > 59.5 && value < 60.5 ? 'success' : 'warning'
      case 'load':
        return value < 80 ? 'success' : value < 90 ? 'warning' : 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(latestMetrics).map(([type, data]: [string, any]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium capitalize">{type}</p>
                  <Badge variant={getStatusColor(type, data.value) as any}>
                    {getStatusColor(type, data.value)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">
                  {data.value.toFixed(1)} {data.unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(data.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Line Chart for Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Real-time grid performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
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
                <Line 
                  type="monotone" 
                  dataKey="power" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Power (MW)"
                />
                <Line 
                  type="monotone" 
                  dataKey="load" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  name="Load (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}