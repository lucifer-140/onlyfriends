"use client"

import { useState, useEffect } from "react"
import {
  Bot,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  FileText,
  MessageSquare,
  Briefcase,
  Sparkles,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Removed static stats array

// Static mock recentFriends removed (now fetching from API)

const recentActivity = [
  { user: "Sarah M.", action: "ran", friend: "Contract Reviewer", time: "2 min ago" },
  { user: "Mike T.", action: "created", friend: "Q4 Report Analyzer", time: "15 min ago" },
  { user: "Emily R.", action: "shared", friend: "Customer Support Bot", time: "1 hour ago" },
  { user: "James L.", action: "updated", friend: "Resume Screener", time: "2 hours ago" },
]

interface DashboardViewProps {
  onTabChange: (tab: string) => void
  onRunFriend?: (friendId: string) => void
}

export function DashboardView({ onTabChange, onRunFriend }: DashboardViewProps) {
  const [digitalFriends, setDigitalFriends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("http://localhost:8000/api/friends")
        if (res.ok) {
          const data = await res.json()
          const enriched = data.map((f: any) => ({
            ...f,
            icon: Bot,
            status: "active",
            runs: Math.floor(Math.random() * 100), // Mock usage stat
          }))
          setDigitalFriends(enriched)
        } else {
          setDigitalFriends([])
        }
      } catch (e) {
        console.error(e)
        setDigitalFriends([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchFriends()
  }, [])
  const dynamicStats = [
    {
      name: "Active Digital Friends",
      value: digitalFriends.length.toString(),
      change: "Currently available",
      icon: Bot,
    },
    {
      name: "Tasks Completed",
      value: digitalFriends.reduce((acc, f) => acc + (f.runs || 0), 0).toString(),
      change: "Global usage",
      icon: TrendingUp,
    },
    {
      name: "Data Sources",
      value: digitalFriends.reduce((acc, f) => acc + (f.dataSources?.length || 0), 0).toString(),
      change: "Indexed files",
      icon: FileText,
    },
    {
      name: "Hours Saved",
      value: Math.floor(digitalFriends.reduce((acc, f) => acc + (f.runs || 0), 0) * 0.5).toString(),
      change: "Estimated based on usage",
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, John</h1>
          <p className="mt-1 text-muted-foreground">
            Your AI workforce is ready. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button onClick={() => onTabChange("create")} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
          Create New Friend
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
              <p className="mt-1 text-xs text-accent">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Popular Digital Friends */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Popular Digital Friends</h2>
            <Button variant="ghost" size="sm" onClick={() => onTabChange("library")} className="gap-1 text-muted-foreground hover:text-foreground">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Loading friends...</div>
            ) : digitalFriends.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No active Digital Friends yet.</div>
            ) : digitalFriends.map((friend) => (
              <div
                key={friend.id || friend.name}
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (onRunFriend && friend.id) onRunFriend(friend.id)
                  else onTabChange("workspace")
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <friend.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{friend.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${friend.status === "active"
                          ? "bg-accent/20 text-accent"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {friend.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{friend.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{friend.runs}</p>
                    <p className="text-xs text-muted-foreground">runs</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                    onClick={() => onTabChange("workspace")}
                  >
                    <Play className="h-3 w-3" />
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                  {activity.user.split(" ")[0][0]}
                  {activity.user.split(" ")[1][0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium text-primary">{activity.friend}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => onTabChange("create")}
            className="flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Create Digital Friend</h3>
              <p className="text-sm text-muted-foreground">Build a new AI workflow</p>
            </div>
          </button>
          <button
            onClick={() => onTabChange("files")}
            className="flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Upload Documents</h3>
              <p className="text-sm text-muted-foreground">Add company files</p>
            </div>
          </button>
          <button
            onClick={() => onTabChange("library")}
            className="flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Explore Library</h3>
              <p className="text-sm text-muted-foreground">Browse shared workflows</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
