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
      activity_templates: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string | null
          default_duration_minutes: number | null
          description: string | null
          emoji: string
          id: string
          impact_type: Database["public"]["Enums"]["activity_impact"]
          is_system: boolean | null
          name: string
          name_en: string
          name_fr: string
        }
        Insert: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string | null
          default_duration_minutes?: number | null
          description?: string | null
          emoji: string
          id?: string
          impact_type: Database["public"]["Enums"]["activity_impact"]
          is_system?: boolean | null
          name: string
          name_en: string
          name_fr: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string | null
          default_duration_minutes?: number | null
          description?: string | null
          emoji?: string
          id?: string
          impact_type?: Database["public"]["Enums"]["activity_impact"]
          is_system?: boolean | null
          name?: string
          name_en?: string
          name_fr?: string
        }
        Relationships: []
      }
      exercise_sessions: {
        Row: {
          completed_at: string | null
          duration_minutes: number
          exercise_id: string
          id: string
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_minutes: number
          exercise_id: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          duration_minutes?: number
          exercise_id?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          effects: string[]
          emoji: string
          id: string
          instructions: Json
          name: string
          name_en: string
          name_fr: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_minutes: number
          effects: string[]
          emoji: string
          id?: string
          instructions: Json
          name: string
          name_en: string
          name_fr: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          effects?: string[]
          emoji?: string
          id?: string
          instructions?: Json
          name?: string
          name_en?: string
          name_fr?: string
          slug?: string
        }
        Relationships: []
      }
      journal_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "journal_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          session_type: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          session_type: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string | null
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
      recommendation_rules: {
        Row: {
          activity_template_ids: string[]
          created_at: string | null
          enabled: boolean | null
          id: string
          priority: number | null
          trigger_condition: Json
        }
        Insert: {
          activity_template_ids: string[]
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          priority?: number | null
          trigger_condition: Json
        }
        Update: {
          activity_template_ids?: string[]
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          priority?: number | null
          trigger_condition?: Json
        }
        Relationships: []
      }
      test_results: {
        Row: {
          answers: Json
          category: string
          completed_at: string | null
          id: string
          max_score: number
          score: number
          test_id: string
          user_id: string
        }
        Insert: {
          answers: Json
          category: string
          completed_at?: string | null
          id?: string
          max_score: number
          score: number
          test_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          category?: string
          completed_at?: string | null
          id?: string
          max_score?: number
          score?: number
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          description_fr: string | null
          duration_minutes: number | null
          id: string
          name: string
          name_en: string
          name_fr: string
          questions: Json
          scoring_info: Json
          slug: string
          total_questions: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          name_en: string
          name_fr: string
          questions: Json
          scoring_info: Json
          slug: string
          total_questions: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          name_en?: string
          name_fr?: string
          questions?: Json
          scoring_info?: Json
          slug?: string
          total_questions?: number
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
      user_recommendations: {
        Row: {
          accepted: boolean | null
          activity_template_id: string
          created_at: string | null
          dismissed: boolean | null
          expires_at: string | null
          id: string
          priority: number | null
          reason: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          activity_template_id: string
          created_at?: string | null
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          priority?: number | null
          reason: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          activity_template_id?: string
          created_at?: string | null
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          priority?: number | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_activity_template_id_fkey"
            columns: ["activity_template_id"]
            isOneToOne: false
            referencedRelation: "activity_templates"
            referencedColumns: ["id"]
          },
        ]
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
