// Document download utility

// Detailed content generation for specific documents
function getDetailedDocumentContent(fileName: string): string {
  const documentName = fileName.toLowerCase();
  
  // Phase-specific documentation
  if (documentName.includes('phase 1')) {
    return `PHASE 1: PROJECT INITIATION & REQUIREMENTS ANALYSIS

EXECUTIVE SUMMARY
This document outlines the comprehensive requirements gathering and project initiation phase for the AWS-based GIS infrastructure implementation for electrical grid management.

1. PROJECT SCOPE DEFINITION
- Smart grid integration with AWS IoT Core
- Real-time monitoring of 500+ substations
- Integration with existing SCADA systems
- Compliance with NERC-CIP standards
- Implementation of advanced analytics using AWS SageMaker

2. STAKEHOLDER ANALYSIS
Primary Stakeholders:
- Grid Operations Center (GOC) personnel
- Field maintenance technicians
- Regulatory compliance officers
- IT infrastructure teams
- Cybersecurity specialists

3. REQUIREMENTS GATHERING
Functional Requirements:
- Real-time data acquisition from RTUs and PLCs
- Automated alarm management system
- Historical data archiving (10+ years)
- Geographic information system integration
- Mobile access for field personnel

Non-Functional Requirements:
- 99.99% system availability
- <500ms response time for critical alarms
- Support for 10,000 concurrent users
- Encrypted data transmission (AES-256)
- Disaster recovery RPO: 15 minutes

4. RISK ASSESSMENT
High Priority Risks:
- Cybersecurity threats to critical infrastructure
- Integration complexity with legacy SCADA systems
- Regulatory compliance challenges
- Data latency issues

5. SUCCESS CRITERIA
- Successful integration of 50 pilot substations
- Zero security incidents during implementation
- 95% user satisfaction rating
- Compliance with all regulatory requirements

6. DELIVERABLES
- Requirements traceability matrix
- Stakeholder communication plan
- Risk register and mitigation strategies
- Project charter approval`;
  }
  
  if (documentName.includes('phase 2')) {
    return `PHASE 2: SYSTEM DESIGN & ARCHITECTURE

EXECUTIVE SUMMARY
This document details the comprehensive system design and architecture for the AWS GIS infrastructure, including detailed technical specifications and integration patterns.

1. SYSTEM ARCHITECTURE OVERVIEW
The proposed architecture leverages AWS cloud services to create a highly scalable, secure, and reliable infrastructure for electrical grid management.

2. AWS SERVICES ARCHITECTURE
Core Services:
- AWS IoT Core: Device connectivity and message routing
- Amazon Kinesis: Real-time data streaming (1M+ messages/second)
- Amazon DynamoDB: High-performance NoSQL database
- Amazon RDS: Relational database for configuration data
- AWS Lambda: Serverless compute for data processing
- Amazon S3: Long-term data archival and analytics
- Amazon SageMaker: Machine learning and predictive analytics

3. NETWORK ARCHITECTURE
- VPC with private/public subnets across 3 AZs
- AWS Direct Connect for primary connectivity
- VPN backup connections for redundancy
- Network segmentation for security isolation
- Load balancers for high availability

4. SECURITY ARCHITECTURE
- Zero-trust security model implementation
- Multi-factor authentication for all users
- Role-based access controls (RBAC)
- End-to-end encryption in transit and at rest
- AWS WAF for web application protection
- AWS Shield for DDoS protection

5. DATA FLOW DESIGN
Real-time Data Pipeline:
SCADA → AWS IoT Core → Kinesis → Lambda → DynamoDB/RDS
Historical Data Pipeline:
DynamoDB → Kinesis Analytics → S3 → Amazon Redshift

6. INTEGRATION PATTERNS
- RESTful APIs for external system integration
- Message queuing with Amazon SQS
- Event-driven architecture with EventBridge
- Microservices architecture pattern

7. SCALABILITY DESIGN
- Auto-scaling groups for compute resources
- Database read replicas for performance
- CloudFront CDN for global distribution
- Elastic Load Balancing for traffic distribution

8. DISASTER RECOVERY
- Multi-region deployment strategy
- Automated backup and restore procedures
- RPO: 15 minutes, RTO: 30 minutes
- Cross-region data replication`;
  }
  
  // Add more detailed content for other document types
  if (documentName.includes('api reference')) {
    return `AWS GIS INFRASTRUCTURE - API REFERENCE GUIDE

OVERVIEW
This comprehensive API reference guide provides detailed documentation for all REST APIs, GraphQL endpoints, and integration interfaces available in the AWS GIS infrastructure system.

BASE URL: https://api.gis-infrastructure.aws.com/v1

AUTHENTICATION
All API endpoints require authentication using AWS Signature Version 4 or JWT tokens.

Authorization Header: Bearer <jwt_token>
Content-Type: application/json

CORE API ENDPOINTS

1. DEVICE MANAGEMENT API
GET /devices
Description: Retrieve list of all IoT devices
Parameters:
  - limit (integer): Number of results to return (max 1000)
  - offset (integer): Pagination offset
  - filter (string): Device type filter

2. REAL-TIME METRICS API
GET /metrics/realtime
Description: Get real-time metrics from devices
WebSocket Endpoint: wss://api.gis-infrastructure.aws.com/v1/realtime

3. HISTORICAL DATA API
GET /data/historical
Description: Retrieve historical time-series data

4. ALARM MANAGEMENT API
GET /alarms
Description: Retrieve active and historical alarms

5. SCADA OPERATIONS API
POST /scada/commands
Description: Execute SCADA control commands

ERROR HANDLING
HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error

RATE LIMITING
- Standard endpoints: 1000 requests/minute
- Real-time endpoints: 10000 requests/minute
- Bulk operations: 100 requests/minute`;
  }
  
  // Add content for security documents
  if (documentName.includes('nerc-cip')) {
    return `NERC-CIP COMPLIANCE MANUAL

OVERVIEW
This document provides comprehensive guidance for ensuring compliance with North American Electric Reliability Corporation Critical Infrastructure Protection (NERC-CIP) standards within the AWS GIS infrastructure.

CIP-002: BES Cyber System Categorization
- Identification of BES Cyber Systems
- Risk-based categorization methodology
- Documentation requirements
- Regular review and update procedures

CIP-003: Security Management Controls
- Senior management approval and oversight
- Cyber security policy implementation
- Information protection program
- Personnel and training requirements

CIP-005: Electronic Security Perimeters
- Electronic Security Perimeter definition
- Interactive Remote Access controls
- Electronic Access Controls
- Network monitoring and logging

CIP-007: Systems Security Management
- System security management controls
- Ports and services management
- Security patch management
- Malware prevention and detection

CIP-010: Configuration Change Management
- Configuration change management procedures
- Baseline configuration documentation
- Change authorization and testing
- Configuration monitoring

CIP-011: Information Protection
- Information identification and classification
- BES Cyber System Information protection
- Information handling procedures
- Secure information destruction`;
  }
  
  if (documentName.includes('security configuration')) {
    return `SECURITY CONFIGURATION GUIDE

OVERVIEW
This comprehensive security configuration guide outlines the implementation of security controls, access management, and monitoring procedures for the AWS GIS infrastructure.

1. IDENTITY AND ACCESS MANAGEMENT
- Multi-factor authentication implementation
- Role-based access control (RBAC) configuration
- Privilege escalation procedures
- Service account management
- Regular access reviews and audits

2. NETWORK SECURITY
- Virtual Private Cloud (VPC) configuration
- Security group rules and policies
- Network access control lists (NACLs)
- VPN and Direct Connect security
- Web Application Firewall (WAF) rules

3. DATA PROTECTION
- Encryption at rest configuration
- Encryption in transit protocols
- Key management procedures
- Data classification and handling
- Backup encryption and security

4. MONITORING AND LOGGING
- CloudTrail configuration
- VPC Flow Logs setup
- Security event monitoring
- Log aggregation and analysis
- Incident detection and alerting

5. COMPLIANCE CONTROLS
- NERC-CIP compliance mapping
- SOC 2 control implementation
- Regular security assessments
- Vulnerability management
- Penetration testing procedures`;
  }
  
  // Add more document types as needed
  return generateDefaultContent(fileName);
}

