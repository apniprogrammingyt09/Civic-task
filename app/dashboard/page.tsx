"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, Award, Target, Clock } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PerformanceChart } from "@/components/performance-chart"
import { ScoreProgress } from "@/components/score-progress"
import { BadgeCollection } from "@/components/badge-collection"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center p-4 border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Performance Dashboard</h1>
      </header>

      <main className="pb-20">
        <div className="p-4 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-green-500">92%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-blue-500">2.3</div>
                <div className="text-sm text-muted-foreground">Avg Days</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold text-orange-500">47</div>
                <div className="text-sm text-muted-foreground">Tasks Done</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold text-purple-500">8</div>
                <div className="text-sm text-muted-foreground">Badges</div>
              </CardContent>
            </Card>
          </div>

          {/* Civic Score Progress */}
          <Card>
            <CardHeader>
              <CardTitle>My Civic Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreProgress />
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800">Quick Resolver</h4>
                    <p className="text-sm text-green-600">Completed 5 tasks in under 24 hours</p>
                  </div>
                  <span className="text-xs text-green-600">2 days ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800">On-Time Hero</h4>
                    <p className="text-sm text-blue-600">100% on-time completion this week</p>
                  </div>
                  <span className="text-xs text-blue-600">1 week ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800">Rising Star</h4>
                    <p className="text-sm text-purple-600">Improved rating by 0.5 points</p>
                  </div>
                  <span className="text-xs text-purple-600">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badge Collection */}
          <Card>
            <CardHeader>
              <CardTitle>Badge Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeCollection />
            </CardContent>
          </Card>

          {/* Goals & Targets */}
          <Card>
            <CardHeader>
              <CardTitle>This Month's Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Complete 50 tasks</span>
                  <span>47/50</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Maintain 90% success rate</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Earn 3 new badges</span>
                  <span>2/3</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "67%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
