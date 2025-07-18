import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Activity, Zap, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

const gridData = [
  { time: '00:00', voltage: 245, current: 120, temperature: 75 },
  { time: '04:00', voltage: 243, current: 118, temperature: 73 },
  { time: '08:00', voltage: 248, current: 135, temperature: 82 },
  { time: '12:00', voltage: 251, current: 142, temperature: 85 },
  { time: '16:00', voltage: 247, current: 138, temperature: 83 },
  { time: '20:00', voltage: 249, current: 125, temperature: 78 },
]

const outageData = [
  { region: 'North', outages: 2, restored: 8 },
  { region: 'South', outages: 1, restored: 12 },
  { region: 'East', outages: 3, restored: 6 },
  { region: 'West', outages: 0, restored: 15 },
]

const complianceData = [
  { name: 'NERC-CIP Compliant', value: 98, color: '#22c55e' },
  { name: 'Pending Review', value: 2, color: '#eab308' },
]

const kinesisMetrics = [
  { timestamp: '10:00', records: 1250, errors: 2 },
  { timestamp: '10:05', records: 1380, errors: 1 },
  { timestamp: '10:10', records: 1420, errors: 0 },
  { timestamp: '10:15', records: 1350, errors: 1 },
  { timestamp: '10:20', records: 1500, errors: 0 },
]

export function RealTimeDashboard() {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-l-4 border-l-utility-success">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-utility-success" />
              Grid Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-utility-success">NORMAL</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-primary" />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,567</div>
            <p className="text-xs text-muted-foreground">+2.1% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-l-4 border-l-utility-warning">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-utility-warning" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-utility-warning">6</div>
            <p className="text-xs text-muted-foreground">3 critical, 3 warnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-accent" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">98%</div>
            <p className="text-xs text-muted-foreground">NERC-CIP compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-utility-blue" />
              Real-Time Grid Metrics
            </CardTitle>
            <CardDescription>Live voltage, current, and temperature data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gridData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="voltage" stroke="hsl(var(--utility-blue))" strokeWidth={2} />
                <Line type="monotone" dataKey="current" stroke="hsl(var(--utility-teal))" strokeWidth={2} />
                <Line type="monotone" dataKey="temperature" stroke="hsl(var(--utility-warning))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>AWS Kinesis Data Stream</CardTitle>
            <CardDescription>Real-time data ingestion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kinesisMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="records" fill="hsl(var(--primary))" />
                <Bar dataKey="errors" fill="hsl(var(--utility-danger))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Regional Outages</CardTitle>
            <CardDescription>Current outages by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={outageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="outages" fill="hsl(var(--utility-danger))" />
                <Bar dataKey="restored" fill="hsl(var(--utility-success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>NERC-CIP Compliance</CardTitle>
            <CardDescription>Security compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {complianceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Latest notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Transformer T-347 High Temp</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">SCADA Connection Timeout</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
                <Badge variant="secondary">Warning</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Backup Restored Successfully</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Resolved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}