import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, MessageSquare, Plus } from "lucide-react"
import { GridSpecificDashboard } from "../grid-specific-dashboard"
import { GISCopilot } from "../gis-copilot"

interface DashboardTabsProps {
  selectedConnection: any
  onCreateConnection: () => void
  onDeleteConnection?: (connectionId: string) => void
  connections?: any[]
}

export function DashboardTabs({ selectedConnection, onCreateConnection, onDeleteConnection, connections }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="grid-dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="grid-dashboard" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Grid Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger value="gis-copilot" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">GIS Copilot</span>
          <span className="sm:hidden">Copilot</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grid-dashboard" className="space-y-6">
        {selectedConnection ? (
          <GridSpecificDashboard 
            connection={selectedConnection} 
            onDeleteConnection={onDeleteConnection}
            connections={connections}
          />
        ) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>No Grid Connection Selected</CardTitle>
              <CardDescription>
                Select a grid connection from the dropdown above or create a new one to view the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={onCreateConnection} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Grid Connection
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="gis-copilot" className="space-y-6">
        <GISCopilot connectionId={selectedConnection?.id} />
      </TabsContent>
    </Tabs>
  )
}