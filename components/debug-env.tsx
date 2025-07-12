"use client"

export function DebugEnv() {
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-50">
      <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌"}</div>
      <div>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌"}</div>
    </div>
  )
}
