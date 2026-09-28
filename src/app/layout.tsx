import type { Metadata, Viewport } from 'next';
import { content } from '@/lib/content';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(content.meta.siteUrl),
  title: {
    default: `${content.meta.name} — ${content.meta.tagline ?? ''}`.trim(),
    template: `%s · ${content.meta.name}`,
  },
  description: content.meta.description,
  openGraph: {
    type: 'website',
    siteName: content.meta.name,
    title: content.meta.tagline,
    description: content.meta.description,
    images: content.meta.og ? [{ url: content.meta.og.image, alt: content.meta.og.imageAlt }] : [],
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eceef4' },
    { media: '(prefers-color-scheme: dark)', color: '#12141b' },
  ],
};

/** Sets the theme before first paint so there is no flash. Runs once, inline. */
const themeBoot = `(function(){try{
  var d=document.documentElement;
  var t=localStorage.getItem('wz-theme');
  if(t)d.setAttribute('data-theme',t);
  var m=localStorage.getItem('wz-motion');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.setAttribute('data-motion',(m==='paused'||(m===null&&reduce))?'paused':'running');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior is required from Next 16 — it no longer forces smooth scrolling.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Preloaded: both faces are used above the fold, so discovering them
            via CSS would delay first text paint. */}
        <link
          rel="preload"
          href="/fonts/outfit-latin-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-latin-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
