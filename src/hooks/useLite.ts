import { createContext, useContext } from 'react'

export type LiteState = { lite: boolean; reason: string; fallBack: (reason: string) => void }

export const LiteContext = createContext<LiteState>({ lite: false, reason: '', fallBack: () => {} })

export const useLite = () => useContext(LiteContext)
