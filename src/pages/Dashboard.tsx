import { RealTimeDashboard } from "@/components/real-time-dashboard"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Real-Time Operations Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Live monitoring of grid operations, AWS infrastructure performance, and security metrics.
          Data refreshes every 30 seconds from field devices and cloud services.
        </p>
      </div>
      
      <RealTimeDashboard />
    </div>
  )
}