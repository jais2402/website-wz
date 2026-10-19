import { aiSummary, brand } from '@/content/site'
import { summaryUrl } from '@/lib/aiSummary'
import { track } from '@/lib/analytics'
import { AiLogo } from './AiLogos'
import './aiSummary.css'

/** Footer row: one tile per AI assistant, each opening it with a ready-made prompt about Wezigns. */
export function AiSummary() {
  return (
    <section className="ai-summary" aria-labelledby="ai-summary-title">
      <div className="ai-summary-copy">
        <h2 id="ai-summary-title" className="mono">
          {aiSummary.title}
        </h2>
      </div>
      <ul className="ai-summary-tiles">
        {aiSummary.engines.map((engine) => (
          <li key={engine.key}>
            <a
              className="ai-tile"
              href={summaryUrl(engine.url, aiSummary.prompt)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('ai_summary_click', { engine: engine.key })}
              aria-label={`Summarise ${brand.name} with ${engine.name} (opens in a new tab)`}
            >
              <AiLogo engine={engine.key} />
              <span className="ai-tile-tip mono" aria-hidden="true">
                {engine.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
