"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Upload,
  FolderOpen,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  MoreVertical,
  Grid3X3,
  List,
  ChevronRight,
  Download,
  Trash2,
  Eye,
  FolderPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Static mock data arrays removed to be calculated dynamically.

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
    case "doc":
      return FileText
    case "image":
      return Image
    case "spreadsheet":
      return FileSpreadsheet
    default:
      return File
  }
}

export function FilesView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [digitalFriends, setDigitalFriends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("http://localhost:8000/api/friends")
        if (res.ok) {
          const data = await res.json()
          setDigitalFriends(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFriends()
  }, [])

  // Derive folders from departments
  const folders = Array.from(new Set(digitalFriends.map(f => f.department || "Custom"))).map((dept, i) => {
    const friendInDept = digitalFriends.filter(f => f.department === dept)
    const filesInDept = friendInDept.reduce((acc: string[], f) => {
      return [...acc, ...(f.dataSources || [])]
    }, [])

    // Deduplicate files in dept
    const uniqueFiles = Array.from(new Set(filesInDept))

    return {
      id: i + 1,
      name: dept,
      files: uniqueFiles.length,
      size: `${uniqueFiles.length * 1.5} MB` // Mock size since we don't have db tracking
    }
  })

  // Derive files from all friends
  const allFilesRaw = digitalFriends.reduce((acc: any[], friend) => {
    if (!friend.dataSources) return acc;
    const fileEntries = friend.dataSources.map((ds: string) => ({
      name: ds,
      type: ds.split('.').pop() || 'file',
      folder: friend.department || "Custom",
      size: "2.5 MB",
      modified: "Recently",
      usedBy: [friend.name],
    }))
    return [...acc, ...fileEntries]
  }, [])

  // Group files by name to consolidate "usedBy"
  const recentFilesMap = new Map()
  allFilesRaw.forEach(file => {
    if (recentFilesMap.has(file.name)) {
      const existing = recentFilesMap.get(file.name)
      if (!existing.usedBy.includes(file.usedBy[0])) {
        existing.usedBy.push(file.usedBy[0])
      }
    } else {
      recentFilesMap.set(file.name, { ...file, id: recentFilesMap.size + 1 })
    }
  })

  const recentFiles = Array.from(recentFilesMap.values())

  const filteredFiles = recentFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = !selectedFolder || file.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Files & Documents</h1>
          <p className="mt-1 text-muted-foreground">
            Manage company documents that power your Digital Friends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 font-medium text-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports PDF, DOCX, XLSX, CSV, TXT, and image files up to 50MB
        </p>
      </div>

      {/* Folders */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Folders</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() =>
                setSelectedFolder(selectedFolder === folder.name ? null : folder.name)
              }
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                selectedFolder === folder.name
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <FolderOpen
                className={cn(
                  "h-10 w-10",
                  selectedFolder === folder.name ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{folder.name}</p>
                <p className="text-sm text-muted-foreground">
                  {folder.files} files · {folder.size}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-4">
          {selectedFolder && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Showing:</span>
              <span className="font-medium text-foreground">{selectedFolder}</span>
              <button
                onClick={() => setSelectedFolder(null)}
                className="ml-1 text-primary hover:underline"
              >
                Clear
              </button>
            </div>
          )}
          <div className="flex rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Table/Grid */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">
            {selectedFolder ? selectedFolder : "All Files"}
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredFiles.length} files
          </span>
        </div>

        {viewMode === "list" ? (
          <div className="divide-y divide-border">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type)
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{file.folder}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span>{file.size}</span>
                        <span>·</span>
                        <span>Modified {file.modified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {file.usedBy.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Used by:</span>
                        {file.usedBy.slice(0, 2).map((friend: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {friend}
                          </span>
                        ))}
                        {file.usedBy.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{file.usedBy.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="p-2 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type)
              return (
                <div
                  key={file.id}
                  className="group rounded-lg border border-border bg-secondary/50 p-4 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex h-16 items-center justify-center rounded-lg bg-primary/10 mb-3">
                    <FileIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{file.size}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
