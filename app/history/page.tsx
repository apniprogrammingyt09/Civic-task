"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Star, AlertTriangle, Eye, Calendar, Archive } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { mockTasks, type Task } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

export default function HistoryPage() {
  const [selectedTab, setSelectedTab] = useState<"all" | "completed" | "reopened" | "escalated">("all")
  const { user } = useAuth()

  const userTasks = useMemo(() => {
    if (!user) return []

    return mockTasks
      .filter((task) => task.assignedTo === user.id)
      .map((task) => ({
        ...task,
        reopened: task.status === "escalated" && Math.random() > 0.7, // Mock some reopened tasks
        escalated: task.status === "escalated",
        rating: task.citizenRating || 4 + Math.random() * 1, // Mock citizen ratings
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [user])

  const filteredHistory = useMemo(() => {
    return userTasks.filter((task) => {
      if (selectedTab === "all") return true
      if (selectedTab === "completed") return task.status === "completed"
      if (selectedTab === "reopened") return task.reopened
      if (selectedTab === "escalated") return task.escalated
      return true
    })
  }, [userTasks, selectedTab])

  const getStatusColor = (task: Task & { reopened?: boolean; escalated?: boolean }) => {
    if (task.reopened) return "border-orange-200 bg-orange-50"
    if (task.escalated) return "border-red-200 bg-red-50"
    if (task.status === "completed") return "border-green-200 bg-green-50"
    return "border-gray-200 bg-gray-50"
  }

  const getStatusBadge = (task: Task & { reopened?: boolean; escalated?: boolean }) => {
    if (task.reopened) return { text: "REOPENED", color: "bg-orange-500" }
    if (task.escalated) return { text: "ESCALATED", color: "bg-red-500" }
    if (task.status === "completed") return { text: "COMPLETED", color: "bg-green-500" }
    return { text: task.status.toUpperCase().replace("-", " "), color: "bg-gray-500" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateDuration = (createdAt: string, updatedAt: string) => {
    const start = new Date(createdAt)
    const end = new Date(updatedAt)
    const diffInHours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days}d`
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center p-4 border-b border-border">
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Task History</h1>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2">
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-primary">{userTasks.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {userTasks.filter((t) => t.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground">Done</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{userTasks.filter((t) => t.reopened).length}</div>
                <div className="text-xs text-muted-foreground">Reopened</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-red-600">{userTasks.filter((t) => t.escalated).length}</div>
                <div className="text-xs text-muted-foreground">Escalated</div>
              </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-muted p-1 overflow-x-auto">
              {[
                { key: "all", label: "All Tasks" },
                { key: "completed", label: "Completed" },
                { key: "reopened", label: "Reopened" },
                { key: "escalated", label: "Escalated" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={selectedTab === key ? "default" : "ghost"}
                  className="flex-1 whitespace-nowrap"
                  onClick={() => setSelectedTab(key as any)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* History List */}
            <div className="space-y-4">
              {filteredHistory.map((task) => {
                const statusBadge = getStatusBadge(task)

                return (
                  <Card key={task.id} className={getStatusColor(task)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{task.title}</h3>
                            {task.reopened && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                            {task.escalated && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{task.location.address}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(task.updatedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{calculateDuration(task.createdAt, task.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${statusBadge.color} text-white`}>{statusBadge.text}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {task.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{task.rating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">/5</span>
                            </div>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/task/${task.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          {(task.reopened || task.escalated) && (
                            <Button size="sm" variant="default">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>

                      {task.reopened && (
                        <div className="mt-3 p-3 bg-orange-100 rounded-lg text-sm text-orange-800">
                          <strong>Reopened:</strong> Citizen reported issue not fully resolved. Requires follow-up
                          action within 24 hours.
                        </div>
                      )}

                      {task.escalated && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg text-sm text-red-800">
                          <strong>Escalated:</strong> Task sent back by supervisor for quality review. Please check work
                          and resubmit with corrections.
                        </div>
                      )}

                      {task.status === "completed" && task.actualTime && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg text-sm text-green-800">
                          <strong>Completed:</strong> Task finished in {task.actualTime}h (Est: {task.estimatedTime}h).
                          {task.actualTime <= task.estimatedTime ? " ✅ On time!" : " ⏰ Overtime"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No tasks found for the selected filter.</p>
                </CardContent>
              </Card>
            )}

            {/* Archive Notice */}
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Archive</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Tasks older than 6 months are automatically archived. Contact admin to access archived records.
                </p>
                <Button variant="outline" size="sm">
                  Request Archive Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
