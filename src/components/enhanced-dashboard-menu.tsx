import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Zap, 
  Plus, 
  Eye, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Users,
  Shield,
  MessageSquare,
  MapPin,
  Smartphone
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { GridSpecificDashboard } from "./grid-specific-dashboard"
import { GISCopilot } from "./gis-copilot"
import { toast } from "sonner"

export function EnhancedDashboardMenu() {
  const { user } = useAuth()
  const [selectedConnection, setSelectedConnection] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    total_connections: 0,
    active_alerts: 0,
    high_risk_predictions: 0,
    active_field_ops: 0
  })

  useEffect(() => {
    if (user) {
      loadConnections()
      loadDashboardStats()
    }
  }, [user])

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_connections')
        .select('*')
        .order('name')

      if (error) throw error

      setConnections(data || [])
      if (data && data.length > 0 && !selectedConnection) {
        setSelectedConnection(data[0])
      }
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load grid connections')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Load aggregate statistics
      const [connectionsResult, alertsResult, predictionsResult, fieldOpsResult] = await Promise.all([
        supabase.from('grid_connections').select('id', { count: 'exact' }),
        supabase.from('grid_alerts').select('id', { count: 'exact' }).eq('resolved', false),
        supabase.from('predictive_analytics').select('id', { count: 'exact' }).gte('probability', 0.7),
        supabase.from('field_operations').select('id', { count: 'exact' }).eq('status', 'in_progress')
      ])

      setDashboardStats({
        total_connections: connectionsResult.count || 0,
        active_alerts: alertsResult.count || 0,
        high_risk_predictions: predictionsResult.count || 0,
        active_field_ops: fieldOpsResult.count || 0
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const createNewConnection = async () => {
    try {
      const newConnection = {
        name: `Grid Connection ${connections.length + 1}`,
        type: 'Distribution',
        location: 'New Location',
        endpoint: 'http://localhost:8080',
        protocol: 'HTTP',
        status: 'disconnected',
        voltage: 12000,
        frequency: 60
      }

      const { data, error } = await supabase
        .from('grid_connections')
        .insert([newConnection])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setConnections([...connections, data[0]])
        setSelectedConnection(data[0])
        toast.success('New grid connection created')
        
        // Update stats
        loadDashboardStats()
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('Failed to create grid connection')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold">Grid Vision Operations Center</h1>
          <p className="text-muted-foreground">
            Comprehensive utility grid management and monitoring platform
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Select
            value={selectedConnection?.id || ""}
            onValueChange={(value) => {
              const connection = connections.find(c => c.id === value)
              setSelectedConnection(connection)
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a grid connection" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>{connection.name}</span>
                    <Badge variant={connection.status === 'connected' ? 'default' : 'secondary'}>
                      {connection.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={createNewConnection} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Grid
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Grids</p>
                <p className="text-2xl font-bold">{dashboardStats.total_connections}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Connected utility networks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{dashboardStats.active_alerts}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${dashboardStats.active_alerts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Assets</p>
                <p className="text-2xl font-bold">{dashboardStats.high_risk_predictions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Predicted failures &gt;70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Field Operations</p>
                <p className="text-2xl font-bold">{dashboardStats.active_field_ops}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="grid-dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid-dashboard" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Grid Dashboard
          </TabsTrigger>
          <TabsTrigger value="gis-copilot" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            GIS Copilot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid-dashboard" className="space-y-6">
          {selectedConnection ? (
            <GridSpecificDashboard connection={selectedConnection} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Grid Connection Selected</CardTitle>
                <CardDescription>
                  Select a grid connection from the dropdown above or create a new one to view the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createNewConnection} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Grid Connection
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gis-copilot" className="space-y-6">
          <GISCopilot connectionId={selectedConnection?.id} />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {selectedConnection && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions for {selectedConnection.name}</CardTitle>
            <CardDescription>
              Common operations and management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Run Predictive Analysis</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <MapPin className="h-6 w-6" />
                <span>Process Environmental Data</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Shield className="h-6 w-6" />
                <span>Security Scan</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Smartphone className="h-6 w-6" />
                <span>Sync Mobile Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}