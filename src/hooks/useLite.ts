import { createContext, useContext } from 'react'

import type { PerfTier } from '@/lib/perfTier'

export type LiteState = {
  lite: boolean
  reason: string
  fallBack: (reason: string) => void
  /** full | lite | static (lib/perfTier.ts); `lite` is true for both cheaper tiers. */
  tier: PerfTier
  demote: (tier: PerfTier, reason: string) => void
}

export const LiteContext = createContext<LiteState>({ lite: false, reason: '', fallBack: () => {}, tier: 'full', demote: () => {} })

export const useLite = () => useContext(LiteContext)
