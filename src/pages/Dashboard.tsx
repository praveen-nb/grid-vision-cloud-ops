import { RealTimeDashboard } from "@/components/real-time-dashboard"
import { GridConnectionPanel } from "@/components/grid-connection-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Download, Monitor } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Grid Vision Operations Center</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Real-time monitoring and control center for electrical utility grid operations. 
          Connect any utility grid and monitor performance with AWS-powered analytics.
        </p>
        
        {/* Mobile App Promotion */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Smartphone className="h-3 w-3" />
            Available on Mobile
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3 w-3" />
              iOS App
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3 w-3" />
              Android App
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Real-Time Monitoring
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Grid Connections
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="monitoring" className="space-y-6">
          <RealTimeDashboard />
        </TabsContent>
        
        <TabsContent value="connections" className="space-y-6">
          <GridConnectionPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}