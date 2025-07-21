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
      gis_assets: {
        Row: {
          asset_id: string
          asset_type: string
          created_at: string
          geometry: Json
          id: string
          last_inspection: string | null
          properties: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          asset_type: string
          created_at?: string
          geometry: Json
          id?: string
          last_inspection?: string | null
          properties: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          asset_type?: string
          created_at?: string
          geometry?: Json
          id?: string
          last_inspection?: string | null
          properties?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
