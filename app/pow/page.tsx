"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAuth } from "firebase/auth"
import { toast } from "sonner"

export default function ProofOfWorkPage() {
  const [selectedTab, setSelectedTab] = useState<"submitted" | "pending" | "approved" | "escalated">("submitted")
  const [tasks, setTasks] = useState<any[]>([])
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])

  const auth = getAuth()

  useEffect(() => {
    if (!auth.currentUser) return

    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, where('assignedPersonnel.id', '==', auth.currentUser.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        taskTitle: doc.data().summary || 'Task assigned',
        location: doc.data().geoData?.address || doc.data().geoData?.city || 'Unknown location',
        date: doc.data().reportedTime || 'Recently',
        status: doc.data().escalation?.status === 'approved' ? 'escalated' :
                doc.data().proofStatus === 'approved' ? 'approved' : 
                doc.data().proofStatus === 'rejected' ? 'pending' :
                doc.data().proofOfWork?.length > 0 ? 'submitted' : 'pending',
        proofType: doc.data().escalation?.status === 'approved' ? 'Escalated' : 'Photos',
        images: doc.data().escalation?.status === 'approved' ? 0 : (doc.data().proofOfWork?.length || 0)
      }))
      setTasks(tasksData)
      setAssignedTasks(tasksData.filter(task => task.status === 'pending' && task.images === 0))
    })

    return () => unsubscribe()
  }, [auth.currentUser])

  const filteredItems = tasks.filter((item) => item.status === selectedTab)
  const stats = {
    submitted: tasks.filter(t => t.status === 'submitted').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    approved: tasks.filter(t => t.status === 'approved').length,
    escalated: tasks.filter(t => t.status === 'escalated').length
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
          <h1 className="text-lg font-semibold">Proof of Work</h1>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-blue-500">{stats.submitted}</div>
                  <div className="text-xs text-muted-foreground">Submitted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-yellow-500">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-green-500">{stats.approved}</div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-purple-500">{stats.escalated}</div>
                  <div className="text-xs text-muted-foreground">Escalated</div>
                </CardContent>
              </Card>
            </div>

          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={selectedTab === "submitted" ? "default" : "ghost"}
              className="flex-1 text-xs"
              onClick={() => setSelectedTab("submitted")}
            >
              Submitted
            </Button>
            <Button
              variant={selectedTab === "pending" ? "default" : "ghost"}
              className="flex-1 text-xs"
              onClick={() => setSelectedTab("pending")}
            >
              Pending
            </Button>
            <Button
              variant={selectedTab === "approved" ? "default" : "ghost"}
              className="flex-1 text-xs"
              onClick={() => setSelectedTab("approved")}
            >
              Approved
            </Button>
            <Button
              variant={selectedTab === "escalated" ? "default" : "ghost"}
              className="flex-1 text-xs"
              onClick={() => setSelectedTab("escalated")}
            >
              Escalated
            </Button>
          </div>

          {/* Proof Items List */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.taskTitle}</h3>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <Badge
                      className={`${
                        item.status === "approved"
                          ? "bg-green-500"
                          : item.status === "submitted"
                            ? "bg-blue-500"
                            : item.status === "escalated"
                              ? "bg-purple-500"
                              : "bg-yellow-500"
                      } text-white`}
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>{item.proofType}</span>
                      {item.status !== 'escalated' && <span>• {item.images} files</span>}
                      {item.status === 'escalated' && <span>• No proof required</span>}
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


        </div>
      </main>



      <BottomNavigation />
    </div>
    </AuthGuard>
  )
}
