"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MapPin, Calendar, Trophy, Star, Edit, Target } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AttendanceChart } from "@/components/attendance-chart"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { mockTasks } from "@/lib/mock-data"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const userTasks = mockTasks.filter((task) => task.assignedTo === user.id)
  const completedTasks = userTasks.filter((task) => task.status === "completed")
  const avgResolutionTime =
    completedTasks.length > 0
      ? completedTasks.reduce((acc, task) => acc + (task.actualTime || task.estimatedTime), 0) / completedTasks.length
      : 0

  const levelProgress = Math.round(((user.civicScore % 1000) / 1000) * 100)

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
            <h1 className="text-lg font-semibold">My Profile</h1>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {user.level}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-primary font-medium">
                  {user.role} • {user.department}
                </p>
                <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{user.zone}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    {user.civicScore.toLocaleString()} points
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    Rank #{user.stats.leaderboardRank}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Personal Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{user.stats.tasksAssigned}</div>
                  <div className="text-sm text-muted-foreground">Tasks Assigned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{user.stats.tasksCompleted}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{user.stats.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">{avgResolutionTime.toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">Avg Resolution</div>
                </CardContent>
              </Card>
            </div>

            {/* Level Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.level}
                      </div>
                      <span className="font-semibold">Level {user.level}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.pointsToNextLevel} points to next level</p>
                  </div>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.level}
                  </div>
                  <div className="flex-1">
                    <Progress value={levelProgress} className="h-3" />
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">
                    {user.level + 1}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{user.civicScore.toLocaleString()}</span>
                  <span>{levelProgress}%</span>
                  <span>{((user.level + 1) * 1000).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Badges & Achievements */}
            {user.badges.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Badges & Achievements</h3>
                    <Link href="/achievements">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {user.badges.map((badge) => {
                      const badgeConfig = {
                        Zap: { icon: "⚡", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
                        Target: { icon: "🎯", color: "text-blue-500", bgColor: "bg-blue-500/10" },
                        Crown: { icon: "👑", color: "text-purple-500", bgColor: "bg-purple-500/10" },
                      }[badge.icon] || { icon: "🏆", color: "text-orange-500", bgColor: "bg-orange-500/10" }
                      
                      return (
                        <div key={badge.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${badgeConfig.bgColor} border-current/20`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badgeConfig.bgColor} text-lg relative`}>
                            <span className="text-lg">{badgeConfig.icon}</span>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">✓</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{badge.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {badge.rarity}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendance Analysis */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Performance Trends</h3>
                    <p className="text-sm text-muted-foreground">Monthly task completion analysis</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last 4 Weeks
                  </Button>
                </div>

                <AttendanceChart />

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium">{user.stats.monthlyTasks} tasks completed</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">On-time Rate</span>
                    <span className="font-medium text-green-600">{user.stats.onTimeCompletion}%</span>
                  </div>
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
