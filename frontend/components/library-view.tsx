"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  FileText,
  MessageSquare,
  Briefcase,
  Sparkles,
  BarChart3,
  Mail,
  Users,
  Shield,
  Play,
  MoreVertical,
  Star,
  Clock,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LibraryViewProps {
  onTabChange: (tab: string) => void
  onRunFriend?: (friendId: string) => void
}

export function LibraryView({ onTabChange, onRunFriend }: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

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
            category: f.department || "Custom",
            runs: Math.floor(Math.random() * 500),
            lastUsed: "Recently",
            creator: "Internal Team",
            starred: Math.random() > 0.5,
          }))
          setDigitalFriends(enriched)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFriends()
  }, [])

  // Derive categories
  const derivedCategories = [{ name: "All", count: digitalFriends.length }]
  const categoryCounts = digitalFriends.reduce((acc: any, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1
    return acc
  }, {})
  Object.entries(categoryCounts).forEach(([name, count]) => {
    derivedCategories.push({ name, count: count as number })
  })

  const filteredFriends = digitalFriends.filter((friend) => {
    const matchesCategory = activeCategory === "All" || friend.category === activeCategory
    const matchesSearch =
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Digital Friends Library</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and run AI workflows created by your team
          </p>
        </div>
        <Button onClick={() => onTabChange("create")} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Digital Friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-border">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div className="flex rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded p-1.5 transition-colors",
                viewMode === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded p-1.5 transition-colors",
                viewMode === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {derivedCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === category.name
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {category.name}
            <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Grid/List View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <friend.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  <button className={cn("p-1 transition-colors", friend.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500")}>
                    <Star className="h-4 w-4" fill={friend.starred ? "currentColor" : "none"} />
                  </button>
                  <button className="p-1 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{friend.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{friend.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {friend.runs} runs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {friend.lastUsed}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {friend.category}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onRunFriend && friend.id) onRunFriend(friend.id)
                    else onTabChange("workspace")
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <friend.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{friend.name}</h3>
                    {friend.starred && <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{friend.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{friend.runs} runs</p>
                  <p className="text-xs text-muted-foreground">{friend.lastUsed}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {friend.category}
                </span>
                <Button
                  size="sm"
                  className="gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onRunFriend && friend.id) onRunFriend(friend.id)
                    else onTabChange("workspace")
                  }}
                >
                  <Play className="h-3 w-3" />
                  Run
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
