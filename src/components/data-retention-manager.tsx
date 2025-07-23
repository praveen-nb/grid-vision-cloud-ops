import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Calendar, Archive, Trash2, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface RetentionPolicy {
  id: string;
  dataType: string;
  category: string;
  retentionPeriod: number; // in years
  retentionUnit: 'days' | 'months' | 'years';
  complianceRequirement: string;
  status: 'active' | 'inactive' | 'pending';
  autoDelete: boolean;
  lastReview: string;
  nextReview: string;
  dataVolume: string;
  estimatedCost: number;
}

interface DataCategory {
  name: string;
  totalSize: string;
  recordCount: number;
  oldestRecord: string;
  newestRecord: string;
  complianceRequired: boolean;
  retentionPolicies: number;
}

interface RetentionAction {
  id: string;
  type: 'archive' | 'delete' | 'review';
  dataType: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'failed';
  affectedRecords: number;
  estimatedSize: string;
}

export function DataRetentionManager() {
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [upcomingActions, setUpcomingActions] = useState<RetentionAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRetentionData = async () => {
      setLoading(true);
      
      // Mock retention policies
      const mockPolicies: RetentionPolicy[] = [
        {
          id: "RP-001",
          dataType: "Authentication Logs",
          category: "Security",
          retentionPeriod: 3,
          retentionUnit: 'years',
          complianceRequirement: "NERC CIP-004",
          status: 'active',
          autoDelete: true,
          lastReview: "2024-01-15",
          nextReview: "2024-07-15",
          dataVolume: "125 GB",
          estimatedCost: 1250
        },
        {
          id: "RP-002",
          dataType: "System Events",
          category: "Operations",
          retentionPeriod: 7,
          retentionUnit: 'years',
          complianceRequirement: "NERC CIP-007",
          status: 'active',
          autoDelete: false,
          lastReview: "2024-01-10",
          nextReview: "2024-07-10",
          dataVolume: "2.5 TB",
          estimatedCost: 5000
        },
        {
          id: "RP-003",
          dataType: "Configuration Changes",
          category: "Compliance",
          retentionPeriod: 10,
          retentionUnit: 'years',
          complianceRequirement: "NERC CIP-010",
          status: 'active',
          autoDelete: false,
          lastReview: "2024-01-20",
          nextReview: "2024-07-20",
          dataVolume: "50 GB",
          estimatedCost: 750
        },
        {
          id: "RP-004",
          dataType: "Financial Records",
          category: "Financial",
          retentionPeriod: 7,
          retentionUnit: 'years',
          complianceRequirement: "SOX",
          status: 'active',
          autoDelete: false,
          lastReview: "2024-01-05",
          nextReview: "2024-07-05",
          dataVolume: "100 GB",
          estimatedCost: 1000
        },
        {
          id: "RP-005",
          dataType: "Customer Data",
          category: "Personal",
          retentionPeriod: 5,
          retentionUnit: 'years',
          complianceRequirement: "Data Privacy Laws",
          status: 'pending',
          autoDelete: true,
          lastReview: "2024-01-01",
          nextReview: "2024-06-01",
          dataVolume: "500 GB",
          estimatedCost: 2500
        }
      ];

      // Mock data categories
      const mockCategories: DataCategory[] = [
        {
          name: "Security Logs",
          totalSize: "1.2 TB",
          recordCount: 15000000,
          oldestRecord: "2020-01-01",
          newestRecord: "2024-01-23",
          complianceRequired: true,
          retentionPolicies: 3
        },
        {
          name: "Operational Data",
          totalSize: "3.8 TB",
          recordCount: 45000000,
          oldestRecord: "2019-06-15",
          newestRecord: "2024-01-23",
          complianceRequired: true,
          retentionPolicies: 2
        },
        {
          name: "Financial Records",
          totalSize: "250 GB",
          recordCount: 2500000,
          oldestRecord: "2017-01-01",
          newestRecord: "2024-01-23",
          complianceRequired: true,
          retentionPolicies: 1
        },
        {
          name: "Personal Data",
          totalSize: "750 GB",
          recordCount: 8000000,
          oldestRecord: "2018-03-01",
          newestRecord: "2024-01-23",
          complianceRequired: true,
          retentionPolicies: 2
        }
      ];

      // Mock upcoming actions
      const mockActions: RetentionAction[] = [
        {
          id: "RA-001",
          type: 'archive',
          dataType: "System Events",
          scheduledDate: "2024-02-01",
          status: 'pending',
          affectedRecords: 500000,
          estimatedSize: "50 GB"
        },
        {
          id: "RA-002",
          type: 'delete',
          dataType: "Authentication Logs",
          scheduledDate: "2024-02-15",
          status: 'pending',
          affectedRecords: 1000000,
          estimatedSize: "10 GB"
        },
        {
          id: "RA-003",
          type: 'review',
          dataType: "Customer Data",
          scheduledDate: "2024-03-01",
          status: 'pending',
          affectedRecords: 750000,
          estimatedSize: "75 GB"
        }
      ];

      setRetentionPolicies(mockPolicies);
      setDataCategories(mockCategories);
      setUpcomingActions(mockActions);
      setLoading(false);
    };

    fetchRetentionData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'archive':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'archive':
        return <Archive className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'review':
        return <Clock className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const totalStorageCost = retentionPolicies.reduce((acc, policy) => acc + policy.estimatedCost, 0);
  const totalDataVolume = dataCategories.reduce((acc, category) => {
    const size = parseFloat(category.totalSize.split(' ')[0]);
    const unit = category.totalSize.split(' ')[1];
    return acc + (unit === 'TB' ? size * 1024 : size);
  }, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Retention Manager</h1>
          <p className="text-muted-foreground">Manage data lifecycle and compliance retention policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Volume</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalDataVolume / 1024).toFixed(1)} TB</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionPolicies.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Out of {retentionPolicies.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Cost</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStorageCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly estimate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingActions.filter(a => a.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Scheduled actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Actions Alert */}
      {upcomingActions.some(action => new Date(action.scheduledDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Upcoming Retention Actions</AlertTitle>
          <AlertDescription>
            There are retention actions scheduled within the next 7 days that require attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Retention Policies</TabsTrigger>
          <TabsTrigger value="categories">Data Categories</TabsTrigger>
          <TabsTrigger value="actions">Scheduled Actions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention Policies</CardTitle>
              <CardDescription>Manage data retention policies and compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{policy.dataType}</h4>
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status.toUpperCase()}
                          </Badge>
                          {policy.autoDelete && (
                            <Badge variant="outline" className="text-xs">
                              Auto-Delete
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Category: {policy.category} | Compliance: {policy.complianceRequirement}
                        </p>
                        <div className="text-sm space-y-1">
                          <div>Retention: {policy.retentionPeriod} {policy.retentionUnit}</div>
                          <div>Data Volume: {policy.dataVolume} | Cost: ${policy.estimatedCost}/month</div>
                          <div>Next Review: {new Date(policy.nextReview).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Time until next review</span>
                        <span>{Math.ceil((new Date(policy.nextReview).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - ((new Date(policy.nextReview).getTime() - Date.now()) / (180 * 24 * 60 * 60 * 1000) * 100))} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {dataCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.complianceRequired && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Compliance Required
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {category.recordCount.toLocaleString()} records | {category.totalSize}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Oldest Record:</span>
                        <div className="font-medium">{new Date(category.oldestRecord).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Newest Record:</span>
                        <div className="font-medium">{new Date(category.newestRecord).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {category.retentionPolicies} retention {category.retentionPolicies === 1 ? 'policy' : 'policies'}
                      </span>
                      <Button size="sm" variant="outline">
                        Manage Policies
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Retention Actions</CardTitle>
              <CardDescription>Upcoming archive, delete, and review actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingActions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getActionIcon(action.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{action.type.charAt(0).toUpperCase() + action.type.slice(1)}: {action.dataType}</h4>
                            <Badge className={getActionColor(action.type)}>
                              {action.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Scheduled: {new Date(action.scheduledDate).toLocaleDateString()}</div>
                            <div>Affected Records: {action.affectedRecords.toLocaleString()}</div>
                            <div>Estimated Size: {action.estimatedSize}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm">Execute Now</Button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Days until execution</span>
                        <span>{Math.ceil((new Date(action.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - ((new Date(action.scheduledDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000) * 100))} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { requirement: "NERC CIP", policies: 3, status: "compliant" },
                    { requirement: "SOX", policies: 1, status: "compliant" },
                    { requirement: "Data Privacy Laws", policies: 1, status: "review_required" },
                    { requirement: "FERC", policies: 2, status: "compliant" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.requirement}</p>
                        <p className="text-sm text-muted-foreground">{item.policies} policies</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'compliant' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <Badge className="bg-yellow-100 text-yellow-800">Review Required</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Summary by Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['NERC CIP', 'SOX', 'Data Privacy Laws', 'FERC'].map((requirement) => {
                    const policiesCount = retentionPolicies.filter(p => p.complianceRequirement.includes(requirement.split(' ')[0])).length;
                    const totalCost = retentionPolicies
                      .filter(p => p.complianceRequirement.includes(requirement.split(' ')[0]))
                      .reduce((acc, p) => acc + p.estimatedCost, 0);
                    
                    return (
                      <div key={requirement} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{requirement}</span>
                          <span>{policiesCount} policies | ${totalCost}/month</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(policiesCount / retentionPolicies.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { doc: "Data Retention Policy", lastUpdated: "2024-01-15", status: "current" },
                  { doc: "Data Classification Guide", lastUpdated: "2024-01-10", status: "current" },
                  { doc: "Compliance Mapping Matrix", lastUpdated: "2023-12-01", status: "needs_update" },
                  { doc: "Audit Trail Procedures", lastUpdated: "2024-01-20", status: "current" },
                  { doc: "Data Destruction Procedures", lastUpdated: "2024-01-05", status: "current" },
                  { doc: "Backup & Recovery Policy", lastUpdated: "2023-11-15", status: "needs_update" }
                ].map((doc, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{doc.doc}</h4>
                      <Badge className={doc.status === 'current' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {doc.status === 'current' ? 'Current' : 'Update Required'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last Updated: {doc.lastUpdated}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}