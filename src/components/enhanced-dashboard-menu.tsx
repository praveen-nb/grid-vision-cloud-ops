import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { DashboardHeader } from "./dashboard/DashboardHeader"
import { SystemOverviewCards } from "./dashboard/SystemOverviewCards"
import { DashboardTabs } from "./dashboard/DashboardTabs"
import { QuickActionsPanel } from "./dashboard/QuickActionsPanel"

export function EnhancedDashboardMenu() {
  const { user } = useAuth()
  const [selectedConnection, setSelectedConnection] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    total_connections: 0,
    active_alerts: 0,
    high_risk_predictions: 0,
    active_field_ops: 0
  })

  useEffect(() => {
    if (user) {
      loadConnections()
      loadDashboardStats()
    }
  }, [user])

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_connections')
        .select('*')
        .order('name')

      if (error) throw error

      setConnections(data || [])
      if (data && data.length > 0 && !selectedConnection) {
        setSelectedConnection(data[0])
      }
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load grid connections')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Load aggregate statistics
      const [connectionsResult, alertsResult, predictionsResult, fieldOpsResult] = await Promise.all([
        supabase.from('grid_connections').select('id', { count: 'exact' }),
        supabase.from('grid_alerts').select('id', { count: 'exact' }).eq('resolved', false),
        supabase.from('predictive_analytics').select('id', { count: 'exact' }).gte('probability', 0.7),
        supabase.from('field_operations').select('id', { count: 'exact' }).eq('status', 'in_progress')
      ])

      setDashboardStats({
        total_connections: connectionsResult.count || 0,
        active_alerts: alertsResult.count || 0,
        high_risk_predictions: predictionsResult.count || 0,
        active_field_ops: fieldOpsResult.count || 0
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const createNewConnection = async () => {
    try {
    const newConnection = {
      name: `Grid Connection ${connections.length + 1}`,
      type: 'Distribution',
      location: 'New Location',
      endpoint: 'http://localhost:8080',
      protocol: 'HTTP',
      status: 'disconnected',
      voltage: 12000,
      frequency: 60,
      user_id: user?.id
    }

      const { data, error } = await supabase
        .from('grid_connections')
        .insert([newConnection])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setConnections([...connections, data[0]])
        setSelectedConnection(data[0])
        toast.success('New grid connection created')
        
        // Update stats
        loadDashboardStats()
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('Failed to create grid connection')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SystemOverviewCards stats={dashboardStats} loading={true} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        selectedConnection={selectedConnection}
        connections={connections}
        onConnectionChange={(value) => {
          const connection = connections.find(c => c.id === value)
          setSelectedConnection(connection)
        }}
        onCreateConnection={createNewConnection}
      />

      <SystemOverviewCards stats={dashboardStats} loading={loading} />

      <DashboardTabs 
        selectedConnection={selectedConnection} 
        onCreateConnection={createNewConnection}
      />

      {selectedConnection && (
        <QuickActionsPanel connection={selectedConnection} />
      )}
    </div>
  )
}