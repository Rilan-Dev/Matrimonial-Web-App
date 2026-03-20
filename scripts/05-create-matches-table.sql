-- Create matches table for the mobile app
-- This won't affect the existing web application functionality

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'liked', 'skipped', 'matched')),
  liked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_a, profile_b)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_profile_a ON matches(profile_a);
CREATE INDEX IF NOT EXISTS idx_matches_profile_b ON matches(profile_b);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = profile_a OR auth.uid() = profile_b);

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = profile_a);

CREATE POLICY "Users can update their matches" ON matches
  FOR UPDATE USING (auth.uid() = profile_a OR auth.uid() = profile_b);

-- Function to handle mutual matches
CREATE OR REPLACE FUNCTION handle_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's a reverse match
  IF EXISTS (
    SELECT 1 FROM matches 
    WHERE profile_a = NEW.profile_b 
    AND profile_b = NEW.profile_a 
    AND status = 'liked'
  ) THEN
    -- Update both matches to 'matched' status
    UPDATE matches 
    SET status = 'matched', updated_at = NOW()
    WHERE (profile_a = NEW.profile_a AND profile_b = NEW.profile_b)
       OR (profile_a = NEW.profile_b AND profile_b = NEW.profile_a);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mutual matches
DROP TRIGGER IF EXISTS trigger_mutual_match ON matches;
CREATE TRIGGER trigger_mutual_match
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'liked')
  EXECUTE FUNCTION handle_mutual_match();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_matches_updated_at_trigger ON matches;
CREATE TRIGGER update_matches_updated_at_trigger
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_matches_updated_at();

-- Add is_active column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index on is_active for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
