"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, doc, addDoc, serverTimestamp, setDoc, writeBatch, increment, arrayUnion } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, Check } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"

const STEPS = { CAMERA: "camera", CROP: "crop", FORM: "form" }

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(STEPS.CAMERA)
  const [description, setDescription] = useState("")
  const [imageData, setImageData] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  // Camera + crop
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  // Location
  const [geoData, setGeoData] = useState<any>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraReady(true)
      }
    } catch (error) {
      console.error("Could not access camera:", error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setIsCameraReady(false)
    }
  }

  const capturePhoto = () => {
    const canvas = document.createElement("canvas")
    const video = videoRef.current
    if (!video) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg")
    setImageData(dataUrl)
    stopCamera()
    setStep(STEPS.FORM)
    getLocation()
  }

  const getLocation = () => {
    if (!navigator.geolocation) return
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await res.json()
          setGeoData({
            latitude,
            longitude,
            city: data.city || data.locality,
            region: data.principalSubdivision,
            country: data.countryName,
            address: `${data.city || data.locality}, ${data.principalSubdivision}, ${data.countryName}`,
          })
        } catch (error) {
          console.error("Could not fetch location details:", error)
          setGeoData({ latitude, longitude })
        }
      },
      (error) => console.error("Location permission denied:", error)
    )
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setTags((prev) => [
        ...prev,
        tagInput.startsWith("#") ? tagInput : `#${tagInput}`,
      ])
      setTagInput("")
    }
  }

  // AI Processing function (same as user app)
  const processWithAI = async (description: string, imageUrl: string | null) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAj2locQOLzDa5F7E91StUEdJGIzZ7d9DQ`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a civic issue classifier. Analyze this post: "${description}"
                
                DEPARTMENTS:
                - pwd: Roads, potholes, construction, buildings, infrastructure repairs
                - water: Water leaks, pipe bursts, sewage blockage, drainage problems
                - swm: Garbage collection, waste disposal, street cleaning, dustbin issues
                - traffic: Traffic signals, parking violations, vehicle issues, road safety
                - health: Public health threats, disease outbreaks, hospital issues, sanitation
                - environment: Parks maintenance, tree cutting, pollution, garden issues
                - electricity: Power outages, street lights, electrical cables, transformer issues
                - disaster: Fire, flood, accidents, emergency situations
                
                RESPONSE FORMAT (JSON only):
                {
                  "department": "pwd | water | swm | traffic | health | environment | electricity | disaster",
                  "priority": "High | Medium | Low | Critical",
                  "summary": "short description"
                }

                If not a civic issue, respond: "REJECT"`
              }]
            }]
          })
        }
      )

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

      if (aiResponse.startsWith("REJECT")) {
        return {
          category: 'rejected',
          priority: 'Low',
          summary: 'Post rejected: Not a civic issue',
          status: 'rejected'
        }
      }

      let cleanResponse = aiResponse
      if (aiResponse.startsWith('```json') && aiResponse.endsWith('```')) {
        cleanResponse = aiResponse.slice(7, -3).trim()
      } else if (aiResponse.startsWith('```') && aiResponse.endsWith('```')) {
        cleanResponse = aiResponse.slice(3, -3).trim()
      }

      const parsed = JSON.parse(cleanResponse)
      const DEPARTMENTS: Record<string, { name: string; priority: string }> = {
        'pwd': { name: 'Public Works Department', priority: 'High' },
        'water': { name: 'Water Supply & Sewage', priority: 'High' },
        'swm': { name: 'Solid Waste Management', priority: 'Medium' },
        'traffic': { name: 'Traffic Police / Transport', priority: 'High' },
        'health': { name: 'Health & Sanitation', priority: 'High' },
        'environment': { name: 'Environment & Parks', priority: 'Medium' },
        'electricity': { name: 'Electricity Department', priority: 'High' },
        'disaster': { name: 'Disaster Management', priority: 'Critical' }
      }

      const deptId = parsed.department.toLowerCase()
      return {
        category: DEPARTMENTS[deptId]?.name || 'General',
        department: deptId,
        priority: parsed.priority || DEPARTMENTS[deptId]?.priority || 'Medium',
        summary: parsed.summary || description.substring(0, 100),
        status: 'working'
      }
    } catch (error) {
      console.error('AI processing failed:', error)
      return {
        category: 'rejected',
        priority: 'Low',
        summary: 'Post rejected: AI processing error',
        status: 'rejected'
      }
    }
  }

  const handleSubmit = async () => {
    if (!description && !imageData) return
    if (!user) return

    try {
      setIsPosting(true)

      // AI categorization
      const aiResult = await processWithAI(description, imageData)
      
      // Create/update user document
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

      const postRef = doc(collection(db, "posts"))
      const postData = {
        uid: user.id,
        description,
        imageUrl: imageData || null,
        tags,
        geoData,
        createdAt: serverTimestamp(),
        status: aiResult.status,
        aiCategory: aiResult.category,
        aiPriority: aiResult.priority,
        aiSummary: aiResult.summary,
        likes: []
      }

      const batch = writeBatch(db)
      batch.set(postRef, postData)
      batch.update(doc(db, "users", user.id), { postCount: increment(1) })

      // Create issue if not rejected
      if (aiResult.status !== 'rejected') {
        const issueRef = doc(collection(db, 'issues'))
        const currentTime = new Date()
        batch.set(issueRef, {
          postId: postRef.id,
          category: aiResult.category,
          priority: aiResult.priority,
          summary: aiResult.summary,
          department: aiResult.department,
          status: 'working',
          geoData,
          reportedAt: serverTimestamp(),
          reportedTime: currentTime.toLocaleString(),
          assignedAt: null,
          assignedTime: null,
          eta: null,
          etaTime: null,
          assignedPersonnel: null,
          updateHistory: [{
            status: 'working',
            timestamp: currentTime.toLocaleString(),
            updatedBy: 'System'
          }],
          relatedPosts: [postRef.id],
          reportCount: 1
        })
      }

      await batch.commit()
      router.push("/")
    } catch (error) {
      console.error("Error posting:", error)
    } finally {
      setIsPosting(false)
    }
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">Create Post</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* CAMERA */}
          {step === STEPS.CAMERA && (
            <div className="relative bg-card">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-[60vh] object-cover"
              />
              {isCameraReady && (
                <div className="absolute bottom-6 w-full flex justify-center">
                  <Button
                    onClick={capturePhoto}
                    className="bg-primary text-primary-foreground p-4 rounded-full shadow-xl"
                  >
                    <Camera className="text-2xl" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* FORM */}
          {step === STEPS.FORM && (
            <div className="bg-card p-6">
              <div className="relative mb-6 border rounded-lg overflow-hidden shadow-md">
                {imageData && (
                  <img
                    src={imageData}
                    alt="Preview"
                    className="w-full max-h-[300px] object-cover"
                  />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setImageData(null)
                    setStep(STEPS.CAMERA)
                    startCamera()
                  }}
                  className="absolute bottom-2 right-2"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {geoData && (
                  <div className="bg-gray-900 text-white text-sm p-3">
                    📍 {geoData.address} <br />
                    Lat: {geoData.latitude?.toFixed(5)}° | Long: {geoData.longitude?.toFixed(5)}°
                  </div>
                )}
              </div>

              <Textarea
                rows={3}
                className="w-full mb-4"
                placeholder="Write something..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex items-center gap-2 mb-3">
                <Input
                  className="flex-grow"
                  placeholder="Add #tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button onClick={handleAddTag}>Add</Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isPosting}
                className="w-full"
              >
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}