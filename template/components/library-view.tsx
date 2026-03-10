"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  { name: "All", count: 24 },
  { name: "Documents", count: 8 },
  { name: "Communication", count: 5 },
  { name: "HR & Recruiting", count: 4 },
  { name: "Sales", count: 4 },
  { name: "Analytics", count: 3 },
]

const digitalFriends = [
  {
    id: 1,
    name: "Contract Reviewer",
    description: "Analyzes legal contracts and highlights key terms, risks, and obligations",
    icon: FileText,
    category: "Documents",
    runs: 234,
    lastUsed: "2 hours ago",
    creator: "Legal Team",
    starred: true,
  },
  {
    id: 2,
    name: "Meeting Summarizer",
    description: "Creates comprehensive summaries from meeting transcripts with action items",
    icon: MessageSquare,
    category: "Communication",
    runs: 189,
    lastUsed: "30 min ago",
    creator: "Operations",
    starred: true,
  },
  {
    id: 3,
    name: "Resume Screener",
    description: "Screens candidate resumes against job requirements and provides scores",
    icon: Briefcase,
    category: "HR & Recruiting",
    runs: 156,
    lastUsed: "1 hour ago",
    creator: "HR Team",
    starred: false,
  },
  {
    id: 4,
    name: "Sales Proposal Generator",
    description: "Generates customized sales proposals based on client data and templates",
    icon: Sparkles,
    category: "Sales",
    runs: 98,
    lastUsed: "4 hours ago",
    creator: "Sales Team",
    starred: false,
  },
  {
    id: 5,
    name: "Financial Report Analyzer",
    description: "Extracts insights and trends from quarterly financial reports",
    icon: BarChart3,
    category: "Analytics",
    runs: 87,
    lastUsed: "1 day ago",
    creator: "Finance Team",
    starred: true,
  },
  {
    id: 6,
    name: "Email Response Helper",
    description: "Drafts professional email responses based on context and tone",
    icon: Mail,
    category: "Communication",
    runs: 245,
    lastUsed: "5 min ago",
    creator: "Customer Success",
    starred: false,
  },
  {
    id: 7,
    name: "Interview Question Generator",
    description: "Creates role-specific interview questions from job descriptions",
    icon: Users,
    category: "HR & Recruiting",
    runs: 67,
    lastUsed: "2 days ago",
    creator: "HR Team",
    starred: false,
  },
  {
    id: 8,
    name: "Compliance Checker",
    description: "Reviews documents for regulatory compliance issues",
    icon: Shield,
    category: "Documents",
    runs: 112,
    lastUsed: "3 hours ago",
    creator: "Legal Team",
    starred: true,
  },
]

interface LibraryViewProps {
  onTabChange: (tab: string) => void
}

export function LibraryView({ onTabChange }: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

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
        {categories.map((category) => (
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
                  onClick={() => onTabChange("workspace")}
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
                  onClick={() => onTabChange("workspace")}
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
