"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Search, Download, Calendar, MapPin, TrendingUp, BarChart3, FileText } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { mockTasks } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

export default function ReportsPage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "completed" | "escalated">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const { user } = useAuth()

  const userTasks = useMemo(() => {
    if (!user) return []
    return mockTasks.filter((task) => task.assignedTo === user.id)
  }, [user])

  const filteredReports = useMemo(() => {
    return userTasks.filter((task) => {
      const matchesFilter = selectedFilter === "all" || task.status === selectedFilter
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [userTasks, selectedFilter, searchTerm])

  const stats = useMemo(() => {
    const completed = userTasks.filter((t) => t.status === "completed")
    const escalated = userTasks.filter((t) => t.status === "escalated")
    const avgRating =
      completed.length > 0 ? completed.reduce((sum, t) => sum + (t.citizenRating || 4.5), 0) / completed.length : 0
    const avgResolutionTime =
      completed.length > 0
        ? completed.reduce((sum, t) => sum + (t.actualTime || t.estimatedTime), 0) / completed.length
        : 0

    return {
      total: userTasks.length,
      completed: completed.length,
      escalated: escalated.length,
      inProgress: userTasks.filter((t) => t.status === "in-progress").length,
      pending: userTasks.filter((t) => t.status === "pending").length,
      avgRating: avgRating.toFixed(1),
      avgResolutionTime: avgResolutionTime.toFixed(1),
      completionRate: userTasks.length > 0 ? Math.round((completed.length / userTasks.length) * 100) : 0,
    }
  }, [userTasks])

  const categoryStats = useMemo(() => {
    const categories = userTasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [userTasks])

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

  const exportReport = () => {
    // Mock export functionality
    const csvContent = [
      ["Task ID", "Title", "Category", "Status", "Location", "Created", "Completed", "Duration", "Rating"].join(","),
      ...filteredReports.map((task) =>
        [
          task.id,
          `"${task.title}"`,
          task.category,
          task.status,
          `"${task.location.address}"`,
          formatDate(task.createdAt),
          task.status === "completed" ? formatDate(task.updatedAt) : "N/A",
          calculateDuration(task.createdAt, task.updatedAt),
          task.citizenRating || "N/A",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `task-report-${selectedMonth}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
            <h1 className="text-lg font-semibold">Reports & Analytics</h1>
          </div>
          <Button size="sm" variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{stats.completionRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Progress</span>
                    <span>
                      {stats.completed}/{stats.total}
                    </span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.escalated}</div>
                  <div className="text-sm text-muted-foreground">Escalated</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.avgRating}</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks by title, location, or category..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto">
                {[
                  { key: "all", label: "All Tasks" },
                  { key: "completed", label: "Completed" },
                  { key: "escalated", label: "Escalated" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={selectedFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(key as any)}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/history">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">Task History</div>
                    <div className="text-sm text-muted-foreground">View completed tasks</div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/leaderboard">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">Performance</div>
                    <div className="text-sm text-muted-foreground">Compare with peers</div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredReports.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{task.location.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : task.status === "escalated"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status.replace("-", " ")}
                      </Badge>
                      <Link href={`/task/${task.id}`}>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Monthly Summary</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="2024-01">January 2024</option>
                      <option value="2023-12">December 2023</option>
                      <option value="2023-11">November 2023</option>
                    </select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tasks Completed:</span>
                    <p className="font-semibold text-lg">{stats.completed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Resolution Time:</span>
                    <p className="font-semibold text-lg">{stats.avgResolutionTime}h</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Success Rate:</span>
                    <p className="font-semibold text-lg text-green-500">{stats.completionRate}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Citizen Rating:</span>
                    <p className="font-semibold text-lg text-yellow-500">{stats.avgRating}/5</p>
                  </div>
                </div>

                {categoryStats.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-3">Top Categories</h4>
                    <div className="space-y-2">
                      {categoryStats.map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center text-sm">
                          <span>{category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(count / stats.total) * 100}%` }}
                              />
                            </div>
                            <span className="font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
