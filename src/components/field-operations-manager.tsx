import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { 
  Wrench, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Camera,
  Plus,
  Calendar,
  User,
  FileText,
  WifiOff,
  Wifi
} from "lucide-react"

interface FieldOperation {
  id: string
  connection_id: string
  technician_id: string
  operation_type: string
  description: string
  location: any
  status: string
  priority: string
  scheduled_start: string
  actual_start: string
  completed_at: string
  findings: any
  photos: any
  offline_data: any
  created_at: string
  grid_connections?: any
}

interface GridConnection {
  id: string
  name: string
  type: string
  location: string
}

export function FieldOperationsManager() {
  const { user } = useAuth()
  const [operations, setOperations] = useState<FieldOperation[]>([])
  const [connections, setConnections] = useState<GridConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [newOperation, setNewOperation] = useState({
    connection_id: '',
    operation_type: 'inspection',
    description: '',
    priority: 'medium',
    scheduled_start: '',
    location: { lat: 0, lng: 0, address: '' }
  })

  useEffect(() => {
    if (user) {
      fetchOperations()
      fetchConnections()
      
      // Check network status
      const updateOnlineStatus = () => {
        setIsOfflineMode(!navigator.onLine)
      }
      
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
      }
    }
  }, [user])

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('field_operations')
        .select(`
          *,
          grid_connections!inner(name, type, location, user_id)
        `)
        .eq('grid_connections.user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOperations(data || [])
    } catch (error) {
      console.error('Error fetching operations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch field operations",
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
        .select('id, name, type, location')
        .eq('user_id', user?.id)

      if (error) throw error
      setConnections(data || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const createOperation = async () => {
    if (!newOperation.connection_id || !newOperation.description) {
      toast({
        title: "Error",
        description: "Connection and description are required",
        variant: "destructive"
      })
      return
    }

    try {
      const operationData = {
        connection_id: newOperation.connection_id,
        technician_id: user?.id,
        operation_type: newOperation.operation_type,
        description: newOperation.description,
        priority: newOperation.priority,
        scheduled_start: newOperation.scheduled_start || new Date().toISOString(),
        location: newOperation.location,
        status: 'assigned',
        findings: {},
        photos: [],
        offline_data: {}
      }

      const { error } = await supabase
        .from('field_operations')
        .insert(operationData)

      if (error) throw error

      toast({
        title: "Success",
        description: "Field operation created successfully"
      })

      setIsCreateDialogOpen(false)
      setNewOperation({
        connection_id: '',
        operation_type: 'inspection',
        description: '',
        priority: 'medium',
        scheduled_start: '',
        location: { lat: 0, lng: 0, address: '' }
      })
      
      await fetchOperations()
    } catch (error) {
      console.error('Error creating operation:', error)
      toast({
        title: "Error",
        description: "Failed to create field operation",
        variant: "destructive"
      })
    }
  }

  const updateOperationStatus = async (operationId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus }
      
      if (newStatus === 'in_progress' && !operations.find(op => op.id === operationId)?.actual_start) {
        updateData.actual_start = new Date().toISOString()
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('field_operations')
        .update(updateData)
        .eq('id', operationId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Operation status updated to ${newStatus}`
      })

      await fetchOperations()
    } catch (error) {
      console.error('Error updating operation status:', error)
      toast({
        title: "Error",
        description: "Failed to update operation status",
        variant: "destructive"
      })
    }
  }

  const syncOfflineData = async () => {
    try {
      const response = await supabase.functions.invoke('mobile-field-sync', {
        body: {
          action: 'sync_offline_data',
          user_id: user?.id
        }
      })

      if (response.error) throw response.error

      toast({
        title: "Success",
        description: `Synced ${response.data.synced_operations} operations from offline storage`
      })

      await fetchOperations()
    } catch (error) {
      console.error('Error syncing offline data:', error)
      toast({
        title: "Error",
        description: "Failed to sync offline data",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'assigned':
        return <User className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getOperationIcon = (operationType: string) => {
    switch (operationType) {
      case 'maintenance':
        return <Wrench className="h-4 w-4" />
      case 'inspection':
        return <FileText className="h-4 w-4" />
      case 'repair':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'default'
      case 'assigned':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading field operations...</div>
  }

  const activeOperations = operations.filter(op => op.status === 'in_progress')
  const pendingOperations = operations.filter(op => op.status === 'assigned')
  const completedOperations = operations.filter(op => op.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Field Operations Manager</h2>
          <p className="text-muted-foreground">
            Coordinate and track maintenance, inspection, and repair activities
          </p>
        </div>
        
        <div className="flex gap-2">
          {isOfflineMode && (
            <Button variant="outline" onClick={syncOfflineData}>
              <WifiOff className="mr-2 h-4 w-4" />
              Sync Offline Data
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            {isOfflineMode ? (
              <WifiOff className="h-4 w-4 text-red-500" />
            ) : (
              <Wifi className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm">
              {isOfflineMode ? 'Offline Mode' : 'Online'}
            </span>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Operation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Field Operation</DialogTitle>
                <DialogDescription>
                  Schedule a new maintenance, inspection, or repair operation
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="connection">Grid Connection</Label>
                  <Select
                    value={newOperation.connection_id}
                    onValueChange={(value) => setNewOperation({ ...newOperation, connection_id: value })}
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
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="operation_type">Operation Type</Label>
                    <Select
                      value={newOperation.operation_type}
                      onValueChange={(value) => setNewOperation({ ...newOperation, operation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="installation">Installation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newOperation.priority}
                      onValueChange={(value) => setNewOperation({ ...newOperation, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newOperation.description}
                    onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                    placeholder="Describe the operation to be performed"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="scheduled_start">Scheduled Start</Label>
                  <Input
                    id="scheduled_start"
                    type="datetime-local"
                    value={newOperation.scheduled_start}
                    onChange={(e) => setNewOperation({ ...newOperation, scheduled_start: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Location Address</Label>
                  <Textarea
                    id="address"
                    value={newOperation.location.address}
                    onChange={(e) => setNewOperation({
                      ...newOperation,
                      location: { ...newOperation.location, address: e.target.value }
                    })}
                    placeholder="Physical location for the operation"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createOperation}>Create Operation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeOperations.length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOperations.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOperations.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {operations.map((operation) => (
          <Card key={operation.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getOperationIcon(operation.operation_type)}
                  <div>
                    <CardTitle className="text-lg">
                      {operation.operation_type.charAt(0).toUpperCase() + operation.operation_type.slice(1)}
                    </CardTitle>
                    <CardDescription>
                      {operation.grid_connections?.name} • {operation.grid_connections?.location}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(operation.priority)}>
                    {operation.priority}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(operation.status)}
                    <Badge variant={getStatusColor(operation.status)}>
                      {operation.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm">{operation.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Scheduled:</span>
                  <p>{new Date(operation.scheduled_start).toLocaleString()}</p>
                </div>
                
                {operation.actual_start && (
                  <div>
                    <span className="font-medium text-muted-foreground">Started:</span>
                    <p>{new Date(operation.actual_start).toLocaleString()}</p>
                  </div>
                )}
                
                {operation.completed_at && (
                  <div>
                    <span className="font-medium text-muted-foreground">Completed:</span>
                    <p>{new Date(operation.completed_at).toLocaleString()}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-muted-foreground">Photos:</span>
                  <p>{operation.photos?.length || 0} uploaded</p>
                </div>
              </div>
              
              {operation.location?.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{operation.location.address}</span>
                </div>
              )}
              
              <div className="flex gap-2">
                {operation.status === 'assigned' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateOperationStatus(operation.id, 'in_progress')}
                  >
                    Start Operation
                  </Button>
                )}
                
                {operation.status === 'in_progress' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateOperationStatus(operation.id, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Add Photo
                </Button>
                
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {operations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Field Operations</h3>
            <p className="text-muted-foreground mb-4">
              Create field operations to coordinate maintenance and inspection activities
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Operation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}