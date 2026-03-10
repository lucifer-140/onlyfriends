"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Users, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsReset(true)
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "One number", met: /[0-9]/.test(formData.password) },
    { text: "One special character", met: /[!@#$%^&*]/.test(formData.password) },
  ]

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
      
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">OnlyFriends</span>
            <p className="text-xs text-muted-foreground">Internal AI Platform</p>
          </div>
        </div>

        {!isReset ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Create new password</h2>
              <p className="mt-2 text-muted-foreground">
                Your new password must be different from previously used passwords.
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="password">New password</FieldLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {passwordRequirements.map((req, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <div className={`h-1.5 w-1.5 rounded-full ${req.met ? "bg-accent" : "bg-muted-foreground/30"}`} />
                              <span className={req.met ? "text-accent" : "text-muted-foreground"}>{req.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <p className={`mt-1 text-xs ${passwordsMatch ? "text-accent" : "text-destructive"}`}>
                          {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </p>
                      )}
                    </Field>
                  </FieldGroup>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !passwordsMatch || passwordRequirements.some(r => !r.met)}
                  >
                    {isLoading ? "Resetting password..." : "Reset password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Password reset successful</h3>
                <p className="mt-2 text-muted-foreground">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
              <div className="pt-2">
                <Button onClick={() => router.push("/login")} className="w-full">
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
