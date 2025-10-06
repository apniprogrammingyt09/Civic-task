"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  BarChart3, 
  Tv, 
  User, 
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  MessageSquare,
  Plus
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function TopNavigation() {
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, where('assignedPersonnel.id', '==', user.id), orderBy('lastUpdated', 'desc'), limit(10))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0
      snapshot.docs.forEach((doc, index) => {
        const task = doc.data()
        if (index < 3) { // Consider first 3 as unread
          if (task.proofStatus === 'rejected' || task.escalation?.status === 'rejected') {
            count++
          }
        }
      })
      count++ // Add system notification
      setUnreadCount(count)
    })

    return () => unsubscribe()
  }, [user])



  const navItems = [
    { path: "/", icon: Briefcase, label: "TASKS" },
    { path: "/leaderboard", icon: BarChart3, label: "LEADERBOARD" },
    { path: "/pow", icon: Tv, label: "POW" },
    { path: "/chat", icon: MessageSquare, label: "CHAT" },
    { path: "/profile", icon: User, label: "PROFILE" },
  ]

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-sm text-primary font-medium">
          CIVIC TASK
        </div>
        
        {/* Department Badge */}
        {user?.department && (
          <div className="px-2 py-1 sm:px-3 sm:py-2 bg-transparent rounded border border-primary text-primary text-xs sm:text-sm">
            {user.department} DEPT
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* Navigation Items */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(item.path)}
              className="text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Create Post Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/create-post')}
          className="text-xs flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">POST</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/notifications')}
          className="text-muted-foreground hover:text-primary p-2 relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src={user.profileImage || user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">
                {user.name?.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-xs text-muted-foreground">
              <div>{user.name?.split(" ")[0]}</div>
              <div>ID: {user.id?.slice(-4)}</div>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-primary p-2"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive p-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  )
}