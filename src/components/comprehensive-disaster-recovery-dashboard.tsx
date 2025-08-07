import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Clock, 
  Server, 
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  RotateCcw,
  Eye,
  Settings,
  Cloud,
  MapPin,
  Zap,
  HardDrive,
  Network,
  AlertCircle,
  TrendingUp,
  Bell,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface DRStatus {
  site: string;
  region: string;
  status: 'active' | 'standby' | 'failed';
  rto: string;
  rpo: string;
  lastTested: string;
  uptime: number;
  services: string[];
}

interface BackupMetrics {
  type: string;
  frequency: string;
  lastBackup: string;
  size: string;
  status: 'success' | 'running' | 'failed';
  retention: string;
}

interface DRTest {
  id: string;
  scenario: string;
  date: string;
  duration: string;
  status: 'passed' | 'failed' | 'partial';
  rtoAchieved: string;
  rpoAchieved: string;
}

export function ComprehensiveDisasterRecoveryDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [drSites, setDrSites] = useState<DRStatus[]>([
    {
      site: "Primary (Production)",
      region: "us-east-1",
      status: 'active',
      rto: "< 15min",
      rpo: "< 1min",
      lastTested: "2024-01-15",
      uptime: 99.99,
      services: ["SCADA", "GIS", "Analytics", "Portal"]
    },
    {
      site: "Secondary (Warm)",
      region: "us-west-2", 
      status: 'standby',
      rto: "< 30min",
      rpo: "< 5min",
      lastTested: "2024-01-10",
      uptime: 99.95,
      services: ["SCADA", "GIS", "Analytics"]
    },
    {
      site: "Tertiary (Cold)",
      region: "Azure Central US",
      status: 'standby',
      rto: "< 4hrs",
      rpo: "< 1hr",
      lastTested: "2024-01-08",
      uptime: 99.9,
      services: ["Backup Storage", "VM Images"]
    }
  ]);

  const [backupMetrics, setBackupMetrics] = useState<BackupMetrics[]>([
    {
      type: "RDS Transaction Logs",
      frequency: "Continuous",
      lastBackup: "2 minutes ago",
      size: "2.3 GB",
      status: 'success',
      retention: "7 days"
    },
    {
      type: "Application Data",
      frequency: "Hourly",
      lastBackup: "23 minutes ago",
      size: "15.7 GB", 
      status: 'success',
      retention: "30 days"
    },
    {
      type: "Full System Backup",
      frequency: "Daily",
      lastBackup: "3 hours ago",
      size: "127.4 GB",
      status: 'success',
      retention: "90 days"
    },
    {
      type: "Cross-Cloud Archive",
      frequency: "Weekly",
      lastBackup: "2 days ago",
      size: "1.2 TB",
      status: 'success',
      retention: "1 year"
    }
  ]);

  const [recentTests, setRecentTests] = useState<DRTest[]>([
    {
      id: "test-001",
      scenario: "AZ Failure Simulation",
      date: "2024-01-15",
      duration: "12 minutes",
      status: 'passed',
      rtoAchieved: "8 minutes",
      rpoAchieved: "30 seconds"
    },
    {
      id: "test-002", 
      scenario: "Regional Failover",
      date: "2024-01-10",
      duration: "45 minutes",
      status: 'passed',
      rtoAchieved: "28 minutes",
      rpoAchieved: "3 minutes"
    },
    {
      id: "test-003",
      scenario: "Database Recovery",
      date: "2024-01-05",
      duration: "35 minutes", 
      status: 'partial',
      rtoAchieved: "32 minutes",
      rpoAchieved: "8 minutes"
    }
  ]);

  const executeDRTest = async () => {
    setIsTestRunning(true);
    toast({
      title: "DR Test Initiated",
      description: "Starting automated disaster recovery test simulation"
    });

    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newTest: DRTest = {
        id: `test-${Date.now()}`,
        scenario: "Automated Test",
        date: new Date().toISOString().split('T')[0],
        duration: "8 minutes",
        status: 'passed',
        rtoAchieved: "6 minutes",
        rpoAchieved: "45 seconds"
      };

      setRecentTests(prev => [newTest, ...prev.slice(0, 4)]);
      
      toast({
        title: "DR Test Completed",
        description: "Test passed successfully. RTO and RPO targets met."
      });
    } catch (error) {
      toast({
        title: "DR Test Failed",
        description: "Test encountered issues. Check logs for details.",
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'standby': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateOverallHealth = () => {
    const activeSites = drSites.filter(site => site.status === 'active').length;
    const totalSites = drSites.length;
    const successfulBackups = backupMetrics.filter(backup => backup.status === 'success').length;
    const totalBackups = backupMetrics.length;
    
    return Math.round(((activeSites + successfulBackups) / (totalSites + totalBackups)) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Disaster Recovery Control Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and management of disaster recovery infrastructure
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="default" className="bg-green-500 text-white">
            {calculateOverallHealth()}% Operational
          </Badge>
          <Button 
            onClick={executeDRTest} 
            disabled={isTestRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isTestRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isTestRunning ? 'Testing...' : 'Execute DR Test'}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Next Scheduled Test:</strong> February 15, 2024 at 2:00 AM EST. 
          NERC CIP-009 quarterly compliance test for all critical systems.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sites">DR Sites</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{calculateOverallHealth()}%</div>
                <Progress value={calculateOverallHealth()} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">RTO Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">98.5%</div>
                <Progress value={98.5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Within target thresholds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Backup Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <Progress value={100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Test Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">96.8%</div>
                <Progress value={96.8} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent DR Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Hourly backup completed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Health check passed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">5 min ago</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cross-region sync completed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">15 min ago</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average RTO Achievement</span>
                    <span className="font-medium">87% under target</span>
                  </div>
                  <Progress value={87} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average RPO Achievement</span>
                    <span className="font-medium">92% under target</span>
                  </div>
                  <Progress value={92} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Site Availability</span>
                    <span className="font-medium">99.97%</span>
                  </div>
                  <Progress value={99.97} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DR Sites Tab */}
        <TabsContent value="sites" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {drSites.map((site, index) => (
              <Card key={index} className={`border-l-4 ${
                site.status === 'active' ? 'border-l-green-500' : 
                site.status === 'standby' ? 'border-l-yellow-500' : 
                'border-l-red-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{site.site}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {site.region}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(site.status)}
                      <Badge variant={site.status === 'active' ? "default" : "secondary"}>
                        {site.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-accent/10 rounded">
                      <div className="text-lg font-bold text-primary">{site.rto}</div>
                      <div className="text-xs text-muted-foreground">RTO Target</div>
                    </div>
                    <div className="text-center p-2 bg-accent/10 rounded">
                      <div className="text-lg font-bold text-blue-600">{site.rpo}</div>
                      <div className="text-xs text-muted-foreground">RPO Target</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-medium">{site.uptime}%</span>
                    </div>
                    <Progress value={site.uptime} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {site.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last tested: {site.lastTested}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {backupMetrics.map((backup, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{backup.type}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <Badge variant={backup.status === 'success' ? "default" : "secondary"}>
                        {backup.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>Frequency: {backup.frequency}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-accent/10 rounded">
                      <div className="text-lg font-bold">{backup.size}</div>
                      <div className="text-xs text-muted-foreground">Size</div>
                    </div>
                    <div className="text-center p-2 bg-accent/10 rounded">
                      <div className="text-lg font-bold">{backup.retention}</div>
                      <div className="text-xs text-muted-foreground">Retention</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last backup:</span>
                    <span className="ml-1 font-medium">{backup.lastBackup}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Recent DR Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.scenario}</div>
                        <div className="text-sm text-muted-foreground">
                          {test.date} • Duration: {test.duration}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-muted-foreground">RTO:</span> {test.rtoAchieved}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">RPO:</span> {test.rpoAchieved}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">RTO Threshold Breach</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Backup Failure</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Site Health Check Failure</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Cross-Region Sync Issues</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Primary VPC Connectivity</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Cross-Region Peering</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Azure ExpressRoute</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">DNS Health Checks</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}