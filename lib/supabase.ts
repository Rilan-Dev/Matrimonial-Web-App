import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone: string
          age: number
          father_guardian_name: string
          email: string | null
          religion: string
          caste: string
          gender: "male" | "female"
          marital_status: "unmarried" | "divorced" | "widowed"
          state: string
          place: string
          photo_url: string | null
          about_me: string | null
          partner_preferences: string | null
          is_active: boolean
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          phone: string
          age: number
          father_guardian_name: string
          email?: string | null
          religion: string
          caste: string
          gender: "male" | "female"
          marital_status: "unmarried" | "divorced" | "widowed"
          state: string
          place: string
          photo_url?: string | null
          about_me?: string | null
          partner_preferences?: string | null
          is_active?: boolean
          is_premium?: boolean
        }
        Update: {
          name?: string
          age?: number
          father_guardian_name?: string
          email?: string | null
          religion?: string
          caste?: string
          marital_status?: "unmarried" | "divorced" | "widowed"
          state?: string
          place?: string
          photo_url?: string | null
          about_me?: string | null
          partner_preferences?: string | null
          is_active?: boolean
          is_premium?: boolean
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          amount: number
          currency: string
          status: string
          plan_type: string
          created_at: string
        }
        Insert: {
          user_id: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount: number
          currency?: string
          status?: string
          plan_type: string
        }
        Update: {
          razorpay_payment_id?: string | null
          status?: string
        }
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string
          viewed_id: string
          viewed_at: string
        }
        Insert: {
          viewer_id: string
          viewed_id: string
        }
        Update: never
      }
    }
  }
}
