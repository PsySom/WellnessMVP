-- Create new enum type with all values
CREATE TYPE activity_impact_new AS ENUM ('restoring', 'depleting', 'mixed', 'neutral');

-- Update activities table to use new enum
ALTER TABLE activities 
  ALTER COLUMN impact_type TYPE activity_impact_new 
  USING (
    CASE impact_type::text
      WHEN 'restorative' THEN 'restoring'::activity_impact_new
      WHEN 'draining' THEN 'depleting'::activity_impact_new
      WHEN 'mixed' THEN 'mixed'::activity_impact_new
      WHEN 'neutral' THEN 'neutral'::activity_impact_new
    END
  );

-- Update activity_templates table to use new enum
ALTER TABLE activity_templates 
  ALTER COLUMN impact_type TYPE activity_impact_new 
  USING (
    CASE impact_type::text
      WHEN 'restorative' THEN 'restoring'::activity_impact_new
      WHEN 'draining' THEN 'depleting'::activity_impact_new
      WHEN 'mixed' THEN 'mixed'::activity_impact_new
      WHEN 'neutral' THEN 'neutral'::activity_impact_new
    END
  );

-- Drop old enum type
DROP TYPE activity_impact;

-- Rename new enum type to original name
ALTER TYPE activity_impact_new RENAME TO activity_impact;