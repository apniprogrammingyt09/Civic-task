"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { mockTasks } from "@/lib/mock-data"

export function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  const userTasks = mockTasks.filter((task) => task.assignedTo === user.id)
  const completedTasks = userTasks.filter((task) => task.status === "completed")
  const todaysTasks = userTasks.filter((task) => {
    const today = new Date().toDateString()
    return new Date(task.createdAt).toDateString() === today
  })
  const todaysCompleted = todaysTasks.filter((task) => task.status === "completed")

  const todayProgress = todaysTasks.length > 0 ? Math.round((todaysCompleted.length / todaysTasks.length) * 100) : 0
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0

  const currentLevelPoints = user.civicScore % 1000
  const progressToNextLevel = Math.round((currentLevelPoints / 1000) * 100)

  return (
    <div className="bg-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {user.level}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-card-foreground text-base sm:text-lg truncate">Hi {user.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground truncate">{user.role}</p>
              {user.badges.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  {user.badges.length}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Link href="/profile" className="flex-shrink-0">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 px-2 sm:px-4">
            <span className="hidden sm:inline">Go to profile</span>
            <span className="sm:hidden">Profile</span>
            <span className="ml-1">→</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-card-foreground">Civic Score</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-primary">{user.civicScore.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Level {user.level}</div>
          </div>
        </div>
        <Progress value={progressToNextLevel} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {user.pointsToNextLevel} points to Level {user.level + 1}
          </span>
          <span>{progressToNextLevel}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-card-foreground">Today's Progress</span>
          </div>
          <span className="text-sm font-semibold text-primary">{todayProgress}%</span>
        </div>
        <Progress value={todayProgress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {todaysCompleted.length} of {todaysTasks.length} tasks completed
          </span>
          <span>{todayProgress === 100 ? "Perfect!" : "Keep going!"}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground">{user.stats.tasksAssigned}</div>
          <div className="text-xs text-muted-foreground">Assigned</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{user.stats.tasksCompleted}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">#{user.stats.leaderboardRank}</div>
          <div className="text-xs text-muted-foreground">Rank</div>
        </div>
      </div>

      {user.badges.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-card-foreground">Recent Badges</span>
            <Link href="/achievements">
              <Button variant="ghost" size="sm" className="text-xs text-primary">
                View All
              </Button>
            </Link>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {user.badges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="flex-shrink-0 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm mb-1">
                  {badge.icon}
                </div>
                <div className="text-xs text-muted-foreground truncate w-16">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
