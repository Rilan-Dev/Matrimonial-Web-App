"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { User, Heart, Search, LogOut, Home, AlertCircle, Loader2, Crown, Sparkles } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
      <Card className="w-96 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
            <Heart className="h-6 w-6 text-pink-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-sm text-gray-600 text-center">Please wait while we load your profile and dashboard...</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 text-center mb-6">{error}</p>
          <div className="flex space-x-3">
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = "/")} className="bg-pink-600 hover:bg-pink-700">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, profileLoading, error, signOut, refreshProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Show loading spinner while auth is initializing
  if (loading) {
    return <LoadingSpinner />
  }

  // Show error state if there's an error and no user
  if (error && !user) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />
  }

  // Redirect if no user
  if (!user) {
    return null
  }

  const menuItems = [
    { title: "Dashboard", icon: Home, href: "/dashboard", color: "text-blue-600" },
    { title: "Profile", icon: User, href: "/dashboard/profile", color: "text-green-600" },
    { title: "Your Matches", icon: Heart, href: "/dashboard/matches", color: "text-pink-600" },
    { title: "Search", icon: Search, href: "/dashboard/search", color: "text-purple-600" },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar className="border-r-0 shadow-lg">
          <SidebarHeader className="p-4 sm:p-6 bg-gradient-to-br from-pink-600 via-rose-600 to-orange-500 text-white">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="relative flex-shrink-0">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 absolute -top-1 -right-1" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold truncate">MATRIMONIAL</h2>
                <p className="text-xs text-pink-100 truncate">Find Your Perfect Match</p>
              </div>
            </div>

            {profile ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-lg font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate" title={profile.name}>
                      {profile.name}
                    </p>
                    <p className="text-xs text-pink-100 truncate" title={profile.email || profile.phone || ""}>
                      {profile.email || profile.phone}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center sm:justify-start">
                  {profile.is_premium ? (
                    <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs">
                      Free Member
                    </Badge>
                  )}
                </div>
              </div>
            ) : profileLoading ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white flex-shrink-0" />
                  <span className="text-sm text-white truncate">Loading profile...</span>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-red-300/30">
                <p className="text-sm text-white mb-3 truncate">Profile error</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent text-xs"
                  onClick={refreshProfile}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-yellow-300/30">
                <p className="text-sm text-white mb-3 truncate">Profile not loaded</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent text-xs"
                  onClick={refreshProfile}
                >
                  Load Profile
                </Button>
              </div>
            )}
          </SidebarHeader>

          <SidebarContent className="bg-white">
            <div className="p-3 sm:p-4">
              <SidebarMenu className="space-y-1 sm:space-y-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="hover:bg-gray-50 rounded-lg transition-colors">
                      <Link href={item.href} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg bg-gray-100 ${item.color} flex-shrink-0`}>
                          <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <span className="font-medium text-gray-700 text-sm sm:text-base truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            {/* Quick Stats */}
            {profile && (
              <div className="mx-3 sm:mx-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Quick Stats</span>
                </h4>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 truncate">Profile Views</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 truncate">Matches</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 truncate">Completion</span>
                    <span className="font-medium text-green-600 flex-shrink-0">85%</span>
                  </div>
                </div>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="p-3 sm:p-4 bg-gray-50 border-t">
            <Button
              variant="outline"
              className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 text-sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700 truncate">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-white px-3 sm:px-4 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            {profile ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xs sm:text-sm text-gray-600 truncate hidden sm:inline">
                  Welcome back, {profile.name}
                </span>
                {profile.is_premium && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            ) : profileLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Loading...</span>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={refreshProfile}
                className="border-pink-200 text-pink-600 bg-transparent text-xs"
              >
                Load Profile
              </Button>
            )}
          </header>

          <main className="flex-1 p-4 sm:p-6">
            {/* Show profile error at the top if there's an error but user exists */}
            {error && user && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="flex items-center justify-between text-red-800">
                  <span className="truncate mr-2">{error}</span>
                  <Button
                    onClick={refreshProfile}
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 bg-transparent flex-shrink-0"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
