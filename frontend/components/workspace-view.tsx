"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import {
  FileText,
  Globe,
  Send,
  Paperclip,
  Bot,
  User,
  Copy,
  RotateCcw,
  Download,
  ChevronDown,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const availableFriends = [
  { id: 1, name: "Contract Reviewer", icon: FileText },
  { id: 2, name: "Meeting Summarizer", icon: FileText },
  { id: 3, name: "Resume Screener", icon: FileText },
]

const sampleConversation = [
  {
    role: "user",
    content: "Please analyze the attached contract for any potential risks or unusual clauses.",
    attachments: ["Q4_Vendor_Contract.pdf"],
    timestamp: "10:32 AM",
  },
  {
    role: "assistant",
    content: `I've analyzed the Q4 Vendor Contract. Here's my comprehensive review:

**Key Findings:**

1. **Liability Clause (Section 4.2)** - The liability cap is set at 2x the annual contract value, which is lower than industry standard (typically 3-5x). This could limit your recourse in case of significant breach.

2. **Termination Terms (Section 7.1)** - The 90-day notice period for termination without cause is standard, but the vendor has only a 30-day notice requirement. Consider negotiating symmetrical terms.

3. **Intellectual Property (Section 5.3)** - All IP created during the engagement transfers to the vendor by default. This should be reversed or modified to retain rights to custom work.

4. **Auto-Renewal (Section 8.2)** - Contract auto-renews for 2-year terms with a 60-day opt-out window. This is a common but restrictive clause.

**Risk Level: Medium**

**Recommended Actions:**
- Negotiate symmetrical termination terms
- Modify IP transfer clause for custom deliverables
- Request liability cap increase to 4x annual value
- Change auto-renewal to annual terms

Would you like me to generate redline suggestions for any of these sections?`,
    timestamp: "10:33 AM",
  },
]

interface WorkspaceViewProps {
  initialFriendId?: string | null
}

