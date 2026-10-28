import { parseStudio } from '@/lib/studio'

/**
 * Studio settings for the loom (studio.html): set only on the dev server, from ?studio=. The production build
 * replaces import.meta.env.DEV with false, so this is always null on the live site and the scene is untouched.
 */
export const studio = import.meta.env.DEV
  ? parseStudio(new URLSearchParams(window.location.search).get('studio'))
  : null

/** Scene time: real time, scaled by the studio speed when the studio is on. */
export const sceneTime = (elapsed: number) => elapsed * (studio?.speed ?? 1)
