import { PageShell } from '../shell'

export function SystemPage({ slug }: { slug: string }) {
  return <PageShell className={`sys-${slug}`}>{null}</PageShell>
}
