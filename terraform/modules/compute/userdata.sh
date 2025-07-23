#!/bin/bash
yum update -y
yum install -y amazon-cloudwatch-agent docker

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Node.js for the application
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Create application directory
mkdir -p /opt/${project_name}
cd /opt/${project_name}

# Create a simple health check endpoint
cat << 'EOF' > /opt/${project_name}/health-server.js
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: '${environment}',
      project: '${project_name}'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 80;
server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
EOF

# Create systemd service for the health server
cat << 'EOF' > /etc/systemd/system/health-server.service
[Unit]
Description=Health Check Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/${project_name}
ExecStart=/usr/bin/node health-server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Start the health server
systemctl daemon-reload
systemctl enable health-server
systemctl start health-server

# Configure CloudWatch agent
cat << 'EOF' > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "metrics": {
    "namespace": "${project_name}/${environment}",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60,
        "totalcpu": false
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "diskio": {
        "measurement": ["io_time"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/messages",
            "log_group_name": "/aws/ec2/${project_name}-${environment}",
            "log_stream_name": "{instance_id}/var/log/messages"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s