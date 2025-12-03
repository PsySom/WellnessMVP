-- Create table for user custom presets
CREATE TABLE public.user_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📋',
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_presets ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own presets
CREATE POLICY "Users can view own presets" 
ON public.user_presets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presets" 
ON public.user_presets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets" 
ON public.user_presets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" 
ON public.user_presets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_presets_updated_at
BEFORE UPDATE ON public.user_presets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();