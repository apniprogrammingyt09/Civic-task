"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Smartphone, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"otp" | "qr">("otp")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSendOTP = async () => {
    if (email) {
      setLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("otp")
      setLoading(false)
      toast.success("OTP sent successfully!")
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length === 6) {
      setLoading(true)
      const success = await login({ email, otp })
      setLoading(false)

      if (success) {
        toast.success("Login successful!")
        router.push("/")
      } else {
        toast.error("Invalid OTP. Please try again.")
      }
    }
  }

  const handleQRLogin = async () => {
    setLoading(true)
    // Simulate QR code authentication
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const success = await login({ email: "demo@gov.in", otp: "123456" })
    setLoading(false)

    if (success) {
      toast.success("QR Login successful!")
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Civic Task Manager</CardTitle>
          <p className="text-muted-foreground">Login with Department Admin credentials</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={loginMethod === "otp" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginMethod("otp")}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              OTP Login
            </Button>
            <Button
              variant={loginMethod === "qr" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginMethod("qr")}
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          </div>

          {loginMethod === "otp" ? (
            <div className="space-y-4">
              {step === "email" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your government email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendOTP} className="w-full" disabled={!email || loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter OTP</label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    <p className="text-sm text-muted-foreground">OTP sent to {email}</p>
                  </div>
                  <Button onClick={handleVerifyOTP} className="w-full" disabled={otp.length !== 6 || loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep("email")} className="w-full">
                    Change Email Address
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-8 text-center">
                <QrCode className="h-32 w-32 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Scan QR code from Department Admin to login</p>
              </div>
              <Button onClick={handleQRLogin} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Simulate QR Login"
                )}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo credentials: Use OTP "123456"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
