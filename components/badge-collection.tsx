import { Award, Star, Zap, Shield, Trophy, Target, Medal } from "lucide-react"

const badges = [
  { icon: Award, name: "Quick Resolver", earned: true, color: "text-green-500", bgColor: "bg-green-500/10" },
  { icon: Star, name: "On-Time Hero", earned: true, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { icon: Zap, name: "Speed Demon", earned: true, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { icon: Shield, name: "Quality Guardian", earned: true, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { icon: Trophy, name: "Top Performer", earned: false, color: "text-gray-400", bgColor: "bg-gray-100" },
  { icon: Target, name: "Precision Pro", earned: false, color: "text-gray-400", bgColor: "bg-gray-100" },
]

export function BadgeCollection() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`text-center p-3 rounded-lg border transition-all duration-200 ${
            badge.earned
              ? `${badge.bgColor} border-current/20 hover:scale-105`
              : "bg-muted/30 border-muted hover:bg-muted/50"
          }`}
        >
          <div
            className={`relative mx-auto mb-2 w-10 h-10 rounded-full flex items-center justify-center ${
              badge.earned ? badge.bgColor : "bg-muted"
            }`}
          >
            {badge.earned && <Medal className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />}
            <badge.icon className={`h-6 w-6 ${badge.color}`} />
          </div>
          <p className={`text-xs font-medium ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
            {badge.name}
          </p>
        </div>
      ))}
    </div>
  )
}
