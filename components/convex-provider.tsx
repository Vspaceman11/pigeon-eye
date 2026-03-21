'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'

const url = process.env.NEXT_PUBLIC_CONVEX_URL

const convex = url ? new ConvexReactClient(url) : null

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    if (typeof window !== 'undefined') {
      console.warn('NEXT_PUBLIC_CONVEX_URL is not set; add it to .env.local')
    }
    return <>{children}</>
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
