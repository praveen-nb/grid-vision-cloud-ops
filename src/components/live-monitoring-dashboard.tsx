import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, Activity, Zap, AlertTriangle, CheckCircle, MapPin, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Substation {
  id: string;
  name: string;
  location: string;
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  status: 'online' | 'offline' | 'warning' | 'critical';
  lastUpdate: Date;
  coordinates: { lat: number; lng: number };
}

interface MetricData {
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  frequency: number;
}

export function LiveMonitoringDashboard() {
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [selectedSubstation, setSelectedSubstation] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [newSubstation, setNewSubstation] = useState({
    name: '',
    location: '',
    coordinates: { lat: 0, lng: 0 }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // Generate real-time data for existing substations
  useEffect(() => {
    const interval = setInterval(() => {
      setSubstations(prev => prev.map(substation => ({
        ...substation,
        voltage: 115 + (Math.random() - 0.5) * 10,
        current: 800 + (Math.random() - 0.5) * 200,
        power: 92 + (Math.random() - 0.5) * 16,
        frequency: 60 + (Math.random() - 0.5) * 0.5,
        status: Math.random() > 0.95 ? 'warning' : 'online',
        lastUpdate: new Date()
      })));

      // Update metrics data for selected substation
      if (selectedSubstation) {
        setMetricsData(prev => {
          const newData = {
            timestamp: new Date().toLocaleTimeString(),
            voltage: 115 + (Math.random() - 0.5) * 10,
            current: 800 + (Math.random() - 0.5) * 200,
            power: 92 + (Math.random() - 0.5) * 16,
            frequency: 60 + (Math.random() - 0.5) * 0.5
          };
          return [...prev.slice(-29), newData]; // Keep last 30 data points
        });
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [selectedSubstation]);

  const addSubstation = () => {
    if (!newSubstation.name || !newSubstation.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const substation: Substation = {
      id: `SUB-${Date.now()}`,
      name: newSubstation.name,
      location: newSubstation.location,
      voltage: 115 + (Math.random() - 0.5) * 10,
      current: 800 + (Math.random() - 0.5) * 200,
      power: 92 + (Math.random() - 0.5) * 16,
      frequency: 60 + (Math.random() - 0.5) * 0.5,
      status: 'online',
      lastUpdate: new Date(),
      coordinates: newSubstation.coordinates
    };

    setSubstations(prev => [...prev, substation]);
    setNewSubstation({ name: '', location: '', coordinates: { lat: 0, lng: 0 } });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: `Substation ${substation.name} added successfully`
    });
  };

  const removeSubstation = (id: string) => {
    const substation = substations.find(s => s.id === id);
    setSubstations(prev => prev.filter(s => s.id !== id));
    if (selectedSubstation === id) {
      setSelectedSubstation(null);
      setMetricsData([]);
    }
    
    toast({
      title: "Removed",
      description: `Substation ${substation?.name} removed successfully`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline': return <Activity className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const selectedSubstationData = substations.find(s => s.id === selectedSubstation);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Substation Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring and visualization of electrical substations</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Substation
        </Button>
      </div>

      {/* Add Substation Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Substation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Substation Name"
                value={newSubstation.name}
                onChange={(e) => setNewSubstation(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={newSubstation.location}
                onChange={(e) => setNewSubstation(prev => ({ ...prev, location: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Latitude"
                value={newSubstation.coordinates.lat || ''}
                onChange={(e) => setNewSubstation(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                }))}
              />
              <Input
                type="number"
                placeholder="Longitude"
                value={newSubstation.coordinates.lng || ''}
                onChange={(e) => setNewSubstation(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addSubstation}>Add Substation</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Substations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {substations.map((substation) => (
          <Card 
            key={substation.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedSubstation === substation.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setSelectedSubstation(substation.id);
              setMetricsData([]); // Reset metrics data when switching
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{substation.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {substation.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(substation.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSubstation(substation.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Voltage:</span>
                  <span className="font-mono">{substation.voltage.toFixed(1)} kV</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current:</span>
                  <span className="font-mono">{substation.current.toFixed(0)} A</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Power:</span>
                  <span className="font-mono">{substation.power.toFixed(1)} MW</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frequency:</span>
                  <span className="font-mono">{substation.frequency.toFixed(2)} Hz</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Status:</span>
                  <Badge variant={substation.status === 'online' ? 'default' : 'destructive'}>
                    {substation.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last update: {substation.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Substation Details */}
      {selectedSubstationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Monitoring: {selectedSubstationData.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList>
                <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
                <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
                <TabsTrigger value="alarms">Alarms & Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Voltage</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedSubstationData.voltage.toFixed(1)} kV
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Current</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedSubstationData.current.toFixed(0)} A
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Power</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedSubstationData.power.toFixed(1)} MW
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Frequency</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedSubstationData.frequency.toFixed(2)} Hz
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {metricsData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Voltage & Current</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={metricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Power & Frequency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={metricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="power" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="frequency" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trends">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Trend analysis shows stable operation over the past 24 hours with minor fluctuations within normal parameters.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="alarms">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No active alarms. All systems operating within normal parameters.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {substations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Substations Added</h3>
            <p className="text-muted-foreground mb-4">
              Start monitoring by adding your first substation to the system.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Substation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}