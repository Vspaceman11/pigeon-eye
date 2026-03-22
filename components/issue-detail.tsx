'use client'

import { useState, type ReactNode } from 'react'
import { useQuery, useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Shield,
  Tag,
  BarChart3,
  RefreshCw,
  Mail,
  Send,
  X,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapOverlayShell } from '@/components/map-overlay-shell'
import { getDisplayAnalysisStatus } from '@/lib/effective-analysis-status'

interface IssueDetailProps {
  issueId: Id<"issues">
  onBack: () => void
}

const severityConfig = {
  EASY: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-400' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-300' },
  HIGH: { label: 'High', color: 'bg-red-500', textColor: 'text-red-400' },
} as const

export function IssueDetail({ issueId, onBack }: IssueDetailProps) {
  const issue = useQuery(api.issues.get, { id: issueId })
  const retryAnalysis = useAction(api.issues.triggerN8nAnalysis)
  const approveLetter = useMutation(api.issues.approveEscalationLetter)
  const rejectLetter = useMutation(api.issues.rejectEscalationLetter)
  const sendLetter = useAction(api.issues.sendApprovedLetter)
  const [letterActionPending, setLetterActionPending] = useState(false)

  let body: ReactNode
  if (issue === undefined) {
    body = (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  } else if (issue === null) {
    body = (
      <div className="space-y-4 p-6 text-center">
        <p className="text-muted-foreground">Issue not found</p>
        <Button type="button" onClick={onBack}>
          Go back
        </Button>
      </div>
    )
  } else {
    const sev = severityConfig[issue.severity]
    const analysisStatus = getDisplayAnalysisStatus(issue)

    const handleRetry = () => {
      if (!issue.storageId) return
      retryAnalysis({
        issueId: issue._id,
        storageId: issue.storageId,
        userId: issue.user_id as string,
        userDescription: issue.user_description,
        latitude: issue.latitude,
        longitude: issue.longitude,
      })
    }

    body = (
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {analysisStatus === 'pending' && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Pending
                </Badge>
              )}
              {analysisStatus === 'analyzing' && (
                <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Analyzing…
                </Badge>
              )}
              {analysisStatus === 'done' && (
                <Badge variant="secondary" className="gap-1 bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Done
                </Badge>
              )}
              {analysisStatus === 'error' && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Error
                </Badge>
              )}
              {!analysisStatus && (
                <Badge variant="default" className="capitalize">
                  {issue.status}
                </Badge>
              )}
            </div>

            {issue.resolvedImageUrl && (
              <div className="aspect-[16/10] max-h-[32vh] w-full overflow-hidden rounded-xl bg-muted">
                <img src={issue.resolvedImageUrl} alt="Issue" className="h-full w-full object-cover" />
              </div>
            )}

            {(analysisStatus === 'pending' || analysisStatus === 'analyzing') && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/10 p-4">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                <div>
                  <p className="font-medium text-card-foreground">AI is analyzing your photo…</p>
                  <p className="text-sm text-muted-foreground">Results will appear here automatically</p>
                </div>
              </div>
            )}

            {analysisStatus === 'error' && (
              <div className="flex flex-col gap-3 rounded-lg bg-destructive/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="font-medium text-destructive">Analysis failed</p>
                </div>
                {issue.analysisError && (
                  <p className="text-sm text-destructive/80">{issue.analysisError}</p>
                )}
                {issue.storageId && (
                  <Button variant="secondary" size="sm" type="button" onClick={handleRetry} className="self-start">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry analysis
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Severity:</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${sev.textColor}`}>
                  <span className={`h-2 w-2 rounded-full ${sev.color}`} />
                  {sev.label}
                </span>
              </div>

              {issue.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium text-card-foreground">{issue.category}</span>
                </div>
              )}

              {issue.priority_score > 0 && (
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <span className="text-sm font-medium text-card-foreground">{issue.priority_score}/10</span>
                </div>
              )}

              {issue.ai_description ? (
                <div className="rounded-lg border border-border/80 bg-field p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">AI Description</p>
                  <p className="text-sm text-field-foreground">{issue.ai_description}</p>
                </div>
              ) : analysisStatus === 'done' ? (
                <p className="text-sm text-muted-foreground">No AI summary was stored for this report.</p>
              ) : null}

              {issue.safety_concern && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/35 bg-red-950/35 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-red-200">Safety concern detected</span>
                </div>
              )}
            </div>

            <EscalationLetterSection
              issue={issue}
              letterActionPending={letterActionPending}
              onApprove={async () => {
                setLetterActionPending(true)
                try {
                  await approveLetter({ issueId: issue._id })
                  await sendLetter({ issueId: issue._id })
                } catch {
                  // Error states are handled via Convex reactive data
                } finally {
                  setLetterActionPending(false)
                }
              }}
              onReject={async () => {
                setLetterActionPending(true)
                try {
                  await rejectLetter({ issueId: issue._id })
                } finally {
                  setLetterActionPending(false)
                }
              }}
            />

            {issue.user_description && (
              <div className="rounded-lg border border-border/80 bg-field p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">User Description</p>
                <p className="text-sm text-field-foreground">{issue.user_description}</p>
              </div>
            )}

            {(issue.latitude !== undefined && issue.longitude !== undefined) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {issue.address ?? `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}`}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Created: {new Date(issue._creationTime).toLocaleString()}
            </p>
          </div>
    )
  }

  return (
    <MapOverlayShell title="Issue Details" onClose={onBack}>
      {body}
    </MapOverlayShell>
  )
}

// ── Escalation letter sub-component ──────────────────────

interface EscalationLetterSectionProps {
  issue: {
    escalation_letter_status?: string
    escalation_letter_subject?: string
    escalation_letter_body?: string
    escalation_letter_to?: string
    escalation_letter_authority?: string
    escalation_letter_error?: string
    safety_concern?: boolean
  }
  letterActionPending: boolean
  onApprove: () => void
  onReject: () => void
}

function EscalationLetterSection({
  issue,
  letterActionPending,
  onApprove,
  onReject,
}: EscalationLetterSectionProps) {
  const status = issue.escalation_letter_status
  if (!issue.safety_concern && !status) return null

  if (status === 'generating') {
    return (
      <div className="mt-2 rounded-xl border border-amber-500/25 bg-amber-950/20 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-400" />
          <div>
            <p className="font-medium text-amber-200">Generating letter to authorities…</p>
            <p className="text-sm text-amber-200/60">
              AI is composing a formal letter based on the safety concern
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'draft') {
    return (
      <div className="mt-2 space-y-3 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-card p-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-amber-400" />
          <h3 className="font-semibold text-amber-200">Review Letter Before Sending</h3>
        </div>

        {issue.escalation_letter_authority && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span>{issue.escalation_letter_authority}</span>
            {issue.escalation_letter_to && (
              <span className="text-xs opacity-70">({issue.escalation_letter_to})</span>
            )}
          </div>
        )}

        {issue.escalation_letter_subject && (
          <div className="rounded-lg border border-border/60 bg-field px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Subject</p>
            <p className="text-sm font-medium text-field-foreground">
              {issue.escalation_letter_subject}
            </p>
          </div>
        )}

        {issue.escalation_letter_body && (
          <div className="max-h-[40vh] overflow-y-auto rounded-lg border border-border/60 bg-field px-3 py-2">
            <div
              className="prose prose-sm prose-invert max-w-none text-field-foreground
                [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:text-card-foreground"
              dangerouslySetInnerHTML={{ __html: issue.escalation_letter_body }}
            />
          </div>
        )}

        <p className="text-sm text-amber-200/80">
          Would you like to send this letter to the municipal authorities?
        </p>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onApprove}
            disabled={letterActionPending}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
          >
            {letterActionPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Letter
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReject}
            disabled={letterActionPending}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Don't Send
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'approved' || status === 'sending') {
    return (
      <div className="mt-2 rounded-xl border border-amber-500/25 bg-amber-950/20 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-400" />
          <p className="font-medium text-amber-200">Sending letter…</p>
        </div>
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-200">Letter sent to authorities</p>
            <p className="text-sm text-emerald-200/60">The letter has been sent successfully</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="mt-2 rounded-xl border border-border/50 bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <X className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-muted-foreground">Letter not sent</p>
            <p className="text-sm text-muted-foreground/60">
              You chose not to send this letter
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mt-2 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium text-red-200">Letter generation failed</p>
            {issue.escalation_letter_error && (
              <p className="text-sm text-red-200/60">{issue.escalation_letter_error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
