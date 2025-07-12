"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Search, RotateCcw, Lock, MapPin, Calendar, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchFilters {
  ageFrom: string
  ageTo: string
  religion: string
  caste: string
  maritalStatus: string
}

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

const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"]

export default function SearchPage() {
  const { profile } = useAuth()
  const [filters, setFilters] = useState<SearchFilters>({
    ageFrom: "",
    ageTo: "",
    religion: "",
    caste: "",
    maritalStatus: "",
  })
  const [results, setResults] = useState<MatchProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = async () => {
    if (!profile) return

    // Check if at least one filter is selected
    const hasFilters = Object.values(filters).some((value) => value !== "")
    if (!hasFilters) {
      toast({
        title: "Error",
        description: "Please select at least one search criteria",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .neq("gender", profile.gender)
        .neq("id", profile.id)

      // Apply filters
      if (filters.ageFrom && filters.ageTo) {
        query = query.gte("age", Number.parseInt(filters.ageFrom)).lte("age", Number.parseInt(filters.ageTo))
      } else if (filters.ageFrom) {
        query = query.gte("age", Number.parseInt(filters.ageFrom))
      } else if (filters.ageTo) {
        query = query.lte("age", Number.parseInt(filters.ageTo))
      }

      if (filters.religion) {
        query = query.eq("religion", filters.religion)
      }

      if (filters.caste) {
        query = query.ilike("caste", `%${filters.caste}%`)
      }

      if (filters.maritalStatus) {
        query = query.eq("marital_status", filters.maritalStatus)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error

      setResults(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Search failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({
      ageFrom: "",
      ageTo: "",
      religion: "",
      caste: "",
      maritalStatus: "",
    })
    setResults([])
    setHasSearched(false)
  }

  const handleUnlockContact = (matchId: string) => {
    if (!profile?.is_premium) {
      router.push(`/dashboard/payment?return=/dashboard/search&profile=${matchId}`)
    }
  }

  const ageOptions = Array.from({ length: 21 }, (_, i) => i + 25) // 25 to 45

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Matches</h1>
        <p className="text-gray-600 mt-2">Use advanced filters to find your perfect match</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Age From</Label>
              <Select value={filters.ageFrom} onValueChange={(value) => handleFilterChange("ageFrom", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Age To</Label>
              <Select value={filters.ageTo} onValueChange={(value) => handleFilterChange("ageTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Religion</Label>
              <Select value={filters.religion} onValueChange={(value) => handleFilterChange("religion", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {religions.map((religion) => (
                    <SelectItem key={religion} value={religion.toLowerCase()}>
                      {religion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caste</Label>
              <Select value={filters.caste} onValueChange={(value) => handleFilterChange("caste", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Enter caste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brahmin">Brahmin</SelectItem>
                  <SelectItem value="kshatriya">Kshatriya</SelectItem>
                  <SelectItem value="vaishya">Vaishya</SelectItem>
                  <SelectItem value="shudra">Shudra</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Select
                value={filters.maritalStatus}
                onValueChange={(value) => handleFilterChange("maritalStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unmarried">Unmarried</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleSearch} disabled={loading} className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>{loading ? "Searching..." : "Search"}</span>
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex items-center space-x-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Results ({results.length} found)</h2>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria to find more matches.</p>
                <Button onClick={handleReset} variant="outline">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((match) => (
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
        </div>
      )}

      {!profile?.is_premium && results.length > 0 && (
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
