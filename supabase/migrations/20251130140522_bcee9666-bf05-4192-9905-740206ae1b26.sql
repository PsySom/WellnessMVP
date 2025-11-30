-- Add emoji and repetition configuration to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS emoji text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS repetition_config jsonb DEFAULT '{"frequency": "daily", "count": 1}'::jsonb;

COMMENT ON COLUMN activities.emoji IS 'Emoji icon for the activity';
COMMENT ON COLUMN activities.repetition_config IS 'Configuration for activity repetitions: {frequency: "daily"|"weekly"|"monthly", count: number}';