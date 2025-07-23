import { Card, CardContent } from "@/components/ui/card"
import { Zap, AlertTriangle, TrendingUp, Users } from "lucide-react"

interface SystemOverviewCardsProps {
  stats: {
    total_connections: number
    active_alerts: number
    high_risk_predictions: number
    active_field_ops: number
  }
  loading?: boolean
}

export function SystemOverviewCards({ stats, loading }: SystemOverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Grids",
      value: stats.total_connections,
      description: "Connected utility networks",
      icon: Zap,
      iconColor: "text-blue-500"
    },
    {
      title: "Active Alerts",
      value: stats.active_alerts,
      description: "Across all connections",
      icon: AlertTriangle,
      iconColor: stats.active_alerts > 0 ? "text-red-500" : "text-muted-foreground"
    },
    {
      title: "High Risk Assets",
      value: stats.high_risk_predictions,
      description: "Predicted failures >70%",
      icon: TrendingUp,
      iconColor: "text-orange-500"
    },
    {
      title: "Field Operations",
      value: stats.active_field_ops,
      description: "Currently in progress",
      icon: Users,
      iconColor: "text-green-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}