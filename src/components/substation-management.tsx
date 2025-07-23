import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  MapPin, 
  Zap, 
  Settings, 
  Trash2, 
  Edit, 
  Save,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Substation {
  id: string;
  name: string;
  location: string;
  type: string;
  voltage_level: number;
  capacity: number;
  status: 'operational' | 'maintenance' | 'offline' | 'emergency';
  coordinates: { lat: number; lng: number };
  installation_date: string;
  last_maintenance: string;
  next_maintenance: string;
  description?: string;
  monitoring_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SubstationFormData {
  name: string;
  location: string;
  type: string;
  voltage_level: number;
  capacity: number;
  coordinates: { lat: number; lng: number };
  installation_date: string;
  description: string;
}

export function SubstationManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubstation, setEditingSubstation] = useState<Substation | null>(null);
  const [formData, setFormData] = useState<SubstationFormData>({
    name: '',
    location: '',
    type: 'distribution',
    voltage_level: 11,
    capacity: 10,
    coordinates: { lat: 0, lng: 0 },
    installation_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Load substations from database
  useEffect(() => {
    if (user) {
      loadSubstations();
    }
  }, [user]);

  const loadSubstations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grid_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform grid_connections to substation format
      const transformedData = data?.map(connection => ({
        id: connection.id,
        name: connection.name,
        location: connection.location,
        type: connection.type,
        voltage_level: connection.voltage || 11,
        capacity: 10, // Default capacity
        status: connection.status as any,
        coordinates: { lat: 0, lng: 0 }, // Default coordinates
        installation_date: connection.created_at.split('T')[0],
        last_maintenance: connection.last_update,
        next_maintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        description: `${connection.protocol} connection at ${connection.endpoint}`,
        monitoring_enabled: connection.status === 'connected',
        created_at: connection.created_at,
        updated_at: connection.updated_at
      })) || [];

      setSubstations(transformedData);
    } catch (error) {
      console.error('Error loading substations:', error);
      toast({
        title: "Error",
        description: "Failed to load substations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSubstation = async (data: SubstationFormData) => {
    try {
      if (editingSubstation) {
        // Update existing substation
        const { error } = await supabase
          .from('grid_connections')
          .update({
            name: data.name,
            location: data.location,
            type: data.type,
            voltage: data.voltage_level,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSubstation.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Substation updated successfully"
        });
      } else {
        // Create new substation
        const { error } = await supabase
          .from('grid_connections')
          .insert({
            user_id: user?.id,
            name: data.name,
            location: data.location,
            type: data.type,
            voltage: data.voltage_level,
            endpoint: `substation://${data.name.toLowerCase().replace(/\s+/g, '-')}`,
            protocol: 'MODBUS',
            status: 'connected'
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Substation created successfully"
        });
      }

      setShowAddDialog(false);
      setEditingSubstation(null);
      resetForm();
      loadSubstations();
    } catch (error) {
      console.error('Error saving substation:', error);
      toast({
        title: "Error",
        description: "Failed to save substation",
        variant: "destructive"
      });
    }
  };

  const deleteSubstation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grid_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Substation deleted successfully"
      });
      loadSubstations();
    } catch (error) {
      console.error('Error deleting substation:', error);
      toast({
        title: "Error",
        description: "Failed to delete substation",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      type: 'distribution',
      voltage_level: 11,
      capacity: 10,
      coordinates: { lat: 0, lng: 0 },
      installation_date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleEdit = (substation: Substation) => {
    setEditingSubstation(substation);
    setFormData({
      name: substation.name,
      location: substation.location,
      type: substation.type,
      voltage_level: substation.voltage_level,
      capacity: substation.capacity,
      coordinates: substation.coordinates,
      installation_date: substation.installation_date,
      description: substation.description || ''
    });
    setShowAddDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': case 'connected': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': case 'disconnected': return 'bg-red-500';
      case 'emergency': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'offline': case 'disconnected': return <AlertTriangle className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Location', 'Type', 'Voltage (kV)', 'Capacity (MVA)', 'Status', 'Installation Date'],
      ...substations.map(s => [
        s.name, s.location, s.type, s.voltage_level, s.capacity, s.status, s.installation_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'substations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6">Loading substations...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Substation Management</h1>
          <p className="text-muted-foreground">Manage and monitor your electrical substations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Substation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSubstation ? 'Edit Substation' : 'Add New Substation'}
                </DialogTitle>
                <DialogDescription>
                  {editingSubstation ? 'Update substation information' : 'Create a new substation for monitoring'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Substation Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Main Substation"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Downtown District"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transmission">Transmission</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="switching">Switching</SelectItem>
                      <SelectItem value="collector">Collector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="voltage">Voltage Level (kV)</Label>
                  <Input
                    id="voltage"
                    type="number"
                    value={formData.voltage_level}
                    onChange={(e) => setFormData({...formData, voltage_level: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity (MVA)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="installation">Installation Date</Label>
                  <Input
                    id="installation"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => setFormData({...formData, installation_date: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional details about the substation..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => saveSubstation(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Substation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Total Substations</span>
            </div>
            <div className="text-2xl font-bold">{substations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Operational</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {substations.filter(s => ['operational', 'connected'].includes(s.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Maintenance</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {substations.filter(s => s.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Total Capacity</span>
            </div>
            <div className="text-2xl font-bold">
              {substations.reduce((sum, s) => sum + s.capacity, 0)} MVA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Substations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {substations.map((substation) => (
          <Card key={substation.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {substation.name}
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(substation.status)}`} />
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {substation.location}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(substation)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteSubstation(substation.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getStatusIcon(substation.status)}
                    {substation.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="secondary">{substation.type}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Voltage</span>
                  <span className="font-medium">{substation.voltage_level} kV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <span className="font-medium">{substation.capacity} MVA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monitoring</span>
                  <Badge variant={substation.monitoring_enabled ? "default" : "outline"}>
                    {substation.monitoring_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {substations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Substations Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first substation to begin monitoring.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Substation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}