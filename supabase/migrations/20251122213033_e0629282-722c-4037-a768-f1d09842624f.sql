-- Add priority field to activities table
ALTER TABLE public.activities ADD COLUMN priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5);