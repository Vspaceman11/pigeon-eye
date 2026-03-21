'use client'

import { ArrowLeft, CheckCircle, Clock, AlertTriangle, LogOut, Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Issue {
  _id: string
  _creationTime: number
  status: string
  analysisStatus?: string | null
  category?: string | null
  ai_description?: string | null
  severity: string
}

interface UserProfileProps {
  issues: Issue[]
  onBack: () => void
}

export function UserProfile({ issues, onBack }: UserProfileProps) {
  const resolved = issues.filter((i) => i.status === 'resolved' || i.status === 'approved').length
  const open = issues.filter((i) => i.status === 'open').length
  const analyzing = issues.filter(
    (i) => i.analysisStatus === 'pending' || i.analysisStatus === 'analyzing',
  ).length

  const stats = [
    { label: 'Resolved', value: resolved, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Open', value: open, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Analyzing', value: analyzing, icon: Clock, color: 'text-blue-500' },
  ]

  const recent = [...issues]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-card-foreground">Profile</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pigeon" alt="User" />
                <AvatarFallback>PE</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-card-foreground">Citizen Reporter</h2>
                <p className="text-sm text-muted-foreground">Heilbronn</p>
                <p className="text-xs text-muted-foreground">{issues.length} reports</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-xl bg-card border border-border p-4 text-center">
                  <Icon className={`mx-auto h-6 w-6 ${stat.color}`} />
                  <p className="mt-2 text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl bg-card border border-border">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold text-card-foreground">Recent Reports</h3>
            </div>
            <div className="divide-y divide-border">
              {recent.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No reports yet</p>
              )}
              {recent.map((issue) => (
                <div key={issue._id} className="flex items-center gap-3 p-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      issue.status === 'resolved' || issue.status === 'approved'
                        ? 'bg-green-500'
                        : issue.analysisStatus === 'error'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-card-foreground">
                      {issue.category ?? 'Pending analysis'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{issue.status}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(issue._creationTime).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border divide-y divide-border">
            <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-card-foreground">Settings</span>
            </button>
            <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="text-card-foreground">Notifications</span>
            </button>
            <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors text-destructive">
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
