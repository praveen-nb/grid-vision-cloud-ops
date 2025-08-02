import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Clock, Users, DollarSign, Shield, Zap, AlertTriangle } from "lucide-react"

interface MetricComparison {
  title: string
  before: {
    value: string | number
    label: string
  }
  after: {
    value: string | number
    label: string
  }
  improvement: number
  unit: string
  icon: React.ReactNode
  category: string
}

const performanceMetrics: MetricComparison[] = [
  {
    title: "Query Response Time",
    before: { value: 82.5, label: "Legacy GIS" },
    after: { value: 5, label: "AWS Optimized" },
    improvement: 93.9,
    unit: "seconds",
    icon: <Clock className="h-4 w-4" />,
    category: "Performance"
  },
  {
    title: "Data Processing Speed",
    before: { value: 36, label: "Manual Updates" },
    after: { value: 0.08, label: "Real-time Automated" },
    improvement: 99.8,
    unit: "hours",
    icon: <Zap className="h-4 w-4" />,
    category: "Performance"
  },
  {
    title: "System Uptime",
    before: { value: 95.5, label: "Legacy Systems" },
    after: { value: 99.9, label: "AWS Infrastructure" },
    improvement: 4.6,
    unit: "%",
    icon: <Shield className="h-4 w-4" />,
    category: "Reliability"
  },
  {
    title: "Concurrent Users",
    before: { value: 37, label: "Legacy Capacity" },
    after: { value: 500, label: "AWS Scalable" },
    improvement: 1251.4,
    unit: "users",
    icon: <Users className="h-4 w-4" />,
    category: "Scalability"
  },
  {
    title: "Outage Detection",
    before: { value: 4, label: "Manual Reports" },
    after: { value: 0.15, label: "AI-Powered" },
    improvement: 96.3,
    unit: "hours",
    icon: <AlertTriangle className="h-4 w-4" />,
    category: "Operations"
  },
  {
    title: "Infrastructure Costs",
    before: { value: 2.5, label: "On-premise" },
    after: { value: 1.2, label: "AWS Managed" },
    improvement: 52,
    unit: "M$/year",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Cost"
  }
]

const uptimeData = [
  { month: "Jan", legacy: 94.2, aws: 99.9 },
  { month: "Feb", legacy: 96.1, aws: 99.9 },
  { month: "Mar", legacy: 93.8, aws: 99.9 },
  { month: "Apr", legacy: 97.2, aws: 99.9 },
  { month: "May", legacy: 95.5, aws: 99.9 },
  { month: "Jun", legacy: 94.9, aws: 99.9 }
]

const responseTimeData = [
  { time: "0s", legacy: 0, aws: 0 },
  { time: "10s", legacy: 15, aws: 85 },
  { time: "30s", legacy: 45, aws: 98 },
  { time: "60s", legacy: 72, aws: 100 },
  { time: "90s", legacy: 88, aws: 100 },
  { time: "120s", legacy: 95, aws: 100 }
]

export function PerformanceMetricsShowcase() {
  const getImprovementColor = (improvement: number) => {
    if (improvement > 90) return "text-green-600"
    if (improvement > 50) return "text-blue-600"
    if (improvement > 25) return "text-yellow-600"
    return "text-orange-600"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Performance": return "bg-blue-100 text-blue-800"
      case "Reliability": return "bg-green-100 text-green-800"
      case "Scalability": return "bg-purple-100 text-purple-800"
      case "Operations": return "bg-orange-100 text-orange-800"
      case "Cost": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AWS-Based GIS Infrastructure Performance</h1>
        <p className="text-muted-foreground">
          Quantifiable improvements demonstrating national impact and technical excellence
        </p>
        <div className="flex justify-center">
          <Badge variant="outline">Electrical Utilities Modernization</Badge>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                </div>
                <Badge variant="secondary" className={getCategoryColor(metric.category)}>
                  {metric.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{metric.before.label}</span>
                  <span className="font-mono">{metric.before.value} {metric.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{metric.after.label}</span>
                  <span className="font-mono">{metric.after.value} {metric.unit}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className={`font-semibold ${getImprovementColor(metric.improvement)}`}>
                  {metric.improvement.toFixed(1)}% improvement
                </span>
              </div>
              <Progress value={Math.min(metric.improvement, 100)} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Uptime Comparison</CardTitle>
            <CardDescription>Monthly uptime percentage over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="legacy" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Legacy Systems"
                />
                <Line 
                  type="monotone" 
                  dataKey="aws" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="AWS Infrastructure"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Response Time Distribution</CardTitle>
            <CardDescription>Percentage of queries completed within time threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="legacy" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Legacy GIS"
                />
                <Line 
                  type="monotone" 
                  dataKey="aws" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="AWS Optimized"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Solution Impact Summary</CardTitle>
          <CardDescription>Demonstrating substantial national benefit and exceptional ability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-muted-foreground">Utility Companies Impacted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">$1.3M</div>
              <div className="text-sm text-muted-foreground">Annual Cost Savings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">75%</div>
              <div className="text-sm text-muted-foreground">Reduction in Outage Duration</div>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}