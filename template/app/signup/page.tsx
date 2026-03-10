"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Lock, Mail, Building2, User, Eye, EyeOff, Check } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    password: "",
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    router.push("/")
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "One number", met: /[0-9]/.test(formData.password) },
    { text: "One special character", met: /[!@#$%^&*]/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        
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
                Join the future of enterprise AI automation
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Request access to start building Digital Friends that transform how your team works.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">What you will get:</h3>
              <ul className="space-y-3">
                {[
                  "Unlimited Digital Friend creation",
                  "Team collaboration workspace",
                  "Enterprise-grade security",
                  "Priority support & onboarding",
                  "Custom AI model fine-tuning",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Enterprises</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">50K+</p>
              <p className="text-sm text-muted-foreground">Digital Friends</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">2M+</p>
              <p className="text-sm text-muted-foreground">Tasks automated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">OnlyFriends</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Request access</h2>
            <p className="mt-2 text-muted-foreground">Fill out the form to join your team</p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="firstName">First name</FieldLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-background/50 border-border/50 focus:border-primary"
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">Work Email</FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="company">Company</FieldLabel>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="role">Your role</FieldLabel>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive / C-Level</SelectItem>
                        <SelectItem value="manager">Manager / Team Lead</SelectItem>
                        <SelectItem value="developer">Developer / Engineer</SelectItem>
                        <SelectItem value="analyst">Analyst / Data Scientist</SelectItem>
                        <SelectItem value="hr">HR / People Operations</SelectItem>
                        <SelectItem value="sales">Sales / Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Create password</FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
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
                </FieldGroup>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !agreedToTerms || passwordRequirements.some(r => !r.met)}
                >
                  {isLoading ? "Creating account..." : "Request access"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
