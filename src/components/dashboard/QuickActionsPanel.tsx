import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, MapPin, Shield, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface QuickActionsPanelProps {
  connection: any
}

export function QuickActionsPanel({ connection }: QuickActionsPanelProps) {
  const handleAction = (actionName: string) => {
    toast.info(`${actionName} initiated for ${connection.name}`)
  }

  const actions = [
    {
      icon: TrendingUp,
      title: "Run Predictive Analysis",
      action: () => handleAction("Predictive Analysis")
    },
    {
      icon: MapPin,
      title: "Process Environmental Data",
      action: () => handleAction("Environmental Data Processing")
    },
    {
      icon: Shield,
      title: "Security Scan",
      action: () => handleAction("Security Scan")
    },
    {
      icon: Smartphone,
      title: "Sync Mobile Data",
      action: () => handleAction("Mobile Data Sync")
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions for {connection.name}</CardTitle>
        <CardDescription>
          Common operations and management tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button 
              key={action.title}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
              onClick={action.action}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-center text-sm">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}