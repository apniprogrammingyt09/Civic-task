"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Info, X, Clock, Users } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"



export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "emergency" | "tasks">("all")

  useEffect(() => {
    setNotificationList([])
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const [notificationList, setNotificationList] = useState([])

  useEffect(() => {
    if (!user?.id) return

    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, where('assignedPersonnel.id', '==', user.id), orderBy('lastUpdated', 'desc'), limit(20))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = []
      
      snapshot.docs.forEach((doc, index) => {
        const task = doc.data()
        const taskId = doc.id
        const timeAgo = task.lastUpdated?.toDate ? 
          new Date().getTime() - task.lastUpdated.toDate().getTime() < 3600000 ? 
            Math.floor((new Date().getTime() - task.lastUpdated.toDate().getTime()) / 60000) + ' min ago' :
            Math.floor((new Date().getTime() - task.lastUpdated.toDate().getTime()) / 3600000) + ' hours ago'
          : 'Recently'

        // New task assignment
        if (task.status === 'assign' && task.assignedAt) {
          notifications.push({
            id: `assign-${taskId}`,
            type: 'task',
            title: 'New Task Assigned',
            message: `${task.summary || 'Task'} at ${task.geoData?.address || 'location'} has been assigned to you. Priority: ${task.priority || 'medium'}`,
            time: timeAgo,
            read: index > 2,
            icon: Info,
            color: 'text-blue-500',
            priority: task.priority?.toLowerCase() || 'medium',
            taskId
          })
        }

        // Proof approved
        if (task.proofStatus === 'approved') {
          notifications.push({
            id: `approved-${taskId}`,
            type: 'task',
            title: 'Work Approved',
            message: `Your work on ${task.summary || 'task'} has been approved by the department.`,
            time: timeAgo,
            read: index > 1,
            icon: CheckCircle,
            color: 'text-green-500',
            priority: 'medium',
            taskId
          })
        }

        // Proof rejected
        if (task.proofStatus === 'rejected') {
          notifications.push({
            id: `rejected-${taskId}`,
            type: 'task',
            title: 'Work Rejected',
            message: `Your work on ${task.summary || 'task'} needs revision. Please resubmit proof of work.`,
            time: timeAgo,
            read: false,
            icon: AlertTriangle,
            color: 'text-red-500',
            priority: 'high',
            taskId
          })
        }

        // Escalation approved
        if (task.escalation?.status === 'approved') {
          notifications.push({
            id: `esc-approved-${taskId}`,
            type: 'escalation',
            title: 'Escalation Approved',
            message: `Your escalation for ${task.summary || 'task'} has been approved by the department.`,
            time: timeAgo,
            read: index > 1,
            icon: CheckCircle,
            color: 'text-green-500',
            priority: 'medium',
            taskId
          })
        }

        // Escalation rejected
        if (task.escalation?.status === 'rejected') {
          notifications.push({
            id: `esc-rejected-${taskId}`,
            type: 'escalation',
            title: 'Escalation Rejected',
            message: `Your escalation for ${task.summary || 'task'} was not approved. Please continue with the task.`,
            time: timeAgo,
            read: false,
            icon: AlertTriangle,
            color: 'text-red-500',
            priority: 'high',
            taskId
          })
        }
      })

      // Add system notification
      notifications.unshift({
        id: 'system-1',
        type: 'emergency',
        title: 'Weather Alert',
        message: 'Heavy rain expected tomorrow. Prioritize drainage-related tasks and ensure safety protocols.',
        time: '5 min ago',
        read: false,
        icon: AlertTriangle,
        color: 'text-red-500',
        priority: 'high'
      })

      setNotificationList(notifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }))
    })

    return () => unsubscribe()
  }, [user])

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const dismissNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((notif) => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filteredNotifications = useMemo(() => {
    return notificationList.filter((notif) => {
      if (selectedFilter === "all") return true
      if (selectedFilter === "unread") return !notif.read
      if (selectedFilter === "emergency") return notif.type === "emergency" || notif.priority === "high"
      if (selectedFilter === "tasks") return notif.type === "task" || notif.type === "escalation"
      return true
    })
  }, [notificationList, selectedFilter])

  const unreadCount = notificationList.filter((n) => !n.read).length
  const emergencyCount = notificationList.filter(
    (n) => (n.type === "emergency" || n.priority === "high") && !n.read,
  ).length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      default:
        return ""
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100"
      case "task":
        return "bg-blue-100"
      case "escalation":
        return "bg-orange-100"
      case "achievement":
        return "bg-green-100"
      default:
        return "bg-gray-100"
    }
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
            <h1 className="text-lg font-semibold">Notifications</h1>
            {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark All Read
          </Button>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-4">
            {/* Notification Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Bell className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold">{notificationList.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                  <div className="text-lg font-bold">{emergencyCount}</div>
                  <div className="text-xs text-muted-foreground">Urgent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <div className="text-lg font-bold">{unreadCount}</div>
                  <div className="text-xs text-muted-foreground">Unread</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-lg bg-muted p-1 overflow-x-auto">
              {[
                { key: "all", label: "All", count: notificationList.length },
                { key: "unread", label: "Unread", count: unreadCount },
                { key: "emergency", label: "Urgent", count: emergencyCount },
                {
                  key: "tasks",
                  label: "Tasks",
                  count: notificationList.filter((n) => n.type === "task" || n.type === "escalation").length,
                },
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={selectedFilter === key ? "default" : "ghost"}
                  className="flex-1 whitespace-nowrap"
                  onClick={() => setSelectedFilter(key as any)}
                >
                  {label} {count > 0 && `(${count})`}
                </Button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${!notification.read ? "border-primary/50 bg-primary/5" : ""} ${getPriorityColor(notification.priority)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getTypeIcon(notification.type)}`}>
                        <notification.icon className={`h-4 w-4 ${notification.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3
                                className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {notification.title}
                              </h3>
                              {notification.priority === "high" && (
                                <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>
                              )}
                              {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>{notification.time}</span>
                              {notification.taskId && (
                                <Link href={`/task/${notification.taskId}`} className="text-primary hover:underline">
                                  View Task
                                </Link>
                              )}
                            </div>
                          </div>

                          <Button variant="ghost" size="sm" onClick={() => dismissNotification(notification.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-primary"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFilter === "unread"
                      ? "All caught up! No unread notifications."
                      : selectedFilter === "emergency"
                        ? "No urgent alerts at this time."
                        : selectedFilter === "tasks"
                          ? "No task-related notifications."
                          : "You're all caught up!"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Communication Center</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/chat">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Team Chat
                    </Button>
                  </Link>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
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
