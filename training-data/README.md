# Training Data Schemas and Samples

This repository contains comprehensive training data schemas and sample datasets for machine learning models used in electrical utility grid operations.

## Repository Structure

```
training-data/
├── grid-anomaly-detection/
│   ├── schemas/
│   │   ├── sensor_data_schema.json
│   │   ├── anomaly_labels_schema.json
│   │   └── feature_schema.json
│   ├── samples/
│   │   ├── normal_operation_sample.csv
│   │   ├── voltage_anomaly_sample.csv
│   │   └── equipment_failure_sample.csv
│   └── validation/
│       ├── data_quality_checks.py
│       └── schema_validation.py
├── predictive-maintenance/
│   ├── schemas/
│   │   ├── equipment_health_schema.json
│   │   ├── maintenance_history_schema.json
│   │   └── environmental_data_schema.json
│   ├── samples/
│   │   ├── transformer_health_sample.csv
│   │   ├── maintenance_records_sample.csv
│   │   └── environmental_conditions_sample.csv
│   └── validation/
├── load-forecasting/
│   ├── schemas/
│   │   ├── historical_load_schema.json
│   │   ├── weather_data_schema.json
│   │   └── economic_indicators_schema.json
│   ├── samples/
│   │   ├── hourly_load_sample.csv
│   │   ├── weather_data_sample.csv
│   │   └── economic_data_sample.csv
│   └── validation/
└── shared/
    ├── common_schemas/
    │   ├── timestamp_schema.json
    │   ├── location_schema.json
    │   └── quality_indicators_schema.json
    └── utilities/
        ├── data_validator.py
        ├── schema_generator.py
        └── quality_metrics.py
```

## Data Quality Standards

### Quality Metrics
- **Completeness**: Minimum 95% non-null values for critical fields
- **Accuracy**: Data validation against known operational ranges
- **Consistency**: Schema compliance across all datasets
- **Timeliness**: Maximum 5-minute latency for real-time data
- **Validity**: Format and type validation for all fields

### Data Governance
- All data is anonymized and contains no personally identifiable information
- NERC CIP compliance maintained through data classification
- Regular audits ensure data quality and security standards
- Version control tracks all schema changes

## Schema Categories

### 1. Grid Anomaly Detection
**Purpose**: Training data for detecting electrical grid anomalies and security threats

**Key Features**:
- Real-time sensor measurements (voltage, current, power, frequency)
- Equipment metadata and location information
- Anomaly labels and severity classifications
- Data quality indicators and sensor health status

### 2. Predictive Maintenance
**Purpose**: Equipment failure prediction and maintenance optimization

**Key Features**:
- Equipment health indicators and performance metrics
- Historical maintenance records and failure patterns
- Environmental conditions affecting equipment
- Asset lifecycle and degradation patterns

### 3. Load Forecasting
**Purpose**: Demand prediction and grid capacity planning

**Key Features**:
- Historical load patterns and consumption data
- Weather data correlations (temperature, humidity, wind)
- Economic indicators and seasonal patterns
- Special events and holiday adjustments

## Usage Guidelines

### Data Access
1. Clone the repository to your development environment
2. Validate schemas using provided validation tools
3. Use sample data for model development and testing
4. Follow data governance policies for production use

### Schema Validation
```python
from validation.schema_validation import validate_data
from schemas import sensor_data_schema

# Validate your data against the schema
is_valid, errors = validate_data(your_data, sensor_data_schema)
if not is_valid:
    print(f"Validation errors: {errors}")
```

### Data Quality Checks
```python
from validation.data_quality_checks import run_quality_checks

# Run comprehensive quality checks
quality_report = run_quality_checks(your_dataset)
print(f"Data quality score: {quality_report.overall_score}")
```

## Integration with ML Pipeline

### SageMaker Integration
- Schemas are compatible with SageMaker Feature Store
- Sample data can be used for model training and validation
- Automated data pipeline validates incoming data against schemas

### Real-time Processing
- Kinesis Data Streams consume data matching these schemas
- Lambda functions validate data quality in real-time
- Non-compliant data is flagged and routed for manual review

## Compliance and Security

### NERC CIP Compliance
- All schemas include required security metadata
- Data classification tags ensure proper handling
- Audit trails track all data access and modifications

### Privacy Protection
- No personally identifiable information (PII)
- Customer account numbers are hashed
- Location data is anonymized to substation level

## Contributing

### Adding New Schemas
1. Create schema following JSON Schema Draft 7 standard
2. Include comprehensive field descriptions and validation rules
3. Provide sample data demonstrating all schema features
4. Add validation tests and quality checks

### Schema Versioning
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Maintain backward compatibility when possible
- Document breaking changes in CHANGELOG.md

## Support and Documentation

For additional information and support:
- Technical documentation: `/docs/technical/`
- API reference: `/docs/api/`
- Training materials: `/docs/training/`
- Contact: ml-ops-team@utility.com

## License

This training data and associated schemas are proprietary and confidential. 
Usage is restricted to authorized personnel only.