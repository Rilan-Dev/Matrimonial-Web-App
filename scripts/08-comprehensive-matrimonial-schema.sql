-- Drop existing profiles table and recreate with comprehensive matrimonial fields
DROP TABLE IF EXISTS profiles CASCADE;

-- Create comprehensive profiles table for matrimonial platform
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    date_of_birth DATE,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    blood_group VARCHAR(5),
    physical_status VARCHAR(50),
    complexion VARCHAR(20),
    body_type VARCHAR(20),
    
    -- Family Information
    father_guardian_name VARCHAR(100) NOT NULL,
    mother_name VARCHAR(100),
    family_type VARCHAR(20),
    family_status VARCHAR(30),
    family_values VARCHAR(20),
    family_location VARCHAR(100),
    brothers INTEGER DEFAULT 0,
    sisters INTEGER DEFAULT 0,
    about_family TEXT,
    
    -- Location Information
    state VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    current_location VARCHAR(100),
    willing_to_relocate BOOLEAN DEFAULT false,
    
    -- Education & Career
    education_level VARCHAR(50),
    education_details TEXT,
    occupation VARCHAR(100),
    occupation_details TEXT,
    company_name VARCHAR(100),
    annual_income VARCHAR(30),
    work_location VARCHAR(100),
    
    -- Religious Information
    religion VARCHAR(30) NOT NULL,
    caste VARCHAR(50) NOT NULL,
    sub_caste VARCHAR(50),
    gothra VARCHAR(50),
    star_rashi VARCHAR(50),
    manglik_status VARCHAR(20),
    horoscope_match BOOLEAN DEFAULT true,
    
    -- Lifestyle
    diet VARCHAR(20),
    smoking VARCHAR(20),
    drinking VARCHAR(20),
    hobbies TEXT,
    interests TEXT,
    languages_known VARCHAR(200),
    
    -- Photos
    photo_url TEXT,
    photo_urls TEXT[], -- Array of photo URLs
    
    -- About & Preferences
    about_me TEXT,
    partner_expectations TEXT,
    
    -- Partner Preferences
    partner_age_min INTEGER,
    partner_age_max INTEGER,
    partner_height_min INTEGER,
    partner_height_max INTEGER,
    partner_education VARCHAR(50),
    partner_occupation VARCHAR(100),
    partner_income_min VARCHAR(30),
    partner_location VARCHAR(100),
    partner_caste VARCHAR(50),
    partner_religion VARCHAR(30),
    partner_manglik_preference VARCHAR(20),
    partner_diet VARCHAR(20),
    partner_smoking_preference VARCHAR(20),
    partner_drinking_preference VARCHAR(20),
    
    -- Horoscope Details
    birth_time VARCHAR(10), -- HH:MM format
    birth_place VARCHAR(100),
    horoscope_url TEXT,
    
    -- Contact Preferences
    contact_privacy VARCHAR(20) DEFAULT 'Protected',
    show_contact_to VARCHAR(20) DEFAULT 'Premium',
    
    -- Status & Metadata
    marital_status VARCHAR(20) NOT NULL,
    profile_created_by VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    profile_completion_percentage INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste);
CREATE INDEX idx_profiles_state ON profiles(state);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Create interests table for better normalization
CREATE TABLE profile_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    interest VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profile_interests_profile_id ON profile_interests(profile_id);

-- Create shortlists table
CREATE TABLE shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, profile_id)
);

CREATE INDEX idx_shortlists_user_id ON shortlists(user_id);
CREATE INDEX idx_shortlists_profile_id ON shortlists(profile_id);

-- Create blocked profiles table
CREATE TABLE blocked_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, blocked_profile_id)
);

CREATE INDEX idx_blocked_profiles_user_id ON blocked_profiles(user_id);

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_row profiles)
RETURNS INTEGER AS $$
DECLARE
    total_fields INTEGER := 30; -- Total important fields
    completed_fields INTEGER := 0;
BEGIN
    -- Basic required fields
    IF profile_row.name IS NOT NULL AND profile_row.name != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.age > 0 THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.gender IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.father_guardian_name IS NOT NULL AND profile_row.father_guardian_name != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.state IS NOT NULL AND profile_row.state != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.city IS NOT NULL AND profile_row.city != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.religion IS NOT NULL AND profile_row.religion != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.caste IS NOT NULL AND profile_row.caste != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.marital_status IS NOT NULL AND profile_row.marital_status != '' THEN completed_fields := completed_fields + 1; END IF;
    
    -- Optional but important fields
    IF profile_row.photo_url IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.height IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.education_level IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.occupation IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.annual_income IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.diet IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.about_me IS NOT NULL AND profile_row.about_me != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.partner_expectations IS NOT NULL AND profile_row.partner_expectations != '' THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.phone IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.email IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.family_type IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.complexion IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.mother_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.hobbies IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.interests IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.partner_age_min IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.partner_age_max IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.partner_education IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.smoking IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.drinking IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    IF profile_row.manglik_status IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    
    RETURN ROUND((completed_fields::FLOAT / total_fields::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := calculate_profile_completion(NEW);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view active profiles" ON profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profile_interests
CREATE POLICY "Users can view all interests" ON profile_interests
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their profile interests" ON profile_interests
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for shortlists
CREATE POLICY "Users can manage their own shortlists" ON shortlists
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for blocked_profiles
CREATE POLICY "Users can manage their own blocked profiles" ON blocked_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data for testing
INSERT INTO profiles (
    user_id, name, age, gender, father_guardian_name, state, city, religion, caste, marital_status,
    height, education_level, occupation, annual_income, diet, about_me, partner_expectations
) VALUES 
(
    gen_random_uuid(), 'Sample User', 28, 'Male', 'Sample Father', 'Maharashtra', 'Mumbai', 
    'Hindu', 'General', 'Unmarried', 175, 'Graduate', 'Software Engineer', '10-20 Lakhs', 
    'Vegetarian', 'I am a software engineer working in Mumbai...', 
    'Looking for a caring and understanding partner...'
);
