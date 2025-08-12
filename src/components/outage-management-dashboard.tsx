import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Power, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  Truck,
  Phone,
  CheckCircle,
  XCircle,
  Timer,
  Zap,
  Settings,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export const OutageManagementDashboard = () => {
  const [selectedOutage, setSelectedOutage] = useState(null);
  const [outageFilter, setOutageFilter] = useState('all');

  const outages = [
    {
      id: 'OUT-2024-001',
      location: 'Downtown District',
      customersAffected: 2847,
      cause: 'Equipment Failure',
      priority: 'High',
      status: 'In Progress',
      estimatedRestoration: '2024-01-12 16:30',
      crewsAssigned: 3,
      startTime: '2024-01-12 14:15',
      duration: '2h 15m',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 'OUT-2024-002',
      location: 'Industrial Park East',
      customersAffected: 156,
      cause: 'Planned Maintenance',
      priority: 'Low',
      status: 'Scheduled',
      estimatedRestoration: '2024-01-12 18:00',
      crewsAssigned: 1,
      startTime: '2024-01-12 16:00',
      duration: '2h 0m',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 'OUT-2024-003',
      location: 'Residential North',
      customersAffected: 4521,
      cause: 'Storm Damage',
      priority: 'Critical',
      status: 'Investigating',
      estimatedRestoration: '2024-01-12 20:00',
      crewsAssigned: 5,
      startTime: '2024-01-12 13:45',
      duration: '2h 45m',
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    {
      id: 'OUT-2024-004',
      location: 'Commercial Center',
      customersAffected: 892,
      cause: 'Third Party Damage',
      priority: 'Medium',
      status: 'Restored',
      estimatedRestoration: '2024-01-12 15:30',
      crewsAssigned: 2,
      startTime: '2024-01-12 12:30',
      duration: '3h 0m',
      coordinates: { lat: 40.7505, lng: -73.9934 }
    }
  ];

  const crews = [
    { id: 'CREW-001', name: 'Team Alpha', status: 'On Site', location: 'Downtown District', eta: '15 min', skills: ['Transmission', 'Emergency'] },
    { id: 'CREW-002', name: 'Team Beta', status: 'En Route', location: 'Residential North', eta: '8 min', skills: ['Distribution', 'Storm'] },
    { id: 'CREW-003', name: 'Team Gamma', status: 'Available', location: 'Main Depot', eta: 'On Standby', skills: ['Substation', 'Maintenance'] },
    { id: 'CREW-004', name: 'Team Delta', status: 'On Site', location: 'Industrial Park', eta: '45 min', skills: ['Underground', 'Emergency'] },
    { id: 'CREW-005', name: 'Team Echo', status: 'Returning', location: 'Commercial Center', eta: '20 min', skills: ['Overhead', 'Repair'] }
  ];

  const metrics = [
    { label: 'Active Outages', value: 3, change: '-2', icon: Power, color: 'text-red-600' },
    { label: 'Customers Affected', value: '7,524', change: '-1,200', icon: Users, color: 'text-orange-600' },
    { label: 'Avg Restoration Time', value: '2.5 hrs', change: '-0.3 hrs', icon: Clock, color: 'text-blue-600' },
    { label: 'Crews Deployed', value: 8, change: '+2', icon: Truck, color: 'text-green-600' }
  ];

  const customerCalls = [
    { time: '14:35', caller: '(555) 0123', location: 'Downtown District', status: 'Outage Confirmed' },
    { time: '14:32', caller: '(555) 0156', location: 'Residential North', status: 'Outage Confirmed' },
    { time: '14:28', caller: '(555) 0189', location: 'Downtown District', status: 'Duplicate Report' },
    { time: '14:25', caller: '(555) 0234', location: 'Commercial Center', status: 'Service Inquiry' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Power className="text-primary" />
              Outage Management System
            </h1>
            <p className="text-muted-foreground">Real-time outage tracking & restoration management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                    <IconComponent className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-green-600">{metric.change} from last hour</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="outages" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="outages">Active Outages</TabsTrigger>
            <TabsTrigger value="crews">Field Crews</TabsTrigger>
            <TabsTrigger value="customers">Customer Calls</TabsTrigger>
            <TabsTrigger value="restoration">Restoration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="outages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Outage Events</CardTitle>
                <CardDescription>Real-time outage tracking and management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <select 
                    value={outageFilter} 
                    onChange={(e) => setOutageFilter(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="all">All Outages</option>
                    <option value="critical">Critical Priority</option>
                    <option value="inprogress">In Progress</option>
                    <option value="investigating">Investigating</option>
                  </select>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search by location or outage ID..." 
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="space-y-4">
                  {outages.map((outage) => (
                    <div key={outage.id} 
                         className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                           selectedOutage === outage.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                         }`}
                         onClick={() => setSelectedOutage(outage.id)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{outage.id}</span>
                          <Badge variant={
                            outage.priority === 'Critical' ? 'destructive' :
                            outage.priority === 'High' ? 'default' :
                            outage.priority === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {outage.priority}
                          </Badge>
                          <Badge variant={
                            outage.status === 'Restored' ? 'default' : 
                            outage.status === 'In Progress' ? 'secondary' : 'outline'
                          }>
                            {outage.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">Duration: {outage.duration}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <div className="font-medium">{outage.location}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Customers:</span>
                          <div className="font-medium">{outage.customersAffected.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Cause:</span>
                          <div className="font-medium">{outage.cause}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">ETR:</span>
                          <div className="font-medium">{outage.estimatedRestoration}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            <Truck className="inline h-4 w-4 mr-1" />
                            {outage.crewsAssigned} crew{outage.crewsAssigned !== 1 ? 's' : ''} assigned
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            View Map
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Update Customers
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crews" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Field Crew Status</CardTitle>
                  <CardDescription>Real-time crew location and availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crews.map((crew) => (
                      <div key={crew.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{crew.name}</span>
                            <Badge variant={
                              crew.status === 'On Site' ? 'default' :
                              crew.status === 'En Route' ? 'secondary' :
                              crew.status === 'Available' ? 'outline' : 'destructive'
                            }>
                              {crew.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">ETA: {crew.eta}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          {crew.location}
                        </div>
                        <div className="flex gap-1">
                          {crew.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crew Dispatch</CardTitle>
                  <CardDescription>Dispatch crews to outage locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">3</div>
                        <div className="text-sm text-muted-foreground">Available Crews</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">5</div>
                        <div className="text-sm text-muted-foreground">Deployed Crews</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Quick Dispatch</h4>
                      <div className="space-y-2">
                        <select className="w-full p-2 border rounded-md">
                          <option>Select Available Crew</option>
                          <option>Team Gamma (Main Depot)</option>
                          <option>Team Echo (Returning)</option>
                        </select>
                        <select className="w-full p-2 border rounded-md">
                          <option>Select Outage Location</option>
                          <option>Downtown District (OUT-2024-001)</option>
                          <option>Residential North (OUT-2024-003)</option>
                        </select>
                        <Button className="w-full">
                          <Truck className="h-4 w-4 mr-2" />
                          Dispatch Crew
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <Timer className="h-4 w-4" />
                      <AlertDescription>
                        Average dispatch time: 12 minutes. Target: &lt;15 minutes.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Customer Calls</CardTitle>
                  <CardDescription>Incoming outage reports and service requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerCalls.map((call, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{call.caller}</span>
                          <span className="text-sm text-muted-foreground">{call.time}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{call.location}</div>
                        <Badge variant={
                          call.status === 'Outage Confirmed' ? 'default' :
                          call.status === 'Duplicate Report' ? 'secondary' : 'outline'
                        }>
                          {call.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Communication</CardTitle>
                  <CardDescription>Automated notifications and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">2,847</div>
                        <div className="text-xs text-muted-foreground">Notified</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">1,203</div>
                        <div className="text-xs text-muted-foreground">SMS Sent</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">567</div>
                        <div className="text-xs text-muted-foreground">Email Sent</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Send Update</h4>
                      <select className="w-full p-2 border rounded-md">
                        <option>Select Outage</option>
                        <option>Downtown District (OUT-2024-001)</option>
                        <option>Residential North (OUT-2024-003)</option>
                      </select>
                      <textarea 
                        className="w-full p-2 border rounded-md" 
                        rows={3}
                        placeholder="Update message..."
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          SMS
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="restoration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Restoration Progress</CardTitle>
                <CardDescription>Track restoration activities and estimated completion times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {outages.filter(o => o.status !== 'Restored').map((outage) => (
                    <div key={outage.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{outage.location}</h4>
                          <p className="text-sm text-muted-foreground">{outage.id}</p>
                        </div>
                        <Badge variant={
                          outage.priority === 'Critical' ? 'destructive' :
                          outage.priority === 'High' ? 'default' : 'secondary'
                        }>
                          {outage.priority} Priority
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{outage.customersAffected.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Customers Out</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{outage.crewsAssigned}</div>
                          <div className="text-sm text-muted-foreground">Crews Working</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{outage.estimatedRestoration.split(' ')[1]}</div>
                          <div className="text-sm text-muted-foreground">Est. Restoration</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Restoration Progress</span>
                          <span>
                            {outage.status === 'In Progress' ? '65%' : 
                             outage.status === 'Investigating' ? '25%' : '0%'}
                          </span>
                        </div>
                        <Progress value={
                          outage.status === 'In Progress' ? 65 : 
                          outage.status === 'Investigating' ? 25 : 0
                        } />
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Restored
                        </Button>
                        <Button variant="outline" size="sm">
                          Update ETR
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Outage Statistics</CardTitle>
                  <CardDescription>Key performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">SAIDI (System Average Interruption Duration)</span>
                        <span className="text-sm">85 min</span>
                      </div>
                      <Progress value={70} />
                      <div className="text-xs text-muted-foreground mt-1">Target: &lt;90 min</div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">SAIFI (System Average Interruption Frequency)</span>
                        <span className="text-sm">1.2</span>
                      </div>
                      <Progress value={80} />
                      <div className="text-xs text-muted-foreground mt-1">Target: &lt;1.5</div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Customer Satisfaction</span>
                        <span className="text-sm">94%</span>
                      </div>
                      <Progress value={94} />
                      <div className="text-xs text-muted-foreground mt-1">Target: &gt;90%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restoration Performance</CardTitle>
                  <CardDescription>Crew efficiency and response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">12 min</div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">2.3 hrs</div>
                        <div className="text-sm text-muted-foreground">Avg Restoration</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">96%</div>
                        <div className="text-sm text-muted-foreground">ETR Accuracy</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="text-lg font-bold">8.7</div>
                        <div className="text-sm text-muted-foreground">Crew Efficiency</div>
                      </div>
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