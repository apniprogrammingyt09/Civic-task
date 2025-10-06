"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Trophy, TrendingUp, Award, BarChart3, Zap, Target, CheckCircle } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { collection, query, onSnapshot, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function LeaderboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const civicUsersRef = collection(db, 'civicUsers')
    const q = query(civicUsersRef, where('active', '==', true))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const workersData = await Promise.all(snapshot.docs.map(async (doc) => {
        const workerData = { id: doc.id, ...doc.data() }
        
        // Count completed tasks
        const issuesRef = collection(db, 'issues')
        const completedQuery = query(issuesRef, where('assignedPersonnel.id', '==', workerData.uid || workerData.id), where('proofStatus', '==', 'approved'))
        const completedSnapshot = await getDocs(completedQuery)
        
        // Count total assigned tasks
        const totalQuery = query(issuesRef, where('assignedPersonnel.id', '==', workerData.uid || workerData.id))
        const totalSnapshot = await getDocs(totalQuery)
        
        const completedTasks = completedSnapshot.size
        const totalTasks = totalSnapshot.size
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        
        // Use stored civic score or calculate if not available
        const civicScore = workerData.civicScore || ((completedTasks * 100) + Math.round(completionRate * 2))
        
        // Use stored badge count or calculate
        const badgeCount = workerData.earnedBadges || 0
        const badges = Array(badgeCount).fill('Badge')
        
        return {
          ...workerData,
          civicScore,
          badges,
          stats: {
            tasksCompleted: workerData.tasksCompleted || completedTasks,
            completionRate,
            leaderboardRank: 0
          }
        }
      }))
      
      // Sort by civic score and assign ranks
      const sortedWorkers = workersData
        .sort((a, b) => b.civicScore - a.civicScore)
        .map((worker, index) => ({
          ...worker,
          stats: {
            ...worker.stats,
            leaderboardRank: index + 1
          }
        }))
      
      setLeaderboard(sortedWorkers)
      
      // Find current user in leaderboard
      const current = sortedWorkers.find(w => w.uid === user.id)
      setCurrentUser(current)
    })

    return () => unsubscribe()
  }, [user, router])

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

        <main className="pb-20 lg:pb-6">
          <div className="p-4 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">{user?.department || 'Department'} Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Based on Civic Score & Task Completion</p>
            </div>

            {/* Top Performers Podium */}
            <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-blue-500/10 dark:from-yellow-400/20 dark:via-orange-400/15 dark:to-blue-400/20 border-none shadow-xl overflow-hidden">
              <CardHeader className="text-center pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-blue-500/20 dark:from-yellow-400/30 dark:to-blue-400/30 blur-xl"></div>
                <CardTitle className="relative">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 text-white py-3 px-6 rounded-2xl inline-flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105 transition-transform">
                    <Trophy className="h-6 w-6 animate-pulse" />
                    <span className="text-base sm:text-lg font-bold">Top Performers</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative pt-6">
                <div className="flex items-end justify-center space-x-3 sm:space-x-6 mb-6">
                  {/* Second Place */}
                  {topPerformers[1] && (
                    <div className="text-center transform hover:-translate-y-2 transition-transform duration-300">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-400/80 to-gray-300/80 dark:from-gray-300 dark:to-gray-400 rounded-full blur opacity-40"></div>
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-gray-400 dark:ring-gray-300 ring-offset-2 ring-offset-background mx-auto">
                          <AvatarImage
                            src={topPerformers[1].profileImage || topPerformers[1].avatar || "/placeholder.svg"}
                            alt={topPerformers[1].name}
                            className="scale-95 hover:scale-100 transition-transform"
                          />
                          <AvatarFallback className="text-sm sm:text-base bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-300 dark:to-gray-400">
                            {topPerformers[1].name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-300 dark:to-gray-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">2</div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <h3 className="font-bold text-sm sm:text-base">{topPerformers[1].name.split(' ')[0]}</h3>
                        <div className="flex items-center justify-center space-x-2 bg-background/80 dark:bg-background/40 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{topPerformers[1].civicScore}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          {topPerformers[1].stats.completionRate}% Tasks
                        </div>
                      </div>
                    </div>
                  )}

                  {/* First Place */}
                  {topPerformers[0] && (
                    <div className="text-center transform hover:-translate-y-2 transition-transform duration-300 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-yellow-300 dark:from-yellow-300 dark:to-yellow-400 rounded-full blur opacity-40"></div>
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-yellow-400 dark:ring-yellow-300 ring-offset-2 ring-offset-background mx-auto">
                          <AvatarImage
                            src={topPerformers[0].profileImage || topPerformers[0].avatar || "/placeholder.svg"}
                            alt={topPerformers[0].name}
                            className="scale-95 hover:scale-100 transition-transform"
                          />
                          <AvatarFallback className="text-base sm:text-lg bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-400">
                            {topPerformers[0].name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-3 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400 dark:bg-yellow-300 blur-sm opacity-50"></div>
                            <Trophy className="h-8 w-8 text-yellow-500 dark:text-yellow-300 drop-shadow-lg animate-bounce" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h3 className="font-bold text-base sm:text-lg">{topPerformers[0].name.split(' ')[0]}</h3>
                        <div className="flex items-center justify-center space-x-2 bg-background/80 dark:bg-background/40 backdrop-blur-sm rounded-full px-4 py-1 shadow-sm">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300" />
                          <span className="text-base font-bold">{topPerformers[0].civicScore}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Target className="h-4 w-4" />
                          {topPerformers[0].stats.completionRate}% Tasks
                        </div>
                        {user?.id === topPerformers[0].id && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-300 dark:to-orange-300 text-white shadow-md">
                            You're #1! 🎉
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Third Place */}
                  {topPerformers[2] && (
                    <div className="text-center transform hover:-translate-y-2 transition-transform duration-300">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-400 to-orange-300 dark:from-orange-300 dark:to-orange-400 rounded-full blur opacity-40"></div>
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-orange-400 dark:ring-orange-300 ring-offset-2 ring-offset-background mx-auto">
                          <AvatarImage
                            src={topPerformers[2].profileImage || topPerformers[2].avatar || "/placeholder.svg"}
                            alt={topPerformers[2].name}
                            className="scale-95 hover:scale-100 transition-transform"
                          />
                          <AvatarFallback className="text-sm sm:text-base bg-gradient-to-br from-orange-400 to-orange-500 dark:from-orange-300 dark:to-orange-400">
                            {topPerformers[2].name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 dark:from-orange-300 dark:to-orange-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">3</div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <h3 className="font-bold text-sm sm:text-base">{topPerformers[2].name.split(' ')[0]}</h3>
                        <div className="flex items-center justify-center space-x-2 bg-background/80 dark:bg-background/40 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300" />
                          <span className="text-sm font-bold">{topPerformers[2].civicScore}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          {topPerformers[2].stats.completionRate}% Tasks
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Podium Base */}
                <div className="relative h-8 mx-8 sm:mx-16">
                  <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-r from-background/80 via-muted to-background/80 dark:from-muted dark:via-background/80 dark:to-muted rounded-t-lg shadow-inner"></div>
                  <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-r from-gray-300/50 via-gray-200/50 to-gray-300/50 dark:from-gray-600/30 dark:via-gray-700/30 dark:to-gray-600/30 blur-sm"></div>
                </div>
              </CardContent>
            </Card>

            {/* Current User Position (if not in top 3) */}
            {currentUser && currentUser.stats.leaderboardRank > 3 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary">#{currentUser.stats.leaderboardRank}</span>
                        {getRankIcon(currentUser.stats.leaderboardRank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.profileImage || currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                        <AvatarFallback>
                          {currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{currentUser.name} (You)</h4>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryByScore(currentUser.civicScore).label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{currentUser.civicScore}</div>
                      <div className="text-xs text-muted-foreground">{currentUser.stats.completionRate}% completion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Badges Section */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Recent Badges</span>
                </CardTitle>
                <Button variant="link" size="sm" className="text-xs px-2">View All</Button>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                {currentUser?.badges?.map((badge: string, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    {badge === 'Expert' && <Star className="h-6 w-6 text-yellow-500" />}
                    {badge === 'Perfectionist' && <CheckCircle className="h-6 w-6 text-green-500" />}
                    {badge === 'Reliable' && <Target className="h-6 w-6 text-blue-500" />}
                    {badge === 'Top Performer' && <Trophy className="h-6 w-6 text-purple-500" />}
                    <span className="text-xs mt-1">{badge}</span>
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground">No badges earned yet</div>
                )}
              </CardContent>
            </Card>
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
                  const isCurrentUser = currentUser?.uid === staff.uid

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
                          <AvatarImage src={staff.profileImage || staff.avatar || "/placeholder.svg"} alt={staff.name} />
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
