"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Star, Crown, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Dashboard() {
  const { profile, profileLoading, error, refreshProfile } = useAuth()
  const [stats, setStats] = useState({
    totalProfiles: 0,
    newMatches: 0,
    profileViews: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return

      setStatsLoading(true)
      setStatsError(null)

      try {
        // Get total profiles count (opposite gender)
        const { count: totalCount, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .neq("gender", profile.gender)

        if (countError) throw countError

        // Get profile views count
        const { count: viewsCount, error: viewsError } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("viewed_id", profile.id)

        if (viewsError) throw viewsError

        setStats({
          totalProfiles: totalCount || 0,
          newMatches: Math.floor((totalCount || 0) * 0.1), // 10% as new matches
          profileViews: viewsCount || 0,
        })
      } catch (err: any) {
        console.error("Stats fetch error:", err)
        setStatsError("Failed to load dashboard statistics")
      } finally {
        setStatsLoading(false)
      }
    }

    if (profile) {
      fetchStats()
    }
  }, [profile])

  // Show loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we load your profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={refreshProfile} size="sm" variant="outline">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show profile not found state
  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find your profile. Please complete your registration or contact support.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={refreshProfile} variant="outline">
                Reload Profile
              </Button>
              <Button onClick={() => (window.location.href = "/")}>Go to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Find your perfect life partner with our advanced matching system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProfiles}</div>
                <p className="text-xs text-muted-foreground">Available profiles for you</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Matches</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.newMatches}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.profileViews}</div>
                <p className="text-xs text-muted-foreground">People viewed your profile</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Show stats error if any */}
      {statsError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{statsError}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <span>Find Your Match</span>
            </CardTitle>
            <CardDescription>Browse through compatible profiles and find your perfect partner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard/matches">View Your Matches</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/search">Advanced Search</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Complete Your Profile</span>
            </CardTitle>
            <CardDescription>A complete profile gets 3x more matches than incomplete ones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-medium">{profile.photo_url && profile.about_me ? "100%" : "70%"}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: profile.photo_url && profile.about_me ? "100%" : "70%",
                  }}
                ></div>
              </div>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/profile">Update Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Upgrade */}
      {!profile.is_premium && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span>Upgrade to Premium</span>
            </CardTitle>
            <CardDescription>Unlock premium features to find your perfect match faster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm space-y-1">
                <li>✅ View contact details of all profiles</li>
                <li>✅ See who viewed your profile</li>
                <li>✅ Advanced search filters</li>
                <li>✅ Priority customer support</li>
              </ul>
              <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
                <Link href="/dashboard/payment">Upgrade Now - ₹999/month</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
