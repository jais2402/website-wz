import '@/index.css'
import '@/loom/loom.css'
import './pages.css'
import { afterFirstPaint, preloadListedModules } from '@/lib/afterFirstPaint'

// One entry for the inner pages (about.html, ai.html, systems/*.html). The prerendered first screen in the HTML
// paints first; then the app (boot.tsx, with the page's chunks listed in <body data-modulepreload>) loads and runs.
// Without a prerender (`npm run dev`, or a page the build could not render) there is nothing to wait for.
const boot = () => {
  preloadListedModules()
  void import('./boot')
}
if (document.querySelector('#root > .prerender')) afterFirstPaint(boot)
else boot()
