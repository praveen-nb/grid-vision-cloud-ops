#!/usr/bin/env python3
"""
GIS System Integration Connector
Provides integration with utility GIS systems (ESRI ArcGIS, Autodesk, Bentley) for AWS modernization
"""

import asyncio
import json
import logging
import requests
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import boto3
from botocore.exceptions import ClientError
import psycopg2
from psycopg2.extras import RealDictCursor
import arcgis
from arcgis.gis import GIS
from arcgis.features import FeatureLayer
import geopandas as gpd
from shapely.geometry import Point, LineString, Polygon
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GISAsset:
    """Represents a utility asset in the GIS system"""
    asset_id: str
    asset_type: str  # TRANSFORMER, LINE, SWITCH, etc.
    asset_name: str
    latitude: float
    longitude: float
    voltage_level: float
    substation: str
    feeder: str
    installation_date: datetime
    manufacturer: str
    model: str
    status: str  # ACTIVE, MAINTENANCE, RETIRED
    attributes: Dict[str, Any]

@dataclass
class NetworkTopology:
    """Represents electrical network topology"""
    node_id: str
    node_type: str
    connected_assets: List[str]
    upstream_assets: List[str]
    downstream_assets: List[str]
    isolation_devices: List[str]
    switching_devices: List[str]

class ESRIArcGISConnector:
    """
    Connector for ESRI ArcGIS Enterprise systems
    Most common GIS platform in utility industry
    """
    
    def __init__(self, portal_url: str, username: str, password: str):
        self.portal_url = portal_url
        self.username = username
        self.password = password
        self.gis = None
        
    async def connect(self) -> bool:
        """Connect to ArcGIS Enterprise portal"""
        try:
            self.gis = GIS(self.portal_url, self.username, self.password)
            logger.info(f"Connected to ArcGIS Enterprise: {self.portal_url}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to ArcGIS: {e}")
            return False
    
    async def get_distribution_assets(self, service_name: str = "DistributionAssets") -> List[GISAsset]:
        """Retrieve distribution assets from ArcGIS feature service"""
        if not self.gis:
            await self.connect()
        
        try:
            # Find the feature service
            feature_service = self.gis.content.search(
                query=f"title:{service_name} AND type:Feature Service",
                item_type="Feature Service"
            )[0]
            
            # Get feature layers
            layers = feature_service.layers
            assets = []
            
            for layer in layers:
                if layer.properties.geometryType in ['esriGeometryPoint', 'esriGeometryPolyline']:
                    features = layer.query(where="1=1", out_fields="*")
                    
                    for feature in features.features:
                        attrs = feature.attributes
                        geom = feature.geometry
                        
                        # Extract coordinates
                        if geom['type'] == 'point':
                            lat, lon = geom['y'], geom['x']
                        elif geom['type'] == 'polyline':
                            # Use first point of line for location
                            lat, lon = geom['paths'][0][0][1], geom['paths'][0][0][0]
                        else:
                            continue
                        
                        asset = GISAsset(
                            asset_id=attrs.get('OBJECTID', str(feature.attributes.get('GlobalID', ''))),
                            asset_type=attrs.get('AssetType', 'UNKNOWN'),
                            asset_name=attrs.get('AssetName', ''),
                            latitude=lat,
                            longitude=lon,
                            voltage_level=float(attrs.get('VoltageLevel', 0)),
                            substation=attrs.get('Substation', ''),
                            feeder=attrs.get('Feeder', ''),
                            installation_date=datetime.now(timezone.utc),  # Simplified
                            manufacturer=attrs.get('Manufacturer', ''),
                            model=attrs.get('Model', ''),
                            status=attrs.get('Status', 'ACTIVE'),
                            attributes=attrs
                        )
                        assets.append(asset)
            
            logger.info(f"Retrieved {len(assets)} assets from ArcGIS")
            return assets
            
        except Exception as e:
            logger.error(f"Failed to retrieve assets from ArcGIS: {e}")
            return []
    
    async def get_network_topology(self, feeder_id: str) -> List[NetworkTopology]:
        """Get electrical network topology for a specific feeder"""
        if not self.gis:
            await self.connect()
        
        try:
            # Query network topology service
            network_service = self.gis.content.search(
                query="title:ElectricNetwork AND type:Feature Service",
                item_type="Feature Service"
            )[0]
            
            topology_layer = network_service.layers[0]  # Assuming first layer is topology
            
            features = topology_layer.query(
                where=f"FeederID = '{feeder_id}'",
                out_fields="*"
            )
            
            topology_nodes = []
            for feature in features.features:
                attrs = feature.attributes
                
                node = NetworkTopology(
                    node_id=attrs.get('NodeID', ''),
                    node_type=attrs.get('NodeType', ''),
                    connected_assets=attrs.get('ConnectedAssets', '').split(',') if attrs.get('ConnectedAssets') else [],
                    upstream_assets=attrs.get('UpstreamAssets', '').split(',') if attrs.get('UpstreamAssets') else [],
                    downstream_assets=attrs.get('DownstreamAssets', '').split(',') if attrs.get('DownstreamAssets') else [],
                    isolation_devices=attrs.get('IsolationDevices', '').split(',') if attrs.get('IsolationDevices') else [],
                    switching_devices=attrs.get('SwitchingDevices', '').split(',') if attrs.get('SwitchingDevices') else []
                )
                topology_nodes.append(node)
            
            logger.info(f"Retrieved topology for feeder {feeder_id}: {len(topology_nodes)} nodes")
            return topology_nodes
            
        except Exception as e:
            logger.error(f"Failed to retrieve network topology: {e}")
            return []

