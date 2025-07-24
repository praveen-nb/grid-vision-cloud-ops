import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { DashboardHeader } from "./dashboard/DashboardHeader"
import { SystemOverviewCards } from "./dashboard/SystemOverviewCards"
import { DashboardTabs } from "./dashboard/DashboardTabs"
import { QuickActionsPanel } from "./dashboard/QuickActionsPanel"
import { LoadingSkeleton } from "./ui/loading-skeleton"
import { ErrorState } from "./ui/error-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function EnhancedDashboardMenu() {
  const { user } = useAuth()
  const [selectedConnection, setSelectedConnection] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardStats, setDashboardStats] = useState({
    total_connections: 0,
    active_alerts: 0,
    high_risk_predictions: 0,
    active_field_ops: 0
  })
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [newGridName, setNewGridName] = useState("")

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([loadConnections(), loadDashboardStats()])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadConnections = async () => {
    const { data, error } = await supabase
      .from('grid_connections')
      .select('*')
      .order('name')

    if (error) throw error

    setConnections(data || [])
    if (data && data.length > 0 && !selectedConnection) {
      setSelectedConnection(data[0])
    }
  }

  const loadDashboardStats = async () => {
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
  }

  const createNewConnection = async (gridName?: string) => {
    if (!gridName && !showNameDialog) {
      setShowNameDialog(true)
      return
    }

    const finalName = gridName || newGridName || `Grid Connection ${connections.length + 1}`
    
    try {
      const newConnection = {
        name: finalName,
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
        toast.success(`Grid "${finalName}" created successfully`)
        
        // Update stats
        loadDashboardStats()
        
        // Reset dialog state
        setShowNameDialog(false)
        setNewGridName("")
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('Failed to create grid connection')
    }
  }

  const handleCreateWithName = () => {
    if (!newGridName.trim()) {
      toast.error('Please enter a grid name')
      return
    }
    createNewConnection(newGridName.trim())
  }

  const deleteConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('grid_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user?.id)

      if (error) throw error

      setConnections(prev => prev.filter(conn => conn.id !== connectionId))
      
      // If deleted connection was selected, select first remaining or null
      if (selectedConnection?.id === connectionId) {
        const remaining = connections.filter(conn => conn.id !== connectionId)
        setSelectedConnection(remaining.length > 0 ? remaining[0] : null)
      }
      
      toast.success('Grid connection deleted')
      loadDashboardStats()
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast.error('Failed to delete grid connection')
    }
  }

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />
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
        onCreateConnection={() => createNewConnection()}
        onDeleteConnection={deleteConnection}
      />

      <SystemOverviewCards stats={dashboardStats} loading={loading} />

      <DashboardTabs 
        selectedConnection={selectedConnection} 
        onCreateConnection={() => createNewConnection()}
        onDeleteConnection={deleteConnection}
        connections={connections}
      />

      {selectedConnection && (
        <QuickActionsPanel connection={selectedConnection} />
      )}

      {/* Grid Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Grid Connection</DialogTitle>
            <DialogDescription>
              Enter a name for your new grid connection. You can configure the details later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grid-name">Grid Name</Label>
              <Input
                id="grid-name"
                placeholder="e.g., Pacific Northwest Grid, Main Distribution Network"
                value={newGridName}
                onChange={(e) => setNewGridName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateWithName()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowNameDialog(false)
                setNewGridName("")
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateWithName}
              disabled={!newGridName.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Grid
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}