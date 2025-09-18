"use client"

import { useState, useMemo } from "react"
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
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const { user } = useAuth()

  const chatList = useMemo(() => {
    if (!user) return []
    return generateChatList(user.id)
  }, [user])

  const filteredChats = useMemo(() => {
    return chatList.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [chatList, searchTerm])

  const handleSelectChat = (chatId: number) => {
    setSelectedChat(chatId)
    if (user) {
      setMessages(generateMessages(chatId, user.id))
    }
  }

  const handleSendMessage = () => {
    if (message.trim() && user) {
      const newMessage = {
        id: messages.length + 1,
        senderId: user.id,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isCurrentUser: true,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const totalUnread = chatList.reduce((sum, chat) => sum + chat.unread, 0)

  if (selectedChat) {
    const chat = chatList.find((c) => c.id === selectedChat)
    if (!chat) return null

    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Chat Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                <AvatarFallback>
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold">{chat.name}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">{chat.role}</p>
                  {chat.online && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {chat.type !== "system" && (
                <>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm">
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
                  <p className="text-sm">{msg.message}</p>
                  <span
                    className={`text-xs ${msg.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {chat.type !== "system" && (
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Messages</h1>
            {totalUnread > 0 && <Badge className="ml-2 bg-red-500 text-white">{totalUnread}</Badge>}
          </div>
          <Link href="/notifications">
            <Button variant="ghost" size="sm">
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
                  <div className="text-lg font-bold">{chatList.length}</div>
                  <div className="text-xs text-muted-foreground">Conversations</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Bell className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <div className="text-lg font-bold">{totalUnread}</div>
                  <div className="text-xs text-muted-foreground">Unread</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-lg font-bold">{chatList.filter((c) => c.online).length}</div>
                  <div className="text-xs text-muted-foreground">Online</div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Broadcast */}
            {chatList.find((c) => c.type === "system" && c.unread > 0) && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800">Emergency Alerts</h3>
                      <p className="text-sm text-red-600">Weather Alert: Heavy rain expected tomorrow</p>
                    </div>
                    <Badge className="bg-red-500 text-white">1</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat List */}
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <Card
                  key={chat.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                          <AvatarFallback>
                            {chat.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{chat.name}</h3>
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{chat.role}</p>
                          {chat.type === "system" && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm truncate mt-1">{chat.lastMessage}</p>
                      </div>

                      {chat.unread > 0 && <Badge className="bg-primary text-primary-foreground">{chat.unread}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredChats.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No conversations found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms." : "Start a conversation to get started."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Supervisor
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
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
