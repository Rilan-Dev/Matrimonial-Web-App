-- Make profiles.phone nullable if it isn't already.
-- This script is safe to run multiple times.

DO $$
BEGIN
  -- Check if the column is NOT NULL
  IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'profiles'
        AND column_name = 'phone'
        AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;
  END IF;
END $$;

-- Ensure a UNIQUE index that allows multiple NULLs
DROP INDEX IF EXISTS profiles_phone_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON profiles(phone)
  WHERE phone IS NOT NULL;
