import '@/index.css'
import './contact.css'
import { afterFirstPaint, preloadListedModules } from '@/lib/afterFirstPaint'

// The prerendered first screen in the HTML paints first; then the app (boot.tsx, with its chunks listed in
// <body data-modulepreload>) loads and runs. Without a prerender (`npm run dev`) there is nothing to wait for.
const boot = () => {
  preloadListedModules()
  void import('./boot')
}
if (document.querySelector('#root > .prerender')) afterFirstPaint(boot)
else boot()
