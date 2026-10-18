import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { LiteContext } from '@/hooks/useLite'
import { decideLite, readLiteSignals } from '@/lib/lite'

/**
 * Lite mode = the same site without WebGL. Decided up front from device/network signals, and switched on later
 * if the 3D cannot keep up (low frame rate) or the GPU drops the WebGL context.
 */
export function LiteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => decideLite(readLiteSignals()))

  const fallBack = useCallback((reason: string) => {
    setState((s) => (s.lite ? s : { lite: true, reason }))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-lite', state.lite)
    if (state.lite) console.info(`[wezigns] lite mode: ${state.reason}`)
  }, [state])

  const value = useMemo(() => ({ ...state, fallBack }), [state, fallBack])
  return <LiteContext.Provider value={value}>{children}</LiteContext.Provider>
}
