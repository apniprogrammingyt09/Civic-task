"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, getCurrentUser, mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: { email: string; otp: string }) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function getLeaderboard(): User[] {
  return mockUsers
    .sort((a, b) => b.civicScore - a.civicScore)
    .map((user, index) => ({
      ...user,
      stats: {
        ...user.stats,
        leaderboardRank: index + 1,
      },
    }))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("civic-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (credentials: { email: string; otp: string }): Promise<boolean> => {
    setLoading(true)

    // Mock authentication - accept any email with OTP "123456"
    if (credentials.otp === "123456") {
      const mockUser = getCurrentUser()
      setUser(mockUser)
      localStorage.setItem("civic-user", JSON.stringify(mockUser))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("civic-user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
