import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus } from "lucide-react"

interface DashboardHeaderProps {
  selectedConnection: any
  connections: any[]
  onConnectionChange: (connectionId: string) => void
  onCreateConnection: () => void
}

export function DashboardHeader({ 
  selectedConnection, 
  connections, 
  onConnectionChange, 
  onCreateConnection 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Grid Vision Operations Center</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Comprehensive utility grid management and monitoring platform
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full lg:w-auto">
        <Select
          value={selectedConnection?.id || ""}
          onValueChange={onConnectionChange}
        >
          <SelectTrigger className="w-full sm:w-64 lg:w-72">
            <SelectValue placeholder="Select a grid connection" />
          </SelectTrigger>
          <SelectContent>
            {connections.map((connection) => (
              <SelectItem key={connection.id} value={connection.id}>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>{connection.name}</span>
                  <Badge variant={connection.status === 'connected' ? 'default' : 'secondary'}>
                    {connection.status}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button onClick={onCreateConnection} variant="outline" className="w-full sm:w-auto whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Add Grid
        </Button>
      </div>
    </div>
  )
}