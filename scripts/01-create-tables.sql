-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  father_guardian_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  religion VARCHAR(50) NOT NULL,
  caste VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  marital_status VARCHAR(20) NOT NULL CHECK (marital_status IN ('unmarried', 'divorced', 'widowed')),
  state VARCHAR(50) NOT NULL,
  place VARCHAR(100) NOT NULL,
  photo_url TEXT,
  about_me TEXT,
  partner_preferences TEXT,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'pending',
  plan_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile views table (for tracking who viewed whom)
CREATE TABLE profile_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viewer_id UUID REFERENCES profiles(id) NOT NULL,
  viewed_id UUID REFERENCES profiles(id) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(viewer_id, viewed_id)
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view active profiles" ON profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profile views policies
CREATE POLICY "Users can view own profile views" ON profile_views
  FOR SELECT USING (auth.uid() = viewer_id);

CREATE POLICY "Users can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX idx_profiles_active ON profiles(is_active);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
