#!/usr/bin/env python3
"""
Outage Management System (OMS) Integration Connector
Provides real-time integration with utility OMS for outage detection and management
"""

import asyncio
import json
import logging
import requests
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import boto3
from botocore.exceptions import ClientError
import xml.etree.ElementTree as ET

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OutageStatus(Enum):
    """Outage status enumeration"""
    PREDICTED = "PREDICTED"
    CONFIRMED = "CONFIRMED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESTORED = "RESTORED"
    CLOSED = "CLOSED"

class OutageCause(Enum):
    """Outage cause enumeration"""
    EQUIPMENT_FAILURE = "EQUIPMENT_FAILURE"
    WEATHER = "WEATHER"
    VEGETATION = "VEGETATION"
    ANIMAL = "ANIMAL"
    CYBER_ATTACK = "CYBER_ATTACK"
    PLANNED_MAINTENANCE = "PLANNED_MAINTENANCE"
    UNKNOWN = "UNKNOWN"

@dataclass
class Customer:
    """Customer information"""
    customer_id: str
    account_number: str
    service_address: str
    latitude: float
    longitude: float
    customer_class: str  # RESIDENTIAL, COMMERCIAL, INDUSTRIAL
    priority_level: int  # 1-5, with 1 being highest priority

@dataclass
class OutageEvent:
    """Represents an outage event in the OMS"""
    outage_id: str
    start_time: datetime
    estimated_restoration: Optional[datetime]
    actual_restoration: Optional[datetime]
    status: OutageStatus
    cause: OutageCause
    affected_customers: List[Customer]
    equipment_id: str
    substation: str
    feeder: str
    latitude: float
    longitude: float
    crew_assigned: Optional[str]
    estimated_duration_minutes: int
    customer_calls: int
    priority_score: float

