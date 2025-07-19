import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { 
  Plug, 
  Activity, 
  Database, 
  Shield, 
  MapPin, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  Server
} from "lucide-react"

interface GridConnection {
  id: string
  name: string
  type: string
  location: string
  status: 'connected' | 'disconnected' | 'error'
  voltage: number
  frequency: number
  lastUpdate: string
}

const mockConnections: GridConnection[] = [
  {
    id: 'grid-001',
    name: 'Central Distribution Grid',
    type: 'Distribution',
    location: 'Houston, TX',
    status: 'connected',
    voltage: 13.8,
    frequency: 60.0,
    lastUpdate: '2024-01-15 10:30:00'
  },
  {
    id: 'grid-002', 
    name: 'North Transmission Line',
    type: 'Transmission',
    location: 'Dallas, TX',
    status: 'connected',
    voltage: 138.0,
    frequency: 59.98,
    lastUpdate: '2024-01-15 10:29:45'
  },
  {
    id: 'grid-003',
    name: 'Solar Farm Alpha',
    type: 'Generation',
    location: 'Austin, TX',
    status: 'error',
    voltage: 34.5,
    frequency: 60.1,
    lastUpdate: '2024-01-15 10:25:12'
  }
]

export function GridConnectionPanel() {
  const [connections, setConnections] = useState<GridConnection[]>(mockConnections)
  const [isConnecting, setIsConnecting] = useState(false)
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: '',
    endpoint: '',
    protocol: 'SCADA',
    apiKey: ''
  })
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!newConnection.name || !newConnection.endpoint) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsConnecting(true)
    
    // Simulate connection process
    setTimeout(() => {
      const connection: GridConnection = {
        id: `grid-${String(connections.length + 1).padStart(3, '0')}`,
        name: newConnection.name,
        type: newConnection.type,
        location: 'Unknown Location',
        status: 'connected',
        voltage: Math.random() * 100 + 50,
        frequency: 60.0 + (Math.random() - 0.5) * 0.2,
        lastUpdate: new Date().toISOString().replace('T', ' ').split('.')[0]
      }
      
      setConnections([...connections, connection])
      setNewConnection({ name: '', type: '', endpoint: '', protocol: 'SCADA', apiKey: '' })
      setIsConnecting(false)
      
      toast({
        title: "Grid Connected Successfully",
        description: `${newConnection.name} has been connected to the monitoring system`,
      })
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'disconnected': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      case 'disconnected': return <Wifi className="h-4 w-4" />
      default: return <Wifi className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            Grid Connection Manager
          </CardTitle>
          <CardDescription>
            Connect and monitor multiple utility grids in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connections">Active Connections</TabsTrigger>
              <TabsTrigger value="add">Add New Grid</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connections" className="space-y-4">
              <div className="grid gap-4">
                {connections.map((connection) => (
                  <Card key={connection.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{connection.name}</h4>
                            <Badge variant="outline">{connection.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {connection.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {connection.voltage}kV
                            </div>
                            <div className="flex items-center gap-1">
                              <Server className="h-3 w-3" />
                              {connection.frequency}Hz
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(connection.status)}>
                            {getStatusIcon(connection.status)}
                            {connection.status.toUpperCase()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gridName">Grid Name *</Label>
                  <Input
                    id="gridName"
                    placeholder="e.g., Central Distribution Grid"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gridType">Grid Type *</Label>
                  <Select value={newConnection.type} onValueChange={(value) => setNewConnection({...newConnection, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grid type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Generation">Generation</SelectItem>
                      <SelectItem value="Transmission">Transmission</SelectItem>
                      <SelectItem value="Distribution">Distribution</SelectItem>
                      <SelectItem value="Substation">Substation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Connection Endpoint *</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.yourgrid.com/v1"
                    value={newConnection.endpoint}
                    onChange={(e) => setNewConnection({...newConnection, endpoint: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select value={newConnection.protocol} onValueChange={(value) => setNewConnection({...newConnection, protocol: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCADA">SCADA</SelectItem>
                      <SelectItem value="DNP3">DNP3</SelectItem>
                      <SelectItem value="Modbus">Modbus</SelectItem>
                      <SelectItem value="IEC 61850">IEC 61850</SelectItem>
                      <SelectItem value="REST API">REST API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="apiKey">API Key / Authentication</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter authentication credentials"
                    value={newConnection.apiKey}
                    onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="autoReconnect" />
                    <Label htmlFor="autoReconnect">Enable automatic reconnection</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="realTimeMonitoring" defaultChecked />
                    <Label htmlFor="realTimeMonitoring">Real-time data monitoring</Label>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <Button 
                    onClick={handleConnect} 
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Connect Grid
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}