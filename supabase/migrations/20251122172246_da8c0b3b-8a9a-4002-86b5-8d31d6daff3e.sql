-- Добавляем поддержку русского языка для activity_templates
ALTER TABLE activity_templates 
ADD COLUMN IF NOT EXISTS name_ru text,
ADD COLUMN IF NOT EXISTS description_ru text;