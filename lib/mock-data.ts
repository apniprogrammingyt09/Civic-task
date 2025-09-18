export interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  zone: string
  avatar: string
  phone: string
  joinDate: string
  civicScore: number
  level: number
  pointsToNextLevel: number
  totalPoints: number
  badges: Badge[]
  stats: UserStats
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface UserStats {
  tasksAssigned: number
  tasksCompleted: number
  completionRate: number
  avgResolutionTime: number
  leaderboardRank: number
  monthlyTasks: number
  onTimeCompletion: number
}

export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "escalated"
  assignedTo: string
  reportedBy: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  deadline: string
  createdAt: string
  updatedAt: string
  attachments: string[]
  proofOfWork: ProofOfWork[]
  estimatedTime: number
  actualTime?: number
  citizenRating?: number
  notes: string[]
  chatMessages: ChatMessage[]
}

export interface ProofOfWork {
  id: string
  type: "before" | "during" | "after"
  mediaUrl: string
  mediaType: "image" | "video"
  notes: string
  timestamp: string
  location?: { lat: number; lng: number }
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  type: "text" | "image" | "location"
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "task" | "deadline" | "achievement" | "system" | "emergency"
  priority: "low" | "medium" | "high"
  timestamp: string
  read: boolean
  actionUrl?: string
}

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Anupama Sharma",
    email: "anupama.sharma@gov.in",
    role: "Field Worker",
    department: "Sanitation",
    zone: "Indiranagar, Bangalore",
    avatar: "/images/anupama-profile.jpg",
    phone: "+91 9876543210",
    joinDate: "2022-03-15",
    civicScore: 5200,
    level: 2,
    pointsToNextLevel: 2800,
    totalPoints: 5200,
    badges: [
      {
        id: "b1",
        name: "Quick Resolver",
        description: "Resolved 50+ tasks within deadline",
        icon: "Zap",
        earnedDate: "2024-08-15",
        rarity: "rare",
      },
      {
        id: "b2",
        name: "On-Time Hero",
        description: "Maintained 90%+ on-time completion",
        icon: "Target",
        earnedDate: "2024-09-01",
        rarity: "epic",
      },
    ],
    stats: {
      tasksAssigned: 55,
      tasksCompleted: 46,
      completionRate: 83,
      avgResolutionTime: 2.5,
      leaderboardRank: 2,
      monthlyTasks: 12,
      onTimeCompletion: 90,
    },
  },
  {
    id: "2",
    name: "Amrita Roy",
    email: "amrita.roy@gov.in",
    role: "Field Worker",
    department: "Sanitation",
    zone: "Koramangala, Bangalore",
    avatar: "/images/amrita-profile.jpg",
    phone: "+91 9876543211",
    joinDate: "2021-11-20",
    civicScore: 4500,
    level: 2,
    pointsToNextLevel: 3500,
    totalPoints: 4500,
    badges: [],
    stats: {
      tasksAssigned: 48,
      tasksCompleted: 43,
      completionRate: 89,
      avgResolutionTime: 2.2,
      leaderboardRank: 3,
      monthlyTasks: 10,
      onTimeCompletion: 85,
    },
  },
  {
    id: "3",
    name: "Anubhab Gupta",
    email: "anubhab.gupta@gov.in",
    role: "Senior Field Worker",
    department: "Sanitation",
    zone: "Whitefield, Bangalore",
    avatar: "/images/anubhab-profile.jpg",
    phone: "+91 9876543212",
    joinDate: "2020-06-10",
    civicScore: 4800,
    level: 3,
    pointsToNextLevel: 2200,
    totalPoints: 4800,
    badges: [
      {
        id: "b3",
        name: "Team Leader",
        description: "Led 10+ collaborative tasks",
        icon: "Crown",
        earnedDate: "2024-07-20",
        rarity: "legendary",
      },
    ],
    stats: {
      tasksAssigned: 52,
      tasksCompleted: 50,
      completionRate: 96,
      avgResolutionTime: 1.8,
      leaderboardRank: 1,
      monthlyTasks: 15,
      onTimeCompletion: 95,
    },
  },
]

