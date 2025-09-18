"use client"

import { ArrowLeft, Zap, Target, Crown, Award, Star, Shield, Trophy, Medal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const badgeIcons = {
  Zap,
  Target,
  Crown,
  Award,
  Star,
  Shield,
  Trophy,
  Medal,
}

const allBadges = [
  { 
    id: "b1", 
    name: "Quick Resolver", 
    description: "Resolved 50+ tasks within deadline", 
    icon: "Zap", 
    rarity: "rare" as const,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
  { 
    id: "b2", 
    name: "On-Time Hero", 
    description: "Maintained 90%+ on-time completion", 
    icon: "Target", 
    rarity: "epic" as const,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  { 
    id: "b3", 
    name: "Team Leader", 
    description: "Led 10+ collaborative tasks", 
    icon: "Crown", 
    rarity: "legendary" as const,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  { 
    id: "b4", 
    name: "Speed Demon", 
    description: "Complete tasks 50% faster than average", 
    icon: "Zap", 
    rarity: "rare" as const,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  { 
    id: "b5", 
    name: "Quality Guardian", 
    description: "Maintain 95%+ citizen satisfaction", 
    icon: "Shield", 
    rarity: "epic" as const,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  { 
    id: "b6", 
    name: "Top Performer", 
    description: "Rank in top 10 for 3 consecutive months", 
    icon: "Trophy", 
    rarity: "legendary" as const,
    color: "text-gold-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
]

const rarityColors = {
  common: "bg-gray-100 text-gray-700",
  rare: "bg-blue-100 text-blue-700",
  epic: "bg-purple-100 text-purple-700",
  legendary: "bg-yellow-100 text-yellow-700",
}

export default function AchievementsPage() {
  const { user } = useAuth()

  if (!user) return null

  const earnedBadgeIds = user.badges.map(badge => badge.id)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Badges & Achievements</h1>
          </div>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{user.badges.length}</div>
                  <div className="text-sm text-muted-foreground">Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{allBadges.length - user.badges.length}</div>
                  <div className="text-sm text-muted-foreground">Locked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{Math.round((user.badges.length / allBadges.length) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Badges */}
            {user.badges.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Badges</h2>
                <div className="grid grid-cols-1 gap-3">
                  {user.badges.slice(0, 2).map((badge) => {
                    const badgeConfig = allBadges.find(b => b.id === badge.id)
                    if (!badgeConfig) return null
                    
                    const IconComponent = badgeIcons[badgeConfig.icon as keyof typeof badgeIcons]
                    
                    return (
                      <Card key={badge.id} className={`${badgeConfig.borderColor} border-2`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badgeConfig.bgColor} relative`}>
                              <Medal className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <IconComponent className={`h-6 w-6 ${badgeConfig.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{badge.name}</h3>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={rarityColors[badge.rarity]} variant="secondary">
                                  {badge.rarity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Earned {new Date(badge.earnedDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Badges */}
            <div>
              <h2 className="text-lg font-semibold mb-4">All Badges</h2>
              <div className="grid grid-cols-2 gap-4">
                {allBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.includes(badge.id)
                  const IconComponent = badgeIcons[badge.icon as keyof typeof badgeIcons]
                  
                  return (
                    <Card 
                      key={badge.id} 
                      className={`transition-all duration-200 ${
                        isEarned 
                          ? `${badge.bgColor} ${badge.borderColor} border hover:scale-105` 
                          : "bg-muted/30 border-muted hover:bg-muted/50"
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`relative mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center ${
                          isEarned ? badge.bgColor : "bg-muted"
                        }`}>
                          {isEarned && <Medal className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          <IconComponent className={`h-6 w-6 ${isEarned ? badge.color : "text-muted-foreground"}`} />
                        </div>
                        <h3 className={`font-medium text-sm mb-1 ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
                          {badge.name}
                        </h3>
                        <p className={`text-xs mb-2 ${isEarned ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                          {badge.description}
                        </p>
                        <Badge 
                          className={`text-xs ${isEarned ? rarityColors[badge.rarity] : "bg-muted text-muted-foreground"}`} 
                          variant="secondary"
                        >
                          {badge.rarity}
                        </Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}