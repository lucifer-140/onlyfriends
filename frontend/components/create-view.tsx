"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Sparkles,
  FileText,
  MessageSquare,
  Briefcase,
  BarChart3,
  Mail,
  Shield,
  ChevronRight,
  Plus,
  X,
  Settings,
  Eye,
  Save,
  Play,
  Wand2,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const templates = [
  {
    id: 1,
    name: "Document Analyzer",
    description: "Extract insights from documents and reports",
    icon: FileText,
    category: "Documents",
  },
  {
    id: 2,
    name: "Communication Assistant",
    description: "Draft emails, messages, and responses",
    icon: MessageSquare,
    category: "Communication",
  },
  {
    id: 3,
    name: "HR & Recruiting Helper",
    description: "Screen resumes and generate interview questions",
    icon: Briefcase,
    category: "HR",
  },
  {
    id: 4,
    name: "Data Analyst",
    description: "Analyze data and generate reports",
    icon: BarChart3,
    category: "Analytics",
  },
  {
    id: 5,
    name: "Customer Support Bot",
    description: "Handle customer inquiries with company knowledge",
    icon: Mail,
    category: "Support",
  },
  {
    id: 6,
    name: "Compliance Checker",
    description: "Review documents for regulatory compliance",
    icon: Shield,
    category: "Legal",
  },
]

const steps = [
  { id: 1, name: "Template", description: "Choose a starting point" },
  { id: 2, name: "Configure", description: "Set up your workflow" },
  { id: 3, name: "Data Sources", description: "Connect your files" },
  { id: 4, name: "Test & Launch", description: "Preview and deploy" },
]

interface CreateViewProps {
  onFriendCreated?: (friendId: string) => void
}

export function CreateView({ onFriendCreated }: CreateViewProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null)
  const [friendName, setFriendName] = useState("")
  const [friendDescription, setFriendDescription] = useState("")
  const [instructions, setInstructions] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleLaunch = async () => {
    if (!friendName) return
    setIsSubmitting(true)
    try {
      // 1. Create the friend configuration
      const friendId = friendName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      const friendData = {
        id: friendId,
        name: friendName,
        department: selectedTemplate?.category || "Custom",
        description: friendDescription,
        system_prompt: instructions,
        creator: "JD"
      }

      const res = await fetch("http://localhost:8000/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(friendData)
      })

      if (!res.ok) throw new Error("Failed to create friend")
      // Backend just returns {status: "success", "id": config.id}

      // 2. Upload any associated files
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("friend_id", friendId)
        await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          body: formData
        })
      }

      // 3. Upload URLs (if any)
      for (const url of urls) {
        await fetch("http://localhost:8000/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friend_id: friendId, url: url })
        })
      }

      // Successfully created and uploaded! Let's go to workspace to test it.
      if (onFriendCreated) {
        onFriendCreated(friendId)
      } else {
        window.location.reload()
      }

    } catch (error) {
      console.error("Error creating digital friend:", error)
      alert("There was an error creating your digital friend.")
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Create a Digital Friend</h1>
        <p className="mt-2 text-muted-foreground">
          Build an AI-powered workflow to automate your tasks
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (step.id < currentStep || (step.id === 2 && selectedTemplate)) {
                  setCurrentStep(step.id)
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 transition-colors",
                currentStep === step.id
                  ? "bg-primary/10 text-primary"
                  : currentStep > step.id
                    ? "text-foreground cursor-pointer hover:bg-secondary"
                    : "text-muted-foreground cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                )}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-border bg-card p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Choose a Template</h2>
                <p className="text-muted-foreground">
                  Start with a pre-built workflow or create from scratch
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null)
                  setCurrentStep(2)
                }}
                className="gap-2 border-border"
              >
                <Plus className="h-4 w-4" />
                Start from Scratch
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setFriendName(template.name)
                    setFriendDescription(template.description)
                  }}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-5 text-left transition-all",
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <template.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{template.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                  <span className="mt-3 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    {template.category}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                disabled={!selectedTemplate}
                onClick={() => setCurrentStep(2)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Configure Your Digital Friend</h2>
              <p className="text-muted-foreground">
                Customize the name, description, and behavior
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="e.g., Contract Reviewer"
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <input
                  type="text"
                  value={friendDescription}
                  onChange={(e) => setFriendDescription(e.target.value)}
                  placeholder="Briefly describe what this Digital Friend does"
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Instructions
                  <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Provide specific instructions for how this Digital Friend should behave..."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Example: &quot;Always highlight liability clauses and provide risk ratings for each section.&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <Wand2 className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">AI-Assisted Setup</p>
                  <p className="text-xs text-muted-foreground">
                    Let AI help you write better instructions based on your use case
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-accent/30 text-accent hover:bg-accent/10">
                  Generate
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2 border-border">
                Back
              </Button>
              <Button
                disabled={!friendName}
                onClick={() => setCurrentStep(3)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Connect Data Sources</h2>
              <p className="text-muted-foreground">
                Select the folders and files your Digital Friend can access
              </p>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                "mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50 hover:border-primary/30 cursor-pointer"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Drop the files here..." : "Drag & drop your files here"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse your computer
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/docs"
                className="flex-1 rounded-lg border border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && urlInput) {
                    setUrls(prev => [...prev, urlInput])
                    setUrlInput("")
                  }
                }}
              />
              <Button
                variant="outline"
                className="gap-2 border-border"
                onClick={() => {
                  if (urlInput) {
                    setUrls(prev => [...prev, urlInput])
                    setUrlInput("")
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                Add URL
              </Button>
            </div>

            {(files.length > 0 || urls.length > 0) && (
              <div className="rounded-lg bg-secondary p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{files.length + urls.length}</span>{" "}
                  source{files.length + urls.length > 1 ? "s" : ""} selected for ingestion
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={`file-${idx}`}
                      className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm text-foreground border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-xs">{file.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles(files.filter((_, i) => i !== idx))
                        }}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {urls.map((url, idx) => (
                    <div
                      key={`url-${idx}`}
                      className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm text-foreground border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-xs">{url}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUrls(urls.filter((_, i) => i !== idx))
                        }}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2 border-border">
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Review & Launch</h2>
              <p className="text-muted-foreground">
                Preview your Digital Friend before making it available
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  {selectedTemplate ? (
                    <selectedTemplate.icon className="h-7 w-7 text-primary" />
                  ) : (
                    <Sparkles className="h-7 w-7 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{friendName || "Untitled"}</h3>
                  <p className="text-muted-foreground">{friendDescription || "No description"}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground">Template</p>
                  <p className="font-medium text-foreground">
                    {selectedTemplate?.name || "Custom"}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground">Data Sources</p>
                  <p className="font-medium text-foreground">
                    {files.length + urls.length} source{files.length + urls.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-accent">Ready to launch</p>
                </div>
              </div>

              {instructions && (
                <div className="mt-4 rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground mb-2">Instructions</p>
                  <p className="text-sm text-foreground">{instructions}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2 border-border">
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 border-border">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" className="gap-2 border-border">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleLaunch}
                  disabled={isSubmitting}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Play className="h-4 w-4" />
                  {isSubmitting ? "Building..." : "Launch Digital Friend"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
