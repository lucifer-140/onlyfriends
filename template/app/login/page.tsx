"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Users, Lock, Mail, Shield, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">OnlyFriends</span>
              <p className="text-xs text-muted-foreground">Internal AI Platform</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
                Transform your workflows with AI-powered Digital Friends
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Create, manage, and share intelligent assistants that automate your work while keeping your data secure.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Enterprise Security</p>
                  <p className="text-sm text-muted-foreground">Your data never leaves your company</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Team Collaboration</p>
                  <p className="text-sm text-muted-foreground">Share workflows across your organization</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Trusted by 500+ enterprises worldwide
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">OnlyFriends</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to access your Digital Friends</p>
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

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  </Field>
                </FieldGroup>

                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Keep me signed in for 30 days
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="bg-background/50 border-border/50 hover:bg-secondary">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                    </svg>
                    Google SSO
                  </Button>
                  <Button variant="outline" className="bg-background/50 border-border/50 hover:bg-secondary">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.007 8.222A3.738 3.738 0 0 0 17.294 5.5h-3.588v3.737h3.588a1.5 1.5 0 0 1 0 3h-3.588V16h3.588a5.25 5.25 0 0 0 3.713-8.778zM10.294 5.5H6.706a5.25 5.25 0 0 0 0 10.5h3.588v-3.737H6.706a1.5 1.5 0 1 1 0-3h3.588V5.5z"/>
                    </svg>
                    SAML SSO
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
