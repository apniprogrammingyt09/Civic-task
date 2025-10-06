"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import { type User, getCurrentUser, mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<boolean>
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check civicUsers collection for department-created users
          const q = query(collection(db, 'civicUsers'), where('uid', '==', firebaseUser.uid))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data()
            const mockUser = {
              ...getCurrentUser(),
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              department: userData.departmentName || 'General',
              role: userData.role || 'citizen',
              profileImage: userData.profileImage || '',
              avatar: userData.profileImage || ''
            }
            console.log('Civic user logged in with ID:', firebaseUser.uid)
            console.log('User data from civicUsers:', userData)
            console.log('Final user object:', mockUser)
            setUser(mockUser)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      return true
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
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
