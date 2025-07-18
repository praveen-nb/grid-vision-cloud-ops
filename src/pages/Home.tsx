import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Cloud, Shield, TrendingUp, Zap, Award, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Cloud,
    title: "Cloud-Native Architecture",
    description: "Fully managed AWS infrastructure with auto-scaling capabilities and 99.9% uptime SLA"
  },
  {
    icon: Shield,
    title: "NERC-CIP Compliant",
    description: "Built-in security controls meeting all regulatory requirements for critical infrastructure"
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "AI-powered grid analytics using Amazon SageMaker for proactive maintenance"
  },
  {
    icon: Zap,
    title: "Real-Time Monitoring",
    description: "Live data streaming from IoT devices with sub-second response times"
  }
]

const metrics = [
  { label: "Cost Reduction", value: "40%", description: "Infrastructure operational costs" },
  { label: "Security Improvement", value: "60%", description: "Enhanced cybersecurity posture" },
  { label: "Faster Response", value: "30%", description: "Outage detection time reduction" },
  { label: "Uptime", value: "99.9%", description: "System availability guarantee" }
]

const benefits = [
  "Seamless SCADA and OMS integration",
  "Real-time grid visibility and control",
  "Automated compliance reporting",
  "Disaster recovery and backup",
  "Elastic scalability for peak loads",
  "Advanced threat detection"
]

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-utility rounded-2xl text-white">
        <div className="max-w-4xl mx-auto px-6">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            AWS-Based GIS Infrastructure
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Modernizing Electrical Utility Grid Operations
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            A comprehensive cloud-based GIS solution addressing aging infrastructure, 
            integration challenges, and cybersecurity vulnerabilities in electrical utilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-utility-blue hover:bg-white/90">
              <Link to="/architecture">
                View Architecture <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link to="/dashboard">
                Live Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="text-center shadow-card">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                <div className="font-medium mb-1">{metric.label}</div>
                <div className="text-sm text-muted-foreground">{metric.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features & Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AWS-based solution addresses critical challenges in traditional GIS infrastructure
            while ensuring regulatory compliance and operational excellence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 rounded-2xl p-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Implementation Benefits</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-utility-success flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild>
                <Link to="/deliverables">
                  View Project Deliverables <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-utility-success" />
                Compliance & Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Regulatory Compliance</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-utility-success/10 text-utility-success">NERC-CIP</Badge>
                  <Badge className="bg-utility-success/10 text-utility-success">FERC</Badge>
                  <Badge className="bg-utility-success/10 text-utility-success">SOC 2</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">AWS Certifications</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">FedRAMP</Badge>
                  <Badge variant="outline">ISO 27001</Badge>
                  <Badge variant="outline">PCI DSS</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Security Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multi-factor authentication</li>
                  <li>• End-to-end encryption</li>
                  <li>• Real-time threat detection</li>
                  <li>• Automated incident response</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12 bg-gradient-card rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Grid?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Explore our comprehensive documentation, view live dashboards, and discover how 
          AWS-based GIS infrastructure can transform your utility operations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/documentation">
              View Documentation
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/compliance">
              Compliance Details
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}