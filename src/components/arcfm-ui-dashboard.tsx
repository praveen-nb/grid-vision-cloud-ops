import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Network, 
  Wrench, 
  FileText, 
  Calendar, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  Settings,
  Database,
  Activity
} from 'lucide-react';

export const ArcFMUIDashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [workOrderFilter, setWorkOrderFilter] = useState('all');

  const assetClasses = [
    { id: 'transformer', name: 'Power Transformers', count: 1247, status: 'healthy' },
    { id: 'switch', name: 'Switches', count: 3456, status: 'maintenance' },
    { id: 'conductor', name: 'Conductors', count: 8934, status: 'healthy' },
    { id: 'fuse', name: 'Fuses', count: 2341, status: 'alert' },
    { id: 'regulator', name: 'Voltage Regulators', count: 156, status: 'healthy' },
    { id: 'capacitor', name: 'Capacitor Banks', count: 789, status: 'maintenance' }
  ];

  const workOrders = [
    { id: 'WO-2024-001', type: 'Preventive Maintenance', asset: 'TX-4567', priority: 'High', status: 'In Progress', assigned: 'John Smith', due: '2024-01-15' },
    { id: 'WO-2024-002', type: 'Emergency Repair', asset: 'SW-8901', priority: 'Critical', status: 'Assigned', assigned: 'Sarah Johnson', due: '2024-01-12' },
    { id: 'WO-2024-003', type: 'Inspection', asset: 'CD-2345', priority: 'Medium', status: 'Scheduled', assigned: 'Mike Wilson', due: '2024-01-18' },
    { id: 'WO-2024-004', type: 'Installation', asset: 'VR-6789', priority: 'Low', status: 'Completed', assigned: 'Lisa Davis', due: '2024-01-10' }
  ];

  const facilityMetrics = [
    { metric: 'Asset Reliability', value: '98.7%', change: '+0.5%', icon: CheckCircle },
    { metric: 'Maintenance Compliance', value: '94.2%', change: '+2.1%', icon: Wrench },
    { metric: 'Work Order Completion', value: '87.5%', change: '-1.3%', icon: Clock },
    { metric: 'Emergency Response', value: '15 min', change: '-2 min', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Network className="text-primary" />
              ArcFM Solution
            </h1>
            <p className="text-muted-foreground">Facility Management & Asset Lifecycle</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Live View
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilityMetrics.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{item.metric}</span>
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs text-green-600">{item.change} from last period</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="assets">Asset Management</TabsTrigger>
            <TabsTrigger value="workorders">Work Orders</TabsTrigger>
            <TabsTrigger value="designer">Network Designer</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Workforce</TabsTrigger>
            <TabsTrigger value="reports">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Asset Classes */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Asset Classes</CardTitle>
                  <CardDescription>Grid infrastructure inventory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assetClasses.map((asset) => (
                    <div key={asset.id} 
                         className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                           selectedAsset === asset.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                         }`}
                         onClick={() => setSelectedAsset(asset.id)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{asset.name}</span>
                        <Badge variant={
                          asset.status === 'healthy' ? 'default' : 
                          asset.status === 'maintenance' ? 'secondary' : 'destructive'
                        }>
                          {asset.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {asset.count.toLocaleString()} assets
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Asset Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Asset Details & Attributes</CardTitle>
                  <CardDescription>
                    {selectedAsset ? `Detailed view of ${assetClasses.find(a => a.id === selectedAsset)?.name}` : 'Select an asset class to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedAsset ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Asset Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Asset ID:</span>
                              <span>TX-4567-A</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Installation Date:</span>
                              <span>2019-03-15</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Manufacturer:</span>
                              <span>ABB Group</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Model:</span>
                              <span>ONAN-65MVA</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rated Capacity:</span>
                              <span>65 MVA</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Operational Status</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Current Load:</span>
                              <span>45.2 MVA</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Load Factor:</span>
                              <span>69.5%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Temperature:</span>
                              <span>68°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Oil Level:</span>
                              <span>Normal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Maintenance:</span>
                              <span>2023-11-20</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Maintenance Schedule</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 border rounded-lg">
                            <div className="text-sm font-medium">Next Inspection</div>
                            <div className="text-lg font-bold text-blue-600">2024-02-15</div>
                            <div className="text-xs text-muted-foreground">Visual inspection</div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="text-sm font-medium">Oil Analysis</div>
                            <div className="text-lg font-bold text-orange-600">2024-03-01</div>
                            <div className="text-xs text-muted-foreground">DGA testing</div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="text-sm font-medium">Major Overhaul</div>
                            <div className="text-lg font-bold text-green-600">2026-03-15</div>
                            <div className="text-xs text-muted-foreground">7 year cycle</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <Database className="h-12 w-12 mx-auto mb-4" />
                        <p>Select an asset class to view detailed information</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workorders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Order Management</CardTitle>
                <CardDescription>Track and manage maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <select 
                    value={workOrderFilter} 
                    onChange={(e) => setWorkOrderFilter(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="all">All Work Orders</option>
                    <option value="critical">Critical Priority</option>
                    <option value="inprogress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule New
                  </Button>
                </div>

                <div className="space-y-3">
                  {workOrders.map((wo) => (
                    <div key={wo.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{wo.id}</span>
                          <Badge variant={
                            wo.priority === 'Critical' ? 'destructive' :
                            wo.priority === 'High' ? 'default' :
                            wo.priority === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {wo.priority}
                          </Badge>
                          <Badge variant="outline">{wo.status}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">Due: {wo.due}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div>{wo.type}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Asset:</span>
                          <div>{wo.asset}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assigned To:</span>
                          <div>{wo.assigned}</div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ArcFM Network Designer</CardTitle>
                <CardDescription>Design and modify electrical network configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 rounded-lg border-2 border-dashed border-muted h-96 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Network className="h-16 w-16 mx-auto text-muted-foreground" />
                        <div>
                          <h3 className="text-lg font-semibold">Network Design Canvas</h3>
                          <p className="text-sm text-muted-foreground">Design electrical network topology</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Design Tools</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Zap className="h-4 w-4 mr-2" />
                        Place Transformer
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Network className="h-4 w-4 mr-2" />
                        Draw Conductor
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Place Switch
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Place Fuse
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Workforce Management</CardTitle>
                <CardDescription>Field crew coordination and task management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Field Crews</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Active Crews:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-medium text-green-600">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Assignment:</span>
                        <span className="font-medium text-blue-600">4</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Response Times</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Emergency:</span>
                        <span className="font-medium">15 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>High Priority:</span>
                        <span className="font-medium">45 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard:</span>
                        <span className="font-medium">2.5 hrs</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Productivity</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tasks Completed:</span>
                        <span className="font-medium">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Task Time:</span>
                        <span className="font-medium">1.8 hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-medium text-green-600">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reporting</CardTitle>
                <CardDescription>Asset performance and maintenance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Asset Performance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">System Reliability</span>
                          <span className="text-sm">98.7%</span>
                        </div>
                        <Progress value={98.7} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Maintenance Effectiveness</span>
                          <span className="text-sm">94.2%</span>
                        </div>
                        <Progress value={94.2} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Asset Utilization</span>
                          <span className="text-sm">76.8%</span>
                        </div>
                        <Progress value={76.8} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Maintenance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Planned Maintenance</span>
                          <span className="text-sm">87%</span>
                        </div>
                        <Progress value={87} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Work Order Completion</span>
                          <span className="text-sm">92%</span>
                        </div>
                        <Progress value={92} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Cost Optimization</span>
                          <span className="text-sm">83%</span>
                        </div>
                        <Progress value={83} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};