"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface RegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber?: string
}

const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"]

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
]

export function RegistrationModal({ open, onOpenChange, phoneNumber = "" }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    fatherGuardianName: "",
    email: "",
    phone: phoneNumber,
    religion: "",
    caste: "",
    gender: "",
    maritalStatus: "",
    state: "",
    place: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    // Require phone number (not just email)
    if (!formData.phone) {
      toast({
        title: "Error",
        description: "Please provide your mobile number",
        variant: "destructive",
      })
      return
    }

    // Require email (phone is optional)
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please provide your email address",
        variant: "destructive",
      })
      return
    }

    const required = [
      ["Name", formData.name],
      ["Age", formData.age],
      ["Father/Guardian Name", formData.fatherGuardianName],
      ["Religion", formData.religion],
      ["Gender", formData.gender],
      ["Marital Status", formData.maritalStatus],
      ["State", formData.state],
      ["Place", formData.place],
      ["Caste", formData.caste],
    ]
    for (const [label, value] of required) {
      if (!value) {
        toast({
          title: "Missing field",
          description: `Please enter "${label}"`,
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)

    // Normalize phone number if provided
    let normalizedPhone = null
    if (formData.phone.trim()) {
      const raw = formData.phone.replace(/\D/g, "")
      normalizedPhone = raw.startsWith("91") && raw.length > 10 ? `+${raw}` : `+91${raw}`

      if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
        toast({ title: "Invalid phone", description: "Enter a valid mobile number", variant: "destructive" })
        setLoading(false)
        return
      }
    }

    try {
      // Call our secure API route to create the user & profile
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          phone: normalizedPhone,
          password: formData.password,
          profile: {
            name: formData.name.trim(),
            age: Number(formData.age),
            father_guardian_name: formData.fatherGuardianName.trim(),
            email: formData.email.trim(),
            phone: normalizedPhone,
            religion: formData.religion,
            caste: formData.caste.trim(),
            gender: formData.gender,
            marital_status: formData.maritalStatus,
            state: formData.state,
            place: formData.place.trim(),
          },
        }),
      })

      const isJson = res.headers.get("content-type")?.includes("application/json")
      const payload = isJson ? await res.json() : { error: await res.text() }

      if (!res.ok) {
        throw new Error(payload.error || "Registration failed")
      }

      // Auto-login with email + password
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (signErr) throw signErr

      toast({ title: "Success", description: "Registration complete! Welcome!" })
      onOpenChange(false)
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter mobile number"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fatherGuardianName">Father/Guardian Name *</Label>
            <Input
              id="fatherGuardianName"
              value={formData.fatherGuardianName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fatherGuardianName: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Religion *</Label>
              <Select
                value={formData.religion}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, religion: value }))}
              >
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
            <div>
              <Label htmlFor="caste">Caste *</Label>
              <Input
                id="caste"
                value={formData.caste}
                onChange={(e) => setFormData((prev) => ({ ...prev, caste: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marital Status *</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, maritalStatus: value }))}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="place">Place *</Label>
              <Input
                id="place"
                value={formData.place}
                onChange={(e) => setFormData((prev) => ({ ...prev, place: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                Terms & Conditions
              </a>
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
