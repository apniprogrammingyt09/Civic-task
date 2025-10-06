"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Zap, Target, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function UserProfile() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    civicScore: 0,
    rank: 0,
    todayProgress: 0,
    badges: []
  })

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      try {
        const issuesRef = collection(db, 'issues')
        
        // Get assigned tasks
        const assignedQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id))
        const assignedSnapshot = await getDocs(assignedQuery)
        const assigned = assignedSnapshot.size
        
        // Get completed tasks
        const completedQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id), where('proofStatus', '==', 'approved'))
        const completedSnapshot = await getDocs(completedQuery)
        const completed = completedSnapshot.size
        
        // Calculate civic score
        const civicScore = (completed * 100) + Math.round((completed / Math.max(assigned, 1)) * 100 * 2)
        
        // Get all workers for ranking
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
        
        // Calculate badges with rarity
        const badges = []
        const completionRate = assigned > 0 ? (completed / assigned) * 100 : 0
        
        if (completed >= 50) badges.push({ name: 'Quick Resolver', rarity: 'rare', icon: 'Zap', description: 'Resolved 50+ tasks within deadline' })
        if (completionRate >= 90) badges.push({ name: 'On-Time Hero', rarity: 'epic', icon: 'Target', description: 'Maintained 90%+ on-time completion' })
        if (completed >= 10) badges.push({ name: 'Team Leader', rarity: 'legendary', icon: 'Trophy', description: 'Led 10+ collaborative tasks' })
        if (completed >= 20) badges.push({ name: 'Speed Demon', rarity: 'rare', icon: 'Zap', description: 'Complete tasks 50% faster than average' })
        if (completionRate >= 95) badges.push({ name: 'Quality Guardian', rarity: 'epic', icon: 'CheckCircle', description: 'Maintain 95%+ citizen satisfaction' })
        if (rank <= 10) badges.push({ name: 'Top Performer', rarity: 'legendary', icon: 'Star', description: 'Rank in top 10 for 3 consecutive months' })
        
        // Store civic score and badges in Firebase
        const userQuery = query(civicUsersRef, where('uid', '==', user.id))
        const userSnapshot = await getDocs(userQuery)
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0]
          await updateDoc(doc(db, 'civicUsers', userDoc.id), {
            civicScore: civicScore,
            tasksCompleted: completed,
            earnedBadges: badges.length,
            lastScoreUpdate: serverTimestamp()
          })
        }
        
        setStats({
          assigned,
          completed,
          civicScore,
          rank,
          todayProgress: 0, // Would need today's specific data
          badges
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    
    fetchStats()
  }, [user])

  if (!user) return null

  const level = Math.floor(stats.civicScore / 1000) + 1
  const currentLevelPoints = stats.civicScore % 1000
  const pointsToNextLevel = 1000 - currentLevelPoints
  const progressToNextLevel = Math.round((currentLevelPoints / 1000) * 100)

  return (
    <div className="bg-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user.profileImage || user.avatar} alt={user.name} />
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
              {stats.badges.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  {stats.badges.length}
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
            <div className="text-sm font-semibold text-primary">{stats.civicScore.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Level {level}</div>
          </div>
        </div>
        <Progress value={progressToNextLevel} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {pointsToNextLevel} points to Level {level + 1}
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
          <span className="text-sm font-semibold text-primary">{stats.todayProgress}%</span>
        </div>
        <Progress value={stats.todayProgress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            0 of 0 tasks completed
          </span>
          <span>Keep going!</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground">{stats.assigned}</div>
          <div className="text-xs text-muted-foreground">Assigned</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">#{stats.rank}</div>
          <div className="text-xs text-muted-foreground">Rank</div>
        </div>
      </div>

      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-card-foreground">Recent Badges</span>
          <Link href="/achievements">
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              View All
            </Button>
          </Link>
        </div>
        <div className="flex space-x-4">
          {stats.badges.slice(0, 3).map((badge, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${
                badge.rarity === 'legendary' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                badge.rarity === 'epic' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}>
                {badge.icon === 'Zap' && <Zap className="h-4 w-4 text-white" />}
                {badge.icon === 'Target' && <Target className="h-4 w-4 text-white" />}
                {badge.icon === 'Trophy' && <Trophy className="h-4 w-4 text-white" />}
                {badge.icon === 'CheckCircle' && <CheckCircle className="h-4 w-4 text-white" />}
                {badge.icon === 'Star' && <Star className="h-4 w-4 text-white" />}
              </div>
              <span className="text-xs mt-1 text-center">{badge.name}</span>
            </div>
          ))}
          {stats.badges.length === 0 && (
            <div className="text-sm text-muted-foreground">No badges earned yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
