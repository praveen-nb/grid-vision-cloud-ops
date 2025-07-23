export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advanced_analytics: {
        Row: {
          accuracy_score: number | null
          analysis_type: string
          anomaly_detection: Json
          confidence_scores: Json
          connection_id: string
          created_at: string
          execution_time_ms: number
          id: string
          input_data: Json
          model_name: string
          predictions: Json
          recommendations: Json
          updated_at: string
        }
        Insert: {
          accuracy_score?: number | null
          analysis_type: string
          anomaly_detection?: Json
          confidence_scores?: Json
          connection_id: string
          created_at?: string
          execution_time_ms?: number
          id?: string
          input_data?: Json
          model_name: string
          predictions?: Json
          recommendations?: Json
          updated_at?: string
        }
        Update: {
          accuracy_score?: number | null
          analysis_type?: string
          anomaly_detection?: Json
          confidence_scores?: Json
          connection_id?: string
          created_at?: string
          execution_time_ms?: number
          id?: string
          input_data?: Json
          model_name?: string
          predictions?: Json
          recommendations?: Json
          updated_at?: string
        }
        Relationships: []
      }
      advanced_reporting_templates: {
        Row: {
          created_at: string
          created_by: string
          data_sources: Json
          distribution_list: Json
          generation_count: number
          id: string
          is_active: boolean
          last_generated: string | null
          organization_id: string
          parameters: Json
          query_config: Json
          report_type: string
          schedule_config: Json
          template_name: string
          updated_at: string
          visualization_config: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          data_sources?: Json
          distribution_list?: Json
          generation_count?: number
          id?: string
          is_active?: boolean
          last_generated?: string | null
          organization_id: string
          parameters?: Json
          query_config?: Json
          report_type: string
          schedule_config?: Json
          template_name: string
          updated_at?: string
          visualization_config?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          data_sources?: Json
          distribution_list?: Json
          generation_count?: number
          id?: string
          is_active?: boolean
          last_generated?: string | null
          organization_id?: string
          parameters?: Json
          query_config?: Json
          report_type?: string
          schedule_config?: Json
          template_name?: string
          updated_at?: string
          visualization_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "advanced_reporting_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_security_policies: {
        Row: {
          affected_resources: Json
          compliance_frameworks: Json
          created_at: string
          enforcement_level: string
          id: string
          is_active: boolean
          last_evaluation: string | null
          organization_id: string
          policy_name: string
          policy_rules: Json
          policy_type: string
          updated_at: string
          violation_actions: Json
          violations_count: number
        }
        Insert: {
          affected_resources?: Json
          compliance_frameworks?: Json
          created_at?: string
          enforcement_level?: string
          id?: string
          is_active?: boolean
          last_evaluation?: string | null
          organization_id: string
          policy_name: string
          policy_rules?: Json
          policy_type: string
          updated_at?: string
          violation_actions?: Json
          violations_count?: number
        }
        Update: {
          affected_resources?: Json
          compliance_frameworks?: Json
          created_at?: string
          enforcement_level?: string
          id?: string
          is_active?: boolean
          last_evaluation?: string | null
          organization_id?: string
          policy_name?: string
          policy_rules?: Json
          policy_type?: string
          updated_at?: string
          violation_actions?: Json
          violations_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "advanced_security_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analytics: {
        Row: {
          actual_outcome: Json | null
          confidence_score: number
          connection_id: string
          created_at: string
          id: string
          is_anomaly: boolean | null
          model_type: string
          prediction_data: Json
          prediction_type: string
          severity_level: string | null
        }
        Insert: {
          actual_outcome?: Json | null
          confidence_score: number
          connection_id: string
          created_at?: string
          id?: string
          is_anomaly?: boolean | null
          model_type: string
          prediction_data: Json
          prediction_type: string
          severity_level?: string | null
        }
        Update: {
          actual_outcome?: Json | null
          confidence_score?: number
          connection_id?: string
          created_at?: string
          id?: string
          is_anomaly?: boolean | null
          model_type?: string
          prediction_data?: Json
          prediction_type?: string
          severity_level?: string | null
        }
        Relationships: []
      }
      audit_trail: {
        Row: {
          action_details: Json
          action_type: string
          created_at: string
          duration_ms: number | null
          id: string
          ip_address: unknown | null
          outcome: string
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json
          action_type: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_address?: unknown | null
          outcome: string
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json
          action_type?: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_address?: unknown | null
          outcome?: string
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          created_at: string
          description: string | null
          execution_count: number
          execution_schedule: Json
          id: string
          is_active: boolean
          last_execution: string | null
          next_execution: string | null
          success_rate: number | null
          trigger_conditions: Json
          updated_at: string
          user_id: string
          workflow_name: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          execution_count?: number
          execution_schedule?: Json
          id?: string
          is_active?: boolean
          last_execution?: string | null
          next_execution?: string | null
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string
          user_id: string
          workflow_name: string
          workflow_steps?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          execution_count?: number
          execution_schedule?: Json
          id?: string
          is_active?: boolean
          last_execution?: string | null
          next_execution?: string | null
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string
          user_id?: string
          workflow_name?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
      compliance_records: {
        Row: {
          compliance_status: string | null
          connection_id: string
          corrective_actions: Json | null
          created_at: string
          findings: Json | null
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          regulation_type: string
          responsible_person: string | null
          updated_at: string
        }
        Insert: {
          compliance_status?: string | null
          connection_id: string
          corrective_actions?: Json | null
          created_at?: string
          findings?: Json | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          regulation_type: string
          responsible_person?: string | null
          updated_at?: string
        }
        Update: {
          compliance_status?: string | null
          connection_id?: string
          corrective_actions?: Json | null
          created_at?: string
          findings?: Json | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          regulation_type?: string
          responsible_person?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_records_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      copilot_queries: {
        Row: {
          connection_id: string | null
          created_at: string
          executed_successfully: boolean | null
          execution_time_ms: number | null
          generated_sql: string | null
          id: string
          natural_query: string
          results_summary: Json | null
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          executed_successfully?: boolean | null
          execution_time_ms?: number | null
          generated_sql?: string | null
          id?: string
          natural_query: string
          results_summary?: Json | null
          user_id: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          executed_successfully?: boolean | null
          execution_time_ms?: number | null
          generated_sql?: string | null
          id?: string
          natural_query?: string
          results_summary?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_queries_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_incidents: {
        Row: {
          actual_resolution: string | null
          affected_customers: number | null
          communication_log: Json | null
          connection_id: string
          created_at: string
          customer_info: Json
          description: string
          estimated_resolution: string | null
          id: string
          incident_type: string
          location: Json | null
          severity: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_resolution?: string | null
          affected_customers?: number | null
          communication_log?: Json | null
          connection_id: string
          created_at?: string
          customer_info: Json
          description: string
          estimated_resolution?: string | null
          id?: string
          incident_type: string
          location?: Json | null
          severity?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_resolution?: string | null
          affected_customers?: number | null
          communication_log?: Json | null
          connection_id?: string
          created_at?: string
          customer_info?: Json
          description?: string
          estimated_resolution?: string | null
          id?: string
          incident_type?: string
          location?: Json | null
          severity?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_incidents_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_pipelines: {
        Row: {
          auto_deploy_enabled: boolean
          created_at: string
          created_by: string
          current_version: string | null
          deployment_history: Json
          deployment_stages: Json
          deployment_status: string
          environment_config: Json
          id: string
          last_deployment: string | null
          monitoring_config: Json
          organization_id: string
          pipeline_name: string
          pipeline_type: string
          rollback_config: Json
          source_repository: Json
          updated_at: string
        }
        Insert: {
          auto_deploy_enabled?: boolean
          created_at?: string
          created_by: string
          current_version?: string | null
          deployment_history?: Json
          deployment_stages?: Json
          deployment_status?: string
          environment_config?: Json
          id?: string
          last_deployment?: string | null
          monitoring_config?: Json
          organization_id: string
          pipeline_name: string
          pipeline_type: string
          rollback_config?: Json
          source_repository?: Json
          updated_at?: string
        }
        Update: {
          auto_deploy_enabled?: boolean
          created_at?: string
          created_by?: string
          current_version?: string | null
          deployment_history?: Json
          deployment_stages?: Json
          deployment_status?: string
          environment_config?: Json
          id?: string
          last_deployment?: string | null
          monitoring_config?: Json
          organization_id?: string
          pipeline_name?: string
          pipeline_type?: string
          rollback_config?: Json
          source_repository?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_api_keys: {
        Row: {
          api_key_hash: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          ip_whitelist: Json
          is_active: boolean
          key_name: string
          last_used_at: string | null
          organization_id: string
          permissions: Json
          rate_limits: Json
          updated_at: string
          usage_count: number
        }
        Insert: {
          api_key_hash: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          ip_whitelist?: Json
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          organization_id: string
          permissions?: Json
          rate_limits?: Json
          updated_at?: string
          usage_count?: number
        }
        Update: {
          api_key_hash?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          ip_whitelist?: Json
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          organization_id?: string
          permissions?: Json
          rate_limits?: Json
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_integrations: {
        Row: {
          authentication_details: Json
          configuration: Json
          created_at: string
          data_mapping: Json
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean
          last_sync: string | null
          organization_id: string
          provider: string
          sync_errors: Json
          sync_settings: Json
          sync_status: string
          updated_at: string
        }
        Insert: {
          authentication_details?: Json
          configuration?: Json
          created_at?: string
          data_mapping?: Json
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean
          last_sync?: string | null
          organization_id: string
          provider: string
          sync_errors?: Json
          sync_settings?: Json
          sync_status?: string
          updated_at?: string
        }
        Update: {
          authentication_details?: Json
          configuration?: Json
          created_at?: string
          data_mapping?: Json
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean
          last_sync?: string | null
          organization_id?: string
          provider?: string
          sync_errors?: Json
          sync_settings?: Json
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_notifications: {
        Row: {
          actions_taken: Json
          content: string
          created_at: string
          delivered_at: string | null
          delivery_channels: Json
          delivery_status: Json
          expires_at: string | null
          id: string
          metadata: Json
          notification_type: string
          organization_id: string
          priority_level: string
          read_by: Json
          scheduled_for: string | null
          target_audience: Json
          title: string
        }
        Insert: {
          actions_taken?: Json
          content: string
          created_at?: string
          delivered_at?: string | null
          delivery_channels?: Json
          delivery_status?: Json
          expires_at?: string | null
          id?: string
          metadata?: Json
          notification_type: string
          organization_id: string
          priority_level?: string
          read_by?: Json
          scheduled_for?: string | null
          target_audience?: Json
          title: string
        }
        Update: {
          actions_taken?: Json
          content?: string
          created_at?: string
          delivered_at?: string | null
          delivery_channels?: Json
          delivery_status?: Json
          expires_at?: string | null
          id?: string
          metadata?: Json
          notification_type?: string
          organization_id?: string
          priority_level?: string
          read_by?: Json
          scheduled_for?: string | null
          target_audience?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      environmental_data: {
        Row: {
          connection_id: string
          coordinates: Json
          created_at: string
          data_type: string
          description: string | null
          id: string
          metadata: Json | null
          severity_level: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          connection_id: string
          coordinates: Json
          created_at?: string
          data_type: string
          description?: string | null
          id?: string
          metadata?: Json | null
          severity_level?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          connection_id?: string
          coordinates?: Json
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          severity_level?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environmental_data_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      etl_jobs: {
        Row: {
          connection_id: string | null
          created_at: string
          error_log: Json | null
          id: string
          job_name: string
          progress_percentage: number | null
          records_processed: number | null
          source_config: Json
          source_type: string
          status: string | null
          target_format: string
          transformation_rules: Json
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          error_log?: Json | null
          id?: string
          job_name: string
          progress_percentage?: number | null
          records_processed?: number | null
          source_config: Json
          source_type: string
          status?: string | null
          target_format: string
          transformation_rules: Json
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          error_log?: Json | null
          id?: string
          job_name?: string
          progress_percentage?: number | null
          records_processed?: number | null
          source_config?: Json
          source_type?: string
          status?: string | null
          target_format?: string
          transformation_rules?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etl_jobs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      field_operations: {
        Row: {
          actual_start: string | null
          completed_at: string | null
          connection_id: string
          created_at: string
          description: string | null
          findings: Json | null
          id: string
          location: Json
          offline_data: Json | null
          operation_type: string
          photos: Json | null
          priority: string | null
          scheduled_start: string | null
          status: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          actual_start?: string | null
          completed_at?: string | null
          connection_id: string
          created_at?: string
          description?: string | null
          findings?: Json | null
          id?: string
          location: Json
          offline_data?: Json | null
          operation_type: string
          photos?: Json | null
          priority?: string | null
          scheduled_start?: string | null
          status?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          actual_start?: string | null
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          description?: string | null
          findings?: Json | null
          id?: string
          location?: Json
          offline_data?: Json | null
          operation_type?: string
          photos?: Json | null
          priority?: string | null
          scheduled_start?: string | null
          status?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_operations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      gis_assets: {
        Row: {
          asset_id: string
          asset_type: string
          connection_id: string | null
          created_at: string
          geometry: Json
          id: string
          last_inspection: string | null
          maintenance_schedule: Json | null
          properties: Json
          risk_level: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          asset_type: string
          connection_id?: string | null
          created_at?: string
          geometry: Json
          id?: string
          last_inspection?: string | null
          maintenance_schedule?: Json | null
          properties: Json
          risk_level?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          asset_type?: string
          connection_id?: string | null
          created_at?: string
          geometry?: Json
          id?: string
          last_inspection?: string | null
          maintenance_schedule?: Json | null
          properties?: Json
          risk_level?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gis_assets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_alerts: {
        Row: {
          alert_type: string
          connection_id: string
          created_at: string
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          connection_id: string
          created_at?: string
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          alert_type?: string
          connection_id?: string
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "grid_alerts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_connections: {
        Row: {
          api_credentials_encrypted: string | null
          created_at: string
          endpoint: string
          frequency: number | null
          id: string
          last_update: string | null
          location: string
          name: string
          protocol: string
          status: string
          type: string
          updated_at: string
          user_id: string
          voltage: number | null
        }
        Insert: {
          api_credentials_encrypted?: string | null
          created_at?: string
          endpoint: string
          frequency?: number | null
          id?: string
          last_update?: string | null
          location: string
          name: string
          protocol: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
          voltage?: number | null
        }
        Update: {
          api_credentials_encrypted?: string | null
          created_at?: string
          endpoint?: string
          frequency?: number | null
          id?: string
          last_update?: string | null
          location?: string
          name?: string
          protocol?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          voltage?: number | null
        }
        Relationships: []
      }
      grid_metrics: {
        Row: {
          connection_id: string
          id: string
          metric_type: string
          timestamp: string
          unit: string
          value: number
        }
        Insert: {
          connection_id: string
          id?: string
          metric_type: string
          timestamp?: string
          unit: string
          value: number
        }
        Update: {
          connection_id?: string
          id?: string
          metric_type?: string
          timestamp?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "grid_metrics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_topology: {
        Row: {
          connection_id: string
          connections: Json | null
          coordinates: Json | null
          created_at: string
          id: string
          node_id: string
          node_type: string
          operational_status: string | null
          properties: Json
          updated_at: string
        }
        Insert: {
          connection_id: string
          connections?: Json | null
          coordinates?: Json | null
          created_at?: string
          id?: string
          node_id: string
          node_type: string
          operational_status?: string | null
          properties: Json
          updated_at?: string
        }
        Update: {
          connection_id?: string
          connections?: Json | null
          coordinates?: Json | null
          created_at?: string
          id?: string
          node_id?: string
          node_type?: string
          operational_status?: string | null
          properties?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grid_topology_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_status: {
        Row: {
          created_at: string
          id: string
          provider: string
          status_data: Json
          timestamp: string
          total_cost: number
          total_resources: number
        }
        Insert: {
          created_at?: string
          id?: string
          provider?: string
          status_data?: Json
          timestamp?: string
          total_cost?: number
          total_resources?: number
        }
        Update: {
          created_at?: string
          id?: string
          provider?: string
          status_data?: Json
          timestamp?: string
          total_cost?: number
          total_resources?: number
        }
        Relationships: []
      }
      iot_devices: {
        Row: {
          created_at: string
          device_id: string
          device_type: string
          id: string
          last_heartbeat: string | null
          location: Json
          metadata: Json | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_type: string
          id?: string
          last_heartbeat?: string | null
          location: Json
          metadata?: Json | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_type?: string
          id?: string
          last_heartbeat?: string | null
          location?: Json
          metadata?: Json | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kinesis_metrics: {
        Row: {
          bytes_per_second: number
          id: string
          iterator_age_ms: number
          records_per_second: number
          shard_id: string
          stream_name: string
          timestamp: string
        }
        Insert: {
          bytes_per_second?: number
          id?: string
          iterator_age_ms?: number
          records_per_second?: number
          shard_id: string
          stream_name: string
          timestamp?: string
        }
        Update: {
          bytes_per_second?: number
          id?: string
          iterator_age_ms?: number
          records_per_second?: number
          shard_id?: string
          stream_name?: string
          timestamp?: string
        }
        Relationships: []
      }
      multi_tenant_organizations: {
        Row: {
          billing_info: Json
          created_at: string
          features_enabled: Json
          id: string
          max_connections: number
          max_users: number
          organization_code: string
          organization_name: string
          settings: Json
          status: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          billing_info?: Json
          created_at?: string
          features_enabled?: Json
          id?: string
          max_connections?: number
          max_users?: number
          organization_code: string
          organization_name: string
          settings?: Json
          status?: string
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          billing_info?: Json
          created_at?: string
          features_enabled?: Json
          id?: string
          max_connections?: number
          max_users?: number
          organization_code?: string
          organization_name?: string
          settings?: Json
          status?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_memberships: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          last_active: string | null
          organization_id: string
          permissions: Json
          profile_id: string
          role: string
          status: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          last_active?: string | null
          organization_id: string
          permissions?: Json
          profile_id: string
          role?: string
          status?: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          last_active?: string | null
          organization_id?: string
          permissions?: Json
          profile_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "multi_tenant_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          collection_method: string
          connection_id: string | null
          current_value: number
          data_source: string
          id: string
          metric_category: string
          metric_name: string
          percentage_change: number | null
          previous_value: number | null
          threshold_critical: number | null
          threshold_warning: number | null
          timestamp: string
          trend_direction: string | null
          unit_of_measure: string
        }
        Insert: {
          collection_method: string
          connection_id?: string | null
          current_value: number
          data_source: string
          id?: string
          metric_category: string
          metric_name: string
          percentage_change?: number | null
          previous_value?: number | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          timestamp?: string
          trend_direction?: string | null
          unit_of_measure: string
        }
        Update: {
          collection_method?: string
          connection_id?: string | null
          current_value?: number
          data_source?: string
          id?: string
          metric_category?: string
          metric_name?: string
          percentage_change?: number | null
          previous_value?: number | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          timestamp?: string
          trend_direction?: string | null
          unit_of_measure?: string
        }
        Relationships: []
      }
      predictive_analytics: {
        Row: {
          asset_id: string
          confidence_score: number | null
          connection_id: string
          created_at: string
          id: string
          input_features: Json
          model_version: string
          predicted_date: string | null
          prediction_type: string
          probability: number | null
        }
        Insert: {
          asset_id: string
          confidence_score?: number | null
          connection_id: string
          created_at?: string
          id?: string
          input_features: Json
          model_version: string
          predicted_date?: string | null
          prediction_type: string
          probability?: number | null
        }
        Update: {
          asset_id?: string
          confidence_score?: number | null
          connection_id?: string
          created_at?: string
          id?: string
          input_features?: Json
          model_version?: string
          predicted_date?: string | null
          prediction_type?: string
          probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "predictive_analytics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      real_time_alerts: {
        Row: {
          affected_systems: Json
          alert_category: string
          auto_resolution: boolean
          connection_id: string | null
          created_at: string
          description: string
          detection_method: string
          escalation_rules: Json
          id: string
          notification_channels: Json
          resolution_time_seconds: number | null
          resolved: boolean
          resolved_at: string | null
          severity_level: string
          title: string
        }
        Insert: {
          affected_systems?: Json
          alert_category: string
          auto_resolution?: boolean
          connection_id?: string | null
          created_at?: string
          description: string
          detection_method: string
          escalation_rules?: Json
          id?: string
          notification_channels?: Json
          resolution_time_seconds?: number | null
          resolved?: boolean
          resolved_at?: string | null
          severity_level?: string
          title: string
        }
        Update: {
          affected_systems?: Json
          alert_category?: string
          auto_resolution?: boolean
          connection_id?: string | null
          created_at?: string
          description?: string
          detection_method?: string
          escalation_rules?: Json
          id?: string
          notification_channels?: Json
          resolution_time_seconds?: number | null
          resolved?: boolean
          resolved_at?: string | null
          severity_level?: string
          title?: string
        }
        Relationships: []
      }
      resource_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json
          executed_at: string
          id: string
          resource_id: string
          status: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json
          executed_at?: string
          id?: string
          resource_id: string
          status?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json
          executed_at?: string
          id?: string
          resource_id?: string
          status?: string
        }
        Relationships: []
      }
      scada_operations: {
        Row: {
          command_data: Json
          connection_id: string
          created_at: string
          executed_at: string | null
          executed_by: string | null
          id: string
          operation_type: string
          status: string
          target_device: string
        }
        Insert: {
          command_data: Json
          connection_id: string
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          operation_type: string
          status?: string
          target_device: string
        }
        Update: {
          command_data?: Json
          connection_id?: string
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          operation_type?: string
          status?: string
          target_device?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          connection_id: string | null
          created_at: string
          event_details: Json
          event_type: string
          id: string
          response_actions: Json | null
          severity: string | null
          source_ip: unknown | null
          status: string | null
          target_system: string | null
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          event_details: Json
          event_type: string
          id?: string
          response_actions?: Json | null
          severity?: string | null
          source_ip?: unknown | null
          status?: string | null
          target_system?: string | null
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          event_details?: Json
          event_type?: string
          id?: string
          response_actions?: Json | null
          severity?: string | null
          source_ip?: unknown | null
          status?: string | null
          target_system?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "grid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "operator"
        | "field_technician"
        | "analyst"
        | "compliance_officer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "operator",
        "field_technician",
        "analyst",
        "compliance_officer",
      ],
    },
  },
} as const