class PostGISConnector:
    """
    Direct PostGIS/PostgreSQL connector for utility spatial databases
    Common backend for many GIS systems
    """
    
    def __init__(self, host: str, port: int, database: str, username: str, password: str):
        self.host = host
        self.port = port
        self.database = database
        self.username = username
        self.password = password
        self.connection = None
    
    async def connect(self) -> bool:
        """Connect to PostGIS database"""
        try:
            self.connection = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.username,
                password=self.password
            )
            logger.info(f"Connected to PostGIS database: {self.database}")
            return True
        except psycopg2.Error as e:
            logger.error(f"Failed to connect to PostGIS: {e}")
            return False
    
    async def get_assets_by_region(self, bbox: Tuple[float, float, float, float]) -> List[GISAsset]:
        """Get assets within bounding box (min_lon, min_lat, max_lon, max_lat)"""
        if not self.connection:
            await self.connect()
        
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT 
                    asset_id,
                    asset_type,
                    asset_name,
                    ST_Y(geom) as latitude,
                    ST_X(geom) as longitude,
                    voltage_level,
                    substation,
                    feeder,
                    installation_date,
                    manufacturer,
                    model,
                    status,
                    attributes
                FROM utility_assets 
                WHERE ST_Intersects(
                    geom, 
                    ST_MakeEnvelope(%s, %s, %s, %s, 4326)
                )
                AND status = 'ACTIVE'
                """
                
                cursor.execute(query, bbox)
                rows = cursor.fetchall()
                
                assets = []
                for row in rows:
                    asset = GISAsset(
                        asset_id=row['asset_id'],
                        asset_type=row['asset_type'],
                        asset_name=row['asset_name'],
                        latitude=float(row['latitude']),
                        longitude=float(row['longitude']),
                        voltage_level=float(row['voltage_level']),
                        substation=row['substation'],
                        feeder=row['feeder'],
                        installation_date=row['installation_date'],
                        manufacturer=row['manufacturer'],
                        model=row['model'],
                        status=row['status'],
                        attributes=row['attributes'] if row['attributes'] else {}
                    )
                    assets.append(asset)
                
                logger.info(f"Retrieved {len(assets)} assets from PostGIS")
                return assets
                
        except psycopg2.Error as e:
            logger.error(f"PostGIS query failed: {e}")
            return []
    
    async def get_network_connectivity(self, asset_id: str) -> Dict[str, List[str]]:
        """Get network connectivity for a specific asset"""
        if not self.connection:
            await self.connect()
        
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Query network connectivity table
                query = """
                SELECT 
                    from_asset,
                    to_asset,
                    connection_type,
                    switch_state
                FROM network_connectivity 
                WHERE from_asset = %s OR to_asset = %s
                """
                
                cursor.execute(query, (asset_id, asset_id))
                rows = cursor.fetchall()
                
                connectivity = {
                    'upstream': [],
                    'downstream': [],
                    'switches': [],
                    'isolation_points': []
                }
                
                for row in rows:
                    if row['from_asset'] == asset_id:
                        connectivity['downstream'].append(row['to_asset'])
                    else:
                        connectivity['upstream'].append(row['from_asset'])
                    
                    if row['connection_type'] == 'SWITCH':
                        connectivity['switches'].append({
                            'switch_id': row['to_asset'] if row['from_asset'] == asset_id else row['from_asset'],
                            'state': row['switch_state']
                        })
                
                return connectivity
                
        except psycopg2.Error as e:
            logger.error(f"Connectivity query failed: {e}")
            return {}

class GISDataProcessor:
    """
    Process and enrich GIS data for AWS cloud storage and analytics
    """
    
    def __init__(self, s3_bucket: str, dynamodb_table: str):
        self.s3_client = boto3.client('s3')
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(dynamodb_table)
        self.s3_bucket = s3_bucket
    
    async def process_asset_data(self, assets: List[GISAsset]) -> bool:
        """Process GIS asset data and store in AWS"""
        try:
            # Convert to DataFrame for analysis
            assets_df = pd.DataFrame([asdict(asset) for asset in assets])
            
            # Create GeoDataFrame for spatial operations
            geometry = [Point(asset.longitude, asset.latitude) for asset in assets]
            gdf = gpd.GeoDataFrame(assets_df, geometry=geometry)
            
            # Store raw data in S3
            await self._store_in_s3(assets_df, 'assets/raw/')
            
            # Store processed data in DynamoDB
            await self._store_assets_in_dynamodb(assets)
            
            # Generate spatial analytics
            await self._generate_spatial_analytics(gdf)
            
            logger.info(f"Processed {len(assets)} GIS assets")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process asset data: {e}")
            return False
    
    async def _store_in_s3(self, df: pd.DataFrame, prefix: str):
        """Store DataFrame in S3 as Parquet"""
        try:
            # Convert to Parquet for efficient storage
            parquet_buffer = df.to_parquet(index=False)
            
            key = f"{prefix}assets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                self.s3_client.put_object,
                Bucket=self.s3_bucket,
                Key=key,
                Body=parquet_buffer
            )
            
            logger.debug(f"Stored asset data in S3: s3://{self.s3_bucket}/{key}")
            
        except ClientError as e:
            logger.error(f"S3 storage failed: {e}")
    
    async def _store_assets_in_dynamodb(self, assets: List[GISAsset]):
        """Store assets in DynamoDB for fast lookup"""
        try:
            with self.table.batch_writer() as batch:
                for asset in assets:
                    item = {
                        'asset_id': asset.asset_id,
                        'asset_type': asset.asset_type,
                        'asset_name': asset.asset_name,
                        'latitude': str(asset.latitude),  # DynamoDB doesn't support float
                        'longitude': str(asset.longitude),
                        'voltage_level': str(asset.voltage_level),
                        'substation': asset.substation,
                        'feeder': asset.feeder,
                        'installation_date': asset.installation_date.isoformat(),
                        'manufacturer': asset.manufacturer,
                        'model': asset.model,
                        'status': asset.status,
                        'last_updated': datetime.now(timezone.utc).isoformat(),
                        'ttl': int((datetime.now(timezone.utc).timestamp() + 31536000))  # 1 year TTL
                    }
                    
                    # Add custom attributes
                    for key, value in asset.attributes.items():
                        if key not in item:  # Don't overwrite existing keys
                            item[f"attr_{key}"] = str(value)
                    
                    batch.put_item(Item=item)
            
            logger.debug(f"Stored {len(assets)} assets in DynamoDB")
            
        except ClientError as e:
            logger.error(f"DynamoDB storage failed: {e}")
    
    async def _generate_spatial_analytics(self, gdf: gpd.GeoDataFrame):
        """Generate spatial analytics from GIS data"""
        try:
            # Asset density analysis
            asset_counts = gdf['asset_type'].value_counts()
            
            # Substation coverage analysis
            substation_coverage = gdf.groupby('substation').agg({
                'asset_id': 'count',
                'voltage_level': 'mean',
                'latitude': ['min', 'max'],
                'longitude': ['min', 'max']
            })
            
            # Generate summary report
            analytics = {
                'total_assets': len(gdf),
                'asset_type_distribution': asset_counts.to_dict(),
                'substation_count': len(gdf['substation'].unique()),
                'voltage_levels': gdf['voltage_level'].unique().tolist(),
                'geographic_bounds': {
                    'min_lat': float(gdf['latitude'].min()),
                    'max_lat': float(gdf['latitude'].max()),
                    'min_lon': float(gdf['longitude'].min()),
                    'max_lon': float(gdf['longitude'].max())
                },
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Store analytics in S3
            analytics_json = json.dumps(analytics, indent=2)
            key = f"analytics/spatial_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                self.s3_client.put_object,
                Bucket=self.s3_bucket,
                Key=key,
                Body=analytics_json,
                ContentType='application/json'
            )
            
            logger.info(f"Generated spatial analytics: {analytics['total_assets']} assets across {analytics['substation_count']} substations")
            
        except Exception as e:
            logger.error(f"Spatial analytics generation failed: {e}")

class GISIntegrationManager:
    """
    Main manager for GIS system integration
    Coordinates data collection from multiple GIS sources
    """
    
    def __init__(self, s3_bucket: str, dynamodb_table: str):
        self.processor = GISDataProcessor(s3_bucket, dynamodb_table)
        self.esri_connector = None
        self.postgis_connector = None
        
    def add_esri_connection(self, portal_url: str, username: str, password: str):
        """Add ESRI ArcGIS connection"""
        self.esri_connector = ESRIArcGISConnector(portal_url, username, password)
        logger.info("Added ESRI ArcGIS connector")
    
    def add_postgis_connection(self, host: str, port: int, database: str, username: str, password: str):
        """Add PostGIS database connection"""
        self.postgis_connector = PostGISConnector(host, port, database, username, password)
        logger.info("Added PostGIS connector")
    
    async def sync_all_assets(self) -> int:
        """Synchronize assets from all configured GIS sources"""
        all_assets = []
        
        # Get assets from ESRI ArcGIS
        if self.esri_connector:
            esri_assets = await self.esri_connector.get_distribution_assets()
            all_assets.extend(esri_assets)
            logger.info(f"Retrieved {len(esri_assets)} assets from ESRI ArcGIS")
        
        # Get assets from PostGIS
        if self.postgis_connector:
            # Example bounding box for entire service territory
            bbox = (-122.5, 37.7, -122.3, 37.8)  # San Francisco area example
            postgis_assets = await self.postgis_connector.get_assets_by_region(bbox)
            all_assets.extend(postgis_assets)
            logger.info(f"Retrieved {len(postgis_assets)} assets from PostGIS")
        
        # Process all collected assets
        if all_assets:
            await self.processor.process_asset_data(all_assets)
        
        logger.info(f"Total assets synchronized: {len(all_assets)}")
        return len(all_assets)
    
    async def get_outage_impact_analysis(self, outage_location: Tuple[float, float], radius_km: float = 5.0) -> Dict[str, Any]:
        """Analyze potential outage impact using GIS data"""
        try:
            impact_analysis = {
                'affected_assets': [],
                'estimated_customers': 0,
                'critical_facilities': [],
                'restoration_complexity': 'LOW'
            }
            
            # Get assets within radius of outage
            if self.postgis_connector:
                # Calculate bounding box from radius
                lat, lon = outage_location
                delta = radius_km / 111.0  # Rough conversion to degrees
                bbox = (lon - delta, lat - delta, lon + delta, lat + delta)
                
                nearby_assets = await self.postgis_connector.get_assets_by_region(bbox)
                impact_analysis['affected_assets'] = [asset.asset_id for asset in nearby_assets]
                
                # Estimate customer impact based on asset types
                for asset in nearby_assets:
                    if asset.asset_type == 'TRANSFORMER':
                        impact_analysis['estimated_customers'] += 150  # Average customers per transformer
                    elif asset.asset_type == 'SUBSTATION':
                        impact_analysis['estimated_customers'] += 5000
                    elif asset.asset_type == 'FEEDER':
                        impact_analysis['estimated_customers'] += 800
                
                # Determine restoration complexity
                transformer_count = sum(1 for asset in nearby_assets if asset.asset_type == 'TRANSFORMER')
                if transformer_count > 10:
                    impact_analysis['restoration_complexity'] = 'HIGH'
                elif transformer_count > 5:
                    impact_analysis['restoration_complexity'] = 'MEDIUM'
            
            return impact_analysis
            
        except Exception as e:
            logger.error(f"Outage impact analysis failed: {e}")
            return {}

# Example usage
async def main():
    """Example GIS integration usage"""
    
    # Initialize GIS integration manager
    manager = GISIntegrationManager(
        s3_bucket='utility-gis-modernization-gis-data-lake',
        dynamodb_table='utility-gis-modernization-grid-assets'
    )
    
    # Add GIS connections
    manager.add_esri_connection(
        portal_url="https://gis.utility.com/portal",
        username="gis_user",
        password="secure_password"
    )
    
    manager.add_postgis_connection(
        host="gis-db.utility.com",
        port=5432,
        database="utility_gis",
        username="postgres",
        password="postgres_password"
    )
    
    # Synchronize all assets
    total_assets = await manager.sync_all_assets()
    logger.info(f"Synchronized {total_assets} total assets")
    
    # Example outage impact analysis
    outage_location = (37.7749, -122.4194)  # San Francisco
    impact = await manager.get_outage_impact_analysis(outage_location, radius_km=2.0)
    logger.info(f"Outage impact analysis: {impact}")

if __name__ == "__main__":
    print("GIS Integration Connector for AWS Modernization")
    print("Supports ESRI ArcGIS Enterprise and PostGIS databases")
    print("Enables spatial analytics and outage impact analysis")
    print("-" * 60)
    
    # Run demo
    # asyncio.run(main())
    
    print("Ready for production deployment with utility GIS systems")