export function WorkspaceView({ initialFriendId }: WorkspaceViewProps) {
  const [availableFriends, setAvailableFriends] = useState<any[]>([])
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null)
  const [friendsOpen, setFriendsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStart] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

  const handleClear = async () => {
    if (!selectedFriend || messages.length === 0) return
    if (!confirm(`Clear all chat history with ${selectedFriend.name}? This cannot be undone.`)) return
    try {
      await fetch(`http://localhost:8000/api/chat/${selectedFriend.id}`, { method: "DELETE" })
    } catch (e) {
      console.error("Failed to clear chat on server", e)
    }
    setMessages([])
  }

  const handleExport = () => {
    if (!selectedFriend || messages.length === 0) return
    const stamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `${selectedFriend.name.replace(/\s+/g, "_")}_chat_${stamp}.txt`
    const lines = messages.map((m: any) => {
      const speaker = m.role === "user" ? "You" : selectedFriend.name
      return `[${m.timestamp}] ${speaker}:\n${m.content}\n\n`
    })
    const blob = new Blob(
      [`Chat with ${selectedFriend.name}\nExported: ${new Date().toLocaleString()}\n${"-".repeat(60)}\n\n`, ...lines],
      { type: "text/plain;charset=utf-8" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error)
  }

  const handleNewSession = async () => {
    if (!selectedFriend) return
    if (messages.length > 0 && !confirm("Start a new session? This will clear the current conversation.")) return
    try {
      await fetch(`http://localhost:8000/api/chat/${selectedFriend.id}`, { method: "DELETE" })
    } catch (e) {
      console.error("Failed to clear for new session", e)
    }
    setMessages([])
    setInputValue("")
  }

  // 1. Fetch available friends on mount
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("http://localhost:8000/api/friends")
        if (res.ok) {
          const data = await res.json()
          setAvailableFriends(data)
          if (data.length > 0) {
            if (initialFriendId) {
              const found = data.find((f: any) => f.id === initialFriendId)
              setSelectedFriend(found || data[0])
            } else {
              setSelectedFriend(data[0]) // Auto-select first friend
            }
          }
        }
      } catch (e) {
        console.error("Failed to load friends", e)
      }
    }
    fetchFriends()
  }, [])

  // 2. Fetch chat history when selected friend changes
  useEffect(() => {
    async function fetchHistory() {
      if (!selectedFriend) return
      setMessages([]) // clear while loading
      try {
        const res = await fetch(`http://localhost:8000/api/chat/${selectedFriend.id}`)
        if (res.ok) {
          const history = await res.json()
          // Ensure history is actually an array before mapping
          if (Array.isArray(history)) {
            // Backend returns {"role": "user"|"assistant", "text": "..."}
            setMessages(history.map((m: any) => ({
              role: m.role,
              content: m.text || m.content, // Fallback just in case
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })))
          } else {
            setMessages([])
          }
        } else {
          setMessages([])
        }
      } catch (e) {
        console.error("Failed to load chat history", e)
      }
    }
    fetchHistory()
  }, [selectedFriend])


  const handleSend = async () => {
    if (!inputValue.trim() || !selectedFriend) return

    const userMsg = inputValue
    setMessages(prev => [...prev, {
      role: "user",
      content: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }])
    setInputValue("")
    setIsProcessing(true)

    // P2: AbortController — cancel the request after 90s to prevent infinite spinner
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000)

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friend_id: selectedFriend.id,
          prompt: userMsg,
          system_prompt: selectedFriend.system_prompt || "",
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      // P2: Granular error handling per status code
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const detail = errorData.detail || "Unknown error"
        let errorMsg = `**Error ${res.status}:** ${detail}`
        if (res.status === 400) errorMsg = `**⚠️ Restricted input detected.** ${detail}`
        if (res.status === 404) {
          errorMsg = `**This Digital Friend no longer exists.** Please select another from the sidebar.`
          setSelectedFriend(null)
        }
        if (res.status === 503) errorMsg = `**🔴 Ollama is not running.** Start Ollama and try again.`
        if (res.status === 504) errorMsg = `**⏱ Request timed out.** The AI took too long — try a shorter prompt.`
        throw new Error(errorMsg)
      }

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } catch (e: any) {
      clearTimeout(timeoutId)
      const isAbort = e?.name === "AbortError"
      const errorContent = isAbort
        ? "**⏱ Request timed out (90s).** The AI is taking too long — try a shorter prompt."
        : (e?.message?.startsWith("**") ? e.message : `**Error:** Could not connect to Ollama. Check that the backend and Ollama are running.`)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative">
            <button
              onClick={() => setFriendsOpen(!friendsOpen)}
              className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-2 hover:bg-secondary/80 transition-colors"
              disabled={!selectedFriend}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{selectedFriend ? selectedFriend.name : "Loading..."}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", friendsOpen && "rotate-180")} />
            </button>
            {friendsOpen && (
              <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
                {availableFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => {
                      setSelectedFriend(friend)
                      setFriendsOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                      selectedFriend.id === friend.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Bot className="h-4 w-4" />
                    <span className="text-sm font-medium">{friend.name}</span>
                    {selectedFriend?.id === friend.id && (
                      <CheckCircle2 className="ml-auto h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              className="gap-1 border-border disabled:opacity-40"
              onClick={handleClear}
              disabled={messages.length === 0 || isProcessing}
              title="Clear conversation history"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline" size="sm"
              className="gap-1 border-border disabled:opacity-40"
              onClick={handleExport}
              disabled={messages.length === 0}
              title="Export conversation as .txt"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-xl p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                )}
              >
                {"attachments" in message && message.attachments && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {message.attachments.map((file: string, j: number) => (
                      <span
                        key={j}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
                          message.role === "user"
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-card text-foreground"
                        )}
                      >
                        <FileText className="h-3 w-3" />
                        {file}
                      </span>
                    ))}
                  </div>
                )}
                <div className={cn(
                  "text-sm",
                  message.role === "user" ? "text-primary-foreground" : "text-foreground"
                )}>
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none max-h-[500px] overflow-y-auto">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <div className={cn(
                  "mt-2 flex items-center justify-between text-xs",
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {message.timestamp}
                  </span>
                  {message.role === "assistant" && (
                    <button
                      onClick={() => handleCopyMessage(message.content)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  )}
                </div>
              </div>
              {message.role === "user" && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-secondary p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-xl border border-border bg-input p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask your Digital Friend anything..."
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip className="h-4 w-4" />
                  Attach files
                </button>
                <span className="text-xs text-muted-foreground">Press Enter to send</span>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Session Info */}
      <div className="hidden w-80 shrink-0 xl:block space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">Session Info</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Digital Friend</span>
              <span className="font-medium text-foreground">{selectedFriend ? selectedFriend.name : "Loading..."}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium text-foreground">{messages.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium text-foreground">{sessionStart}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-medium text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">Attached Files</h3>
          <div className="mt-4 space-y-2">
            {(!selectedFriend || !selectedFriend.dataSources || selectedFriend.dataSources.length === 0) ? (
              <p className="text-xs text-muted-foreground italic">
                No data sources attached yet. Upload files or add URLs when creating or editing this Digital Friend.
              </p>
            ) : (
              selectedFriend.dataSources.map((source: string, i: number) => {
                const isUrl = source.startsWith("http://") || source.startsWith("https://")
                const label = isUrl
                  ? (() => { try { return new URL(source).hostname } catch { return source } })()
                  : source
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    {isUrl
                      ? <Globe className="h-5 w-5 shrink-0 text-primary" />
                      : <FileText className="h-5 w-5 shrink-0 text-primary" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={source}>
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isUrl ? "Web source" : "Document"}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Button
              variant="outline" size="sm"
              className="w-full justify-start gap-2 border-border disabled:opacity-40"
              onClick={() => {
                const last = messages.filter((m: any) => m.role === "assistant").at(-1)
                if (last) handleCopyMessage(last.content)
              }}
              disabled={!messages.some((m: any) => m.role === "assistant")}
            >
              <Copy className="h-4 w-4" />
              Copy Full Response
            </Button>
            <Button
              variant="outline" size="sm"
              className="w-full justify-start gap-2 border-border disabled:opacity-40"
              onClick={handleExport}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4" />
              Export as .txt
            </Button>
            <Button
              variant="outline" size="sm"
              className="w-full justify-start gap-2 border-border"
              onClick={handleNewSession}
            >
              <RotateCcw className="h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
