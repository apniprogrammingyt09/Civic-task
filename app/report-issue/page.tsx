"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Camera, MapPin, AlertTriangle, CheckCircle, Share2 } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"

const issueCategories = [
  "Road Maintenance",
  "Water Supply",
  "Sewage & Drainage",
  "Waste Management",
  "Street Lighting",
  "Public Safety",
  "Parks & Recreation",
  "Traffic Management",
  "Building Violations",
  "Other"
]

const priorityLevels = [
  { value: "low", label: "Low", color: "text-green-600" },
  { value: "medium", label: "Medium", color: "text-yellow-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "urgent", label: "Urgent", color: "text-red-600" }
]

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
    landmark: ""
  })
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [postToFeed, setPostToFeed] = useState(false)
  const [geoData, setGeoData] = useState<any>(null)
  const { user } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages].slice(0, 3)) // Max 3 images
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }))
          
          // Get address from coordinates
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const data = await response.json()
            setGeoData({
              latitude,
              longitude,
              city: data.city || data.locality,
              region: data.principalSubdivision,
              country: data.countryName,
              address: `${data.city || data.locality}, ${data.principalSubdivision}, ${data.countryName}`
            })
          } catch (error) {
            console.error("Error fetching address:", error)
            setGeoData({ latitude, longitude })
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert first image to base64 if exists
      let imageUrl = null
      if (images.length > 0) {
        imageUrl = await convertToBase64(images[0])
      }

      // Create user document if posting to feed
      if (postToFeed && user) {
        await setDoc(doc(db, "users", user.id), {
          username: user.name,
          name: user.name,
          profileImage: user.avatar || "/placeholder-user.jpg",
          userRole: "Department",
          department: user.department,
          postCount: 0,
          followersCount: 0,
          followingCount: 0
        }, { merge: true })

        // Post to user feed
        await addDoc(collection(db, "posts"), {
          uid: user.id,
          description: `${formData.title}\n\n${formData.description}`,
          imageUrl,
          geoData,
          status: "working",
          aiCategory: formData.category,
          aiPriority: formData.priority,
          createdAt: serverTimestamp(),
          likes: [],
          tags: [`#${formData.category.replace(/\s+/g, '')}`]
        })
      }

      setIsSubmitting(false)
      setIsSubmitted(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          title: "",
          description: "",
          category: "",
          priority: "",
          location: "",
          landmark: ""
        })
        setImages([])
        setPostToFeed(false)
        setGeoData(null)
      }, 3000)
    } catch (error) {
      console.error("Error submitting:", error)
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title && formData.description && formData.category && formData.priority && formData.location

  if (isSubmitted) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Issue Reported Successfully!</h2>
              <p className="text-muted-foreground mb-4">
                Your issue has been submitted and assigned ID #ISSUe-{Math.random().toString(36).substr(2, 6).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                You will receive updates on the progress via notifications.
              </p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Report Issue</h1>
          </div>
        </header>

        <main className="pb-20">
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Issue Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {issueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex space-x-2">
                <Input
                  id="location"
                  placeholder="Enter address or coordinates"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline" onClick={getCurrentLocation}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark">Nearby Landmark</Label>
              <Input
                id="landmark"
                placeholder="e.g., Near City Mall, Opposite School"
                value={formData.landmark}
                onChange={(e) => handleInputChange("landmark", e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline" className="cursor-pointer">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>
                  </label>
                  <span className="text-sm text-muted-foreground">Max 3 photos</span>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Post to Feed Option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="postToFeed" 
                checked={postToFeed}
                onCheckedChange={setPostToFeed}
              />
              <Label htmlFor="postToFeed" className="text-sm">
                <div className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Also post to community feed</span>
                </div>
              </Label>
            </div>
            {postToFeed && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-sm text-blue-700">
                    This will share your report with the community to increase awareness and gather support.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {postToFeed ? "Report & Post to Feed" : "Report Issue"}
                  </>
                )}
              </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Reporting Guidelines</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Provide accurate location information</li>
                      <li>• Include clear photos if possible</li>
                      <li>• Be specific in your description</li>
                      <li>• Emergency issues: Call emergency services</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}