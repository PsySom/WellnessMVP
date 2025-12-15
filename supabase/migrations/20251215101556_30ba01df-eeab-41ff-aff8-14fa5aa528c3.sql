-- Add recurrence settings columns to user_presets table
ALTER TABLE public.user_presets 
ADD COLUMN IF NOT EXISTS recurrence_type text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS recurrence_count integer DEFAULT 7,
ADD COLUMN IF NOT EXISTS custom_interval integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS custom_unit text DEFAULT 'day',
ADD COLUMN IF NOT EXISTS custom_end_type text DEFAULT 'never',
ADD COLUMN IF NOT EXISTS custom_end_date date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS custom_end_count integer DEFAULT 30;