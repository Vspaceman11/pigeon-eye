'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuthActions } from '@convex-dev/auth/react'
import { formatAuthError } from '@/lib/format-auth-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Flow = 'signIn' | 'signUp'

export interface AuthOverlayProps {
  initialFlow: Flow
  onClose: () => void
  onSignedIn: () => void
}

export function AuthOverlay({ initialFlow, onClose, onSignedIn }: AuthOverlayProps) {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<Flow>(initialFlow)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setStep(initialFlow)
  }, [initialFlow])

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1100] cursor-default bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className="fixed left-1/2 top-1/2 z-[1101] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-overlay-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <h1 id="auth-overlay-title" className="text-2xl font-bold text-card-foreground">
              {step === 'signIn' ? 'Sign In' : 'Sign Up'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'signIn'
                ? 'Sign in to your Pigeon-eye account'
                : 'Create a new account to report city issues'}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            const formData = new FormData(e.currentTarget)
            try {
              const result = await signIn('password', formData)
              if (result.signingIn) {
                await new Promise((r) => setTimeout(r, 500))
                onSignedIn()
                return
              }
            } catch (err) {
              setError(formatAuthError(err))
            } finally {
              setLoading(false)
            }
          }}
        >
          {step === 'signUp' && (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Name</Label>
              <Input
                id="auth-name"
                name="name"
                type="text"
                placeholder="Your name"
                required={step === 'signUp'}
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              name="password"
              type="password"
              placeholder={step === 'signUp' ? 'Min. 8 characters' : ''}
              required
              autoComplete={step === 'signIn' ? 'current-password' : 'new-password'}
              minLength={8}
            />
          </div>
          <input name="flow" type="hidden" value={step} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : step === 'signIn' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {step === 'signIn' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setStep('signUp')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setStep('signIn')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </>
  )
}
