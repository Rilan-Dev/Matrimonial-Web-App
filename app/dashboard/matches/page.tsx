"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Lock, Heart, MapPin, Calendar, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface MatchProfile {
  id: string
  name: string
  age: number
  religion: string
  caste: string
  state: string
  place: string
  photo_url: string | null
  phone: string
  about_me: string | null
  marital_status: string
}

export default function MatchesPage() {
  const { profile } = useAuth()
  const [matches, setMatches] = useState<MatchProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchMatches = async () => {
      if (!profile) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("is_active", true)
          .neq("gender", profile.gender)
          .neq("id", profile.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setMatches(data || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch matches",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [profile, toast])

  const handleUnlockContact = (matchId: string) => {
    if (!profile?.is_premium) {
      router.push(`/dashboard/payment?return=/dashboard/matches&profile=${matchId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
        <p className="text-gray-600 mt-2">
          {profile?.gender === "male" ? "Browse bride profiles" : "Browse groom profiles"} that match your preferences
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any matches for you at the moment. Try updating your profile or check back later.
            </p>
            <Button onClick={() => router.push("/dashboard/profile")}>Update Profile</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.is_premium ? match.photo_url || "" : ""} alt={match.name} />
                    <AvatarFallback className="text-lg">
                      {profile?.is_premium ? match.name.charAt(0).toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{match.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{match.age} years</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {match.place}, {match.state}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{match.religion}</Badge>
                    <Badge variant="outline">{match.caste}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {match.marital_status}
                    </Badge>
                  </div>
                </div>

                {match.about_me && (
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-3">{match.about_me}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {profile?.is_premium ? (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{match.phone}</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleUnlockContact(match.id)}
                      variant="outline"
                      className="w-full flex items-center space-x-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Unlock Contact</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!profile?.is_premium && matches.length > 0 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-yellow-800">Upgrade to Premium to Unlock All Features</h3>
              <p className="text-yellow-700">View contact details and photos of all profiles instantly</p>
              <Button onClick={() => router.push("/dashboard/payment")} className="bg-yellow-600 hover:bg-yellow-700">
                Upgrade Now - ₹999/month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