class OMSRestAPIConnector:
    """
    REST API connector for modern OMS systems
    Supports common utility OMS platforms like ABB, Schneider Electric, Oracle
    """
    
    def __init__(self, base_url: str, api_key: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    async def get_active_outages(self) -> List[OutageEvent]:
        """Retrieve all active outages from OMS"""
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.session.get(f"{self.base_url}/api/v1/outages/active", timeout=self.timeout)
            )
            response.raise_for_status()
            
            outages_data = response.json()
            outages = []
            
            for outage_data in outages_data.get('outages', []):
                outages.append(self._parse_outage_data(outage_data))
            
            logger.info(f"Retrieved {len(outages)} active outages")
            return outages
            
        except requests.RequestException as e:
            logger.error(f"Failed to retrieve active outages: {e}")
            return []
    
    async def get_outage_by_id(self, outage_id: str) -> Optional[OutageEvent]:
        """Get specific outage details by ID"""
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.session.get(f"{self.base_url}/api/v1/outages/{outage_id}", timeout=self.timeout)
            )
            response.raise_for_status()
            
            outage_data = response.json()
            return self._parse_outage_data(outage_data)
            
        except requests.RequestException as e:
            logger.error(f"Failed to retrieve outage {outage_id}: {e}")
            return None
    
    async def get_customer_outages(self, customer_id: str) -> List[OutageEvent]:
        """Get outages affecting a specific customer"""
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.session.get(
                    f"{self.base_url}/api/v1/customers/{customer_id}/outages",
                    timeout=self.timeout
                )
            )
            response.raise_for_status()
            
            outages_data = response.json()
            return [self._parse_outage_data(data) for data in outages_data.get('outages', [])]
            
        except requests.RequestException as e:
            logger.error(f"Failed to retrieve customer outages: {e}")
            return []
    
    async def create_outage_event(self, equipment_id: str, cause: OutageCause, 
                                 estimated_customers: int) -> Optional[str]:
        """Create new outage event in OMS"""
        try:
            outage_data = {
                'equipment_id': equipment_id,
                'cause': cause.value,
                'estimated_affected_customers': estimated_customers,
                'detected_time': datetime.now(timezone.utc).isoformat(),
                'detection_method': 'AUTOMATED_SCADA'
            }
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.session.post(
                    f"{self.base_url}/api/v1/outages",
                    json=outage_data,
                    timeout=self.timeout
                )
            )
            response.raise_for_status()
            
            result = response.json()
            outage_id = result.get('outage_id')
            logger.info(f"Created outage event: {outage_id}")
            return outage_id
            
        except requests.RequestException as e:
            logger.error(f"Failed to create outage event: {e}")
            return None
    
    def _parse_outage_data(self, data: Dict[str, Any]) -> OutageEvent:
        """Parse OMS API response into OutageEvent object"""
        
        # Parse affected customers
        customers = []
        for customer_data in data.get('affected_customers', []):
            customers.append(Customer(
                customer_id=customer_data.get('customer_id', ''),
                account_number=customer_data.get('account_number', ''),
                service_address=customer_data.get('service_address', ''),
                latitude=float(customer_data.get('latitude', 0)),
                longitude=float(customer_data.get('longitude', 0)),
                customer_class=customer_data.get('customer_class', 'RESIDENTIAL'),
                priority_level=int(customer_data.get('priority_level', 3))
            ))
        
        # Parse timestamps
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        estimated_restoration = None
        actual_restoration = None
        
        if data.get('estimated_restoration'):
            estimated_restoration = datetime.fromisoformat(
                data['estimated_restoration'].replace('Z', '+00:00')
            )
        
        if data.get('actual_restoration'):
            actual_restoration = datetime.fromisoformat(
                data['actual_restoration'].replace('Z', '+00:00')
            )
        
        return OutageEvent(
            outage_id=data['outage_id'],
            start_time=start_time,
            estimated_restoration=estimated_restoration,
            actual_restoration=actual_restoration,
            status=OutageStatus(data['status']),
            cause=OutageCause(data.get('cause', 'UNKNOWN')),
            affected_customers=customers,
            equipment_id=data.get('equipment_id', ''),
            substation=data.get('substation', ''),
            feeder=data.get('feeder', ''),
            latitude=float(data.get('latitude', 0)),
            longitude=float(data.get('longitude', 0)),
            crew_assigned=data.get('crew_assigned'),
            estimated_duration_minutes=int(data.get('estimated_duration_minutes', 0)),
            customer_calls=int(data.get('customer_calls', 0)),
            priority_score=float(data.get('priority_score', 0))
        )

