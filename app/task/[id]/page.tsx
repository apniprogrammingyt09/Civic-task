"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Clock, Camera, Navigation, MessageSquare, Upload, AlertTriangle, Wrench, Droplets, Zap, TreePine, Car, Home, AlertCircle } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

type Task = {
  id: string
  title: string
  category: string
  priority: string
  status: string
  location: {
    address: string
    coordinates?: { lat: number; lng: number }
  }
  description: string
  estimatedTime: string
  deadline: string
  reportedBy: string
  attachments: string[]
  assignedPersonnel?: any
}

type ProofOfWork = {
  id: string
  type: "completed"
  mediaUrl: string
  mediaType: "image" | "video"
  notes: string
  timestamp: string
  location?: { lat: number; lng: number }
  geoVerified?: boolean
  accuracy?: number
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [status, setStatus] = useState<Task["status"]>("pending")
  const [notes, setNotes] = useState("")
  const [proofImages, setProofImages] = useState<ProofOfWork[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [proofStatus, setProofStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [showEscalation, setShowEscalation] = useState(false)
  const [escalationReason, setEscalationReason] = useState('')

  const updateUserPostStatus = async (taskId: string, newStatus: string) => {
    try {
      const issuesRef = collection(db, 'issues')
      const issueQuery = query(issuesRef, where('__name__', '==', taskId))
      const issueSnapshot = await getDocs(issueQuery)
      
      if (!issueSnapshot.empty) {
        const issueData = issueSnapshot.docs[0].data()
        const originalPostId = issueData.originalPostId
        
        if (originalPostId) {
          const postRef = doc(db, 'posts', originalPostId)
          await updateDoc(postRef, {
            status: newStatus,
            lastStatusUpdate: serverTimestamp()
          })
        }
      }
    } catch (error) {
      console.error('Error updating user post status:', error)
    }
  }

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'issues', params.id))
        if (taskDoc.exists()) {
          const data = taskDoc.data()
          // Determine status based on proof approval and escalation
          let taskStatus = data.status === 'assign' ? 'pending' : data.status
          if (data.proofStatus === 'approved') {
            taskStatus = 'completed'
          } else if (data.status === 'resolved') {
            taskStatus = 'completed'
          } else if (data.proofStatus === 'rejected' || data.escalation?.status === 'rejected') {
            taskStatus = 'pending'
          }
          
          const taskData: Task = {
            id: taskDoc.id,
            title: data.summary || 'Task assigned',
            category: data.category || 'General',
            priority: data.priority?.toLowerCase() || 'medium',
            status: taskStatus,
            location: {
              address: data.geoData?.address || data.geoData?.city || 'Unknown location',
              coordinates: data.geoData?.latitude && data.geoData?.longitude ? {
                lat: data.geoData.latitude,
                lng: data.geoData.longitude
              } : undefined
            },
            description: data.summary || 'No description available',
            estimatedTime: data.eta || '2-4',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            reportedBy: 'Citizen Report',
            attachments: data.imageUrl ? [data.imageUrl] : [],
            assignedPersonnel: data.assignedPersonnel
          }
          setTask(taskData)
          setStatus(taskData.status as any)
          setProofImages(data.proofOfWork || [])
          setIsSubmitted(data.status === 'pending-review' || data.submittedAt)
          setProofStatus(data.proofStatus || 'pending')
        }
      } catch (error) {
        console.error('Error fetching task:', error)
        toast.error('Failed to load task details')
      }
    }
    
    fetchTask()
  }, [params.id])

  if (!task) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p>Task not found</p>
        </div>
      </AuthGuard>
    )
  }

  const handleStatusChange = async (newStatus: Task["status"]) => {
    if (!task) return
    
    if (newStatus === 'escalated') {
      setShowEscalation(true)
      return
    }
    
    const confirmed = window.confirm(`Are you sure you want to change status to ${newStatus.replace("-", " ")}?`)
    if (!confirmed) return
    
    setLoading(true)
    try {
      const taskRef = doc(db, 'issues', task.id)
      const firebaseStatus = newStatus === 'pending' ? 'assign' : newStatus
      
      await updateDoc(taskRef, {
        status: firebaseStatus,
        lastUpdated: serverTimestamp()
      })
      
      // Update user post status
      const postStatus = newStatus === 'pending' ? 'assign' : newStatus
      await updateUserPostStatus(task.id, postStatus)
      
      setStatus(newStatus)
      toast.success(`Task status updated to ${newStatus.replace("-", " ")}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update task status')
    }
    setLoading(false)
  }

  const handleEscalation = async () => {
    if (!task || !escalationReason.trim()) {
      toast.error('Please provide a reason for escalation')
      return
    }
    
    setLoading(true)
    try {
      const taskRef = doc(db, 'issues', task.id)
      await updateDoc(taskRef, {
        status: 'escalated',
        escalation: {
          reason: escalationReason,
          escalatedBy: user?.name || 'Worker',
          escalatedAt: serverTimestamp(),
          status: 'pending'
        },
        lastUpdated: serverTimestamp()
      })
      
      // Update user post status
      await updateUserPostStatus(task.id, 'escalated')
      
      setStatus('escalated')
      setShowEscalation(false)
      setEscalationReason('')
      toast.success('Task escalated to department successfully')
    } catch (error) {
      console.error('Error escalating task:', error)
      toast.error('Failed to escalate task')
    }
    setLoading(false)
  }

  const handleAddProof = async (type: "completed") => {
    if (!task) return
    
    setLoading(true)
    try {
      // Access camera directly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      })
      
      // Create video element
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.playsInline = true
      
      // Create modal overlay
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
        background: black; z-index: 9999; display: flex; flex-direction: column;
        touch-action: none;
      `
      
      // Style video
      video.style.cssText = 'flex: 1; width: 100%; height: 100%; object-fit: cover;'
      
      // Create buttons container
      const buttons = document.createElement('div')
      buttons.style.cssText = `
        padding: 16px; display: flex; gap: 12px; justify-content: center;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
        position: absolute; bottom: 0; left: 0; right: 0;
      `
      
      const captureBtn = document.createElement('button')
      captureBtn.textContent = 'Capture'
      captureBtn.style.cssText = `
        padding: 14px 28px; background: #3b82f6; color: white; border: none; 
        border-radius: 8px; font-size: 16px; font-weight: 600;
        min-width: 120px; touch-action: manipulation;
      `
      
      const cancelBtn = document.createElement('button')
      cancelBtn.textContent = 'Cancel'
      cancelBtn.style.cssText = `
        padding: 14px 28px; background: #6b7280; color: white; border: none; 
        border-radius: 8px; font-size: 16px; font-weight: 600;
        min-width: 120px; touch-action: manipulation;
      `
      
      buttons.appendChild(captureBtn)
      buttons.appendChild(cancelBtn)
      overlay.appendChild(video)
      overlay.appendChild(buttons)
      document.body.appendChild(overlay)
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop())
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay)
        }
        setLoading(false)
      }
      
      cancelBtn.onclick = cleanup
      
      captureBtn.onclick = async () => {
        try {
          // Create canvas to capture frame
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(video, 0, 0)
          
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
          // Get location
          let location = task.location.coordinates
          let geoVerified = false
          let accuracy = 0
          
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 60000
              })
            })
            location = { lat: position.coords.latitude, lng: position.coords.longitude }
            geoVerified = true
            accuracy = position.coords.accuracy
          } catch (geoError) {
            console.log('Location not available, using task location')
          }
          
          const newProof: ProofOfWork = {
            id: `proof_${Date.now()}`,
            type,
            mediaUrl: imageDataUrl,
            mediaType: "image",
            notes: notes || `Work completion photo`,
            timestamp: new Date().toISOString(),
            location,
            geoVerified,
            accuracy
          }

          const updatedProofs = [newProof]
          
          const taskRef = doc(db, 'issues', task.id)
          await updateDoc(taskRef, {
            proofOfWork: updatedProofs,
            lastUpdated: serverTimestamp()
          })
          
          setProofImages(updatedProofs)
          toast.success(geoVerified ? 'Photo captured with location verification' : 'Photo captured')
          cleanup()
        } catch (error) {
          console.error('Error capturing photo:', error)
          toast.error('Failed to capture photo')
          cleanup()
        }
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      toast.error('Camera access required to capture photos')
      setLoading(false)
    }
  }

  const handleSubmitWork = async () => {
    if (!task) return
    if (proofImages.length === 0) {
      toast.error("Please add at least one proof of work photo")
      return
    }

    setLoading(true)
    try {
      const taskRef = doc(db, 'issues', task.id)
      await updateDoc(taskRef, {
        status: 'pending-review',
        submittedAt: serverTimestamp(),
        workNotes: notes,
        proofOfWork: proofImages,
        lastUpdated: serverTimestamp()
      })
      
      // Update user post status
      await updateUserPostStatus(task.id, 'pending-review')
      
      setStatus('pending-review' as any)
      setIsSubmitted(true)
      setProofStatus('pending')
      toast.success("Work submitted for review!")
    } catch (error) {
      console.error('Error submitting work:', error)
      toast.error('Failed to submit work')
    }
    setLoading(false)
  }

  const openInMaps = () => {
    const { lat, lng } = task.location.coordinates
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      case "pending":
        return "bg-red-500"
      case "escalated":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityIcon = (priority: Task["priority"]) => {
    if (priority === "urgent" || priority === "high") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 0) {
      return { text: "Overdue", color: "text-red-600" }
    } else if (diffInHours < 24) {
      return { text: `${diffInHours}h left`, color: "text-orange-600" }
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return { text: `${diffInDays}d left`, color: "text-green-600" }
    }
  }

  const deadlineInfo = formatDeadline(task.deadline)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-3 hover:bg-muted hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Task Details</h1>
          </div>
          <Badge className={`${getStatusColor(status)} text-white`}>{status.toUpperCase().replace("-", " ")}</Badge>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-4">
            {/* Task Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {task.category === "Sanitation" && <Droplets className="h-6 w-6 text-blue-600" />}
                    {task.category === "Electrical" && <Zap className="h-6 w-6 text-yellow-600" />}
                    {task.category === "Maintenance" && <Wrench className="h-6 w-6 text-gray-600" />}
                    {task.category === "Environment" && <TreePine className="h-6 w-6 text-green-600" />}
                    {task.category === "Transport" && <Car className="h-6 w-6 text-purple-600" />}
                    {!['Sanitation', 'Electrical', 'Maintenance', 'Environment', 'Transport'].includes(task.category) && <Home className="h-6 w-6 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold">{task.title}</h2>
                      {getPriorityIcon(task.priority)}
                    </div>
                    <p className="text-muted-foreground">{task.category}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{task.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Details */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{task.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <p
                      className={`font-medium ${task.priority === "urgent" || task.priority === "high" ? "text-red-500" : "text-yellow-500"}`}
                    >
                      {task.priority.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Est. Time</span>
                    <p className="font-medium">{task.estimatedTime}h</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Location</span>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{task.location.address}</p>
                    <Button size="sm" onClick={openInMaps} className="ml-2 hover:opacity-90">
                      <Navigation className="h-4 w-4 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reported By */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Reported By</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={task.reportedBy} />
                      <AvatarFallback>RC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{task.reportedBy}</p>
                      <p className="text-sm text-muted-foreground">Citizen Report</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="hover:bg-muted hover:text-foreground">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Citizen Attachments */}
            {task.attachments.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Citizen's Evidence</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {task.attachments.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Update Status</h3>
                {(task.escalation?.status === 'approved' || isSubmitted) ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <span className="text-gray-600 font-medium">
                      {task.escalation?.status === 'approved' ? 'Task escalated - Status locked' : 'Proof submitted - Status locked'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button
                        variant={status === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange("pending")}
                        disabled={loading}
                        className={status === "pending" ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-muted hover:text-foreground"}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={status === "in-progress" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange("in-progress")}
                        disabled={loading}
                        className={status === "in-progress" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "hover:bg-muted hover:text-foreground"}
                      >
                        In Progress
                      </Button>
                    </div>
                    <Button
                      variant={status === "escalated" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("escalated")}
                      disabled={loading}
                      className={`w-full ${status === "escalated" ? "bg-purple-500 hover:bg-purple-600 text-white" : "hover:bg-muted hover:text-foreground"}`}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Escalate to Department
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Escalation Modal */}
            {showEscalation && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">Escalate Task to Department</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-orange-700 dark:text-orange-300">Reason for Escalation</label>
                      <Textarea
                        placeholder="Explain why this task needs department attention (e.g., requires special equipment, safety concerns, beyond worker scope)..."
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEscalation}
                        disabled={loading || !escalationReason.trim()}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {loading ? 'Escalating...' : 'Submit Escalation'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowEscalation(false)
                          setEscalationReason('')
                        }}
                        className="flex-1 hover:bg-muted hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proof of Work */}
            {!(task.escalation?.status === 'approved') && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Proof of Work</h3>

                {isSubmitted ? (
                  <div className="space-y-4">
                    {proofStatus === 'pending' && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">⏳</span>
                        </div>
                        <span className="text-blue-700 font-medium">Work submitted - Pending review</span>
                      </div>
                    )}
                    {proofStatus === 'approved' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-green-700 font-medium">Work approved - Task completed!</span>
                      </div>
                    )}
                    {proofStatus === 'rejected' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✗</span>
                        </div>
                        <span className="text-red-700 font-medium">Work rejected - Resubmission required</span>
                      </div>
                    )}
                    
                    {proofImages.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Submitted Evidence</h4>
                        <div className="relative">
                          <img
                            src={proofImages[0].mediaUrl || "/placeholder.svg"}
                            alt="Work completion proof"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {proofImages[0].geoVerified && (
                            <Badge className="absolute top-2 right-2 text-xs bg-green-500">
                              📍 Location Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          <div className="text-xs text-gray-600">
                            <strong>Submitted:</strong> {new Date(proofImages[0].timestamp).toLocaleString()}
                          </div>
                          {proofImages[0].location && (
                            <div className="text-xs text-gray-600">
                              <strong>Location:</strong> {proofImages[0].location.lat.toFixed(6)}, {proofImages[0].location.lng.toFixed(6)}
                              {proofImages[0].geoVerified && ` (Accuracy: ${proofImages[0].accuracy?.toFixed(0)}m)`}
                            </div>
                          )}
                          {proofImages[0].notes && (
                            <div className="text-xs text-gray-600">
                              <strong>Notes:</strong> {proofImages[0].notes}
                            </div>
                          )}
                        </div>
                        
                        {proofStatus === 'rejected' && (
                          <Button 
                            onClick={() => {
                              setIsSubmitted(false)
                              setProofImages([])
                              setProofStatus('pending')
                            }} 
                            variant="outline" 
                            className="w-full"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Reupload Proof of Work
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {proofStatus === 'pending' && (
                      <Button 
                        onClick={handleSubmitWork} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Resubmitting...
                          </>
                        ) : (
                          "Resubmit Work"
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proofImages.length === 0 ? (
                      <Button 
                        onClick={() => handleAddProof("completed")} 
                        variant="outline" 
                        size="lg" 
                        disabled={loading}
                        className="w-full h-20 flex flex-col gap-2"
                      >
                        <Camera className="h-8 w-8" />
                        {loading ? 'Opening Camera...' : 'Capture Completion Photo'}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Work Completion Photo</h4>
                        <div className="relative">
                          <img
                            src={proofImages[0].mediaUrl || "/placeholder.svg"}
                            alt="Work completion proof"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {proofImages[0].geoVerified && (
                            <Badge className="absolute top-2 right-2 text-xs bg-green-500">
                              📍 Location Verified
                            </Badge>
                          )}
                        </div>
                        <Button 
                          onClick={() => setProofImages([])} 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                        >
                          Retake Photo
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Work Notes</label>
                      <Textarea
                        placeholder="Describe the work completed..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleSubmitWork} 
                      disabled={proofImages.length === 0 || loading}
                    >
                      {loading ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Work Completion"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
