import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\+\d{8,15}$/)
    .optional()
    .nullable(),
  password: z.string().min(6),
  profile: z.object({
    name: z.string().min(1),
    age: z.number().int().min(18).max(100),
    father_guardian_name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z
      .string()
      .regex(/^\+\d{8,15}$/)
      .optional()
      .nullable(),
    religion: z.string().min(1),
    caste: z.string().min(1),
    gender: z.enum(["male", "female"]),
    marital_status: z.enum(["unmarried", "divorced", "widowed"]),
    state: z.string().min(1),
    place: z.string().min(1),
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      if (process.env.NODE_ENV === "development") {
        console.error("Registration – Zod errors:", parsed.error.flatten())
      }
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
    }

    if (!parsed.data.email && !parsed.data.phone) {
      return NextResponse.json({ error: "Either email or phone is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check for orphaned auth users first
    if (parsed.data.email) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const orphanedUser = existingUsers.users?.find((user) => user.email === parsed.data.email)

      if (orphanedUser) {
        // Check if profile exists
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", orphanedUser.id).single()

        if (!profile) {
          // Orphaned user found - delete and recreate
          console.log("Cleaning up orphaned auth user:", orphanedUser.id)
          await supabase.auth.admin.deleteUser(orphanedUser.id)
        }
      }
    }

    // Create auth user
    const authPayload: Record<string, unknown> = {
      password: parsed.data.password,
      user_metadata: { name: parsed.data.profile.name },
    }

    if (parsed.data.email) {
      authPayload.email = parsed.data.email
      authPayload.email_confirm = true
    }

    if (parsed.data.phone) {
      authPayload.phone = parsed.data.phone
      authPayload.phone_confirm = true
    }

    const { data: user, error: authErr } = await supabase.auth.admin.createUser(authPayload)

    if (authErr) {
      console.error("Auth creation error:", authErr)
      return NextResponse.json({ error: authErr.message }, { status: 400 })
    }

    if (!user?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    // Insert profile row with all required fields
    const profileData = {
      id: user.user.id,
      name: parsed.data.profile.name,
      age: parsed.data.profile.age,
      father_guardian_name: parsed.data.profile.father_guardian_name,
      email: parsed.data.profile.email,
      phone: parsed.data.profile.phone,
      religion: parsed.data.profile.religion,
      caste: parsed.data.profile.caste,
      gender: parsed.data.profile.gender,
      marital_status: parsed.data.profile.marital_status,
      state: parsed.data.profile.state,
      place: parsed.data.profile.place,
      is_active: true,
      is_premium: false,
    }

    const { error: profileErr } = await supabase.from("profiles").insert(profileData)

    if (profileErr) {
      console.error("Profile creation error:", profileErr)
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(user.user.id)
      return NextResponse.json({ error: `Profile creation failed: ${profileErr.message}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: user.user.id })
  } catch (err: any) {
    console.error("Registration – unhandled error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
