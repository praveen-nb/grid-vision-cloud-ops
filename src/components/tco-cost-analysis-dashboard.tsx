import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Calculator, 
  PieChart, 
  BarChart3,
  AlertCircle,
  Server,
  Database,
  Globe,
  Cloud,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

const CostCategory = ({ category, current, projected, savings, breakdown }) => (
  <Card className="border-l-4 border-l-primary">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <category.icon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription className="text-sm">{category.description}</CardDescription>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-utility-success">
            ${savings.toLocaleString()}/mo saved
          </div>
          <div className="text-sm text-muted-foreground">
            {((savings / current) * 100).toFixed(1)}% reduction
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="text-lg font-semibold text-utility-warning">
            ${current.toLocaleString()}/mo
          </div>
          <div className="text-xs text-muted-foreground">Current On-Premise</div>
        </div>
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="text-lg font-semibold text-utility-success">
            ${projected.toLocaleString()}/mo
          </div>
          <div className="text-xs text-muted-foreground">Projected AWS</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Cost Breakdown:</h4>
        {breakdown.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{item.component}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">${item.cost.toLocaleString()}/mo</span>
              <Badge variant={item.type === 'savings' ? "default" : "secondary"} className="text-xs">
                {item.type === 'savings' ? 'Savings' : 'Cost'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const HiddenCostAlert = ({ cost, description, mitigation }) => (
  <div className="p-3 border border-utility-warning/20 rounded-lg bg-utility-warning/5">
    <div className="flex items-center gap-2 mb-2">
      <AlertCircle className="h-4 w-4 text-utility-warning" />
      <span className="font-semibold text-sm">${cost.toLocaleString()}/mo</span>
      <Badge variant="secondary" className="text-xs">Hidden Cost</Badge>
    </div>
    <p className="text-xs text-muted-foreground mb-2">{description}</p>
    <p className="text-xs text-utility-success"><strong>Mitigation:</strong> {mitigation}</p>
  </div>
);

export function TcoCostAnalysisDashboard() {
  const [timeframe, setTimeframe] = useState("3-year");
  const [scenario, setScenario] = useState("standard");

  const costCategories = [
    {
      name: "Infrastructure & Compute",
      description: "EC2, RDS, Storage, and networking costs",
      icon: Server,
      current: 85000,
      projected: 52000,
      savings: 33000,
      breakdown: [
        { component: "EC2 Instances (Reserved)", cost: 28000, type: "cost" },
        { component: "RDS Multi-AZ", cost: 15000, type: "cost" },
        { component: "S3 Storage", cost: 9000, type: "cost" },
        { component: "Data Center Elimination", cost: 45000, type: "savings" },
        { component: "Hardware Refresh Avoided", cost: 18000, type: "savings" }
      ]
    },
    {
      name: "GIS Software Licensing",
      description: "ArcGIS Enterprise, ArcFM, and related tools",
      icon: Globe,
      current: 120000,
      projected: 95000,
      savings: 25000,
      breakdown: [
        { component: "ArcGIS Enterprise Cloud", cost: 65000, type: "cost" },
        { component: "ArcFM Cloud Licensing", cost: 30000, type: "cost" },
        { component: "On-Premise License Savings", cost: 35000, type: "savings" },
        { component: "Maintenance Contract Reduction", cost: 15000, type: "savings" }
      ]
    },
    {
      name: "Data & Analytics",
      description: "Real-time streaming, ML/AI, and data processing",
      icon: BarChart3,
      current: 35000,
      projected: 28000,
      savings: 7000,
      breakdown: [
        { component: "Kinesis Data Streams", cost: 12000, type: "cost" },
        { component: "SageMaker Training/Inference", cost: 16000, type: "cost" },
        { component: "Legacy Analytics Platform", cost: 25000, type: "savings" },
        { component: "Reduced Data Processing Staff", cost: 8000, type: "savings" }
      ]
    },
    {
      name: "Security & Compliance",
      description: "NERC-CIP compliance, monitoring, and protection",
      icon: Shield,
      current: 45000,
      projected: 32000,
      savings: 13000,
      breakdown: [
        { component: "GuardDuty + Security Hub", cost: 8000, type: "cost" },
        { component: "WAF + Shield Advanced", cost: 12000, type: "cost" },
        { component: "Compliance Auditing Tools", cost: 12000, type: "cost" },
        { component: "Physical Security Reduction", cost: 20000, type: "savings" },
        { component: "Automated Compliance", cost: 15000, type: "savings" }
      ]
    }
  ];

  const hiddenCosts = [
    {
      cost: 8500,
      description: "Data egress charges for real-time GIS-Kinesis pipelines at 100GB/hour",
      mitigation: "Use CloudFront caching and Direct Connect for bulk transfers"
    },
    {
      cost: 12000,
      description: "Cross-region replication for disaster recovery and compliance",
      mitigation: "Optimize replication frequency and use S3 Intelligent-Tiering"
    },
    {
      cost: 6800,
      description: "CloudWatch logging at scale for NERC-CIP audit requirements",
      mitigation: "Use log filtering and retention policies to reduce volume"
    },
    {
      cost: 15200,
      description: "SageMaker training costs for large-scale grid prediction models",
      mitigation: "Use Spot instances and scheduled training windows"
    },
    {
      cost: 4500,
      description: "NAT Gateway charges for private subnet connectivity",
      mitigation: "Implement VPC endpoints for AWS services"
    }
  ];

  const costTrendData = [
    { month: 'Jan', onPremise: 285000, aws: 207000 },
    { month: 'Feb', onPremise: 287000, aws: 205000 },
    { month: 'Mar', onPremise: 290000, aws: 208000 },
    { month: 'Apr', onPremise: 295000, aws: 210000 },
    { month: 'May', onPremise: 298000, aws: 212000 },
    { month: 'Jun', onPremise: 301000, aws: 215000 },
    { month: 'Jul', onPremise: 305000, aws: 218000 },
    { month: 'Aug', onPremise: 308000, aws: 220000 },
    { month: 'Sep', onPremise: 312000, aws: 222000 },
    { month: 'Oct', onPremise: 315000, aws: 225000 },
    { month: 'Nov', onPremise: 318000, aws: 228000 },
    { month: 'Dec', onPremise: 322000, aws: 230000 }
  ];

  const pieChartData = [
    { name: 'Infrastructure Savings', value: 33000, color: '#059669' },
    { name: 'Licensing Optimization', value: 25000, color: '#0891b2' },
    { name: 'Security Automation', value: 13000, color: '#7c3aed' },
    { name: 'Analytics Efficiency', value: 7000, color: '#dc2626' },
    { name: 'Hidden Costs', value: 47000, color: '#ea580c' }
  ];

  const roiMetrics = {
    totalInvestment: 450000,
    annualSavings: 936000,
    paybackPeriod: 5.8,
    threeYearRoi: 312,
    breakeven: "6 months"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Total Cost of Ownership (TCO) Analysis
          </h2>
          <p className="text-muted-foreground">
            Comprehensive cost framework comparing on-premise vs AWS cloud infrastructure
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-utility-success text-white">
            ${(936000/12).toLocaleString()}/mo Total Savings
          </Badge>
          <Button variant="outline" size="sm">
            Export Analysis
          </Button>
        </div>
      </div>

      {/* ROI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-utility-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-utility-success">
              ${roiMetrics.totalInvestment.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Initial Investment</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-utility-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-utility-success">
              ${roiMetrics.annualSavings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Annual Savings</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {roiMetrics.paybackPeriod} mo
            </div>
            <div className="text-xs text-muted-foreground">Payback Period</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-utility-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-utility-success">
              {roiMetrics.threeYearRoi}%
            </div>
            <div className="text-xs text-muted-foreground">3-Year ROI</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {roiMetrics.breakeven}
            </div>
            <div className="text-xs text-muted-foreground">Break-even</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={timeframe} onValueChange={setTimeframe}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1-year">1 Year</TabsTrigger>
          <TabsTrigger value="3-year">3 Year</TabsTrigger>
          <TabsTrigger value="5-year">5 Year</TabsTrigger>
          <TabsTrigger value="hidden-costs">Hidden Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="3-year" className="space-y-6">
          {/* Cost Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {costCategories.map((category, index) => (
              <CostCategory key={index} category={category} {...category} />
            ))}
          </div>

          {/* Cost Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Cost Comparison Trend
              </CardTitle>
              <CardDescription>
                On-premise vs AWS costs over 12-month migration period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="onPremise" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="On-Premise"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aws" 
                    stroke="#059669" 
                    strokeWidth={2}
                    name="AWS Cloud"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Savings Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Savings Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <RechartsPieChart data={pieChartData}>
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-utility-success/10 rounded-lg">
                  <div className="font-semibold text-utility-success text-sm">Reserved Instance Optimization</div>
                  <div className="text-xs text-muted-foreground">Additional 15% savings: $94,000/year</div>
                </div>
                <div className="p-3 bg-utility-blue/10 rounded-lg">
                  <div className="font-semibold text-utility-blue text-sm">Auto Scaling Implementation</div>
                  <div className="text-xs text-muted-foreground">Estimated savings: $36,000/year</div>
                </div>
                <div className="p-3 bg-utility-teal/10 rounded-lg">
                  <div className="font-semibold text-utility-teal text-sm">Storage Lifecycle Policies</div>
                  <div className="text-xs text-muted-foreground">Archive savings: $28,000/year</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hidden-costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-utility-warning" />
                Hidden Cost Analysis & Mitigation Strategies
              </CardTitle>
              <CardDescription>
                Often-overlooked costs that can impact your AWS budget and recommended mitigation approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hiddenCosts.map((cost, index) => (
                  <HiddenCostAlert key={index} {...cost} />
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Total Hidden Costs Impact
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-utility-warning">
                      ${hiddenCosts.reduce((sum, cost) => sum + cost.cost, 0).toLocaleString()}/mo
                    </div>
                    <div className="text-xs text-muted-foreground">Hidden Costs</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-utility-success">
                      ${Math.round(hiddenCosts.reduce((sum, cost) => sum + cost.cost, 0) * 0.65).toLocaleString()}/mo
                    </div>
                    <div className="text-xs text-muted-foreground">After Mitigation</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      35%
                    </div>
                    <div className="text-xs text-muted-foreground">Reduction Potential</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}