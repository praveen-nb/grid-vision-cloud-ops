import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Database, 
  GitBranch, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Clock
} from 'lucide-react';

const ModelCard = ({ model, accuracy, drift, explainability, status }) => (
  <Card className={`border-l-4 ${status === 'production' ? 'border-l-utility-success' : 'border-l-utility-warning'}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">{model}</CardTitle>
          <CardDescription className="text-sm">Production Model v2.1.3</CardDescription>
        </div>
        <Badge variant={status === 'production' ? "default" : "secondary"}>
          {status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-accent/10 rounded">
          <div className="text-sm font-bold text-utility-success">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>
        <div className="text-center p-2 bg-accent/10 rounded">
          <div className="text-sm font-bold text-primary">{drift}%</div>
          <div className="text-xs text-muted-foreground">Drift Score</div>
        </div>
        <div className="text-center p-2 bg-accent/10 rounded">
          <div className="text-sm font-bold text-utility-blue">{explainability}%</div>
          <div className="text-xs text-muted-foreground">Explainable</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function MlopsGovernanceDashboard() {
  const [selectedTab, setSelectedTab] = useState("models");

  const productionModels = [
    {
      model: "Grid Anomaly Detection",
      accuracy: 94.2,
      drift: 2.1,
      explainability: 87,
      status: "production"
    },
    {
      model: "Predictive Maintenance",
      accuracy: 91.8,
      drift: 3.4,
      explainability: 92,
      status: "production"
    },
    {
      model: "Load Forecasting",
      accuracy: 96.1,
      drift: 1.8,
      explainability: 89,
      status: "production"
    },
    {
      model: "Outage Prediction",
      accuracy: 88.7,
      drift: 5.2,
      explainability: 85,
      status: "validation"
    }
  ];

  const trainingMetrics = [
    { dataset: "Historical Grid Data", size: "2.4TB", coverage: "5 years", quality: "98.2%" },
    { dataset: "Weather Patterns", size: "890GB", coverage: "10 years", quality: "96.8%" },
    { dataset: "Equipment Telemetry", size: "1.8TB", coverage: "3 years", quality: "94.5%" },
    { dataset: "Outage Records", size: "156GB", coverage: "8 years", quality: "99.1%" }
  ];

  const explainabilityFeatures = [
    {
      feature: "SHAP Values Integration",
      description: "Local and global feature importance for all prediction models",
      implementation: "Real-time SHAP calculation in SageMaker endpoints",
      regulatoryValue: "Meets NERC audit requirements for decision transparency"
    },
    {
      feature: "Model Decision Trees",
      description: "Visual decision pathways for critical grid protection decisions", 
      implementation: "Interactive dashboards with decision flow visualization",
      regulatoryValue: "Supports operator understanding and regulatory compliance"
    },
    {
      feature: "Confidence Scoring",
      description: "Prediction confidence levels with uncertainty quantification",
      implementation: "Bayesian neural networks with uncertainty estimation",
      regulatoryValue: "Risk assessment for grid-critical decisions"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            MLOps Governance & Model Registry
          </h2>
          <p className="text-muted-foreground">
            End-to-end ML lifecycle management with regulatory compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-utility-success">
            4 Production Models
          </Badge>
          <Button variant="outline" size="sm">
            Deploy New Model
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Model Registry</TabsTrigger>
          <TabsTrigger value="training">Training Pipeline</TabsTrigger>
          <TabsTrigger value="explainability">Explainability</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {productionModels.map((model, index) => (
              <ModelCard key={index} {...model} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Model Performance & Cost Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-utility-success">$12,400</div>
                  <div className="text-sm text-muted-foreground">Monthly Training Cost</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">$8,200</div>
                  <div className="text-sm text-muted-foreground">Monthly Inference Cost</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-utility-blue">125ms</div>
                  <div className="text-sm text-muted-foreground">Avg Inference Latency</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-utility-success">99.2%</div>
                  <div className="text-sm text-muted-foreground">Model Availability</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Training Data Schema & Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingMetrics.map((dataset, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{dataset.dataset}</h4>
                      <Badge variant="outline">{dataset.quality} Quality</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size: </span>
                        <span className="font-medium">{dataset.size}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coverage: </span>
                        <span className="font-medium">{dataset.coverage}</span>
                      </div>
                      <div>
                        <Progress value={parseFloat(dataset.quality)} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explainability" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {explainabilityFeatures.map((feature, index) => (
              <Card key={index} className="border-l-4 border-l-utility-blue">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.feature}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-2 bg-accent/10 rounded">
                    <strong className="text-sm">Implementation:</strong>
                    <p className="text-sm text-muted-foreground">{feature.implementation}</p>
                  </div>
                  <div className="p-2 bg-utility-success/10 rounded">
                    <strong className="text-sm text-utility-success">Regulatory Value:</strong>
                    <p className="text-sm text-muted-foreground">{feature.regulatoryValue}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Model Governance Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-utility-success/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-utility-success mb-2" />
                    <h4 className="font-semibold text-sm">Automated Model Validation</h4>
                    <p className="text-xs text-muted-foreground">
                      All models undergo automated A/B testing before production deployment
                    </p>
                  </div>
                  <div className="p-3 bg-utility-warning/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-utility-warning mb-2" />
                    <h4 className="font-semibold text-sm">Drift Detection & Alerts</h4>
                    <p className="text-xs text-muted-foreground">
                      Real-time monitoring with automatic model retraining triggers
                    </p>
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