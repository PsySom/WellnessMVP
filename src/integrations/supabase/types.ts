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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string | null
          date: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          impact_type: Database["public"]["Enums"]["activity_impact"]
          is_recurring: boolean | null
          recurrence_pattern: Json | null
          reminder_enabled: boolean | null
          reminder_minutes_before: number | null
          start_time: string | null
          status: Database["public"]["Enums"]["activity_status"] | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string | null
          date: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          impact_type: Database["public"]["Enums"]["activity_impact"]
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["activity_status"] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string | null
          date?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          impact_type?: Database["public"]["Enums"]["activity_impact"]
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["activity_status"] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          evening_reflection_enabled: boolean | null
          evening_reflection_time: string | null
          full_name: string | null
          gender: string | null
          goals: string[] | null
          id: string
          morning_reflection_enabled: boolean | null
          morning_reflection_time: string | null
          onboarding_completed: boolean | null
          tracker_frequency: number | null
          tracker_times: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          evening_reflection_enabled?: boolean | null
          evening_reflection_time?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          id: string
          morning_reflection_enabled?: boolean | null
          morning_reflection_time?: string | null
          onboarding_completed?: boolean | null
          tracker_frequency?: number | null
          tracker_times?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          evening_reflection_enabled?: boolean | null
          evening_reflection_time?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          id?: string
          morning_reflection_enabled?: boolean | null
          morning_reflection_time?: string | null
          onboarding_completed?: boolean | null
          tracker_frequency?: number | null
          tracker_times?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tracker_emotions: {
        Row: {
          category: string
          emotion_label: string
          id: string
          intensity: number
          tracker_entry_id: string
        }
        Insert: {
          category: string
          emotion_label: string
          id?: string
          intensity: number
          tracker_entry_id: string
        }
        Update: {
          category?: string
          emotion_label?: string
          id?: string
          intensity?: number
          tracker_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_emotions_tracker_entry_id_fkey"
            columns: ["tracker_entry_id"]
            isOneToOne: false
            referencedRelation: "tracker_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_entries: {
        Row: {
          anxiety_level: number | null
          created_at: string | null
          energy_level: number | null
          entry_date: string
          entry_time: string
          id: string
          mood_score: number | null
          process_satisfaction: number | null
          result_satisfaction: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          anxiety_level?: number | null
          created_at?: string | null
          energy_level?: number | null
          entry_date: string
          entry_time: string
          id?: string
          mood_score?: number | null
          process_satisfaction?: number | null
          result_satisfaction?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          anxiety_level?: number | null
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          entry_time?: string
          id?: string
          mood_score?: number | null
          process_satisfaction?: number | null
          result_satisfaction?: number | null
          stress_level?: number | null
          user_id?: string
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
      activity_category:
        | "sleep"
        | "nutrition"
        | "hydration"
        | "exercise"
        | "leisure"
        | "hobby"
        | "work"
        | "social"
        | "practice"
        | "health"
        | "reflection"
      activity_impact: "restorative" | "draining" | "neutral" | "mixed"
      activity_status: "planned" | "in_progress" | "completed" | "cancelled"
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
      activity_category: [
        "sleep",
        "nutrition",
        "hydration",
        "exercise",
        "leisure",
        "hobby",
        "work",
        "social",
        "practice",
        "health",
        "reflection",
      ],
      activity_impact: ["restorative", "draining", "neutral", "mixed"],
      activity_status: ["planned", "in_progress", "completed", "cancelled"],
    },
  },
} as const
