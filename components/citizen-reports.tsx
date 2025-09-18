import { Card, CardContent } from "@/components/ui/card"
import { FileText, Users, TrendingUp } from "lucide-react"

export function CitizenReports() {
  return (
    <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-orange-600" />
              <h3 className="font-bold text-lg text-orange-900">Reports Submitted by Citizens</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-bold text-orange-900">2,350,000+</p>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
            <p className="text-sm text-orange-700">Real time civic issues raised across India by active citizens</p>
          </div>
          <div className="w-16 h-16 bg-orange-200/50 rounded-full flex items-center justify-center ml-4">
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
