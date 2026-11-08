import { brand } from '@/content/site'
import { LOGO_VIEWBOX, MARK_VIEWBOX, logoPaths, logoViewBox, markViewBox } from '@/content/logo'

/**
 * The square Wezigns mark: the client's "W" icon (the wordmark's W in a square frame), in currentColor. Decorative:
 * the wordmark or the surrounding text names the company.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={Math.round((size * MARK_VIEWBOX.w) / MARK_VIEWBOX.h)}
      height={size}
      viewBox={markViewBox}
      aria-hidden="true"
      // Shared markup string (content/logo.ts), so the HTML copies (lib/snapshot.ts) match it exactly.
      dangerouslySetInnerHTML={{ __html: logoPaths('mark') }}
    />
  )
}

/** The Wezigns wordmark (content/logo.ts), `height` px tall, letters in currentColor. */
export function Logo({ className, height = 30 }: { className?: string; height?: number }) {
  return (
    <span className={className ? `logo ${className}` : 'logo'}>
      <svg
        width={Math.round((height * LOGO_VIEWBOX.w) / LOGO_VIEWBOX.h)}
        height={height}
        viewBox={logoViewBox}
        role="img"
        aria-label={brand.name}
        dangerouslySetInnerHTML={{ __html: logoPaths('word') }}
      />
    </span>
  )
}