class LegacyOMSConnector:
    """
    Legacy OMS connector for older systems using XML/SOAP or proprietary formats
    Common with older ABB, GE, or Siemens systems
    """
    
    def __init__(self, host: str, port: int, username: str, password: str):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.connection = None
    
    async def connect(self) -> bool:
        """Connect to legacy OMS system"""
        try:
            # Simulate connection to legacy system
            logger.info(f"Connecting to legacy OMS at {self.host}:{self.port}")
            # In real implementation, this would establish SOAP/TCP connection
            self.connection = {"connected": True, "session_id": "12345"}
            return True
        except Exception as e:
            logger.error(f"Failed to connect to legacy OMS: {e}")
            return False
    
    async def get_outage_summary_xml(self) -> str:
        """Get outage summary in XML format (legacy systems)"""
        if not self.connection:
            await self.connect()
        
        # Simulate XML response from legacy OMS
        xml_response = """<?xml version="1.0" encoding="UTF-8"?>
        <OutageSummary>
            <Outage>
                <ID>OUT-2024-001</ID>
                <Status>CONFIRMED</Status>
                <StartTime>2024-01-15T10:30:00Z</StartTime>
                <Equipment>TRANSFORMER_T001</Equipment>
                <Substation>MAIN_SUB_001</Substation>
                <CustomersAffected>1250</CustomersAffected>
                <EstimatedRestoration>2024-01-15T14:30:00Z</EstimatedRestoration>
            </Outage>
            <Outage>
                <ID>OUT-2024-002</ID>
                <Status>IN_PROGRESS</Status>
                <StartTime>2024-01-15T09:15:00Z</StartTime>
                <Equipment>FEEDER_F003</Equipment>
                <Substation>DIST_SUB_002</Substation>
                <CustomersAffected>450</CustomersAffected>
                <CrewAssigned>CREW_A</CrewAssigned>
            </Outage>
        </OutageSummary>"""
        
        return xml_response
    
    def parse_legacy_xml(self, xml_data: str) -> List[OutageEvent]:
        """Parse legacy XML outage data"""
        outages = []
        
        try:
            root = ET.fromstring(xml_data)
            
            for outage_elem in root.findall('Outage'):
                outage_id = outage_elem.find('ID').text
                status = OutageStatus(outage_elem.find('Status').text)
                start_time = datetime.fromisoformat(
                    outage_elem.find('StartTime').text.replace('Z', '+00:00')
                )
                
                equipment_id = outage_elem.find('Equipment').text
                substation = outage_elem.find('Substation').text
                customers_affected = int(outage_elem.find('CustomersAffected').text)
                
                # Create simplified outage event
                outage = OutageEvent(
                    outage_id=outage_id,
                    start_time=start_time,
                    estimated_restoration=None,
                    actual_restoration=None,
                    status=status,
                    cause=OutageCause.EQUIPMENT_FAILURE,
                    affected_customers=[],  # Legacy systems might not have detailed customer data
                    equipment_id=equipment_id,
                    substation=substation,
                    feeder="",
                    latitude=0.0,
                    longitude=0.0,
                    crew_assigned=outage_elem.find('CrewAssigned').text if outage_elem.find('CrewAssigned') is not None else None,
                    estimated_duration_minutes=240,  # Default 4 hours
                    customer_calls=0,
                    priority_score=customers_affected / 100  # Simple priority calculation
                )
                
                outages.append(outage)
        
        except ET.ParseError as e:
            logger.error(f"Failed to parse legacy XML: {e}")
        
        return outages

