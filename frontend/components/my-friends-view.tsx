"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Grid3X3,
    List,
    FileText,
    MessageSquare,
    Sparkles,
    BarChart3,
    Play,
    MoreVertical,
    Star,
    Clock,
    Edit3,
    Trash2,
    Copy,
    Share2,
    TrendingUp,
    Eye,
    PauseCircle,
    CheckCircle,
    AlertCircle,
    Plus,
    ArrowUpRight,
    Settings2,
    Bot
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const statusConfig = {
    active: { label: "Active", color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle },
    draft: { label: "Draft", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: AlertCircle },
    paused: { label: "Paused", color: "text-muted-foreground", bg: "bg-muted", icon: PauseCircle },
}

interface MyFriendsViewProps {
    onTabChange: (tab: string) => void
    onRunFriend?: (friendId: string) => void
}

export function MyFriendsView({ onTabChange, onRunFriend }: MyFriendsViewProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "draft" | "paused">("all")
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [myDigitalFriends, setMyDigitalFriends] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMyFriends() {
            try {
                const res = await fetch("http://localhost:8000/api/friends/me/JD")
                if (res.ok) {
                    const data = await res.json()
                    const enriched = data.map((f: any) => ({
                        ...f,
                        icon: Bot,
                        category: f.department || "Custom",
                        runs: Math.floor(Math.random() * 500),
                        lastUsed: "Recently",
                        status: "active",
                        isPublic: false,
                        sharedWith: 0,
                        successRate: 98,
                    }))
                    setMyDigitalFriends(enriched)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMyFriends()
    }, [])

    const filteredFriends = myDigitalFriends.filter((friend) => {
        const matchesFilter = activeFilter === "all" || friend.status === activeFilter
        const matchesSearch =
            friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Basic mock statistical totals since the backend doesn't store runs yet
    const totalRuns = myDigitalFriends.reduce((acc, f) => acc + f.runs, 0)
    const activeFriends = myDigitalFriends.filter((f) => f.status === "active").length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Digital Friends</h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage the AI workflows you have created
                    </p>
                </div>
                <Button
                    onClick={() => onTabChange("create")}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <Plus className="h-4 w-4" />
                    Create New Friend
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Friends</span>
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{myDigitalFriends.length}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activeFriends} active</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Runs</span>
                        <Play className="h-4 w-4 text-accent" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{totalRuns}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-green-400">
                        <TrendingUp className="h-3 w-3" />
                        +23% this month
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Shared With</span>
                        <Share2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {myDigitalFriends.reduce((acc, f) => acc + f.sharedWith, 0)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">team members</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Success Rate</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {myDigitalFriends.length > 0 ? Math.round(myDigitalFriends.reduce((acc, f) => acc + f.successRate, 0) / myDigitalFriends.length) : 0}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">across all friends</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your Digital Friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border bg-secondary p-1">
                        {(["all", "active", "draft", "paused"] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "rounded px-3 py-1.5 text-sm font-medium transition-colors capitalize",
                                    activeFilter === filter
                                        ? "bg-card text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
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

            {/* Empty State */}
            {!isLoading && filteredFriends.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">No Digital Friends found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {searchQuery ? "Try adjusting your search" : "Create your first AI workflow to get started"}
                    </p>
                    {!searchQuery && (
                        <Button
                            onClick={() => onTabChange("create")}
                            className="mt-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Plus className="h-4 w-4" />
                            Create Your First Friend
                        </Button>
                    )}
                </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && filteredFriends.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredFriends.map((friend) => {
                        const status = statusConfig[friend.status as keyof typeof statusConfig] || statusConfig.draft
                        const StatusIcon = status.icon
                        return (
                            <div
                                key={friend.id}
                                className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <friend.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenu(openMenu === friend.id ? null : friend.id)}
                                            className="p-1 text-muted-foreground hover:text-foreground"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                        {openMenu === friend.id && (
                                            <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-border bg-popover p-1 shadow-lg">
                                                <button
                                                    onClick={() => {
                                                        if (onRunFriend && friend.id) onRunFriend(friend.id)
                                                        else onTabChange("workspace")
                                                        setOpenMenu(null)
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-secondary"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Run
                                                </button>
                                                <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-secondary">
                                                    <Edit3 className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-secondary">
                                                    <Copy className="h-4 w-4" />
                                                    Duplicate
                                                </button>
                                                <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-secondary">
                                                    <Share2 className="h-4 w-4" />
                                                    Share
                                                </button>
                                                <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground hover:bg-secondary">
                                                    <Settings2 className="h-4 w-4" />
                                                    Settings
                                                </button>
                                                <div className="my-1 border-t border-border" />
                                                <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{friend.name}</h3>
                                    {friend.isPublic && (
                                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                            Public
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{friend.description}</p>

                                <div className="mt-4 flex items-center gap-2">
                                    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", status.bg, status.color)}>
                                        <StatusIcon className="h-3 w-3" />
                                        {status.label}
                                    </span>
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                        {friend.category}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                                    <div>
                                        <p className="text-lg font-semibold text-foreground">{friend.runs}</p>
                                        <p className="text-xs text-muted-foreground">runs</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-foreground">{friend.sharedWith}</p>
                                        <p className="text-xs text-muted-foreground">shared</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-foreground">{friend.successRate}%</p>
                                        <p className="text-xs text-muted-foreground">success</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {friend.lastUsed}
                                    </span>
                                    <Button
                                        size="sm"
                                        className="gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={() => {
                                            if (onRunFriend && friend.id) onRunFriend(friend.id)
                                            else onTabChange("workspace")
                                        }}
                                    >
                                        <Play className="h-3 w-3" />
                                        Run
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && filteredFriends.length > 0 && (
                <div className="rounded-xl border border-border bg-card">
                    <div className="grid grid-cols-12 gap-4 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
                        <div className="col-span-4">Name</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Runs</div>
                        <div className="col-span-1">Shared</div>
                        <div className="col-span-2">Last Used</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {filteredFriends.map((friend) => {
                        const status = statusConfig[friend.status as keyof typeof statusConfig] || statusConfig.draft
                        const StatusIcon = status.icon
                        return (
                            <div
                                key={friend.id}
                                className="grid grid-cols-12 gap-4 items-center border-b border-border px-4 py-4 last:border-0 hover:bg-secondary/50 transition-colors"
                            >
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <friend.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-foreground">{friend.name}</h3>
                                            {friend.isPublic && (
                                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                    Public
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{friend.description}</p>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className={cn("flex items-center gap-1 w-fit rounded-full px-2 py-0.5 text-xs", status.bg, status.color)}>
                                        <StatusIcon className="h-3 w-3" />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="col-span-1 text-sm text-foreground">{friend.runs}</div>
                                <div className="col-span-1 text-sm text-foreground">{friend.sharedWith}</div>
                                <div className="col-span-2 text-sm text-muted-foreground">{friend.lastUsed}</div>
                                <div className="col-span-2 flex items-center justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                        onClick={() => {
                                            if (onRunFriend && friend.id) onRunFriend(friend.id)
                                            else onTabChange("workspace")
                                        }}
                                    >
                                        <Play className="h-3 w-3" />
                                        Run
                                    </Button>
                                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
