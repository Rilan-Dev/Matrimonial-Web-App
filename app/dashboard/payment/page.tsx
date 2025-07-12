"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Crown, Check, Star, Heart, Phone, Eye } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Plan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 499,
    duration: "1 Month",
    features: ["View 10 contact details", "Basic search filters", "Profile visibility boost", "Email support"],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 999,
    duration: "1 Month",
    features: [
      "Unlimited contact details",
      "Advanced search filters",
      "See who viewed your profile",
      "Priority customer support",
      "Profile verification badge",
      "Featured profile listing",
    ],
    popular: true,
  },
  {
    id: "gold",
    name: "Gold Plan",
    price: 2499,
    duration: "3 Months",
    features: [
      "All Premium features",
      "Personal matchmaker assistance",
      "Video call feature",
      "Background verification",
      "Exclusive member events",
      "Relationship counseling session",
    ],
  },
]

export default function PaymentPage() {
  const { profile, refreshProfile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("return") || "/dashboard"
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null)

  useEffect(() => {
    const getKey = async () => {
      const res = await fetch("/api/razorpay-key")
      const json = await res.json()
      setRazorpayKey(json.key)
    }
    getKey()
  }, [])

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async (plan: Plan) => {
    if (!profile) return

    if (!razorpayKey) {
      toast({ title: "Error", description: "Unable to load payment key", variant: "destructive" })
      return
    }

    setLoading(true)
    setSelectedPlan(plan)

    try {
      // Create order in database
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: profile.id,
          amount: plan.price,
          plan_type: plan.id,
          status: "pending",
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: plan.price * 100, // Amount in paise
        currency: "INR",
        name: "Perfect Match",
        description: `${plan.name} - ${plan.duration}`,
        order_id: payment.id,
        handler: async (response: any) => {
          try {
            // Update payment status
            const { error: updateError } = await supabase
              .from("payments")
              .update({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                status: "completed",
              })
              .eq("id", payment.id)

            if (updateError) throw updateError

            // Update user to premium
            const { error: profileError } = await supabase
              .from("profiles")
              .update({ is_premium: true })
              .eq("id", profile.id)

            if (profileError) throw profileError

            await refreshProfile()

            toast({
              title: "Payment Successful!",
              description: `You have successfully upgraded to ${plan.name}`,
            })

            router.push(returnUrl)
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Payment verification failed",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: profile.name,
          email: profile.email || "",
          contact: profile.phone,
        },
        theme: {
          color: "#ec4899",
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setSelectedPlan(null)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Payment initialization failed",
        variant: "destructive",
      })
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  if (profile.is_premium) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-12">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Already Premium!</h2>
            <p className="text-gray-600 mb-6">
              You have access to all premium features. Enjoy finding your perfect match!
            </p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mt-2">Upgrade to premium and unlock all features to find your perfect match</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden ${plan.popular ? "border-pink-500 shadow-lg scale-105" : ""}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-pink-500 text-white px-3 py-1 text-sm font-medium">
                Most Popular
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {plan.id === "basic" && <Heart className="h-12 w-12 text-blue-500" />}
                {plan.id === "premium" && <Crown className="h-12 w-12 text-pink-500" />}
                {plan.id === "gold" && <Star className="h-12 w-12 text-yellow-500" />}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                ₹{plan.price}
                <span className="text-sm font-normal text-gray-600">/{plan.duration}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePayment(plan)}
                disabled={!razorpayKey || (loading && selectedPlan?.id === plan.id)}
                className={`w-full ${plan.popular ? "bg-pink-600 hover:bg-pink-700" : "bg-gray-900 hover:bg-gray-800"}`}
              >
                {loading && selectedPlan?.id === plan.id ? "Processing..." : `Choose ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Why Upgrade to Premium?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <Phone className="h-8 w-8 text-green-500 mx-auto" />
              <h3 className="font-semibold">Unlimited Contact Access</h3>
              <p className="text-sm text-gray-600">View phone numbers and contact details of all profiles</p>
            </div>
            <div className="text-center space-y-2">
              <Eye className="h-8 w-8 text-blue-500 mx-auto" />
              <h3 className="font-semibold">Profile Insights</h3>
              <p className="text-sm text-gray-600">See who viewed your profile and track your popularity</p>
            </div>
            <div className="text-center space-y-2">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto" />
              <h3 className="font-semibold">Priority Support</h3>
              <p className="text-sm text-gray-600">Get dedicated customer support and faster response times</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>Secure payments powered by Razorpay. Your payment information is encrypted and secure.</p>
      </div>
    </div>
  )
}
