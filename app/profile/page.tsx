"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MapPin, Calendar, Trophy, Star, Edit, Target, Power, Phone, LogOut, TrendingUp, Zap, CheckCircle } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AttendanceChart } from "@/components/attendance-chart"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { mockTasks } from "@/lib/mock-data"
import { db } from "@/lib/firebase"
import { doc, updateDoc, query, where, collection, getDocs } from "firebase/firestore"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    tasksAssigned: 0,
    tasksCompleted: 0,
    successRate: 0,
    avgResolution: 0.0,
    level: 1,
    pointsToNextLevel: 1000,
    civicScore: 0,
    monthlyCompleted: 0,
    onTimeRate: 0,
    weeklyProgress: [0, 0, 0, 0],
    badges: [],
    rank: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      const fetchProfileData = async () => {
        try {
          const q = query(collection(db, 'civicUsers'), where('uid', '==', user.id))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data()
            setProfileData({ ...userData, docId: querySnapshot.docs[0].id })
          } else {
            setProfileData({
              name: user.name,
              email: user.email,
              role: user.role,
              departmentName: user.department,
              active: true,
              profileImage: '',
              phone: '',
              location: ''
            })
          }
          
          // Fetch real stats from Firebase
          const issuesRef = collection(db, 'issues')
          const assignedQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id))
          const assignedSnapshot = await getDocs(assignedQuery)
          const tasksAssigned = assignedSnapshot.size
          
          const completedQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id), where('proofStatus', '==', 'approved'))
          const completedSnapshot = await getDocs(completedQuery)
          const tasksCompleted = completedSnapshot.size
          
          const successRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0
          const civicScore = (tasksCompleted * 100) + Math.round(successRate * 2)
          const level = Math.floor(civicScore / 1000) + 1
          const pointsToNextLevel = 1000 - (civicScore % 1000)
          
          // Calculate monthly stats
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const monthlyQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id), where('proofStatus', '==', 'approved'))
          const monthlySnapshot = await getDocs(monthlyQuery)
          const monthlyCompleted = Math.min(monthlySnapshot.size, tasksCompleted)
          
          // Generate badges based on performance
          const badges = []
          if (tasksCompleted >= 10) badges.push({ id: 1, name: 'Quick Resolver', description: 'Resolved 10+ tasks', rarity: 'rare', icon: 'Zap', earned: true })
          if (successRate >= 80) badges.push({ id: 2, name: 'On-Time Hero', description: 'Maintained 80%+ completion rate', rarity: 'epic', icon: 'Target', earned: true })
          
          // Get rank from all workers
          const civicUsersRef = collection(db, 'civicUsers')
          const allUsersQuery = query(civicUsersRef, where('active', '==', true))
          const allUsersSnapshot = await getDocs(allUsersQuery)
          
          const allScores = await Promise.all(allUsersSnapshot.docs.map(async (doc) => {
            const workerData = doc.data()
            const workerCompletedQuery = query(issuesRef, where('assignedPersonnel.id', '==', workerData.uid), where('proofStatus', '==', 'approved'))
            const workerCompletedSnapshot = await getDocs(workerCompletedQuery)
            const workerAssignedQuery = query(issuesRef, where('assignedPersonnel.id', '==', workerData.uid))
            const workerAssignedSnapshot = await getDocs(workerAssignedQuery)
            
            const workerCompleted = workerCompletedSnapshot.size
            const workerAssigned = workerAssignedSnapshot.size
            const workerScore = (workerCompleted * 100) + Math.round((workerCompleted / Math.max(workerAssigned, 1)) * 100 * 2)
            
            return { uid: workerData.uid, score: workerScore }
          }))
          
          const sortedScores = allScores.sort((a, b) => b.score - a.score)
          const rank = sortedScores.findIndex(s => s.uid === user.id) + 1
          
          // Mock weekly progress based on completion rate
          const baseProgress = Math.max(10, successRate - 20)
          const weeklyProgress = [
            Math.max(0, baseProgress - 15),
            Math.max(0, baseProgress - 10),
            Math.max(0, baseProgress - 5),
            Math.min(100, baseProgress)
          ]
          
          setStats({
            tasksAssigned,
            tasksCompleted,
            successRate,
            avgResolution: 0.0,
            level,
            pointsToNextLevel,
            civicScore,
            monthlyCompleted,
            onTimeRate: successRate,
            weeklyProgress,
            badges,
            rank
          })
        } catch (error) {
          console.error('Error fetching profile data:', error)
          setProfileData({
            name: user.name,
            email: user.email,
            role: user.role,
            departmentName: user.department,
            active: true,
            profileImage: '',
            phone: '',
            location: ''
          })
        }
      }
      
      fetchProfileData()
    }
  }, [user])

  const toggleActiveStatus = async () => {
    if (!profileData || !profileData.docId) {
      alert('Cannot update status - profile not loaded from database')
      return
    }
    
    setLoading(true)
    try {
      const userDocRef = doc(db, 'civicUsers', profileData.docId)
      const newStatus = !profileData.active
      
      await updateDoc(userDocRef, {
        active: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      setProfileData(prev => ({ ...prev, active: newStatus }))
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status - check network connection')
    }
    setLoading(false)
  }

  if (!user || !profileData) return null

  const levelProgress = Math.round(((1000 - stats.pointsToNextLevel) / 1000) * 100)

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
          <div className="flex gap-2">
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt={profileData.name} />
                  <AvatarFallback>
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {stats.level}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <Badge variant={profileData.active ? "default" : "secondary"}>
                    {profileData.active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
                <p className="text-primary font-medium">
                  {profileData.role} • {profileData.departmentName}
                </p>
                <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profileData.location || 'Not set'}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    {stats.civicScore.toLocaleString()} points
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    Rank #{stats.rank || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Status Control */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${profileData.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <h3 className="font-semibold">Work Status</h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData.active 
                          ? "Available for task assignments" 
                          : "Not receiving new assignments"
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={profileData.active ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleActiveStatus}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Power className="h-4 w-4" />
                    {loading ? 'Updating...' : (profileData.active ? 'Go Inactive' : 'Go Active')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Personal Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{profileData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </span>
                    <span className="font-medium">{profileData.phone || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </span>
                    <span className="font-medium">{profileData.location || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium">{new Date(profileData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{stats.tasksAssigned}</div>
                  <div className="text-sm text-muted-foreground">Tasks Assigned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.tasksCompleted}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">{stats.avgResolution}h</div>
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
                        {stats.level}
                      </div>
                      <span className="font-semibold">Level {stats.level}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stats.pointsToNextLevel} points to next level</p>
                  </div>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {stats.level}
                  </div>
                  <div className="flex-1">
                    <Progress value={levelProgress} className="h-3" />
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">
                    {stats.level + 1}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{stats.civicScore.toLocaleString()}</span>
                  <span>{Math.round(((1000 - stats.pointsToNextLevel) / 1000) * 100)}%</span>
                  <span>{(stats.level * 1000).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Badges & Achievements */}
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
                <div className="grid grid-cols-1 gap-3">
                  {stats.badges.map((badge) => {
                    const badgeConfig = {
                      Zap: { icon: "⚡", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
                      Target: { icon: "🎯", color: "text-blue-500", bgColor: "bg-blue-500/10" },
                    }[badge.icon] || { icon: "🏆", color: "text-orange-500", bgColor: "bg-orange-500/10" }
                    
                    return (
                      <div key={badge.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${badgeConfig.bgColor} border-current/20`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badgeConfig.bgColor} text-lg relative`}>
                          <span className="text-lg">{badgeConfig.icon}</span>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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

            {/* Performance Trends */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">Performance Trends</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Monthly task completion analysis</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last 4 Weeks</span>
                    <div className="flex space-x-1">
                      {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, index) => (
                        <div key={week} className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">{week}</div>
                          <div className="w-8 h-16 bg-muted rounded-sm relative overflow-hidden">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-300"
                              style={{ height: `${stats.weeklyProgress[index]}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{stats.weeklyProgress[index]}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">This Month</span>
                      </div>
                      <div className="text-lg font-semibold text-green-600">{stats.monthlyCompleted}</div>
                      <div className="text-xs text-muted-foreground">tasks completed</div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-muted-foreground">On-time Rate</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-600">{stats.onTimeRate}%</div>
                      <div className="text-xs text-muted-foreground">completion rate</div>
                    </div>
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
