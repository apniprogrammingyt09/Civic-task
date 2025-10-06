"use client"

import { useState, useMemo, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Eye, Clock, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { mockTasks, type Task } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

type TaskStatus = "all" | "pending" | "in-progress" | "completed" | "escalated"

export function TaskList() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus>("all")
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "created">("deadline")
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    setLoading(true)
    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, where('assignedPersonnel.id', '==', user.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.summary || 'Task assigned',
          category: data.category || 'General',
          priority: data.priority?.toLowerCase() || 'medium',
          status: data.escalation?.status === 'approved' ? 'escalated' : 
                  data.status === 'assign' ? 'pending' : 
                  data.status === 'resolved' ? 'completed' : 
                  data.status,
          location: {
            address: data.geoData?.address || data.geoData?.city || 'Unknown location'
          },
          createdAt: data.reportedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: data.eta || '2-4',
          assignedPersonnel: data.assignedPersonnel
        }
      })
      setAssignedTasks(tasks)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching tasks:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.id])

  const filteredTasks = useMemo(() => {
    let tasks = assignedTasks

    if (statusFilter !== "all") {
      tasks = tasks.filter((task) => task.status === statusFilter)
    }

    // Sort tasks
    tasks.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return tasks
  }, [statusFilter, sortBy, assignedTasks])

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

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 0) {
      return "Overdue"
    } else if (diffInHours < 24) {
      return `${diffInHours}h left`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d left`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{filteredTasks.length} Tasks for you</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === "deadline" ? "priority" : "deadline")}
            className="text-primary"
          >
            <Filter className="h-4 w-4 mr-1" />
            {sortBy === "deadline" ? "Deadline" : "Priority"} ↓
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "in-progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "escalated", label: "Escalated" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={statusFilter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(key as TaskStatus)}
            className={`whitespace-nowrap ${statusFilter === key ? "" : "hover:bg-muted hover:text-foreground"}`}
          >
            {label}
          </Button>
        ))}
      </div>

      {filteredTasks.map((task) => (
        <Card key={task.id} className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/images/sewage-icon.jpg"
                  alt={task.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.category}</p>
                    <p className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()} PRIORITY
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(task.status)} text-white text-xs`}>
                    {task.status.toUpperCase().replace("-", " ")}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{task.location.address}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 text-orange-500" />
                    <span>Priority Task</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(task.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-red-500" />
                    <span className="text-red-600 font-medium">{formatDeadline(task.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link href={`/task/${task.id}`}>
                    <Button variant="outline" size="sm" className="hover:bg-muted hover:text-foreground">
                      VIEW DETAIL
                    </Button>
                  </Link>
                  <div className="text-xs text-muted-foreground">Est. {task.estimatedTime}h</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found for the selected filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
