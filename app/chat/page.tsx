"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Phone, Video, MoreVertical, Bell, Search, Users, MessageSquare } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from "firebase/firestore"

const generateChatList = (currentUserId: string) => [
  {
    id: 1,
    userId: "supervisor-1",
    name: "Supervisor - Rajesh Kumar",
    role: "Department Head",
    lastMessage: "Great work on the sewage issue. Keep it up!",
    time: "2 min ago",
    unread: 0,
    online: true,
    avatar: "/supervisor.png",
    type: "supervisor" as const,
  },
  {
    id: 2,
    userId: "admin-1",
    name: "Admin - Priya Sharma",
    role: "Zone Coordinator",
    lastMessage: "Please submit the monthly report by EOD",
    time: "1 hour ago",
    unread: 2,
    online: true,
    avatar: "/admin-interface.png",
    type: "admin" as const,
  },
  {
    id: 3,
    userId: "citizen-1",
    name: "Citizen - Ramesh Gupta",
    role: "Reporter",
    lastMessage: "Thank you for fixing the pothole so quickly!",
    time: "3 hours ago",
    unread: 0,
    online: false,
    avatar: "/citizen.jpg",
    type: "citizen" as const,
  },
  {
    id: 4,
    userId: "system",
    name: "Emergency Broadcast",
    role: "System Alert",
    lastMessage: "Weather Alert: Heavy rain expected tomorrow",
    time: "5 hours ago",
    unread: 1,
    online: false,
    avatar: "/emergency-button.png",
    type: "system" as const,
  },
]

