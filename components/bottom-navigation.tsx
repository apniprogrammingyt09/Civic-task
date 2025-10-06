"use client"

import { Briefcase, MessageSquare, User, Plus, CheckCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: Briefcase, label: "Task", href: "/" },
  { icon: CheckCircle, label: "PoW", href: "/pow" },
  { icon: Plus, label: "Post", href: "/create-post" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