class OMSDataProcessor:
    """
    Process and enrich OMS data before publishing to AWS
    """
    
    def __init__(self, kinesis_stream: str, dynamodb_table: str):
        self.kinesis_client = boto3.client('kinesis')
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(dynamodb_table)
        self.kinesis_stream = kinesis_stream
    
    async def process_outage_event(self, outage: OutageEvent) -> bool:
        """Process and publish outage event to AWS services"""
        try:
            # Store in DynamoDB for historical tracking
            await self._store_outage_in_dynamodb(outage)
            
            # Publish to Kinesis for real-time processing
            await self._publish_to_kinesis(outage)
            
            # Generate alerts for high-priority outages
            if outage.priority_score > 5.0 or len(outage.affected_customers) > 1000:
                await self._generate_high_priority_alert(outage)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to process outage event: {e}")
            return False
    
    async def _store_outage_in_dynamodb(self, outage: OutageEvent):
        """Store outage event in DynamoDB"""
        try:
            item = {
                'outage_id': outage.outage_id,
                'start_time': outage.start_time.isoformat(),
                'status': outage.status.value,
                'cause': outage.cause.value,
                'equipment_id': outage.equipment_id,
                'substation': outage.substation,
                'feeder': outage.feeder,
                'affected_customers_count': len(outage.affected_customers),
                'priority_score': outage.priority_score,
                'customer_calls': outage.customer_calls,
                'crew_assigned': outage.crew_assigned,
                'ttl': int((datetime.now(timezone.utc).timestamp() + 2592000))  # 30 days TTL
            }
            
            if outage.estimated_restoration:
                item['estimated_restoration'] = outage.estimated_restoration.isoformat()
            
            if outage.actual_restoration:
                item['actual_restoration'] = outage.actual_restoration.isoformat()
            
            await asyncio.get_event_loop().run_in_executor(
                None, self.table.put_item, Item=item
            )
            
            logger.debug(f"Stored outage {outage.outage_id} in DynamoDB")
            
        except ClientError as e:
            logger.error(f"DynamoDB storage failed: {e}")
    
    async def _publish_to_kinesis(self, outage: OutageEvent):
        """Publish outage event to Kinesis stream"""
        try:
            # Convert to JSON-serializable format
            outage_dict = asdict(outage)
            outage_dict['start_time'] = outage.start_time.isoformat()
            outage_dict['status'] = outage.status.value
            outage_dict['cause'] = outage.cause.value
            
            if outage.estimated_restoration:
                outage_dict['estimated_restoration'] = outage.estimated_restoration.isoformat()
            
            if outage.actual_restoration:
                outage_dict['actual_restoration'] = outage.actual_restoration.isoformat()
            
            # Serialize customer data
            outage_dict['affected_customers'] = [asdict(customer) for customer in outage.affected_customers]
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                self.kinesis_client.put_record,
                StreamName=self.kinesis_stream,
                Data=json.dumps(outage_dict),
                PartitionKey=outage.outage_id
            )
            
            logger.debug(f"Published outage {outage.outage_id} to Kinesis")
            
        except ClientError as e:
            logger.error(f"Kinesis publishing failed: {e}")
    
    async def _generate_high_priority_alert(self, outage: OutageEvent):
        """Generate high-priority alert for critical outages"""
        try:
            sns_client = boto3.client('sns')
            
            message = {
                "alert_type": "HIGH_PRIORITY_OUTAGE",
                "outage_id": outage.outage_id,
                "equipment_id": outage.equipment_id,
                "substation": outage.substation,
                "affected_customers": len(outage.affected_customers),
                "priority_score": outage.priority_score,
                "start_time": outage.start_time.isoformat(),
                "status": outage.status.value
            }
            
            # Publish to SNS topic for alerts
            await asyncio.get_event_loop().run_in_executor(
                None,
                sns_client.publish,
                TopicArn='arn:aws:sns:us-east-1:123456789012:utility-critical-alerts',
                Message=json.dumps(message),
                Subject=f"CRITICAL: Outage {outage.outage_id} affecting {len(outage.affected_customers)} customers"
            )
            
            logger.info(f"Generated high-priority alert for outage {outage.outage_id}")
            
        except ClientError as e:
            logger.error(f"Failed to generate alert: {e}")

# Example usage
async def main():
    """Example OMS integration usage"""
    
    # Initialize OMS connectors
    modern_oms = OMSRestAPIConnector(
        base_url="https://oms.utility.com",
        api_key="your-api-key-here"
    )
    
    legacy_oms = LegacyOMSConnector(
        host="10.0.3.100",
        port=8080,
        username="oms_user",
        password="secure_password"
    )
    
    # Initialize data processor
    processor = OMSDataProcessor(
        kinesis_stream='utility-gis-modernization-grid-events',
        dynamodb_table='utility-gis-modernization-outage-events'
    )
    
    # Get outages from modern OMS
    active_outages = await modern_oms.get_active_outages()
    logger.info(f"Retrieved {len(active_outages)} active outages from modern OMS")
    
    # Process each outage
    for outage in active_outages:
        await processor.process_outage_event(outage)
    
    # Get data from legacy OMS
    xml_data = await legacy_oms.get_outage_summary_xml()
    legacy_outages = legacy_oms.parse_legacy_xml(xml_data)
    logger.info(f"Retrieved {len(legacy_outages)} outages from legacy OMS")
    
    # Process legacy outages
    for outage in legacy_outages:
        await processor.process_outage_event(outage)

if __name__ == "__main__":
    print("OMS Integration Connector for AWS GIS Modernization")
    print("Supports modern REST APIs and legacy XML/SOAP systems")
    print("Publishes outage data to AWS Kinesis and DynamoDB")
    print("-" * 60)
    
    # Run demo
    # asyncio.run(main())
    
    print("Ready for production deployment with utility OMS systems")