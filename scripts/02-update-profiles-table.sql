-- Update profiles table to make phone optional
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- Add unique constraint that allows nulls
CREATE UNIQUE INDEX profiles_phone_unique ON profiles (phone) WHERE phone IS NOT NULL;

-- Update the profiles table structure
COMMENT ON COLUMN profiles.phone IS 'Phone number in E.164 format (optional)';
COMMENT ON COLUMN profiles.email IS 'Email address (optional, but either email or phone required)';
