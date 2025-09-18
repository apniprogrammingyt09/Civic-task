"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Clock, Camera, Navigation, MessageSquare, Upload, AlertTriangle } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { getTaskById, type Task, type ProofOfWork } from "@/lib/mock-data"
import { toast } from "sonner"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null)
  const [status, setStatus] = useState<Task["status"]>("pending")
  const [notes, setNotes] = useState("")
  const [proofImages, setProofImages] = useState<ProofOfWork[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const foundTask = getTaskById(params.id)
    if (foundTask) {
      setTask(foundTask)
      setStatus(foundTask.status)
      setProofImages(foundTask.proofOfWork)
    }
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
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStatus(newStatus)
    setLoading(false)
    toast.success(`Task status updated to ${newStatus.replace("-", " ")}`)
  }

  const handleAddProof = async (type: "before" | "during" | "after") => {
    setLoading(true)
    // Simulate image upload
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newProof: ProofOfWork = {
      id: `proof_${Date.now()}`,
      type,
      mediaUrl: `/placeholder.svg?height=200&width=300&query=${type} work photo`,
      mediaType: "image",
      notes: notes || `${type} work documentation`,
      timestamp: new Date().toISOString(),
      location: task.location.coordinates,
    }

    setProofImages([...proofImages, newProof])
    setLoading(false)
    toast.success(`${type} photo added successfully`)
  }

  const handleSubmitWork = async () => {
    if (proofImages.length === 0) {
      toast.error("Please add at least one proof of work photo")
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await handleStatusChange("completed")
    toast.success("Work completed successfully!")
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
              <Button variant="ghost" size="sm" className="mr-3">
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
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-sm"></div>
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
                    <Button size="sm" onClick={openInMaps} className="ml-2">
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
                  <Button size="sm" variant="outline">
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
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant={status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("pending")}
                    disabled={loading}
                    className={status === "pending" ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={status === "in-progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("in-progress")}
                    disabled={loading}
                    className={status === "in-progress" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("completed")}
                    disabled={loading}
                    className={status === "completed" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    Completed
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Proof of Work */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Proof of Work</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleAddProof("before")} variant="outline" size="sm" disabled={loading}>
                      <Camera className="h-4 w-4 mr-1" />
                      Before
                    </Button>
                    <Button onClick={() => handleAddProof("during")} variant="outline" size="sm" disabled={loading}>
                      <Camera className="h-4 w-4 mr-1" />
                      During
                    </Button>
                    <Button onClick={() => handleAddProof("after")} variant="outline" size="sm" disabled={loading}>
                      <Camera className="h-4 w-4 mr-1" />
                      After
                    </Button>
                  </div>

                  {proofImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Uploaded Proof</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {proofImages.map((proof, index) => (
                          <div key={proof.id} className="relative">
                            <img
                              src={proof.mediaUrl || "/placeholder.svg"}
                              alt={`Proof ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Badge className="absolute top-1 left-1 text-xs">{proof.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Work Notes</label>
                    <Textarea
                      placeholder="Add notes about the work done..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button className="w-full" onClick={handleSubmitWork} disabled={status === "completed" || loading}>
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
              </CardContent>
            </Card>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
