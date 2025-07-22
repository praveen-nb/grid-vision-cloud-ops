// Document download utility
export function downloadDocument(fileName: string, fileType: string, content?: string) {
  // Generate mock document content based on file type
  let blob: Blob;
  let mimeType: string;
  
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
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${fileName}) Tj
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
      const docContent = `Document: ${fileName}\n\nThis is a sample DOCX document for the AWS GIS Infrastructure project.\n\nGenerated on: ${new Date().toLocaleDateString()}`;
      blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
      
    case 'xlsx':
      const xlsContent = `Document,${fileName}\nType,Excel Spreadsheet\nProject,AWS GIS Infrastructure\nDate,${new Date().toLocaleDateString()}`;
      blob = new Blob([xlsContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
      
    case 'json':
      const jsonContent = {
        document: fileName,
        type: "JSON Data",
        project: "AWS GIS Infrastructure",
        timestamp: new Date().toISOString(),
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
      
    case 'png':
      // Create a simple PNG data URL (1x1 pixel transparent PNG)
      const pngData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const binaryString = atob(pngData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: 'image/png' });
      mimeType = 'image/png';
      break;
      
    case 'html':
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${fileName}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .header { background: #f4f4f4; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${fileName}</h1>
        <p>AWS GIS Infrastructure Documentation</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    <h2>Overview</h2>
    <p>This document contains comprehensive information about the AWS GIS Infrastructure implementation.</p>
    <h2>Contents</h2>
    <ul>
        <li>System Architecture</li>
        <li>Configuration Details</li>
        <li>Operational Procedures</li>
        <li>Security Guidelines</li>
    </ul>
</body>
</html>`;
      blob = new Blob([htmlContent], { type: 'text/html' });
      mimeType = 'text/html';
      break;
      
    case 'log':
      const logContent = Array.from({ length: 1000 }, (_, i) => {
        const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();
        const levels = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
        const level = levels[Math.floor(Math.random() * levels.length)];
        return `${timestamp} [${level}] ${fileName} - System operation ${i + 1}`;
      }).join('\n');
      blob = new Blob([logContent], { type: 'text/plain' });
      mimeType = 'text/plain';
      break;
      
    case 'zip':
      // Create a simple text file representing a ZIP
      const zipContent = `PK Archive: ${fileName}\nContents: Multiple files related to AWS GIS Infrastructure\nGenerated: ${new Date().toLocaleDateString()}`;
      blob = new Blob([zipContent], { type: 'application/zip' });
      mimeType = 'application/zip';
      break;
      
    case 'vsdx':
      const vsdxContent = `Visio Document: ${fileName}\nDiagram Type: Network Topology\nProject: AWS GIS Infrastructure\nCreated: ${new Date().toLocaleDateString()}`;
      blob = new Blob([vsdxContent], { type: 'application/vnd.visio' });
      mimeType = 'application/vnd.visio';
      break;
      
    case 'ipynb':
      const notebookContent = {
        nbformat: 4,
        nbformat_minor: 2,
        metadata: {
          title: fileName,
          created: new Date().toISOString()
        },
        cells: [
          {
            cell_type: "markdown",
            metadata: {},
            source: [`# ${fileName}\n\nAWS GIS Infrastructure - Machine Learning Model\n\nGenerated: ${new Date().toLocaleDateString()}`]
          },
          {
            cell_type: "code",
            execution_count: 1,
            metadata: {},
            outputs: [],
            source: ["import pandas as pd\nimport numpy as np\n\n# Sample ML code for predictive maintenance\nprint('Model initialized')"]
          }
        ]
      };
      blob = new Blob([JSON.stringify(notebookContent, null, 2)], { type: 'application/x-ipynb+json' });
      mimeType = 'application/x-ipynb+json';
      break;
      
    default:
      const defaultContent = `Document: ${fileName}\nType: ${fileType}\nProject: AWS GIS Infrastructure\nGenerated: ${new Date().toLocaleDateString()}`;
      blob = new Blob([defaultContent], { type: 'text/plain' });
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