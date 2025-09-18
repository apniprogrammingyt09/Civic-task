"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Upload } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"

const proofItems = [
  {
    id: 1,
    taskTitle: "Sewage Problem - Main Pipe",
    location: "Indiranagar, Bangalore",
    date: "2024-01-18",
    status: "submitted",
    proofType: "Before/After Photos",
    images: 3,
  },
  {
    id: 2,
    taskTitle: "Street Light Repair",
    location: "Koramangala, Bangalore",
    date: "2024-01-17",
    status: "approved",
    proofType: "Video + Photos",
    images: 5,
  },
  {
    id: 3,
    taskTitle: "Pothole Filling",
    location: "Whitefield, Bangalore",
    date: "2024-01-16",
    status: "pending",
    proofType: "Photos",
    images: 2,
  },
]

export default function ProofOfWorkPage() {
  const [selectedTab, setSelectedTab] = useState<"submitted" | "pending" | "approved">("submitted")

  const filteredItems = proofItems.filter((item) => item.status === selectedTab)

  return (
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
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">12</div>
                <div className="text-sm text-muted-foreground">Submitted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">5</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">8</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={selectedTab === "submitted" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setSelectedTab("submitted")}
            >
              Submitted
            </Button>
            <Button
              variant={selectedTab === "pending" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setSelectedTab("pending")}
            >
              Pending
            </Button>
            <Button
              variant={selectedTab === "approved" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setSelectedTab("approved")}
            >
              Approved
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
                      <span>• {item.images} files</span>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Upload */}
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Quick Upload</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload proof for your latest completed task</p>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Add Proof
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
