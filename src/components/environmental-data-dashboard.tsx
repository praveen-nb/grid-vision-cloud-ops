import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  RefreshCw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EnvironmentalData {
  id: string
  connection_id: string
  data_type: string
  coordinates: any
  metadata: any
  severity_level: string
  description: string
  source: string
  created_at: string
}

interface WeatherMetrics {
  temperature: number
  humidity: number
  windSpeed: number
  rainfall: number
  solarIrradiance: number
  timestamp: string
}

export function EnvironmentalDataDashboard() {
  const { user } = useAuth()
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([])
  const [weatherData, setWeatherData] = useState<WeatherMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [processingData, setProcessingData] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user) {
      fetchEnvironmentalData()
      generateWeatherData()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('environmental_data_changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'environmental_data' },
          (payload) => {
            setEnvironmentalData(prev => [payload.new as EnvironmentalData, ...prev])
            
            // Show notification for critical events
            if ((payload.new as EnvironmentalData).severity_level === 'critical') {
              toast({
                title: "Critical Environmental Event",
                description: (payload.new as EnvironmentalData).description,
                variant: "destructive"
              })
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchEnvironmentalData = async () => {
    try {
      // Get user's connections first
      const { data: connections, error: connError } = await supabase
        .from('grid_connections')
        .select('id')
        .eq('user_id', user?.id)

      if (connError) throw connError

      if (connections && connections.length > 0) {
        const connectionIds = connections.map(c => c.id)
        
        const { data, error } = await supabase
          .from('environmental_data')
          .select('*')
          .in('connection_id', connectionIds)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        setEnvironmentalData(data || [])
      }
    } catch (error) {
      console.error('Error fetching environmental data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch environmental data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateWeatherData = () => {
    // Generate sample weather data for the last 24 hours
    const data: WeatherMetrics[] = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        temperature: 20 + Math.sin(i * 0.5) * 10 + Math.random() * 5,
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        rainfall: Math.random() > 0.8 ? Math.random() * 10 : 0,
        solarIrradiance: Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 800 + Math.random() * 100),
        timestamp: timestamp.toISOString()
      })
    }
    
    setWeatherData(data)
  }

  const processEnvironmentalData = async () => {
    setProcessingData(true)
    try {
      const response = await supabase.functions.invoke('environmental-data-processor', {
        body: {
          action: 'process_recent_data',
          timeframe: '24h'
        }
      })

      if (response.error) throw response.error

      toast({
        title: "Success",
        description: `Processed ${response.data.processed_records} environmental records`
      })

      // Refresh data
      await fetchEnvironmentalData()
    } catch (error) {
      console.error('Error processing environmental data:', error)
      toast({
        title: "Error", 
        description: "Failed to process environmental data",
        variant: "destructive"
      })
    } finally {
      setProcessingData(false)
    }
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'weather':
        return <Cloud className="h-4 w-4" />
      case 'temperature':
        return <Thermometer className="h-4 w-4" />
      case 'humidity':
        return <Droplets className="h-4 w-4" />
      case 'wind':
        return <Wind className="h-4 w-4" />
      case 'solar':
        return <Sun className="h-4 w-4" />
      case 'precipitation':
        return <CloudRain className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const criticalEvents = environmentalData.filter(d => d.severity_level === 'critical')
  const recentEvents = environmentalData.slice(0, 10)
  const dataTypes = [...new Set(environmentalData.map(d => d.data_type))]

  if (loading) {
    return <div className="flex justify-center p-8">Loading environmental data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Environmental Data Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time environmental monitoring and impact analysis
          </p>
        </div>
        
        <Button onClick={processEnvironmentalData} disabled={processingData}>
          <RefreshCw className={`mr-2 h-4 w-4 ${processingData ? 'animate-spin' : ''}`} />
          {processingData ? 'Processing...' : 'Process Data'}
        </Button>
      </div>

      {criticalEvents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalEvents.length} critical environmental event(s) detected that may impact grid operations
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environmentalData.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(environmentalData.map(d => d.source)).size}</div>
            <p className="text-xs text-muted-foreground">
              Active sensors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Types</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Different metrics
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Trends</CardTitle>
                <CardDescription>24-hour temperature variation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: any) => [`${value.toFixed(1)}°C`, 'Temperature']}
                    />
                    <Line type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wind & Humidity</CardTitle>
                <CardDescription>Current atmospheric conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line type="monotone" dataKey="windSpeed" stroke="#82ca9d" name="Wind Speed (km/h)" />
                    <Line type="monotone" dataKey="humidity" stroke="#ffc658" name="Humidity (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weatherData.length > 0 && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {weatherData[weatherData.length - 1]?.temperature.toFixed(1)}°C
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {getTrendIcon(
                        weatherData[weatherData.length - 1]?.temperature,
                        weatherData[weatherData.length - 2]?.temperature
                      )}
                      <span className="ml-1">vs previous hour</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Humidity</CardTitle>
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {weatherData[weatherData.length - 1]?.humidity.toFixed(1)}%
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {getTrendIcon(
                        weatherData[weatherData.length - 1]?.humidity,
                        weatherData[weatherData.length - 2]?.humidity
                      )}
                      <span className="ml-1">vs previous hour</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
                    <Wind className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {weatherData[weatherData.length - 1]?.windSpeed.toFixed(1)} km/h
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {getTrendIcon(
                        weatherData[weatherData.length - 1]?.windSpeed,
                        weatherData[weatherData.length - 2]?.windSpeed
                      )}
                      <span className="ml-1">vs previous hour</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Solar Irradiance</CardTitle>
              <CardDescription>Impact on solar generation capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: any) => [`${value.toFixed(0)} W/m²`, 'Solar Irradiance']}
                  />
                  <Line type="monotone" dataKey="solarIrradiance" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDataTypeIcon(event.data_type)}
                      <div>
                        <CardTitle className="text-lg">{event.data_type.toUpperCase()}</CardTitle>
                        <CardDescription>{event.source}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(event.severity_level)}>
                      {event.severity_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{event.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Lat: {event.coordinates.lat}, Lng: {event.coordinates.lng}
                    </span>
                    <span>
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution by Type</CardTitle>
              <CardDescription>Analysis of environmental events by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataTypes.map((type) => {
                  const typeEvents = environmentalData.filter(d => d.data_type === type)
                  const criticalCount = typeEvents.filter(d => d.severity_level === 'critical').length
                  
                  return (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDataTypeIcon(type)}
                        <div>
                          <p className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                          <p className="text-sm text-muted-foreground">
                            {typeEvents.length} events, {criticalCount} critical
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={criticalCount > 0 ? 'destructive' : 'secondary'}>
                          {((criticalCount / typeEvents.length) * 100).toFixed(0)}% critical
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}