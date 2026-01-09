 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      custom_labels: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          icon: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          lead_id: string | null
          response_received: boolean | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          response_received?: boolean | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          response_received?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_stage_history: {
        Row: {
          from_funnel: Database["public"]["Enums"]["funnel_type"] | null
          from_stage_id: string | null
          id: string
          lead_id: string | null
          moved_at: string | null
          moved_by: string | null
          notes: string | null
          reason: string | null
          to_funnel: Database["public"]["Enums"]["funnel_type"] | null
          to_stage_id: string | null
        }
        Insert: {
          from_funnel?: Database["public"]["Enums"]["funnel_type"] | null
          from_stage_id?: string | null
          id?: string
          lead_id?: string | null
          moved_at?: string | null
          moved_by?: string | null
          notes?: string | null
          reason?: string | null
          to_funnel?: Database["public"]["Enums"]["funnel_type"] | null
          to_stage_id?: string | null
        }
        Update: {
          from_funnel?: Database["public"]["Enums"]["funnel_type"] | null
          from_stage_id?: string | null
          id?: string
          lead_id?: string | null
          moved_at?: string | null
          moved_by?: string | null
          notes?: string | null
          reason?: string | null
          to_funnel?: Database["public"]["Enums"]["funnel_type"] | null
          to_stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string | null
          current_funnel: Database["public"]["Enums"]["funnel_type"] | null
          current_stage_id: string | null
          custom_labels: string[] | null
          deal_value: number | null
          email: string | null
          id: string
          last_response_date: string | null
          last_response_note: string | null
          name: string | null
          phone: string
          source_id: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          current_funnel?: Database["public"]["Enums"]["funnel_type"] | null
          current_stage_id?: string | null
          custom_labels?: string[] | null
          deal_value?: number | null
          email?: string | null
          id?: string
          last_response_date?: string | null
          last_response_note?: string | null
          name?: string | null
          phone: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          current_funnel?: Database["public"]["Enums"]["funnel_type"] | null
          current_stage_id?: string | null
          custom_labels?: string[] | null
          deal_value?: number | null
          email?: string | null
          id?: string
          last_response_date?: string | null
          last_response_note?: string | null
          name?: string | null
          phone?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stage_scripts: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          media_links: string[] | null
          script_text: string
          stage_id: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          media_links?: string[] | null
          script_text: string
          stage_id?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          media_links?: string[] | null
          script_text?: string
          stage_id?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_scripts_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string | null
          description: string | null
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          id: string
          stage_name: string
          stage_number: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          id?: string
          stage_name: string
          stage_number: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          funnel_type?: Database["public"]["Enums"]["funnel_type"]
          id?: string
          stage_name?: string
          stage_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_avg_time_per_stage: {
        Args: never
        Returns: {
          avg_hours: number
          stage_name_out: string
          total_leads_passed: number
        }[]
      }
      get_bottleneck_analytics: {
        Args: never
        Returns: {
          avg_time_in_stage: number
          conversion_rate: number
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          leads_entered: number
          leads_progressed: number
          leads_stuck: number
          stage_id: string
          stage_name: string
          stage_number: number
        }[]
      }
      get_daily_stage_movements: {
        Args: { end_date: string; start_date: string }
        Returns: {
          from_funnel: string
          from_stage_name: string
          is_funnel_switch: boolean
          movement_date: string
          movement_reasons: Json
          to_funnel: string
          to_stage_name: string
          total_movements: number
        }[]
      }
      get_follow_up_funnel_flow: {
        Args: never
        Returns: {
          conversion_rate: number
          drop_rate: number
          funnel_type: string
          leads_dropped: number
          leads_entered: number
          leads_progressed: number
          stage_id: string
          stage_name: string
          stage_number: number
        }[]
      }
      get_funnel_leakage_stats: {
        Args: never
        Returns: {
          leakage_percentage: number
          leaked_to_broadcast: number
          total_leads: number
        }[]
      }
      get_heatmap_analytics: {
        Args: { target_type: string }
        Returns: {
          count: number
          day_name: string
          hour_of_day: number
        }[]
      }
      get_lead_journey_analytics: {
        Args: { p_lead_id: string }
        Returns: {
          current_funnel: string
          current_stage_name: string
          current_status: string
          lead_id: string
          lead_name: string
          stages_history: Json
          total_journey_days: number
        }[]
      }
    }
    Enums: {
      funnel_type: "follow_up" | "broadcast"
      lead_status: "active" | "deal" | "lost"
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
      funnel_type: ["follow_up", "broadcast"],
      lead_status: ["active", "deal", "lost"],
    },
  },
} as const
