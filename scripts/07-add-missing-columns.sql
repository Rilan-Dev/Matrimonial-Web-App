-- Add missing columns to profiles table
DO $$ 
BEGIN
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;
    
    -- Add about_me column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'about_me') THEN
        ALTER TABLE profiles ADD COLUMN about_me TEXT;
    END IF;
    
    -- Add partner_preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'partner_preferences') THEN
        ALTER TABLE profiles ADD COLUMN partner_preferences TEXT;
    END IF;
    
    -- Ensure height is integer type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'height' AND data_type = 'text') THEN
        ALTER TABLE profiles ALTER COLUMN height TYPE INTEGER USING height::integer;
    END IF;
    
    -- Add height as integer if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'height') THEN
        ALTER TABLE profiles ADD COLUMN height INTEGER;
    END IF;
END $$;

-- Update existing profiles to have default values for new columns
UPDATE profiles 
SET location = COALESCE(location, place || ', ' || state)
WHERE location IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON profiles(occupation);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON profiles(education);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_religion ON profiles(religion);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
