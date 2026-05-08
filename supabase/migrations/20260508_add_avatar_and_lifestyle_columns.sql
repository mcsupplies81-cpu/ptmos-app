-- Add avatar_url to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add workout and energy columns to lifestyle_logs
ALTER TABLE lifestyle_logs ADD COLUMN IF NOT EXISTS workout_type TEXT;
ALTER TABLE lifestyle_logs ADD COLUMN IF NOT EXISTS workout_duration_min INTEGER;
ALTER TABLE lifestyle_logs ADD COLUMN IF NOT EXISTS workout_intensity INTEGER;
ALTER TABLE lifestyle_logs ADD COLUMN IF NOT EXISTS energy_level INTEGER;