// Mock Tasks Data
export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Sewage Problem",
    description: "Main pipe blockage causing overflow in residential area. Immediate attention required.",
    category: "Sanitation",
    priority: "high",
    status: "in-progress",
    assignedTo: "1",
    reportedBy: "Citizen #12345",
    location: {
      address: "Indiranagar, Bangalore - 5.6 Km",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    deadline: "2024-09-20T18:00:00Z",
    createdAt: "2024-09-18T10:30:00Z",
    updatedAt: "2024-09-18T14:20:00Z",
    attachments: ["/images/sewage-problem-1.jpg", "/images/sewage-problem-2.jpg"],
    proofOfWork: [
      {
        id: "pow1",
        type: "before",
        mediaUrl: "/images/sewage-before.jpg",
        mediaType: "image",
        notes: "Initial assessment - severe blockage confirmed",
        timestamp: "2024-09-18T14:20:00Z",
        location: { lat: 12.9716, lng: 77.5946 },
      },
    ],
    estimatedTime: 4,
    notes: ["Equipment requested", "Backup team notified"],
    chatMessages: [
      {
        id: "msg1",
        senderId: "supervisor1",
        senderName: "Supervisor Kumar",
        message: "Priority task - please update status every hour",
        timestamp: "2024-09-18T11:00:00Z",
        type: "text",
      },
    ],
  },
  {
    id: "t2",
    title: "Sewage Problem",
    description: "Minor drainage issue in commercial area. Regular maintenance required.",
    category: "Sanitation",
    priority: "medium",
    status: "completed",
    assignedTo: "1",
    reportedBy: "Citizen #12346",
    location: {
      address: "Indiranagar, Bangalore - 3.2 Km",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    deadline: "2024-09-19T16:00:00Z",
    createdAt: "2024-09-17T09:15:00Z",
    updatedAt: "2024-09-18T15:45:00Z",
    attachments: ["/images/drainage-issue.jpg"],
    proofOfWork: [
      {
        id: "pow2",
        type: "before",
        mediaUrl: "/images/drainage-before.jpg",
        mediaType: "image",
        notes: "Minor blockage identified",
        timestamp: "2024-09-18T10:00:00Z",
      },
      {
        id: "pow3",
        type: "after",
        mediaUrl: "/images/drainage-after.jpg",
        mediaType: "image",
        notes: "Drainage cleared successfully",
        timestamp: "2024-09-18T15:45:00Z",
      },
    ],
    estimatedTime: 2,
    actualTime: 1.5,
    citizenRating: 5,
    notes: ["Task completed ahead of schedule"],
    chatMessages: [],
  },
  {
    id: "t3",
    title: "Sewage Problem",
    description: "Emergency sewage overflow affecting multiple buildings. Requires immediate response.",
    category: "Sanitation",
    priority: "urgent",
    status: "pending",
    assignedTo: "1",
    reportedBy: "Citizen #12347",
    location: {
      address: "Indiranagar, Bangalore - 2.1 Km",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    deadline: "2024-09-19T12:00:00Z",
    createdAt: "2024-09-18T16:00:00Z",
    updatedAt: "2024-09-18T16:00:00Z",
    attachments: ["/images/emergency-sewage.jpg"],
    proofOfWork: [],
    estimatedTime: 6,
    notes: [],
    chatMessages: [],
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "New High Priority Task",
    message: "Sewage overflow reported in Indiranagar - immediate attention required",
    type: "task",
    priority: "high",
    timestamp: "2024-09-18T16:00:00Z",
    read: false,
    actionUrl: "/task/t3",
  },
  {
    id: "n2",
    title: "Badge Earned!",
    message: 'Congratulations! You earned the "On-Time Hero" badge',
    type: "achievement",
    priority: "medium",
    timestamp: "2024-09-18T15:30:00Z",
    read: false,
  },
  {
    id: "n3",
    title: "Deadline Reminder",
    message: 'Task "Sewage Problem" deadline is in 2 hours',
    type: "deadline",
    priority: "high",
    timestamp: "2024-09-18T16:00:00Z",
    read: true,
    actionUrl: "/task/t1",
  },
]

// Helper functions
export const getCurrentUser = (): User => mockUsers[0]

export const getTasksByStatus = (status: Task["status"]): Task[] => {
  return mockTasks.filter((task) => task.status === status)
}

export const getTaskById = (id: string): Task | undefined => {
  return mockTasks.find((task) => task.id === id)
}

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id)
}

export const getLeaderboard = (): User[] => {
  return [...mockUsers].sort((a, b) => b.civicScore - a.civicScore)
}

export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter((notification) => !notification.read)
}

export const getAttendanceData = () => {
  return [
    { week: "Week 1", attendance: 85 },
    { week: "Week 2", attendance: 95 },
    { week: "Week 3", attendance: 75 },
    { week: "Week 4", attendance: 90 },
  ]
}
