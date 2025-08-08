import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Calculator,
  Target,
  Zap,
  Database,
  Globe,
  Shield,
  Cloud,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Cost data for comprehensive analysis
const monthlyCostBreakdown = [
  { service: 'EC2 Instances', cost: 2800, category: 'Compute', optimized: 1680, savings: 1120, percentage: 28 },
  { service: 'ArcGIS Licensing', cost: 3100, category: 'Software', optimized: 3100, savings: 0, percentage: 31 },
  { service: 'SageMaker', cost: 1800, category: 'ML/AI', optimized: 1260, savings: 540, percentage: 18 },
  { service: 'RDS Database', cost: 1200, category: 'Database', optimized: 660, savings: 540, percentage: 12 },
  { service: 'S3 Storage', cost: 450, category: 'Storage', optimized: 270, savings: 180, percentage: 4.5 },
  { service: 'Data Transfer', cost: 300, category: 'Network', optimized: 150, savings: 150, percentage: 3 },
  { service: 'VPC Endpoints', cost: 200, category: 'Network', optimized: 200, savings: 0, percentage: 2 },
  { service: 'CloudWatch', cost: 150, category: 'Monitoring', optimized: 120, savings: 30, percentage: 1.5 }
];

const dataEgressCosts = [
  { type: 'CloudFront to Internet', volume: '1 TB', cost: 85, optimized: 60, description: 'CDN distribution' },
  { type: 'Direct Egress', volume: '1 TB', cost: 90, optimized: 27, description: 'Direct internet egress' },
  { type: 'Inter-Region Transfer', volume: '2 TB', cost: 40, optimized: 40, description: 'Disaster recovery sync' },
  { type: 'Partner Data Sharing', volume: '700 GB', cost: 63, optimized: 19, description: 'Utility consortium' }
];

const arcGISLicensing = {
  baseLicense: { name: 'ArcGIS Enterprise Advanced', cost: 12000, annual: true },
  namedUsers: [
    { type: 'Creator', count: 50, unitCost: 500, total: 25000 },
    { type: 'GIS Professional', count: 20, unitCost: 700, total: 14000 },
    { type: 'Viewer', count: 200, unitCost: 100, total: 20000 }
  ],
  concurrentUsers: [
    { type: 'Advanced Editing', count: 10, unitCost: 3500, total: 35000 },
    { type: 'Basic Viewing', count: 50, unitCost: 1500, total: 75000 }
  ],
  extensions: [
    { name: 'Spatial Analyst', count: 20, unitCost: 1500, total: 30000 },
    { name: 'Network Analyst', count: 10, unitCost: 2500, total: 25000 },
    { name: 'Geostatistical Analyst', count: 5, unitCost: 1500, total: 7500 }
  ],
  awsInfrastructure: {
    ec2: { description: 'ArcGIS Server Instances', monthlyCost: 2400 },
    portal: { description: 'Portal for ArcGIS', monthlyCost: 800 },
    datastore: { description: 'Data Store Instances', monthlyCost: 1200 },
    storage: { description: 'EBS + S3 Storage', monthlyCost: 450 },
    network: { description: 'ALB + Data Transfer', monthlyCost: 325 }
  }
};

const costOptimizationOpportunities = [
  { 
    category: 'Reserved Instances', 
    currentCost: 2800, 
    optimizedCost: 1120, 
    savings: 1680, 
    effort: 'Low',
    timeline: 'Immediate',
    description: '60% savings on EC2 with 1-year RI commitment'
  },
  { 
    category: 'S3 Intelligent Tiering', 
    currentCost: 450, 
    optimizedCost: 270, 
    savings: 180, 
    effort: 'Low',
    timeline: '1 week',
    description: 'Automatic storage class optimization'
  },
  { 
    category: 'VPC Endpoints', 
    currentCost: 300, 
    optimizedCost: 100, 
    savings: 200, 
    effort: 'Medium',
    timeline: '2 weeks',
    description: 'Eliminate NAT Gateway costs for AWS services'
  },
  { 
    category: 'Spot Instances for ML', 
    currentCost: 1800, 
    optimizedCost: 720, 
    savings: 1080, 
    effort: 'High',
    timeline: '1 month',
    description: 'Use Spot for SageMaker training workloads'
  }
];

const monthlyTrend = [
  { month: 'Jan', total: 9800, compute: 2800, storage: 450, network: 300, software: 3100, ml: 1800, database: 1200, other: 150 },
  { month: 'Feb', total: 10200, compute: 2900, storage: 470, network: 320, software: 3100, ml: 1900, database: 1250, other: 160 },
  { month: 'Mar', total: 9950, compute: 2750, storage: 460, network: 290, software: 3100, ml: 1850, database: 1200, other: 155 },
  { month: 'Apr', total: 10500, compute: 3100, storage: 480, network: 350, software: 3100, ml: 1950, database: 1300, other: 170 },
  { month: 'May', total: 10100, compute: 2850, storage: 465, network: 310, software: 3100, ml: 1875, database: 1220, other: 165 },
  { month: 'Jun', total: 10000, compute: 2800, storage: 450, network: 300, software: 3100, ml: 1800, database: 1200, other: 150 }
];

