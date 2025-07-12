"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use ref to track if profile is being fetched to prevent multiple calls
  const profileFetchingRef = useRef(false)

  const refreshProfile = useCallback(async () => {
    if (!user || profileFetchingRef.current) {
      return
    }

    profileFetchingRef.current = true
    setProfileLoading(true)
    setError(null)

    try {
      console.log("Fetching profile for user:", user.id)
      const { data, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileError) {
        if (profileError.code === "PGRST116") {
          // Profile doesn't exist
          setError("Profile not found. Please complete your registration.")
        } else {
          setError(`Failed to load profile: ${profileError.message}`)
        }
        setProfile(null)
      } else {
        console.log("Profile loaded successfully:", data.name)
        setProfile(data)
        setError(null)
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err)
      setError("Failed to load profile. Please try again.")
      setProfile(null)
    } finally {
      setProfileLoading(false)
      profileFetchingRef.current = false
    }
  }, [user])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("Authentication error. Please try logging in again.")
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Only fetch profile if we have a user and haven't fetched yet
        if (currentUser && !profile && !profileFetchingRef.current) {
          await refreshProfile()
        }
      } catch (err: any) {
        if (!mounted) return
        console.error("Auth initialization error:", err)
        setError("Failed to initialize authentication.")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email)

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Only fetch profile if we don't have one or user changed
        if (!profile || profile.id !== currentUser.id) {
          await refreshProfile()
        }
      } else {
        setProfile(null)
        setError(null)
        profileFetchingRef.current = false
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove all dependencies to prevent infinite loops

  // Separate effect to handle profile fetching when user changes
  useEffect(() => {
    if (user && !profile && !profileFetchingRef.current && !loading) {
      console.log("User changed, fetching profile...")
      refreshProfile()
    }
  }, [user]) // Only depend on user, not the entire user object

  const signOut = async () => {
    try {
      setError(null)
      profileFetchingRef.current = false
      await supabase.auth.signOut()
      setProfile(null)
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError("Failed to sign out. Please try again.")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        error,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
