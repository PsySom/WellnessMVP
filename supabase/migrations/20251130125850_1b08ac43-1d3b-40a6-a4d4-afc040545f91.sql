-- Remove 'routine' from activity_category enum
-- First, create a new enum without 'routine'
CREATE TYPE activity_category_new AS ENUM (
  'sleep',
  'nutrition',
  'hydration',
  'exercise',
  'leisure',
  'hobby',
  'work',
  'social',
  'practice',
  'health',
  'reflection',
  'rest',
  'psychological_exercises',
  'light_exercise',
  'close_socializing',
  'walks',
  'games',
  'creative',
  'entertainment',
  'self_care',
  'meditation',
  'nature',
  'study',
  'commute',
  'intense_exercise',
  'household_chores',
  'tasks',
  'finances',
  'health_appointments',
  'caregiving',
  'deadlines',
  'learning',
  'problem_solving',
  'social_obligations',
  'multitasking',
  'emotional_labor',
  'moderate_exercise',
  'cooking',
  'projects',
  'shopping',
  'cleaning',
  'planning',
  'reading',
  'volunteering',
  'spiritual',
  'hygiene',
  'waiting',
  'testing',
  'other',
  'sleep_8hours',
  'sleep_nap',
  'sleep_quiet_rest',
  'nutrition_breakfast',
  'nutrition_brunch',
  'nutrition_lunch',
  'nutrition_coffee',
  'nutrition_dinner',
  'nutrition_after_dinner',
  'rest_relaxation',
  'rest_water_procedures',
  'rest_hygiene',
  'rest_self_care',
  'rest_meditation_10min',
  'rest_psychological_exercises',
  'rest_walks',
  'rest_light_exercise',
  'rest_morning_exercise',
  'rest_reading',
  'rest_doing_nothing',
  'rest_breathing_5min',
  'rest_grounding_10min',
  'entertainment_music',
  'entertainment_social_media',
  'entertainment_movies',
  'reflection_trackers_5min',
  'reflection_evening_10min',
  'reflection_morning_10min'
);

-- Update tables to use new enum
ALTER TABLE activities 
  ALTER COLUMN category TYPE activity_category_new 
  USING category::text::activity_category_new;

ALTER TABLE activity_templates 
  ALTER COLUMN category TYPE activity_category_new 
  USING category::text::activity_category_new;

-- Drop old enum and rename new one
DROP TYPE activity_category;
ALTER TYPE activity_category_new RENAME TO activity_category;