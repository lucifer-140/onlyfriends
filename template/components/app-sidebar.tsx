"use client"

import { useState } from "react"
import {
  Home,
  Library,
  PlayCircle,
  FolderOpen,
  PlusCircle,
  Settings,
  HelpCircle,
  ChevronDown,
  Users,
  Bot,
  Shield,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", icon: Home, id: "dashboard" },
  { name: "My Friends", icon: UserCircle, id: "my-friends" },
  { name: "Library", icon: Library, id: "library" },
  { name: "Workspace", icon: PlayCircle, id: "workspace" },
  { name: "Files", icon: FolderOpen, id: "files" },
  { name: "Create", icon: PlusCircle, id: "create" },
]

const bottomNav = [
  { name: "Settings", icon: Settings, id: "settings" },
  { name: "Help", icon: HelpCircle, id: "help" },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const [teamOpen, setTeamOpen] = useState(false)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">OnlyFriends</span>
      </div>

      {/* Team Selector */}
      <div className="border-b border-border p-4">
        <button
          onClick={() => setTeamOpen(!teamOpen)}
          className="flex w-full items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold text-accent-foreground">
              A
            </div>
            <span>Acme Corp</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", teamOpen && "rotate-180")} />
        </button>
        {teamOpen && (
          <div className="mt-2 rounded-lg border border-border bg-card p-2">
            <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Users className="h-4 w-4" />
              <span>Switch Team</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Security Badge */}
      <div className="mx-4 mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3">
        <div className="flex items-center gap-2 text-accent">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">Air-Gapped Security</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">No internet access. Your data stays internal.</p>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-4 space-y-1">
        {bottomNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
