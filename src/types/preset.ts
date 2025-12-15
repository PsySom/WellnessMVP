export interface PresetActivity {
  template_id: string;
  category: string;
  day_part: 'early_morning' | 'late_morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  duration: number;
  repetitions: number;
}

export interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  activities: PresetActivity[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_archived: boolean;
  last_activated_at: string | null;
  activation_start_date: string | null;
  activation_end_date: string | null;
  tags: string[];
  // Recurrence settings
  recurrence_type?: string;
  recurrence_count?: number;
  custom_interval?: number;
  custom_unit?: string;
  custom_end_type?: string;
  custom_end_date?: string;
  custom_end_count?: number;
}

export interface RecurrenceConfig {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  count?: number;
  customInterval?: number;
  customUnit?: 'day' | 'week' | 'month' | 'year';
  customEndType?: 'never' | 'date' | 'count';
  customEndDate?: string;
  customEndCount?: number;
}

// Preset tag options
export const PRESET_TAGS = [
  'routine',
  'care', 
  'health',
  'sport',
  'habits',
  'tasks',
  'rest',
  'learning',
  'development',
  'antistress',
  'basic_needs',
  'other'
] as const;

export type PresetTag = typeof PRESET_TAGS[number];
