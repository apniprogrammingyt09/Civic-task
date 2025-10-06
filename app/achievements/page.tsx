"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Trophy, Zap, Target, CheckCircle, Lock } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

const ALL_BADGES = [
  // Beginner Badges
  {
    name: 'First Steps',
    description: 'Complete your first task',
    rarity: 'common',
    icon: 'CheckCircle',
    requirement: 1,
    type: 'completed',
    category: 'Milestone'
  },
  {
    name: 'Getting Started',
    description: 'Complete 5 tasks',
    rarity: 'common',
    icon: 'Target',
    requirement: 5,
    type: 'completed',
    category: 'Milestone'
  },
  {
    name: 'Rookie',
    description: 'Active for 1 week',
    rarity: 'common',
    icon: 'Star',
    requirement: 7,
    type: 'days_active',
    category: 'Time-based'
  },
  
  // Task Completion Badges
  {
    name: 'Task Master',
    description: 'Complete 25 tasks',
    rarity: 'rare',
    icon: 'Trophy',
    requirement: 25,
    type: 'completed',
    category: 'Achievement'
  },
  {
    name: 'Quick Resolver',
    description: 'Complete 50 tasks',
    rarity: 'rare',
    icon: 'Zap',
    requirement: 50,
    type: 'completed',
    category: 'Achievement'
  },
  {
    name: 'Century Club',
    description: 'Complete 100 tasks',
    rarity: 'epic',
    icon: 'Trophy',
    requirement: 100,
    type: 'completed',
    category: 'Achievement'
  },
  {
    name: 'Legend',
    description: 'Complete 500 tasks',
    rarity: 'legendary',
    icon: 'Star',
    requirement: 500,
    type: 'completed',
    category: 'Achievement'
  },
  
  // Performance Badges
  {
    name: 'Reliable Worker',
    description: 'Maintain 70%+ completion rate',
    rarity: 'common',
    icon: 'CheckCircle',
    requirement: 70,
    type: 'completion_rate',
    category: 'Performance'
  },
  {
    name: 'On-Time Hero',
    description: 'Maintain 85%+ completion rate',
    rarity: 'rare',
    icon: 'Target',
    requirement: 85,
    type: 'completion_rate',
    category: 'Performance'
  },
  {
    name: 'Perfectionist',
    description: 'Maintain 95%+ completion rate',
    rarity: 'epic',
    icon: 'Star',
    requirement: 95,
    type: 'completion_rate',
    category: 'Performance'
  },
  {
    name: 'Flawless',
    description: 'Maintain 100% completion rate (min 20 tasks)',
    rarity: 'legendary',
    icon: 'Trophy',
    requirement: 100,
    type: 'completion_rate',
    category: 'Performance'
  },
  
  // Speed & Efficiency Badges
  {
    name: 'Speed Demon',
    description: 'Complete 5 tasks in one day',
    rarity: 'rare',
    icon: 'Zap',
    requirement: 5,
    type: 'daily_tasks',
    category: 'Speed'
  },
  {
    name: 'Lightning Fast',
    description: 'Complete 10 tasks in one day',
    rarity: 'epic',
    icon: 'Zap',
    requirement: 10,
    type: 'daily_tasks',
    category: 'Speed'
  },
  {
    name: 'Productivity King',
    description: 'Complete 15 tasks in one day',
    rarity: 'legendary',
    icon: 'Trophy',
    requirement: 15,
    type: 'daily_tasks',
    category: 'Speed'
  },
  
  // Streak Badges
  {
    name: 'Consistent',
    description: 'Complete tasks for 7 consecutive days',
    rarity: 'rare',
    icon: 'Target',
    requirement: 7,
    type: 'streak',
    category: 'Consistency'
  },
  {
    name: 'Dedicated',
    description: 'Complete tasks for 30 consecutive days',
    rarity: 'epic',
    icon: 'Star',
    requirement: 30,
    type: 'streak',
    category: 'Consistency'
  },
  {
    name: 'Unstoppable',
    description: 'Complete tasks for 90 consecutive days',
    rarity: 'legendary',
    icon: 'Trophy',
    requirement: 90,
    type: 'streak',
    category: 'Consistency'
  },
  
  // Time-based Badges
  {
    name: 'Early Bird',
    description: 'Complete 10 tasks before 8 AM',
    rarity: 'rare',
    icon: 'CheckCircle',
    requirement: 10,
    type: 'early_tasks',
    category: 'Time-based'
  },
  {
    name: 'Night Owl',
    description: 'Complete 10 tasks after 8 PM',
    rarity: 'rare',
    icon: 'Star',
    requirement: 10,
    type: 'night_tasks',
    category: 'Time-based'
  },
  {
    name: 'Weekend Warrior',
    description: 'Complete 25 tasks on weekends',
    rarity: 'epic',
    icon: 'Trophy',
    requirement: 25,
    type: 'weekend_tasks',
    category: 'Time-based'
  },
  {
    name: 'Holiday Hero',
    description: 'Work on 5 public holidays',
    rarity: 'legendary',
    icon: 'Star',
    requirement: 5,
    type: 'holiday_tasks',
    category: 'Time-based'
  },
  
  // Ranking Badges
  {
    name: 'Rising Star',
    description: 'Reach top 50 ranking',
    rarity: 'common',
    icon: 'Star',
    requirement: 50,
    type: 'rank',
    category: 'Ranking'
  },
  {
    name: 'Top Performer',
    description: 'Reach top 10 ranking',
    rarity: 'rare',
    icon: 'Trophy',
    requirement: 10,
    type: 'rank',
    category: 'Ranking'
  },
  {
    name: 'Elite',
    description: 'Reach top 5 ranking',
    rarity: 'epic',
    icon: 'Star',
    requirement: 5,
    type: 'rank',
    category: 'Ranking'
  },
  {
    name: 'Champion',
    description: 'Achieve #1 ranking',
    rarity: 'legendary',
    icon: 'Trophy',
    requirement: 1,
    type: 'rank',
    category: 'Ranking'
  },
  
  // Special Badges
  {
    name: 'Team Player',
    description: 'Help 5 colleagues with their tasks',
    rarity: 'rare',
    icon: 'CheckCircle',
    requirement: 5,
    type: 'help_colleagues',
    category: 'Social'
  },
  {
    name: 'Mentor',
    description: 'Train 3 new workers',
    rarity: 'epic',
    icon: 'Star',
    requirement: 3,
    type: 'mentoring',
    category: 'Social'
  },
  {
    name: 'Innovation Award',
    description: 'Suggest 5 process improvements',
    rarity: 'legendary',
    icon: 'Trophy',
    requirement: 5,
    type: 'innovations',
    category: 'Innovation'
  },
  {
    name: 'Quality Inspector',
    description: 'Zero quality issues in 50 tasks',
    rarity: 'epic',
    icon: 'CheckCircle',
    requirement: 50,
    type: 'quality_tasks',
    category: 'Quality'
  },
  {
    name: 'Emergency Responder',
    description: 'Complete 10 urgent/emergency tasks',
    rarity: 'rare',
    icon: 'Zap',
    requirement: 10,
    type: 'urgent_tasks',
    category: 'Emergency'
  },
  {
    name: 'Department Star',
    description: 'Top performer in your department',
    rarity: 'epic',
    icon: 'Star',
    requirement: 1,
    type: 'department_rank',
    category: 'Department'
  },
  {
    name: 'Veteran',
    description: 'Active for 6 months',
    rarity: 'epic',
    icon: 'Trophy',
    requirement: 180,
    type: 'days_active',
    category: 'Time-based'
  },
  {
    name: 'Master',
    description: 'Active for 1 year',
    rarity: 'legendary',
    icon: 'Star',
    requirement: 365,
    type: 'days_active',
    category: 'Time-based'
  }
]

