"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Users, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

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

        {!isSubmitted ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
              <p className="mt-2 text-muted-foreground">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Work Email</FieldLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                    </Field>
                  </FieldGroup>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending reset link..." : "Send reset link"}
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
                <h3 className="text-xl font-bold text-foreground">Check your email</h3>
                <p className="mt-2 text-muted-foreground">
                  We have sent a password reset link to <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>
              <div className="pt-2 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {"Didn't receive the email? Check your spam folder or"}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-background/50 border-border/50"
                >
                  Try another email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