function generateDefaultContent(fileName: string): string {
  return `${fileName}

AWS GIS Infrastructure - ${fileName}
Generated: ${new Date().toLocaleDateString()}

This document is part of the comprehensive AWS GIS Infrastructure documentation suite, providing detailed information about electrical grid management systems, SCADA integration, and real-time monitoring capabilities.

For additional information, please refer to the complete documentation set available in the system.`;
}

export function downloadDocument(fileName: string, fileType: string, content?: string) {
  // Generate detailed document content based on file name and type
  let blob: Blob;
  let mimeType: string;
  
  // Get detailed content based on document name
  const detailedContent = getDetailedDocumentContent(fileName);
  
  switch (fileType.toLowerCase()) {
    case 'pdf':
      // Create a simple PDF-like content (in real implementation, use a PDF library)
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${detailedContent.length + 50}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${fileName}) Tj
0 -20 Td
(${detailedContent.substring(0, 100)}...) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
      blob = new Blob([pdfContent], { type: 'application/pdf' });
      mimeType = 'application/pdf';
      break;
      
    case 'docx':
      blob = new Blob([detailedContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
      
    case 'xlsx':
      const xlsContent = `Document,${fileName}\nType,Excel Spreadsheet\nProject,AWS GIS Infrastructure\nDate,${new Date().toLocaleDateString()}\n\nContent:\n${detailedContent}`;
      blob = new Blob([xlsContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
      
    case 'json':
      const jsonContent = {
        document: fileName,
        type: "JSON Data",
        project: "AWS GIS Infrastructure",
        timestamp: new Date().toISOString(),
        content: detailedContent,
        data: {
          records: Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            value: Math.random() * 100
          }))
        }
      };
      blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
      mimeType = 'application/json';
      break;
      
    case 'html':
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${fileName}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1 { color: #333; }
        .header { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${fileName}</h1>
        <p>AWS GIS Infrastructure Documentation</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="content">
        ${detailedContent}
    </div>
</body>
</html>`;
      blob = new Blob([htmlContent], { type: 'text/html' });
      mimeType = 'text/html';
      break;
      
    default:
      blob = new Blob([detailedContent], { type: 'text/plain' });
      mimeType = 'text/plain';
  }

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.${fileType.toLowerCase()}`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

// Generate random 2025 dates
export function generateRandom2025Date(): string {
  const start = new Date('2025-01-01');
  const end = new Date('2025-12-31');
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function generateRandom2025DateTime(): string {
  const start = new Date('2025-01-01');
  const end = new Date('2025-12-31');
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString();
}