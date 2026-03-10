"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardView } from "@/components/dashboard-view"
import { MyFriendsView } from "@/components/my-friends-view"
import { LibraryView } from "@/components/library-view"
import { WorkspaceView } from "@/components/workspace-view"
import { FilesView } from "@/components/files-view"
import { CreateView } from "@/components/create-view"
import { Bell, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function OnlyFriendsApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onTabChange={setActiveTab} />
      case "my-friends":
        return <MyFriendsView onTabChange={setActiveTab} />
      case "library":
        return <LibraryView onTabChange={setActiveTab} />
      case "workspace":
        return <WorkspaceView />
      case "files":
        return <FilesView />
      case "create":
        return <CreateView />
      default:
        return <DashboardView onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <AppSidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab)
                setMobileMenuOpen(false)
              }}
            />
          </div>
          <button
            className="absolute right-4 top-4 p-2 text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Digital Friends, files, or actions..."
                className="w-80 rounded-lg border border-border bg-secondary pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-xs text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">{renderContent()}</div>
      </main>
    </div>
  )
}
