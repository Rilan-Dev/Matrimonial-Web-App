-- Fix orphaned auth user by creating missing profile
-- Replace the values below with the actual registration data

INSERT INTO profiles (
  id,
  name,
  age,
  father_guardian_name,
  email,
  phone,
  religion,
  caste,
  gender,
  marital_status,
  state,
  place,
  is_active,
  is_premium
) VALUES (
  '0378104e-2db3-46bc-8e5d-9d026a0f159f',
  'Mohammed Rilan J',  -- Replace with actual name
  25,                  -- Replace with actual age
  'Father Name',       -- Replace with actual father/guardian name
  'mohammedrilan.ksa@gmail.com',
  NULL,                -- Phone is optional
  'muslim',            -- Replace with actual religion
  'Caste Name',        -- Replace with actual caste
  'male',              -- Replace with actual gender
  'unmarried',         -- Replace with actual marital status
  'Karnataka',         -- Replace with actual state
  'Bangalore',         -- Replace with actual place
  true,
  false
);
