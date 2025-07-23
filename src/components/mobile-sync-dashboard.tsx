import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Cloud,
  MapPin,
  Camera,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  HardDrive
} from "lucide-react"

interface SyncStatus {
  lastSync: string
  pendingUploads: number
  pendingDownloads: number
  totalDataSize: number
  syncProgress: number
  isOnline: boolean
  conflicts: any[]
}

interface OfflineData {
  operations: any[]
  measurements: any[]
  photos: any[]
  notes: any[]
  lastModified: string
}

export function MobileSyncDashboard() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: '',
    pendingUploads: 0,
    pendingDownloads: 0,
    totalDataSize: 0,
    syncProgress: 0,
    isOnline: navigator.onLine,
    conflicts: []
  })
  const [offlineData, setOfflineData] = useState<OfflineData>({
    operations: [],
    measurements: [],
    photos: [],
    notes: [],
    lastModified: ''
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSyncStatus()
      loadOfflineData()
      
      // Monitor network status
      const updateOnlineStatus = () => {
        setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }))
      }
      
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      
      // Auto-sync when coming back online
      if (navigator.onLine) {
        autoSync()
      }
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
      }
    }
  }, [user])

  const fetchSyncStatus = async () => {
    try {
      // Simulate fetching sync status from local storage or cache
      const cachedStatus = localStorage.getItem('sync_status')
      if (cachedStatus) {
        setSyncStatus(prev => ({ ...prev, ...JSON.parse(cachedStatus) }))
      }
      
      // Get pending data counts
      const pendingOperations = JSON.parse(localStorage.getItem('pending_operations') || '[]')
      const pendingPhotos = JSON.parse(localStorage.getItem('pending_photos') || '[]')
      const pendingMeasurements = JSON.parse(localStorage.getItem('pending_measurements') || '[]')
      
      setSyncStatus(prev => ({
        ...prev,
        pendingUploads: pendingOperations.length + pendingPhotos.length + pendingMeasurements.length,
        lastSync: localStorage.getItem('last_sync') || 'Never'
      }))
    } catch (error) {
      console.error('Error fetching sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOfflineData = () => {
    try {
      const operations = JSON.parse(localStorage.getItem('offline_operations') || '[]')
      const measurements = JSON.parse(localStorage.getItem('offline_measurements') || '[]')
      const photos = JSON.parse(localStorage.getItem('offline_photos') || '[]')
      const notes = JSON.parse(localStorage.getItem('offline_notes') || '[]')
      
      setOfflineData({
        operations,
        measurements,
        photos,
        notes,
        lastModified: localStorage.getItem('offline_data_modified') || new Date().toISOString()
      })
    } catch (error) {
      console.error('Error loading offline data:', error)
    }
  }

  const performManualSync = async () => {
    setSyncing(true)
    try {
      const response = await supabase.functions.invoke('mobile-field-sync', {
        body: {
          action: 'full_sync',
          user_id: user?.id,
          offline_data: offlineData
        }
      })

      if (response.error) throw response.error

      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        pendingUploads: 0,
        syncProgress: 100
      }))

      // Clear offline pending data
      localStorage.removeItem('pending_operations')
      localStorage.removeItem('pending_photos')
      localStorage.removeItem('pending_measurements')
      localStorage.setItem('last_sync', new Date().toISOString())

      toast({
        title: "Sync Complete",
        description: `Synchronized ${response.data.synced_operations} operations and ${response.data.synced_photos} photos`
      })
    } catch (error) {
      console.error('Error during sync:', error)
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data. Will retry automatically.",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const autoSync = async () => {
    if (!navigator.onLine || syncing) return
    
    try {
      // Only auto-sync if there's pending data
      if (syncStatus.pendingUploads > 0) {
        await performManualSync()
      }
    } catch (error) {
      console.error('Auto-sync failed:', error)
    }
  }

  const downloadOfflineData = async () => {
    setSyncing(true)
    try {
      const response = await supabase.functions.invoke('mobile-field-sync', {
        body: {
          action: 'download_offline_data',
          user_id: user?.id
        }
      })

      if (response.error) throw response.error

      // Store data for offline use
      localStorage.setItem('offline_operations', JSON.stringify(response.data.operations))
      localStorage.setItem('offline_measurements', JSON.stringify(response.data.measurements))
      localStorage.setItem('offline_data_modified', new Date().toISOString())

      loadOfflineData()

      toast({
        title: "Download Complete",
        description: `Downloaded ${response.data.operations.length} operations for offline use`
      })
    } catch (error) {
      console.error('Error downloading offline data:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download offline data",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const clearOfflineData = () => {
    localStorage.removeItem('offline_operations')
    localStorage.removeItem('offline_measurements')
    localStorage.removeItem('offline_photos')
    localStorage.removeItem('offline_notes')
    localStorage.removeItem('pending_operations')
    localStorage.removeItem('pending_photos')
    localStorage.removeItem('pending_measurements')
    
    setOfflineData({
      operations: [],
      measurements: [],
      photos: [],
      notes: [],
      lastModified: ''
    })

    setSyncStatus(prev => ({ ...prev, pendingUploads: 0 }))

    toast({
      title: "Success",
      description: "Offline data cleared"
    })
  }

  const getDataSizeFormatted = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStorageUsage = () => {
    const totalOperations = offlineData.operations.length
    const totalPhotos = offlineData.photos.length
    const totalMeasurements = offlineData.measurements.length
    
    // Estimate storage size (rough calculation)
    const estimatedSize = (totalOperations * 1024) + (totalPhotos * 50 * 1024) + (totalMeasurements * 512)
    return estimatedSize
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading sync status...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mobile Data Sync</h2>
          <p className="text-muted-foreground">
            Manage offline data synchronization for field operations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {syncStatus.isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Offline</span>
            </>
          )}
        </div>
      </div>

      {!syncStatus.isOnline && syncStatus.pendingUploads > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {syncStatus.pendingUploads} pending uploads. Data will sync automatically when you're back online.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {syncStatus.lastSync === 'Never' ? 'Never' : 
                new Date(syncStatus.lastSync).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStatus.isOnline ? 'Connected' : 'Working offline'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{syncStatus.pendingUploads}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Data</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineData.operations.length}</div>
            <p className="text-xs text-muted-foreground">
              Operations stored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDataSizeFormatted(getStorageUsage())}</div>
            <p className="text-xs text-muted-foreground">
              Local storage
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sync Actions</CardTitle>
            <CardDescription>Manual synchronization controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={performManualSync} 
              disabled={!syncStatus.isOnline || syncing}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Manual Sync'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadOfflineData}
              disabled={!syncStatus.isOnline || syncing}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download for Offline
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearOfflineData}
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Clear Offline Data
            </Button>
            
            {syncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sync Progress</span>
                  <span>{syncStatus.syncProgress}%</span>
                </div>
                <Progress value={syncStatus.syncProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offline Data Summary</CardTitle>
            <CardDescription>Data available for offline work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Operations</span>
                </div>
                <Badge variant="secondary">{offlineData.operations.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Photos</span>
                </div>
                <Badge variant="secondary">{offlineData.photos.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm">Measurements</span>
                </div>
                <Badge variant="secondary">{offlineData.measurements.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Notes</span>
                </div>
                <Badge variant="secondary">{offlineData.notes.length}</Badge>
              </div>
            </div>
            
            {offlineData.lastModified && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Last modified: {new Date(offlineData.lastModified).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {syncStatus.conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Sync Conflicts
            </CardTitle>
            <CardDescription>
              Data conflicts that need manual resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncStatus.conflicts.map((conflict, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{conflict.type}</p>
                    <p className="text-sm text-muted-foreground">{conflict.description}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mobile App Features</CardTitle>
          <CardDescription>Available functionality for field technicians</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Offline Capabilities</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">View assigned operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Capture photos and measurements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Record field notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Update operation status</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Online Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Real-time sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Live grid monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Instant notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Team communication</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}