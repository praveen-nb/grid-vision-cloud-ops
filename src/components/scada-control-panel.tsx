import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Settings, Power, AlertTriangle, Clock, CheckCircle, XCircle, Play, Pause } from "lucide-react"

interface ScadaOperation {
  id: string
  connection_id: string
  operation_type: string
  target_device: string
  command_data: any
  status: string
  executed_by: string
  executed_at: string
  created_at: string
  grid_connections?: any
}

interface GridConnection {
  id: string
  name: string
  type: string
  status: string
}

export function ScadaControlPanel() {
  const { user } = useAuth()
  const [operations, setOperations] = useState<ScadaOperation[]>([])
  const [connections, setConnections] = useState<GridConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false)
  const [executingCommand, setExecutingCommand] = useState(false)
  const [newCommand, setNewCommand] = useState({
    connection_id: '',
    operation_type: 'voltage_regulate',
    target_device: '',
    command_data: {}
  })

  useEffect(() => {
    if (user) {
      fetchOperations()
      fetchConnections()
    }
  }, [user])

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('scada_operations')
        .select(`
          *,
          grid_connections!inner(name, type, user_id)
        `)
        .eq('grid_connections.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setOperations(data || [])
    } catch (error) {
      console.error('Error fetching operations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch SCADA operations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_connections')
        .select('id, name, type, status')
        .eq('user_id', user?.id)
        .eq('status', 'connected')

      if (error) throw error
      setConnections(data || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const executeCommand = async () => {
    if (!newCommand.connection_id || !newCommand.target_device) {
      toast({
        title: "Error",
        description: "Please select connection and target device",
        variant: "destructive"
      })
      return
    }

    setExecutingCommand(true)
    try {
      const response = await supabase.functions.invoke('scada-operations', {
        body: {
          command: {
            connectionId: newCommand.connection_id,
            operationType: newCommand.operation_type,
            targetDevice: newCommand.target_device,
            commandData: newCommand.command_data,
            priority: 'medium'
          }
        }
      })

      if (response.error) throw response.error

      toast({
        title: "Success",
        description: `SCADA command ${response.data.success ? 'executed successfully' : 'failed'}`,
        variant: response.data.success ? "default" : "destructive"
      })

      setIsCommandDialogOpen(false)
      setNewCommand({
        connection_id: '',
        operation_type: 'voltage_regulate',
        target_device: '',
        command_data: {}
      })
      
      // Refresh operations
      await fetchOperations()
    } catch (error) {
      console.error('Error executing command:', error)
      toast({
        title: "Error",
        description: "Failed to execute SCADA command",
        variant: "destructive"
      })
    } finally {
      setExecutingCommand(false)
    }
  }

  const triggerAutomatedResponse = async () => {
    try {
      const response = await supabase.functions.invoke('scada-operations', {
        method: 'PUT'
      })

      if (response.error) throw response.error

      toast({
        title: "Success",
        description: `Triggered ${response.data.automated_operations} automated responses`
      })

      await fetchOperations()
    } catch (error) {
      console.error('Error triggering automated response:', error)
      toast({
        title: "Error",
        description: "Failed to trigger automated response",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'executing':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Pause className="h-4 w-4 text-gray-500" />
    }
  }

  const getOperationIcon = (operationType: string) => {
    switch (operationType) {
      case 'switch_open':
      case 'switch_close':
        return <Power className="h-4 w-4" />
      case 'voltage_regulate':
        return <Settings className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'executing':
        return 'default'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const updateCommandData = (operationType: string) => {
    let defaultData = {}
    
    switch (operationType) {
      case 'voltage_regulate':
        defaultData = { target_voltage: 230, tolerance: 5 }
        break
      case 'load_shed':
        defaultData = { shed_percentage: 10, duration_minutes: 15 }
        break
      case 'switch_open':
      case 'switch_close':
        defaultData = { confirmation_required: true }
        break
      case 'breaker_trip':
        defaultData = { trip_reason: 'manual', reset_delay: 30 }
        break
    }
    
    setNewCommand({ ...newCommand, operation_type: operationType, command_data: defaultData })
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading SCADA operations...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">SCADA Control Panel</h2>
          <p className="text-muted-foreground">
            Real-time grid control and monitoring operations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={triggerAutomatedResponse}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Auto Response
          </Button>
          
          <Dialog open={isCommandDialogOpen} onOpenChange={setIsCommandDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Execute Command
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Execute SCADA Command</DialogTitle>
                <DialogDescription>
                  Send a control command to grid equipment
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="connection">Grid Connection</Label>
                  <Select
                    value={newCommand.connection_id}
                    onValueChange={(value) => setNewCommand({ ...newCommand, connection_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map((conn) => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.name} ({conn.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="operation_type">Operation Type</Label>
                  <Select
                    value={newCommand.operation_type}
                    onValueChange={updateCommandData}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voltage_regulate">Voltage Regulation</SelectItem>
                      <SelectItem value="switch_open">Switch Open</SelectItem>
                      <SelectItem value="switch_close">Switch Close</SelectItem>
                      <SelectItem value="load_shed">Load Shedding</SelectItem>
                      <SelectItem value="breaker_trip">Breaker Trip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="target_device">Target Device</Label>
                  <Input
                    id="target_device"
                    value={newCommand.target_device}
                    onChange={(e) => setNewCommand({ ...newCommand, target_device: e.target.value })}
                    placeholder="e.g., transformer_1, switch_A2"
                  />
                </div>
                
                {newCommand.operation_type === 'voltage_regulate' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="target_voltage">Target Voltage</Label>
                      <Input
                        id="target_voltage"
                        type="number"
                        value={(newCommand.command_data as any).target_voltage || 230}
                        onChange={(e) => setNewCommand({
                          ...newCommand,
                          command_data: { ...newCommand.command_data, target_voltage: parseFloat(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tolerance">Tolerance</Label>
                      <Input
                        id="tolerance"
                        type="number"
                        value={(newCommand.command_data as any).tolerance || 5}
                        onChange={(e) => setNewCommand({
                          ...newCommand,
                          command_data: { ...newCommand.command_data, tolerance: parseFloat(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                )}
                
                {newCommand.operation_type === 'load_shed' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="shed_percentage">Shed %</Label>
                      <Input
                        id="shed_percentage"
                        type="number"
                        value={(newCommand.command_data as any).shed_percentage || 10}
                        onChange={(e) => setNewCommand({
                          ...newCommand,
                          command_data: { ...newCommand.command_data, shed_percentage: parseFloat(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={(newCommand.command_data as any).duration_minutes || 15}
                        onChange={(e) => setNewCommand({
                          ...newCommand,
                          command_data: { ...newCommand.command_data, duration_minutes: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCommandDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={executeCommand} disabled={executingCommand}>
                  {executingCommand ? "Executing..." : "Execute Command"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Success rate: {operations.length > 0 ? Math.round(operations.filter(op => op.status === 'completed').length / operations.length * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.status === 'pending' || op.status === 'executing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting execution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
          <CardDescription>Latest SCADA control operations and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operations.slice(0, 10).map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getOperationIcon(operation.operation_type)}
                    {getStatusIcon(operation.status)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {operation.operation_type.replace('_', ' ')} on {operation.target_device}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {operation.grid_connections?.name} • Created: {new Date(operation.created_at).toLocaleString()}
                    </div>
                    {operation.executed_at && (
                      <div className="text-sm text-muted-foreground">
                        Executed: {new Date(operation.executed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusVariant(operation.status)}>
                    {operation.status}
                  </Badge>
                  {operation.command_data && Object.keys(operation.command_data).length > 0 && (
                    <div className="text-xs text-muted-foreground text-right">
                      {Object.entries(operation.command_data).map(([key, value]) => (
                        <div key={key}>{key}: {String(value)}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {operations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No SCADA operations found. Execute your first command to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}