export const CostAnalysisDashboard = () => {
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);
  const [projectedSavings, setProjectedSavings] = useState(0);

  useEffect(() => {
    const totalSavings = costOptimizationOpportunities.reduce((sum, opp) => sum + opp.savings, 0);
    setProjectedSavings(totalSavings);
  }, []);

  const totalMonthlyCost = monthlyCostBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const totalOptimizedCost = monthlyCostBreakdown.reduce((sum, item) => sum + item.optimized, 0);
  const totalPotentialSavings = totalMonthlyCost - totalOptimizedCost;

  const arcGISTotalAnnual = arcGISLicensing.baseLicense.cost +
    arcGISLicensing.namedUsers.reduce((sum, user) => sum + user.total, 0) +
    arcGISLicensing.concurrentUsers.reduce((sum, user) => sum + user.total, 0) +
    arcGISLicensing.extensions.reduce((sum, ext) => sum + ext.total, 0);

  const arcGISMonthlyInfra = Object.values(arcGISLicensing.awsInfrastructure).reduce((sum, item) => sum + item.monthlyCost, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Cost Analysis & Optimization Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive cost breakdown with ArcGIS licensing and data egress analysis
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${totalMonthlyCost.toLocaleString()}/month</div>
          <div className="text-sm text-muted-foreground">Current total cost</div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current infrastructure spend</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-success shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-utility-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPotentialSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{Math.round((totalPotentialSavings / totalMonthlyCost) * 100)}% cost reduction</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-warning shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Egress</CardTitle>
            <Globe className="h-4 w-4 text-utility-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dataEgressCosts.reduce((sum, item) => sum + item.cost, 0)}</div>
            <p className="text-xs text-muted-foreground">Monthly transfer costs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-utility-blue shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ArcGIS Annual</CardTitle>
            <Target className="h-4 w-4 text-utility-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(arcGISTotalAnnual / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Software licensing cost</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="egress">Data Egress</TabsTrigger>
          <TabsTrigger value="arcgis">ArcGIS Licensing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Cost Distribution
                </CardTitle>
                <CardDescription>Monthly cost breakdown by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={monthlyCostBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="cost"
                      label={({service, percentage}) => `${service}: ${percentage}%`}
                    >
                      {monthlyCostBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 4 === 0 ? 'hsl(var(--primary))' : 
                          index % 4 === 1 ? 'hsl(var(--utility-blue))' :
                          index % 4 === 2 ? 'hsl(var(--utility-teal))' : 'hsl(var(--utility-warning))'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Monthly Cost']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-utility-success" />
                  Optimization Impact
                </CardTitle>
                <CardDescription>Current vs. optimized costs comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyCostBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Bar dataKey="cost" fill="hsl(var(--utility-warning))" name="Current Cost" />
                    <Bar dataKey="optimized" fill="hsl(var(--utility-success))" name="Optimized Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Detailed Cost Breakdown
              </CardTitle>
              <CardDescription>Service-by-service analysis with optimization opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyCostBreakdown.map((service, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium">{service.service}</h4>
                        <p className="text-sm text-muted-foreground">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${service.cost.toLocaleString()}</div>
                        {service.savings > 0 && (
                          <div className="text-sm text-utility-success">
                            Save ${service.savings.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-mono">${service.cost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Optimized</div>
                        <div className="font-mono">${service.optimized.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Potential Savings</div>
                        <div className="font-mono text-utility-success">
                          ${service.savings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {service.savings > 0 && (
                      <Progress 
                        value={(service.savings / service.cost) * 100} 
                        className="mt-2" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egress" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-utility-blue" />
                  Data Egress Costs
                </CardTitle>
                <CardDescription>Monthly data transfer and egress charges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataEgressCosts.map((egress, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{egress.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {egress.volume} • {egress.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${egress.cost}</div>
                          {egress.optimized < egress.cost && (
                            <div className="text-sm text-utility-success">
                              Optimized: ${egress.optimized}
                            </div>
                          )}
                        </div>
                      </div>
                      {egress.optimized < egress.cost && (
                        <Progress 
                          value={(egress.optimized / egress.cost) * 100} 
                          className="mt-2" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-utility-warning" />
                  Optimization Strategies
                </CardTitle>
                <CardDescription>Data transfer cost reduction methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-utility-success/10 rounded-lg border border-utility-success/20">
                    <div className="font-medium text-utility-success">CloudFront Caching</div>
                    <div className="text-sm text-muted-foreground">
                      85% cache hit ratio reduces egress by 70%
                    </div>
                  </div>
                  
                  <div className="p-3 bg-utility-blue/10 rounded-lg border border-utility-blue/20">
                    <div className="font-medium text-utility-blue">VPC Endpoints</div>
                    <div className="text-sm text-muted-foreground">
                      Eliminates NAT Gateway costs for AWS services
                    </div>
                  </div>
                  
                  <div className="p-3 bg-utility-teal/10 rounded-lg border border-utility-teal/20">
                    <div className="font-medium text-utility-teal">Direct Connect</div>
                    <div className="text-sm text-muted-foreground">
                      Reduces partner data sharing costs by 70%
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Monthly Savings:</strong> Implementing all optimizations could save 
                      ${dataEgressCosts.reduce((sum, item) => sum + (item.cost - item.optimized), 0)} 
                      per month on data egress costs.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="arcgis" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  ArcGIS Enterprise Licensing
                </CardTitle>
                <CardDescription>Complete licensing breakdown for GIS capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Base License</h4>
                    <div className="flex justify-between">
                      <span>{arcGISLicensing.baseLicense.name}</span>
                      <span className="font-mono">${arcGISLicensing.baseLicense.cost.toLocaleString()}/year</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Named Users</h4>
                    <div className="space-y-2">
                      {arcGISLicensing.namedUsers.map((user, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{user.type} ({user.count})</span>
                          <span className="font-mono">${user.total.toLocaleString()}/year</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Concurrent Users</h4>
                    <div className="space-y-2">
                      {arcGISLicensing.concurrentUsers.map((user, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{user.type} ({user.count})</span>
                          <span className="font-mono">${user.total.toLocaleString()}/year</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Extensions</h4>
                    <div className="space-y-2">
                      {arcGISLicensing.extensions.map((ext, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{ext.name} ({ext.count})</span>
                          <span className="font-mono">${ext.total.toLocaleString()}/year</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-utility-blue" />
                  AWS Infrastructure Costs
                </CardTitle>
                <CardDescription>Monthly hosting costs for ArcGIS on AWS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(arcGISLicensing.awsInfrastructure).map(([key, infra], index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{infra.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {key === 'ec2' && 'm5.4xlarge × 3'}
                            {key === 'portal' && 'm5.xlarge × 2'}
                            {key === 'datastore' && 'm5.2xlarge × 2'}
                            {key === 'storage' && '3TB EBS + 10TB S3'}
                            {key === 'network' && 'ALB + Transfer'}
                          </div>
                        </div>
                        <div className="text-lg font-bold">
                          ${infra.monthlyCost.toLocaleString()}/month
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Annual Software</div>
                        <div className="text-xl font-bold">${arcGISTotalAnnual.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Annual Infrastructure</div>
                        <div className="text-xl font-bold">${(arcGISMonthlyInfra * 12).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-muted-foreground">Total Annual Cost</div>
                      <div className="text-2xl font-bold text-primary">
                        ${(arcGISTotalAnnual + (arcGISMonthlyInfra * 12)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-utility-success" />
                Cost Optimization Opportunities
              </CardTitle>
              <CardDescription>Prioritized recommendations for cost reduction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costOptimizationOpportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{opportunity.category}</h4>
                        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-utility-success">
                          ${opportunity.savings.toLocaleString()}/month
                        </div>
                        <Badge variant={
                          opportunity.effort === 'Low' ? 'default' :
                          opportunity.effort === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {opportunity.effort} Effort
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-mono">${opportunity.currentCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Optimized</div>
                        <div className="font-mono">${opportunity.optimizedCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Timeline</div>
                        <div className="font-mono">{opportunity.timeline}</div>
                      </div>
                    </div>
                    <Progress 
                      value={(opportunity.savings / opportunity.currentCost) * 100} 
                      className="mt-3" 
                    />
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <strong>Total Potential Savings:</strong> ${projectedSavings.toLocaleString()}/month 
                  (${(projectedSavings * 12).toLocaleString()}/year) with complete optimization implementation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Cost Trends Analysis
              </CardTitle>
              <CardDescription>6-month cost evolution by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Area type="monotone" dataKey="software" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
                  <Area type="monotone" dataKey="compute" stackId="1" stroke="hsl(var(--utility-blue))" fill="hsl(var(--utility-blue))" />
                  <Area type="monotone" dataKey="ml" stackId="1" stroke="hsl(var(--utility-teal))" fill="hsl(var(--utility-teal))" />
                  <Area type="monotone" dataKey="database" stackId="1" stroke="hsl(var(--utility-warning))" fill="hsl(var(--utility-warning))" />
                  <Area type="monotone" dataKey="storage" stackId="1" stroke="hsl(var(--utility-success))" fill="hsl(var(--utility-success))" />
                  <Area type="monotone" dataKey="network" stackId="1" stroke="hsl(var(--utility-gray))" fill="hsl(var(--utility-gray))" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};