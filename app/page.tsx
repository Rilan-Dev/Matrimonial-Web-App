"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationModal } from "@/components/registration-modal"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Heart, Users, Shield, Star, Sparkles, Crown, CheckCircle, Phone, Mail } from "lucide-react"
import { DebugEnv } from "@/components/debug-env"

export default function LandingPage() {
  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  })
  const [loginMethod, setLoginMethod] = useState("password")
  const [showRegistration, setShowRegistration] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const registerButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const detectInputType = (input: string) => {
    // Check if it's an email (contains @ and .)
    if (input.includes("@") && input.includes(".")) {
      return "email"
    }
    // Check if it's a phone number (contains only digits, +, -, spaces, parentheses)
    if (/^[\d\s\-+$$$$]+$/.test(input.replace(/\s/g, ""))) {
      return "phone"
    }
    // Default to email if unclear
    return "email"
  }

  const normalizePhoneNumber = (phone: string) => {
    const raw = phone.replace(/\D/g, "")
    return raw.startsWith("91") && raw.length > 10 ? `+${raw}` : `+91${raw}`
  }

  const checkUserExists = async (emailOrPhone: string) => {
    const inputType = detectInputType(emailOrPhone)

    if (inputType === "email") {
      // Check by email in profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("email, phone")
        .eq("email", emailOrPhone.trim())
        .single()

      return {
        exists: !!data,
        error,
        loginPayload: { email: emailOrPhone.trim() },
        inputType: "email",
      }
    } else {
      // Normalize and check phone number
      const normalizedPhone = normalizePhoneNumber(emailOrPhone)

      if (!/^\+91\d{10}$/.test(normalizedPhone)) {
        throw new Error("Please enter a valid 10-digit mobile number")
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("phone, email")
        .eq("phone", normalizedPhone)
        .single()

      return {
        exists: !!data,
        error,
        loginPayload: { phone: normalizedPhone },
        inputType: "phone",
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginData.emailOrPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email or mobile number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { exists, loginPayload, inputType } = await checkUserExists(loginData.emailOrPhone)

      if (!exists) {
        toast({
          title: "Account not found",
          description: `No account found with this ${inputType}. Please register first.`,
          variant: "destructive",
        })

        // Focus on register button
        setTimeout(() => {
          registerButtonRef.current?.focus()
          registerButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)

        setLoading(false)
        return
      }

      if (loginMethod === "password") {
        if (!loginData.password.trim()) {
          toast({
            title: "Error",
            description: "Please enter your password",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Login with email/phone + password
        const { data, error } = await supabase.auth.signInWithPassword({
          ...loginPayload,
          password: loginData.password,
        })

        if (error) {
          console.error("Login error:", error)
          throw error
        }

        if (data.user) {
          toast({
            title: "Success",
            description: "Login successful!",
          })
        }
      } else {
        // OTP login
        const { error } = await supabase.auth.signInWithOtp(loginPayload)

        if (error) {
          console.error("OTP error:", error)
          throw error
        }

        toast({
          title: "OTP Sent",
          description: `Please check your ${inputType} for the verification code`,
        })
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  const inputType = detectInputType(loginData.emailOrPhone)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Heart className="h-8 w-8 text-pink-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  MATRIMONIAL
                </h1>
                <p className="text-xs text-gray-600">Find Your Perfect Match</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Trusted by 10,000+ couples</span>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 relative z-40">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium flex items-center justify-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>🎉 Join thousands of happy couples - Register today!</span>
            <Sparkles className="h-5 w-5" />
          </p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/Login_Logo.jpg"
                alt="Beautiful Indian wedding couple with rose petals"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Your Perfect Match Awaits</h3>
                <p className="text-white/90">Join thousands of couples who found their soulmate</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Find Your
                <span className="block bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Perfect Life Partner
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Join thousands of happy couples who found their soulmate through our trusted matrimonial platform with
                advanced matching algorithms.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Verified Profiles</h3>
                    <p className="text-sm text-gray-600">100% authentic</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                    <p className="text-sm text-gray-600">Your privacy first</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Success Stories</h3>
                    <p className="text-sm text-gray-600">10,000+ marriages</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Matching</h3>
                    <p className="text-sm text-gray-600">Smart compatibility</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-pink-600">10K+</div>
                  <div className="text-sm text-gray-600">Happy Couples</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">50K+</div>
                  <div className="text-sm text-gray-600">Active Profiles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    {inputType === "email" ? (
                      <Mail className="h-8 w-8 text-white" />
                    ) : (
                      <Phone className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription>Login with your email or mobile number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="emailOrPhone" className="text-gray-700 font-medium flex items-center space-x-2">
                        {inputType === "email" ? (
                          <Mail className="h-4 w-4 text-pink-600" />
                        ) : (
                          <Phone className="h-4 w-4 text-pink-600" />
                        )}
                        <span>Email or Mobile Number</span>
                      </Label>
                      <Input
                        id="emailOrPhone"
                        type="text"
                        placeholder="Enter email or mobile number"
                        value={loginData.emailOrPhone}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, emailOrPhone: e.target.value }))}
                        className="mt-1 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {inputType === "email" ? "Format: user@example.com" : "Format: 9876543210 or +919876543210"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium">Login Method</Label>
                      <RadioGroup value={loginMethod} onValueChange={setLoginMethod} className="flex space-x-6 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="password" id="password" className="border-pink-500 text-pink-500" />
                          <Label htmlFor="password" className="flex items-center space-x-1">
                            <span>📌</span>
                            <span>Password</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="otp" id="otp" className="border-pink-500 text-pink-500" />
                          <Label htmlFor="otp" className="flex items-center space-x-1">
                            <span>🔑</span>
                            <span>OTP</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {loginMethod === "password" && (
                      <div>
                        <Label htmlFor="password-input" className="text-gray-700 font-medium">
                          Password
                        </Label>
                        <Input
                          id="password-input"
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                          className="mt-1 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                          required
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-medium py-2.5"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Please wait...</span>
                        </div>
                      ) : (
                        `Login with ${loginMethod === "password" ? "Password" : "OTP"}`
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        ref={registerButtonRef}
                        type="button"
                        variant="outline"
                        className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        onClick={() => setShowRegistration(true)}
                      >
                        <span className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4" />
                          <span>New User? Register Here</span>
                        </span>
                      </Button>
                    </div>
                  </form>

                  {/* Trust Indicators */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Private</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Trusted</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal
        open={showRegistration}
        onOpenChange={setShowRegistration}
        phoneNumber={inputType === "phone" ? loginData.emailOrPhone : ""}
      />
      {/* <DebugEnv /> */}
    </div>
  )
}
