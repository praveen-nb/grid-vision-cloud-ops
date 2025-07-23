import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  Activity, 
  Brain, 
  AlertTriangle, 
  Database,
  RefreshCw,
  TrendingUp,
  Shield,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSystemControl } from '@/hooks/useSystemControl';

export function SystemControlPanel() {
  const {
    systemStatus,
    loading,
    startSystem,
    stopSystem,
    runDataSimulation,
    runAIAnalytics,
    runAlertManagement
  } = useSystemControl();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Control Panel</h2>
          <p className="text-muted-foreground">Manage real-time monitoring systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={systemStatus.isRunning ? "default" : "secondary"}>
            {systemStatus.isRunning ? "Running" : "Stopped"}
          </Badge>
          {systemStatus.isRunning ? (
            <Button variant="outline" onClick={stopSystem} disabled={loading}>
              <Square className="h-4 w-4 mr-2" />
              Stop System
            </Button>
          ) : (
            <Button onClick={startSystem} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Starting..." : "Start System"}
            </Button>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Connections</span>
            </div>
            <div className="text-2xl font-bold">{systemStatus.stats.totalConnections}</div>
            <div className="text-sm text-muted-foreground">Active substations</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="font-medium">Metrics</span>
            </div>
            <div className="text-2xl font-bold">{systemStatus.stats.metricsGenerated}</div>
            <div className="text-sm text-muted-foreground">Data points generated</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Alerts</span>
            </div>
            <div className="text-2xl font-bold">{systemStatus.stats.alertsGenerated}</div>
            <div className="text-sm text-muted-foreground">Generated alerts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="font-medium">AI Insights</span>
            </div>
            <div className="text-2xl font-bold">{systemStatus.stats.aiPredictions}</div>
            <div className="text-sm text-muted-foreground">Predictions made</div>
          </CardContent>
        </Card>
      </div>

      {/* Individual System Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Data Simulation
            </CardTitle>
            <CardDescription>
              Generate realistic substation metrics and sensor data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Metrics Generated:</span>
                <Badge variant="outline">{systemStatus.stats.metricsGenerated}</Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={runDataSimulation}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Run Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Analytics
            </CardTitle>
            <CardDescription>
              Process predictive analytics and anomaly detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Predictions:</span>
                  <Badge variant="outline">{systemStatus.stats.aiPredictions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Anomalies:</span>
                  <Badge variant="destructive">{systemStatus.stats.anomaliesDetected}</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={runAIAnalytics}
                disabled={loading}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Run AI Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Alert Management
            </CardTitle>
            <CardDescription>
              Intelligent alert generation and management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Generated:</span>
                  <Badge variant="outline">{systemStatus.stats.alertsGenerated}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Resolved:</span>
                  <Badge variant="default">{systemStatus.stats.alertsResolved}</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={runAlertManagement}
                disabled={loading}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Process Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            System Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.lastRun && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Last Run</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(systemStatus.lastRun).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            {systemStatus.nextRun && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Next Scheduled Run</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(systemStatus.nextRun).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {!systemStatus.lastRun && !systemStatus.nextRun && (
              <div className="text-center text-muted-foreground py-4">
                No system activity yet. Click "Start System" to begin monitoring.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}