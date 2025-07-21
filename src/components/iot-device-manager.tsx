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
import { Cpu, Wifi, WifiOff, Plus, MapPin, Activity } from "lucide-react"

interface IoTDevice {
  id: string
  device_id: string
  device_type: string
  name: string
  location: any
  status: string
  last_heartbeat: string
  metadata: any
  created_at: string
}

export function IoTDeviceManager() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newDevice, setNewDevice] = useState({
    device_id: '',
    device_type: 'smart_meter',
    name: '',
    location: { lat: 0, lng: 0, address: '' },
    metadata: {}
  })

  useEffect(() => {
    if (user) {
      fetchDevices()
    }
  }, [user])

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDevices(data || [])
    } catch (error) {
      console.error('Error fetching devices:', error)
      toast({
        title: "Error",
        description: "Failed to fetch IoT devices",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addDevice = async () => {
    if (!newDevice.device_id || !newDevice.name) {
      toast({
        title: "Error",
        description: "Device ID and name are required",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('iot_devices')
        .insert({
          user_id: user?.id,
          device_id: newDevice.device_id,
          device_type: newDevice.device_type,
          name: newDevice.name,
          location: newDevice.location,
          status: 'offline',
          metadata: newDevice.metadata
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "IoT device added successfully"
      })

      setIsAddDialogOpen(false)
      setNewDevice({
        device_id: '',
        device_type: 'smart_meter',
        name: '',
        location: { lat: 0, lng: 0, address: '' },
        metadata: {}
      })
      fetchDevices()
    } catch (error) {
      console.error('Error adding device:', error)
      toast({
        title: "Error",
        description: "Failed to add IoT device",
        variant: "destructive"
      })
    }
  }

  const toggleDeviceStatus = async (deviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'online' ? 'offline' : 'online'
    
    try {
      const { error } = await supabase
        .from('iot_devices')
        .update({ 
          status: newStatus,
          last_heartbeat: newStatus === 'online' ? new Date().toISOString() : null
        })
        .eq('id', deviceId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Device status updated to ${newStatus}`
      })

      fetchDevices()
    } catch (error) {
      console.error('Error updating device status:', error)
      toast({
        title: "Error",
        description: "Failed to update device status",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getDeviceTypeIcon = (type: string) => {
    return <Cpu className="h-5 w-5" />
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading devices...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">IoT Device Management</h2>
          <p className="text-muted-foreground">
            Manage smart meters, sensors, and SCADA units in your grid infrastructure
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add IoT Device</DialogTitle>
              <DialogDescription>
                Register a new IoT device to the grid monitoring system
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="device_id">Device ID</Label>
                <Input
                  id="device_id"
                  value={newDevice.device_id}
                  onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
                  placeholder="e.g., SM001, SENSOR_01"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="device_type">Device Type</Label>
                <Select
                  value={newDevice.device_type}
                  onValueChange={(value) => setNewDevice({ ...newDevice, device_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smart_meter">Smart Meter</SelectItem>
                    <SelectItem value="sensor">IoT Sensor</SelectItem>
                    <SelectItem value="scada_unit">SCADA Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Device Name</Label>
                <Input
                  id="name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="e.g., Main Substation Meter"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={newDevice.location.lat}
                    onChange={(e) => setNewDevice({
                      ...newDevice,
                      location: { ...newDevice.location, lat: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={newDevice.location.lng}
                    onChange={(e) => setNewDevice({
                      ...newDevice,
                      location: { ...newDevice.location, lng: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newDevice.location.address}
                  onChange={(e) => setNewDevice({
                    ...newDevice,
                    location: { ...newDevice.location, address: e.target.value }
                  })}
                  placeholder="Physical location address"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addDevice}>Add Device</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <Card key={device.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDeviceTypeIcon(device.device_type)}
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <CardDescription>{device.device_id}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(device.status)}
                  <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                    {device.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {device.location.address || `${device.location.lat}, ${device.location.lng}`}
                </span>
              </div>
              
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">Type:</span> {device.device_type.replace('_', ' ')}
                </div>
                {device.last_heartbeat && (
                  <div>
                    <span className="font-medium">Last Heartbeat:</span>{' '}
                    {new Date(device.last_heartbeat).toLocaleString()}
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toggleDeviceStatus(device.id, device.status)}
              >
                {device.status === 'online' ? 'Take Offline' : 'Bring Online'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Cpu className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No IoT Devices</h3>
            <p className="text-muted-foreground mb-4">
              Add IoT devices to start monitoring your grid infrastructure
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Device
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}