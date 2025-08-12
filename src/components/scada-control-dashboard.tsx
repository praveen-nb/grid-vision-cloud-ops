import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  Power, 
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  RefreshCw,
  Shield,
  Thermometer,
  Battery,
  Wind
} from 'lucide-react';

export const SCADAControlDashboard = () => {
  const [systemStatus, setSystemStatus] = useState('normal');
  const [realTimeData, setRealTimeData] = useState({
    voltage: 138.5,
    current: 245.8,
    frequency: 60.02,
    powerFactor: 0.95,
    temperature: 68,
    pressure: 14.7
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        voltage: prev.voltage + (Math.random() - 0.5) * 2,
        current: prev.current + (Math.random() - 0.5) * 10,
        frequency: 60 + (Math.random() - 0.5) * 0.1,
        powerFactor: 0.95 + (Math.random() - 0.5) * 0.1,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        pressure: prev.pressure + (Math.random() - 0.5) * 0.5
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const substations = [
    { id: 'SUB-001', name: 'Central Substation', voltage: '138kV', status: 'online', load: 85, alarms: 0 },
    { id: 'SUB-002', name: 'North Substation', voltage: '69kV', status: 'online', load: 67, alarms: 1 },
    { id: 'SUB-003', name: 'South Substation', voltage: '138kV', status: 'maintenance', load: 0, alarms: 2 },
    { id: 'SUB-004', name: 'West Substation', voltage: '69kV', status: 'online', load: 92, alarms: 0 },
    { id: 'SUB-005', name: 'East Substation', voltage: '138kV', status: 'online', load: 76, alarms: 0 }
  ];

  const alarms = [
    { id: 1, timestamp: '2024-01-12 14:23:15', severity: 'High', message: 'Transformer T-2 temperature alarm', location: 'SUB-002', acknowledged: false },
    { id: 2, timestamp: '2024-01-12 14:18:42', severity: 'Medium', message: 'Communication timeout - RTU-007', location: 'SUB-003', acknowledged: true },
    { id: 3, timestamp: '2024-01-12 14:15:33', severity: 'Low', message: 'Voltage regulator tap position changed', location: 'SUB-003', acknowledged: false },
    { id: 4, timestamp: '2024-01-12 13:45:21', severity: 'Critical', message: 'Breaker CB-145 failed to open', location: 'SUB-001', acknowledged: true }
  ];

  const controlActions = [
    { device: 'Breaker CB-145', action: 'Open', status: 'Available' },
    { device: 'Breaker CB-146', action: 'Close', status: 'Available' },
    { device: 'Tap Changer TC-001', action: 'Raise', status: 'Available' },
    { device: 'Tap Changer TC-001', action: 'Lower', status: 'Available' },
    { device: 'Capacitor Bank CB-001', action: 'Switch In', status: 'Available' },
    { device: 'Capacitor Bank CB-002', action: 'Switch Out', status: 'Available' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="text-primary" />
              SCADA Control Center
            </h1>
            <p className="text-muted-foreground">Supervisory Control & Data Acquisition System</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Status Alert */}
        {systemStatus !== 'normal' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System operating in {systemStatus} mode. Monitor all critical parameters closely.
            </AlertDescription>
          </Alert>
        )}

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">kV</span>
              </div>
              <div className="text-2xl font-bold">{realTimeData.voltage.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Voltage</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">A</span>
              </div>
              <div className="text-2xl font-bold">{realTimeData.current.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Gauge className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Hz</span>
              </div>
              <div className="text-2xl font-bold">{realTimeData.frequency.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Frequency</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Power className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">PF</span>
              </div>
              <div className="text-2xl font-bold">{realTimeData.powerFactor.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Power Factor</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground">°C</span>
              </div>
              <div className="text-2xl font-bold">{realTimeData.temperature.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Temperature</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wind className="h-4 w-4 text-teal-500" />
                <span className="text-xs text-muted-foreground">PSI</span>
              </div>
              <div className="text-2xl font-bold">{realTimeData.pressure.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Pressure</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="substations">Substations</TabsTrigger>
            <TabsTrigger value="alarms">Alarms & Events</TabsTrigger>
            <TabsTrigger value="control">Control Actions</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Overall system status and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">99.8%</div>
                      <div className="text-sm text-muted-foreground">System Availability</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-sm text-muted-foreground">Active Substations</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">3</div>
                      <div className="text-sm text-muted-foreground">Active Alarms</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">247</div>
                      <div className="text-sm text-muted-foreground">Connected RTUs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communication Status</CardTitle>
                  <CardDescription>Network and device connectivity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">DNP3 Communication</span>
                        <span className="text-sm">98.5%</span>
                      </div>
                      <Progress value={98.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Modbus TCP</span>
                        <span className="text-sm">97.2%</span>
                      </div>
                      <Progress value={97.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">IEC 61850</span>
                        <span className="text-sm">99.1%</span>
                      </div>
                      <Progress value={99.1} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Network Redundancy</span>
                        <span className="text-sm">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="substations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Substation Status</CardTitle>
                <CardDescription>Real-time status of all substations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {substations.map((station) => (
                    <div key={station.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{station.name}</h4>
                          <p className="text-sm text-muted-foreground">{station.id} - {station.voltage}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            station.status === 'online' ? 'default' : 
                            station.status === 'maintenance' ? 'secondary' : 'destructive'
                          }>
                            {station.status}
                          </Badge>
                          {station.alarms > 0 && (
                            <Badge variant="destructive">{station.alarms} alarm{station.alarms !== 1 ? 's' : ''}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Load</span>
                            <span className="text-sm">{station.load}%</span>
                          </div>
                          <Progress value={station.load} className="h-2" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4" />
                          <span className="text-sm">DC Supply: Normal</span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Controls</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alarms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Alarms & Events</CardTitle>
                <CardDescription>Real-time system alerts and operational events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alarms.map((alarm) => (
                    <div key={alarm.id} className={`p-4 border rounded-lg ${alarm.acknowledged ? 'bg-muted/50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            alarm.severity === 'Critical' ? 'destructive' :
                            alarm.severity === 'High' ? 'default' :
                            alarm.severity === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {alarm.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{alarm.timestamp}</span>
                          <span className="text-sm font-medium">{alarm.location}</span>
                        </div>
                        {!alarm.acknowledged && (
                          <Button variant="outline" size="sm">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{alarm.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="control" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Control Actions</CardTitle>
                <CardDescription>Remote control operations and device commands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {controlActions.map((action, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <h4 className="font-medium">{action.device}</h4>
                        <p className="text-sm text-muted-foreground">{action.action}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{action.status}</Badge>
                        <Button variant="outline" size="sm" disabled={action.status !== 'Available'}>
                          Execute
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-6">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All control actions require operator authentication and are logged for audit purposes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Trends</CardTitle>
                  <CardDescription>Key parameter trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">System Load</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">+2.3%</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold">847 MW</div>
                      <div className="text-xs text-muted-foreground">24-hour average</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Voltage Deviation</span>
                        <div className="flex items-center gap-1">
                          <Minus className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">±0.1%</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold">0.05%</div>
                      <div className="text-xs text-muted-foreground">Within limits</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Frequency Stability</span>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">-0.01 Hz</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold">60.01 Hz</div>
                      <div className="text-xs text-muted-foreground">Nominal range</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>System reliability and availability metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">SAIDI (System Average Interruption Duration Index)</span>
                        <span className="text-sm">12.5 min</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">YTD: 15% improvement</div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">SAIFI (System Average Interruption Frequency Index)</span>
                        <span className="text-sm">0.8</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">YTD: 8% improvement</div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Equipment Availability</span>
                        <span className="text-sm">99.7%</span>
                      </div>
                      <Progress value={99.7} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">Target: 99.5%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};