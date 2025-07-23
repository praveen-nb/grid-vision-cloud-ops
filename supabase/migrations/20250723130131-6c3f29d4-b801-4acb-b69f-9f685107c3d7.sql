-- Add sample grid metrics data
INSERT INTO grid_metrics (connection_id, metric_type, value, unit) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'voltage', 48750.5, 'V'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'frequency', 59.98, 'Hz'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'power', 2450.8, 'MW'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'load', 85.3, '%'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'voltage', 48695.2, 'V'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'frequency', 60.01, 'Hz'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'power', 2468.1, 'MW'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'load', 87.1, '%');

-- Add sample grid alerts
INSERT INTO grid_alerts (connection_id, alert_type, severity, message) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'voltage_fluctuation', 'medium', 'Voltage fluctuation detected on Line 4A - Monitor closely'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'maintenance_due', 'low', 'Transformer T-34 scheduled maintenance due in 7 days'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'load_high', 'high', 'High load detected on Distribution Circuit DC-12 - 92% capacity');

-- Add sample predictive analytics
INSERT INTO predictive_analytics (connection_id, asset_id, prediction_type, probability, predicted_date, model_version, input_features) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'TRANS_T34', 'equipment_failure', 0.85, NOW() + INTERVAL '30 days', 'v2.1.0', '{"temperature": 85, "vibration": 0.45, "age_years": 15}'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'LINE_4A', 'maintenance_required', 0.72, NOW() + INTERVAL '14 days', 'v2.1.0', '{"insulation_resistance": 450, "weather_exposure": 0.8, "last_maintenance_days": 180}'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'BREAKER_CB12', 'performance_degradation', 0.68, NOW() + INTERVAL '45 days', 'v2.1.0', '{"operation_count": 8500, "contact_resistance": 12.5, "arc_duration": 0.15}');

-- Add sample field operations
INSERT INTO field_operations (connection_id, technician_id, operation_type, status, description, location, priority) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', '7dcd7e71-e5a0-473f-a7fa-89bc08a26389', 'inspection', 'in_progress', 'Routine quarterly inspection of Substation Alpha', '{"lat": 40.7128, "lng": -74.0060, "address": "123 Grid St, New York, NY"}', 'medium'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', '7dcd7e71-e5a0-473f-a7fa-89bc08a26389', 'maintenance', 'assigned', 'Replace aging insulators on transmission line TL-45', '{"lat": 40.7580, "lng": -73.9855, "address": "Central Park Transmission, New York, NY"}', 'high'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', '7dcd7e71-e5a0-473f-a7fa-89bc08a26389', 'emergency_repair', 'completed', 'Emergency repair of damaged conductor', '{"lat": 40.6892, "lng": -74.0445, "address": "Brooklyn Grid Station, Brooklyn, NY"}', 'high');

-- Add sample environmental data
INSERT INTO environmental_data (connection_id, data_type, coordinates, description, severity_level, source) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'weather', '{"lat": 40.7128, "lng": -74.0060}', 'High wind conditions affecting transmission lines', 'medium', 'WeatherAPI'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'temperature', '{"lat": 40.7128, "lng": -74.0060}', 'Extreme heat warning - increased cooling load expected', 'high', 'NOAA'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'seismic', '{"lat": 40.7128, "lng": -74.0060}', 'Minor seismic activity detected - infrastructure monitoring initiated', 'low', 'USGS');

-- Add sample security events
INSERT INTO security_events (connection_id, event_type, severity, event_details, source_ip, target_system) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'unauthorized_access_attempt', 'high', '{"attempts": 5, "blocked": true, "user_agent": "automated_scanner"}', '203.0.113.1', 'SCADA_MAIN'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'configuration_change', 'medium', '{"changed_by": "admin", "system": "protection_relay", "change_type": "threshold_update"}', '192.168.1.100', 'PROTECTION_RELAY_01'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'network_anomaly', 'low', '{"traffic_spike": true, "duration_minutes": 15, "resolved": true}', '10.0.0.45', 'NETWORK_MONITOR');

-- Add sample compliance records
INSERT INTO compliance_records (connection_id, regulation_type, compliance_status, findings, last_audit_date, next_audit_date) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'NERC_CIP_003', 'compliant', '[{"finding": "All cybersecurity policies up to date", "status": "passed"}]', NOW() - INTERVAL '90 days', NOW() + INTERVAL '275 days'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'NERC_CIP_005', 'compliant', '[{"finding": "Electronic security perimeters properly configured", "status": "passed"}]', NOW() - INTERVAL '90 days', NOW() + INTERVAL '275 days'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'NERC_CIP_007', 'pending', '[{"finding": "System security management review in progress", "status": "in_review"}]', NOW() - INTERVAL '90 days', NOW() + INTERVAL '30 days');

-- Add sample customer incidents
INSERT INTO customer_incidents (connection_id, incident_type, severity, status, description, customer_info, affected_customers, location) VALUES
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'power_outage', 'high', 'resolved', 'Transformer failure caused outage in residential area', '{"primary_contact": "Manhattan Residential Association", "phone": "+1-555-0123"}', 1250, '{"lat": 40.7589, "lng": -73.9851, "area": "Upper East Side, Manhattan"}'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'voltage_sag', 'medium', 'investigating', 'Industrial customers reporting voltage quality issues', '{"primary_contact": "NYC Industrial Council", "phone": "+1-555-0456"}', 45, '{"lat": 40.6782, "lng": -73.9442, "area": "Industrial District, Queens"}'),
  ('84885662-3cfc-4125-bfd9-0ff41825f748', 'frequency_deviation', 'low', 'monitoring', 'Minor frequency fluctuations detected', '{"primary_contact": "Grid Operations Center", "phone": "+1-555-0789"}', 0, '{"lat": 40.7128, "lng": -74.0060, "area": "Grid-wide monitoring"}');