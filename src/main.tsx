import './index.css'
import './loom/loom.css'
import { afterFirstPaint } from './lib/afterFirstPaint'

// The preloader in the HTML (lib/snapshot.ts) paints first; the app (boot.tsx, already downloading via
// modulepreload) runs after it. Without that preloader there is nothing to wait for.
const boot = () => void import('./boot')
if (document.querySelector('#root > .preloader')) afterFirstPaint(boot)
else boot()
