"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Save } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, updateDoc, query, where, collection, getDocs } from "firebase/firestore"
import Link from "next/link"

export default function EditProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    profileImage: ''
  })
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (user) {
      // Fetch current user data from civicUsers collection
      const fetchUserData = async () => {
        try {
          const q = query(collection(db, 'civicUsers'), where('uid', '==', user.id))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data()
            setUserData(data)
            setFormData({
              profileImage: data.profileImage || ''
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      
      fetchUserData()
    }
  }, [user])

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Resize to max 300x300 to reduce size
        const maxSize = 300
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Compress to 70% quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressedBase64)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedBase64 = await compressImage(file)
        setFormData(prev => ({ ...prev, profileImage: compressedBase64 }))
      } catch (error) {
        console.error('Error compressing image:', error)
        alert('Error processing image')
      }
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Find user document in civicUsers collection
      const q = query(collection(db, 'civicUsers'), where('uid', '==', user.id))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const userDocRef = doc(db, 'civicUsers', querySnapshot.docs[0].id)
        await updateDoc(userDocRef, {
          profileImage: formData.profileImage,
          updatedAt: new Date().toISOString()
        })
        
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Edit Profile</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Image */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.profileImage || "/placeholder.svg"} alt={userData?.name || 'User'} />
                  <AvatarFallback>
                    {userData?.name ? userData.name.split(" ").map((n) => n[0]).join("") : 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Click camera icon to update profile picture
              </p>
            </div>
          </CardContent>
        </Card>





        {/* Department Info (Read-only) */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Department Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{user.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}