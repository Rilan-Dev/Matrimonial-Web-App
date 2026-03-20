-- First, check if user_id column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing profiles to have user_id if they don't
UPDATE profiles 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE auth.users.email = profiles.email 
    LIMIT 1
)
WHERE user_id IS NULL AND email IS NOT NULL;

-- Create matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    profile_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_a, profile_b)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_matches_profile_a ON matches(profile_a);
CREATE INDEX IF NOT EXISTS idx_matches_profile_b ON matches(profile_b);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for matches
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (
        profile_a IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        profile_b IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create matches" ON matches;
CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (
        profile_a IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their matches" ON matches;
CREATE POLICY "Users can update their matches" ON matches
    FOR UPDATE USING (
        profile_a IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        profile_b IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Add missing columns to profiles if they don't exist
DO $$ 
BEGIN
    -- Add missing columns one by one
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'photo_url') THEN
        ALTER TABLE profiles ADD COLUMN photo_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'occupation') THEN
        ALTER TABLE profiles ADD COLUMN occupation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'education') THEN
        ALTER TABLE profiles ADD COLUMN education TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'religion') THEN
        ALTER TABLE profiles ADD COLUMN religion TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'caste') THEN
        ALTER TABLE profiles ADD COLUMN caste TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'mother_tongue') THEN
        ALTER TABLE profiles ADD COLUMN mother_tongue TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'marital_status') THEN
        ALTER TABLE profiles ADD COLUMN marital_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'height') THEN
        ALTER TABLE profiles ADD COLUMN height TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'body_type') THEN
        ALTER TABLE profiles ADD COLUMN body_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'complexion') THEN
        ALTER TABLE profiles ADD COLUMN complexion TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'diet') THEN
        ALTER TABLE profiles ADD COLUMN diet TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'smoking') THEN
        ALTER TABLE profiles ADD COLUMN smoking TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'drinking') THEN
        ALTER TABLE profiles ADD COLUMN drinking TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'family_type') THEN
        ALTER TABLE profiles ADD COLUMN family_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'family_status') THEN
        ALTER TABLE profiles ADD COLUMN family_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'family_values') THEN
        ALTER TABLE profiles ADD COLUMN family_values TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
        ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
