-- Add localized fields for test questions and scoring info
ALTER TABLE tests ADD COLUMN IF NOT EXISTS questions_ru jsonb;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS questions_fr jsonb;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS scoring_info_ru jsonb;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS scoring_info_fr jsonb;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS description_ru text;