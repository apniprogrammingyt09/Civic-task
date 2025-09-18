"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { month: "Jan", tasks: 32, rating: 4.2 },
  { month: "Feb", tasks: 28, rating: 4.1 },
  { month: "Mar", tasks: 35, rating: 4.3 },
  { month: "Apr", tasks: 42, rating: 4.5 },
  { month: "May", tasks: 38, rating: 4.4 },
  { month: "Jun", tasks: 47, rating: 4.6 },
]

export function PerformanceChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="tasks"
            stroke="#059669"
            strokeWidth={3}
            dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
