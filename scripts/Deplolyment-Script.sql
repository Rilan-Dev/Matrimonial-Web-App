-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.


CREATE TABLE public.profiles (
  location text,
  height integer,
  phone character varying,
  id uuid NOT NULL,
  name character varying NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 100),
  father_guardian_name character varying NOT NULL,
  email character varying,
  religion character varying NOT NULL,
  caste character varying NOT NULL,
  gender character varying NOT NULL CHECK (gender::text = ANY (ARRAY['male'::character varying, 'female'::character varying]::text[])),
  marital_status character varying NOT NULL CHECK (marital_status::text = ANY (ARRAY['unmarried'::character varying, 'divorced'::character varying, 'widowed'::character varying]::text[])),
  state character varying NOT NULL,
  place character varying NOT NULL,
  photo_url text,
  about_me text,
  partner_preferences text,
  is_active boolean DEFAULT true,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  occupation text,
  education text,
  mother_tongue text,
  body_type text,
  complexion text,
  diet text,
  smoking text,
  drinking text,
  interests text[],
  family_type text,
  family_status text,
  family_values text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.matches (
  profile_a uuid NOT NULL,
  profile_b uuid NOT NULL,
  liked_by uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'liked'::character varying, 'matched'::character varying, 'skipped'::character varying, 'viewed'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_profile_a_fkey FOREIGN KEY (profile_a) REFERENCES public.profiles(id),
  CONSTRAINT matches_profile_b_fkey FOREIGN KEY (profile_b) REFERENCES public.profiles(id),
  CONSTRAINT matches_liked_by_fkey FOREIGN KEY (liked_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.payments (
  user_id uuid NOT NULL,
  razorpay_payment_id character varying,
  razorpay_order_id character varying,
  amount numeric NOT NULL,
  plan_type character varying NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  currency character varying DEFAULT 'INR'::character varying,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_views (
  viewer_id uuid NOT NULL,
  viewed_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_views_pkey PRIMARY KEY (id),
  CONSTRAINT profile_views_viewed_id_fkey FOREIGN KEY (viewed_id) REFERENCES public.profiles(id),
  CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id)
);