"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TaskList } from "@/components/task-list"
import { UserProfile } from "@/components/user-profile"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SearchBar } from "@/components/search-bar"
import { CitizenReports } from "@/components/citizen-reports"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="p-4 space-y-4">
          <SearchBar />
          <UserProfile />
          <CitizenReports />
          <TaskList />
        </div>
      </main>
      <BottomNavigation />
    </div>
  )
}
