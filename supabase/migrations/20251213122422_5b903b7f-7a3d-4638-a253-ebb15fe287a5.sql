-- Add tags column to user_presets table for template categorization
ALTER TABLE public.user_presets 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];