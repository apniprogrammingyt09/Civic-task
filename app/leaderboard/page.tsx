"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Trophy, TrendingUp, Award, BarChart3 } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { getLeaderboard, useAuth } from "@/lib/auth-context"

export default function LeaderboardPage() {
  const { user } = useAuth()
  const leaderboard = getLeaderboard()

  const topPerformers = leaderboard.slice(0, 3)
  const otherPerformers = leaderboard.slice(3)

  const getCategoryByScore = (score: number) => {
    if (score >= 4500) return { label: "HIGH PERFORMERS", color: "bg-green-100 text-green-800" }
    if (score >= 3500) return { label: "AVERAGE PERFORMERS", color: "bg-yellow-100 text-yellow-800" }
    if (score >= 2500) return { label: "IMPROVING", color: "bg-blue-100 text-blue-800" }
    return { label: "NEEDS SUPPORT", color: "bg-red-100 text-red-800" }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center p-4 border-b border-border">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-base sm:text-lg font-semibold truncate">Employee Performance Reports</h1>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">Department Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Based on Civic Score & Task Completion</p>
            </div>

            {/* Top Performers Podium */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="text-center pb-2">
                <CardTitle className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg inline-flex items-center justify-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span className="text-sm sm:text-base">Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-center space-x-2 sm:space-x-4">
                  {/* Third Place */}
                  {topPerformers[2] && (
                    <div className="text-center flex-1 max-w-[80px] sm:max-w-none">
                      <div className="relative">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto border-2 sm:border-4 border-orange-500">
                          <AvatarImage
                            src={topPerformers[2].avatar || "/placeholder.svg"}
                            alt={topPerformers[2].name}
                          />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {topPerformers[2].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                      </div>
                      <h3 className="font-semibold mt-1 sm:mt-2 text-xs sm:text-sm truncate">{topPerformers[2].name.split(' ')[0]}</h3>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{topPerformers[2].civicScore}</span>
                      </div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {topPerformers[2].stats.completionRate}%
                      </p>
                    </div>
                  )}

                  {/* First Place */}
                  {topPerformers[0] && (
                    <div className="text-center flex-1 max-w-[100px] sm:max-w-none">
                      <div className="relative">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto border-2 sm:border-4 border-yellow-500">
                          <AvatarImage
                            src={topPerformers[0].avatar || "/placeholder.svg"}
                            alt={topPerformers[0].name}
                          />
                          <AvatarFallback className="text-sm sm:text-base">
                            {topPerformers[0].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                          1
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                        </div>
                      </div>
                      <h3 className="font-semibold mt-2 sm:mt-3 text-sm sm:text-base truncate">{topPerformers[0].name.split(' ')[0]}</h3>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold">{topPerformers[0].civicScore}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        {topPerformers[0].stats.completionRate}%
                      </p>
                      {user?.id === topPerformers[0].id && <Badge className="mt-1 bg-yellow-500 text-xs">You!</Badge>}
                    </div>
                  )}

                  {/* Second Place */}
                  {topPerformers[1] && (
                    <div className="text-center flex-1 max-w-[80px] sm:max-w-none">
                      <div className="relative">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto border-2 sm:border-4 border-gray-400">
                          <AvatarImage
                            src={topPerformers[1].avatar || "/placeholder.svg"}
                            alt={topPerformers[1].name}
                          />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {topPerformers[1].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                      </div>
                      <h3 className="font-semibold mt-1 sm:mt-2 text-xs sm:text-sm truncate">{topPerformers[1].name.split(' ')[0]}</h3>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{topPerformers[1].civicScore}</span>
                      </div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {topPerformers[1].stats.completionRate}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current User Position (if not in top 3) */}
            {user && user.stats.leaderboardRank > 3 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary">#{user.stats.leaderboardRank}</span>
                        {getRankIcon(user.stats.leaderboardRank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.name} (You)</h4>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryByScore(user.civicScore).label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.civicScore}</div>
                      <div className="text-xs text-muted-foreground">{user.stats.completionRate}% completion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Staff Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>All Department Staff</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((staff, index) => {
                  const category = getCategoryByScore(staff.civicScore)
                  const isCurrentUser = user?.id === staff.id

                  return (
                    <div
                      key={staff.id}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="flex items-center space-x-1 sm:space-x-2 min-w-[35px] sm:min-w-[40px]">
                          <span className={`text-sm sm:text-lg font-bold ${index < 3 ? "text-primary" : "text-muted-foreground"}`}>
                            #{index + 1}
                          </span>
                          <div className="hidden sm:block">{getRankIcon(index + 1)}</div>
                        </div>
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                          <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {staff.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">
                            {staff.name} {isCurrentUser && <span className="text-primary">(You)</span>}
                          </h4>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                            <Badge variant="secondary" className={`text-xs ${category.color}`}>
                              <span className="hidden sm:inline">{category.label}</span>
                              <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                            </Badge>
                            {staff.badges.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Trophy className="h-3 w-3 mr-1" />
                                {staff.badges.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm sm:text-base">{staff.civicScore}</div>
                        <div className="text-xs text-muted-foreground">{staff.stats.completionRate}%</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Department Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        leaderboard.reduce((acc, user) => acc + user.stats.completionRate, 0) / leaderboard.length,
                      )}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {leaderboard.reduce((acc, user) => acc + user.stats.tasksCompleted, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tasks Done</div>
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
