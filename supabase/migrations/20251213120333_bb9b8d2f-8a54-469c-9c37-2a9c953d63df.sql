-- Add template management fields to user_presets
ALTER TABLE public.user_presets 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS activation_start_date date,
ADD COLUMN IF NOT EXISTS activation_end_date date;

-- Add user_preset_id to activities to track which preset created the activity
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS user_preset_id uuid REFERENCES public.user_presets(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_user_preset_id ON public.activities(user_preset_id);
CREATE INDEX IF NOT EXISTS idx_user_presets_is_active ON public.user_presets(is_active);
CREATE INDEX IF NOT EXISTS idx_user_presets_is_archived ON public.user_presets(is_archived);