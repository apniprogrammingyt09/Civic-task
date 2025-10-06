import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "next-themes"
import { TopNavigation } from "@/components/top-navigation"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Civic Task Worker",
  description: "Municipal task management for civic workers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <TopNavigation />
              {children}
            </ThemeProvider>
          </Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
