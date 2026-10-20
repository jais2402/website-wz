import { useEffect, useState } from 'react'

/** False while the tab is in the background: WebGL loops render no frames then. */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}