const generateMessages = (chatId: number, currentUserId: string) => {
  const baseMessages = [
    {
      id: 1,
      senderId: chatId === 1 ? "supervisor-1" : "admin-1",
      message: "Hi! How's the progress on the Indiranagar sewage issue?",
      timestamp: "10:30 AM",
      isCurrentUser: false,
    },
    {
      id: 2,
      senderId: currentUserId,
      message: "Almost done! Just finishing up the final repairs. Will submit proof in 30 minutes.",
      timestamp: "10:35 AM",
      isCurrentUser: true,
    },
    {
      id: 3,
      senderId: chatId === 1 ? "supervisor-1" : "admin-1",
      message: "Perfect! Great work as always.",
      timestamp: "10:36 AM",
      isCurrentUser: false,
    },
  ]

  if (chatId === 2) {
    return [
      ...baseMessages,
      {
        id: 4,
        senderId: "admin-1",
        message: "Also, don't forget about the monthly performance review meeting tomorrow at 2 PM.",
        timestamp: "10:40 AM",
        isCurrentUser: false,
      },
    ]
  }

  return baseMessages
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [departmentWorkers, setDepartmentWorkers] = useState<any[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch department workers and admins
  useEffect(() => {
    if (!user) return

    // Fetch civic workers from same department
    const workersQuery = query(
      collection(db, 'civicUsers'),
      where('departmentName', '==', user.department)
    )

    const workersUnsubscribe = onSnapshot(workersQuery, (snapshot) => {
      const workers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'worker'
      })).filter(worker => worker.uid !== user.id)
      
      console.log('Found workers:', workers) // Debug log
      
      // Fetch department admins
      const adminsQuery = query(
        collection(db, 'users')
      )

      const adminsUnsubscribe = onSnapshot(adminsQuery, (adminSnapshot) => {
        const admins = adminSnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('Admin data:', data) // Debug log
          return {
            id: doc.id,
            uid: doc.id, // Use document ID as UID for consistency
            name: data.name,
            role: 'Department Admin',
            departmentName: data.department?.name || data.departmentName,
            departmentId: data.departmentId,
            active: true,
            profileImage: data.profileImage || '/placeholder.svg',
            type: 'admin',
            location: 'Department Office'
          }
        }).filter(admin => {
          console.log('Filtering admin:', admin.departmentId, 'vs user dept:', user.department) // Debug log
          
          // Match by department ID
          return (admin.departmentId === 'environment' && user.department === 'Environment & Parks Department') ||
                 (admin.departmentId === 'pwd' && user.department.includes('PWD')) ||
                 (admin.departmentId === 'health' && user.department.includes('Health')) ||
                 (admin.departmentId === 'traffic' && user.department.includes('Traffic')) ||
                 (admin.departmentId === 'swm' && user.department.includes('SWM')) ||
                 (admin.departmentId === 'disaster' && user.department.includes('Disaster'))
        })
        
        console.log('Found admins:', admins) // Debug log
        console.log('Current user department:', user.department) // Debug log
        
        // Add fallback admin for the user's department
        if (admins.length === 0) {
          const fallbackAdmin = {
            id: `${user.department.toLowerCase().replace(/\s+/g, '-')}-admin`,
            uid: `${user.department.toLowerCase().replace(/\s+/g, '-')}-admin`,
            name: `${user.department} Admin`,
            role: 'Department Admin',
            departmentName: user.department,
            active: true,
            profileImage: '/placeholder.svg',
            type: 'admin',
            location: 'Department Office'
          }
          admins.push(fallbackAdmin)
        }
        
        setDepartmentWorkers([...workers, ...admins])
      }, (error) => {
        console.error('Error fetching admins:', error)
        setDepartmentWorkers(workers)
      })

      return () => adminsUnsubscribe()
    }, (error) => {
      console.error('Error fetching department workers:', error)
    })

    return () => workersUnsubscribe()
  }, [user])

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user) return

    const chatId = [user.id, selectedChat].sort().join('_')
    console.log('Civic chat - fetching messages for chatId:', chatId, 'user.id:', user.id, 'selectedChat:', selectedChat)
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isCurrentUser: doc.data().senderId === user.id
      })).sort((a, b) => {
        // Sort by createdAt client-side
        const timeA = new Date(a.createdAt || 0).getTime()
        const timeB = new Date(b.createdAt || 0).getTime()
        return timeA - timeB
      })
      console.log('Civic chat - messages:', msgs)
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedChat, user])

  const filteredWorkers = useMemo(() => {
    return departmentWorkers.filter((worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [departmentWorkers, searchTerm])

  const handleSelectChat = (workerId: string) => {
    setSelectedChat(workerId)
  }

  const handleSendMessage = async () => {
    if (message.trim() && user && selectedChat) {
      try {
        const chatId = [user.id, selectedChat].sort().join('_')
        console.log('Civic sending message - chatId:', chatId, 'senderId:', user.id)
        await addDoc(collection(db, 'messages'), {
          chatId,
          senderId: user.id,
          senderName: user.name,
          message: message.trim(),
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString()
        })
        setMessage("")
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  const totalUnread = 0 // Will implement unread count later

  if (selectedChat) {
    const worker = departmentWorkers.find((w) => w.uid === selectedChat)
    if (!worker) return null

    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Chat Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)} className="hover:bg-muted hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={worker.profileImage || "/placeholder.svg"} alt={worker.name} />
                <AvatarFallback>
                  {worker.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold">{worker.name}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">{worker.role}</p>
                  {worker.active && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hover:bg-muted hover:text-foreground">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-muted hover:text-foreground">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-muted hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg p-3 max-w-xs ${
                    msg.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {!msg.isCurrentUser && (
                    <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <span
                    className={`text-xs ${msg.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()} className="hover:opacity-90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-3 hover:bg-muted hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Messages</h1>
            {totalUnread > 0 && <Badge className="ml-2 bg-red-500 text-white">{totalUnread}</Badge>}
          </div>
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        <main className="pb-20">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Communication Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold">{departmentWorkers.filter(w => w.type === 'worker').length}</div>
                  <div className="text-xs text-muted-foreground">Workers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-lg font-bold">{departmentWorkers.filter(w => w.type === 'admin').length}</div>
                  <div className="text-xs text-muted-foreground">Admins</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="w-5 h-5 mx-auto mb-1 bg-green-500 rounded-full"></div>
                  <div className="text-lg font-bold">{departmentWorkers.filter((w) => w.active).length}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </CardContent>
              </Card>
            </div>



            {/* Department Admin Section */}
            {departmentWorkers.filter(w => w.type === 'admin').length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Department Administration
                  </h3>
                  <div className="space-y-2">
                    {departmentWorkers.filter(w => w.type === 'admin').map((admin) => (
                      <div
                        key={admin.id}
                        className="p-3 bg-background rounded border cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleSelectChat(admin.uid)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={admin.profileImage || "/placeholder.svg"} alt={admin.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">{admin.name}</h4>
                              <Badge className="text-xs bg-primary text-primary-foreground">
                                Admin
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{admin.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Department Workers List */}
            {departmentWorkers.filter(w => w.type === 'worker').length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Team Members
                  </h3>
                  <div className="space-y-2">
                    {filteredWorkers.filter(w => w.type === 'worker').map((worker) => (
                      <div
                        key={worker.id}
                        className="p-3 bg-background rounded border cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleSelectChat(worker.uid)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={worker.profileImage || "/placeholder.svg"} alt={worker.name} />
                              <AvatarFallback>
                                {worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {worker.active && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">{worker.name}</h4>
                              <Badge variant={worker.active ? "default" : "secondary"} className="text-xs">
                                {worker.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{worker.role}</p>
                            <p className="text-sm text-muted-foreground">{worker.location || 'No location set'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {departmentWorkers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No contacts found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms." : "No department contacts available."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start bg-transparent hover:bg-muted hover:text-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Supervisor
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent hover:bg-muted hover:text-foreground">
                    <Bell className="h-4 w-4 mr-2" />
                    Emergency Alert
                  </Button>
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
