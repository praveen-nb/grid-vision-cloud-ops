import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  Layers, 
  MapPin, 
  Zap, 
  Settings, 
  Search,
  Filter,
  Download,
  Share2,
  RefreshCw,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

export const ArcGISUIDashboard = () => {
  const [selectedLayer, setSelectedLayer] = useState('transmission');
  const [mapView, setMapView] = useState('hybrid');

  const layerData = [
    { id: 'transmission', name: 'Transmission Lines', count: 1247, status: 'active' },
    { id: 'distribution', name: 'Distribution Networks', count: 8934, status: 'active' },
    { id: 'substations', name: 'Substations', count: 156, status: 'active' },
    { id: 'transformers', name: 'Transformers', count: 2341, status: 'maintenance' },
    { id: 'switches', name: 'Switches & Breakers', count: 5678, status: 'active' },
    { id: 'meters', name: 'Smart Meters', count: 45672, status: 'active' }
  ];

  const spatialAnalytics = [
    { metric: 'Coverage Analysis', value: '99.7%', change: '+0.3%' },
    { metric: 'Load Density', value: '847 MW/km²', change: '+2.1%' },
    { metric: 'Network Reliability', value: '99.94%', change: '+0.02%' },
    { metric: 'Asset Utilization', value: '78.3%', change: '-1.2%' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Map className="text-primary" />
              ArcGIS Enterprise Portal
            </h1>
            <p className="text-muted-foreground">Geospatial Intelligence & Grid Visualization</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>

        {/* Map Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Interactive Grid Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map Visualization Area */}
              <div className="lg:col-span-3">
                <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg border-2 border-dashed border-muted h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Map className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">ArcGIS Web Map</h3>
                      <p className="text-sm text-muted-foreground">Real-time grid topology visualization</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Badge variant={mapView === 'satellite' ? 'default' : 'outline'} 
                             className="cursor-pointer" 
                             onClick={() => setMapView('satellite')}>
                        Satellite
                      </Badge>
                      <Badge variant={mapView === 'hybrid' ? 'default' : 'outline'} 
                             className="cursor-pointer" 
                             onClick={() => setMapView('hybrid')}>
                        Hybrid
                      </Badge>
                      <Badge variant={mapView === 'topology' ? 'default' : 'outline'} 
                             className="cursor-pointer" 
                             onClick={() => setMapView('topology')}>
                        Topology
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4" />
                  <input 
                    type="text" 
                    placeholder="Search layers..." 
                    className="flex-1 px-3 py-2 text-sm border rounded-md"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Grid Layers</h4>
                  {layerData.map((layer) => (
                    <div key={layer.id} 
                         className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                           selectedLayer === layer.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                         }`}
                         onClick={() => setSelectedLayer(layer.id)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{layer.name}</span>
                        <Badge variant={layer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {layer.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {layer.count.toLocaleString()} features
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spatialAnalytics.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{item.metric}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-green-600">{item.change} from last month</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Tabs */}
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Spatial Analysis</TabsTrigger>
            <TabsTrigger value="geoprocessing">Geoprocessing</TabsTrigger>
            <TabsTrigger value="services">Web Services</TabsTrigger>
            <TabsTrigger value="portal">Portal Management</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Network Tracing</CardTitle>
                  <CardDescription>Electrical connectivity analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trace Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Upstream Trace</option>
                      <option>Downstream Trace</option>
                      <option>Isolation Trace</option>
                      <option>Service Area</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Starting Point</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Click on map..." className="flex-1 p-2 border rounded-md" />
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Run Trace
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proximity Analysis</CardTitle>
                  <CardDescription>Buffer and service area analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analysis Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Buffer Analysis</option>
                      <option>Service Area</option>
                      <option>Viewshed Analysis</option>
                      <option>Watershed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Distance/Time</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="500" className="flex-1 p-2 border rounded-md" />
                      <select className="p-2 border rounded-md">
                        <option>meters</option>
                        <option>kilometers</option>
                        <option>minutes</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full">
                    Run Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geoprocessing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geoprocessing Tools</CardTitle>
                <CardDescription>Automated spatial processing workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Data Management</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Feature Class Export</li>
                      <li>• Data Conversion</li>
                      <li>• Schema Validation</li>
                      <li>• Quality Assurance</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Analysis Tools</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Overlay Analysis</li>
                      <li>• Statistical Analysis</li>
                      <li>• Raster Processing</li>
                      <li>• Network Analysis</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Utility Tools</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Load Flow Analysis</li>
                      <li>• Fault Analysis</li>
                      <li>• Asset Management</li>
                      <li>• Compliance Reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Published Services</CardTitle>
                <CardDescription>Web services and API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'GridTopology_MapService', type: 'Map Service', status: 'Running', requests: '1.2M' },
                    { name: 'OutageManagement_FeatureService', type: 'Feature Service', status: 'Running', requests: '856K' },
                    { name: 'AssetInventory_FeatureService', type: 'Feature Service', status: 'Running', requests: '643K' },
                    { name: 'NetworkTrace_GPService', type: 'Geoprocessing Service', status: 'Running', requests: '234K' }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.type}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="mb-1">{service.status}</Badge>
                        <p className="text-sm text-muted-foreground">{service.requests} requests</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portal Administration</CardTitle>
                <CardDescription>User management and system configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Server Health</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Connection</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>License Status</span>
                        <Badge variant="default">Valid</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Token</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Resource Usage</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">CPU Usage</span>
                          <span className="text-sm">34%</span>
                        </div>
                        <Progress value={34} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Memory Usage</span>
                          <span className="text-sm">67%</span>
                        </div>
                        <Progress value={67} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Storage Usage</span>
                          <span className="text-sm">45%</span>
                        </div>
                        <Progress value={45} />
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