export default function AchievementsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    completed: 0,
    assigned: 0,
    rank: 0,
    earnedBadges: []
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchStats = async () => {
      try {
        const issuesRef = collection(db, 'issues')
        
        const assignedQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id))
        const assignedSnapshot = await getDocs(assignedQuery)
        const assigned = assignedSnapshot.size
        
        const completedQuery = query(issuesRef, where('assignedPersonnel.id', '==', user.id), where('proofStatus', '==', 'approved'))
        const completedSnapshot = await getDocs(completedQuery)
        const completed = completedSnapshot.size
        
        const completionRate = assigned > 0 ? (completed / assigned) * 100 : 0
        
        // Get rank
        const civicUsersRef = collection(db, 'civicUsers')
        const allUsersQuery = query(civicUsersRef, where('active', '==', true))
        const allUsersSnapshot = await getDocs(allUsersQuery)
        
        const allScores = await Promise.all(allUsersSnapshot.docs.map(async (doc) => {
          const workerData = doc.data()
          const workerCompletedQuery = query(issuesRef, where('assignedPersonnel.id', '==', workerData.uid), where('proofStatus', '==', 'approved'))
          const workerCompletedSnapshot = await getDocs(workerCompletedQuery)
          const workerScore = workerCompletedSnapshot.size * 100
          return { uid: workerData.uid, score: workerScore }
        }))
        
        const sortedScores = allScores.sort((a, b) => b.score - a.score)
        const rank = sortedScores.findIndex(s => s.uid === user.id) + 1
        
        // Calculate earned badges based on stats
        const earnedBadges = []
        
        // Task completion badges
        if (completed >= 1) earnedBadges.push('First Steps')
        if (completed >= 5) earnedBadges.push('Getting Started')
        if (completed >= 25) earnedBadges.push('Task Master')
        if (completed >= 50) earnedBadges.push('Quick Resolver')
        if (completed >= 100) earnedBadges.push('Century Club')
        if (completed >= 500) earnedBadges.push('Legend')
        
        // Performance badges
        if (completionRate >= 70) earnedBadges.push('Reliable Worker')
        if (completionRate >= 85) earnedBadges.push('On-Time Hero')
        if (completionRate >= 95) earnedBadges.push('Perfectionist')
        if (completionRate >= 100 && completed >= 20) earnedBadges.push('Flawless')
        
        // Ranking badges
        if (rank <= 50) earnedBadges.push('Rising Star')
        if (rank <= 10) earnedBadges.push('Top Performer')
        if (rank <= 5) earnedBadges.push('Elite')
        if (rank === 1) earnedBadges.push('Champion')
        
        // Mock some special badges based on completion count
        if (completed >= 10) earnedBadges.push('Rookie')
        if (completed >= 15) earnedBadges.push('Consistent')
        if (completed >= 20) earnedBadges.push('Early Bird')
        if (completed >= 30) earnedBadges.push('Weekend Warrior')
        if (completed >= 40) earnedBadges.push('Department Star')
        
        setStats({ completed, assigned, rank, earnedBadges })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    
    fetchStats()
  }, [user])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-purple-500 to-pink-500'
      case 'epic':
        return 'from-blue-500 to-cyan-500'
      case 'rare':
        return 'from-yellow-500 to-orange-500'
      case 'common':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-purple-500'
      case 'epic':
        return 'border-blue-500'
      case 'rare':
        return 'border-yellow-500'
      case 'common':
        return 'border-green-500'
      default:
        return 'border-gray-400'
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="h-6 w-6 text-white" />
      case 'Target':
        return <Target className="h-6 w-6 text-white" />
      case 'Trophy':
        return <Trophy className="h-6 w-6 text-white" />
      case 'CheckCircle':
        return <CheckCircle className="h-6 w-6 text-white" />
      case 'Star':
        return <Star className="h-6 w-6 text-white" />
      default:
        return <Lock className="h-6 w-6 text-white" />
    }
  }

  const isEarned = (badgeName: string) => stats.earnedBadges.includes(badgeName)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center p-4 border-b border-border">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-base sm:text-lg font-semibold truncate">Achievements & Badges</h1>
        </header>

        <main className="pb-20 lg:pb-6">
          <div className="p-4 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">Your Badge Collection</h2>
              <p className="text-sm text-muted-foreground">
                {stats.earnedBadges.length} of {ALL_BADGES.length} badges earned
              </p>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="text-green-600">Common: {ALL_BADGES.filter(b => b.rarity === 'common').length}</span>
                <span className="text-yellow-600">Rare: {ALL_BADGES.filter(b => b.rarity === 'rare').length}</span>
                <span className="text-blue-600">Epic: {ALL_BADGES.filter(b => b.rarity === 'epic').length}</span>
                <span className="text-purple-600">Legendary: {ALL_BADGES.filter(b => b.rarity === 'legendary').length}</span>
              </div>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.completed}</div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">#{stats.rank}</div>
                    <div className="text-sm text-muted-foreground">Current Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_BADGES.map((badge) => {
                const earned = isEarned(badge.name)
                return (
                  <Card 
                    key={badge.name} 
                    className={`relative overflow-hidden ${earned ? getRarityBorder(badge.rarity) : 'border-gray-300'} ${earned ? 'border-2' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${earned ? getRarityColor(badge.rarity) : 'from-gray-400 to-gray-500'} ${!earned ? 'opacity-50' : ''}`}>
                          {earned ? getIcon(badge.icon) : <Lock className="h-6 w-6 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {badge.name}
                          </h3>
                          <div className="space-y-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                badge.rarity === 'legendary' ? 'border-purple-500 text-purple-600' :
                                badge.rarity === 'epic' ? 'border-blue-500 text-blue-600' :
                                badge.rarity === 'rare' ? 'border-yellow-500 text-yellow-600' :
                                'border-green-500 text-green-600'
                              }`}
                            >
                              {badge.rarity.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{badge.category}</div>
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm ${earned ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                        {badge.description}
                      </p>
                      {!earned && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Progress: {
                            badge.type === 'completed' ? `${stats.completed}/${badge.requirement}` :
                            badge.type === 'completion_rate' ? `${stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0}%/${badge.requirement}%` :
                            badge.type === 'rank' ? `Rank ${stats.rank}` : '0/1'
                          }
                        </div>
                      )}
                    </CardContent>
                    {earned && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}