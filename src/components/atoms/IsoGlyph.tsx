import { cn } from '@/lib/cn';

/**
 * Atom. A small line-drawn isometric illustration, in the same block language
 * as the 3D model: rounded-cornered boxes seen from the same angle.
 *
 * Decorative (aria-hidden): the tile's text says what it is. Strokes use
 * currentColor, so the parent decides the colour (ink-3 at rest, the tile's hue
 * when pointed at). Faces are filled with the ground colour and drawn back to
 * front, so nearer boxes hide the lines behind them.
 */

export type GlyphName =
  | 'software' | 'automation' | 'integration' | 'data'
  | 'platforms' | 'hosting' | 'ai' | 'websites' | 'disciplines';

/** A box: grid x, y (depth), z (height), then width, depth, height. */
type Box = [number, number, number, number, number, number];

const SCENES: Record<GlyphName, { boxes: Box[]; links?: Array<[number, number]> }> = {
  // The site's own motif: a system with one piece lifted out above its place,
  // the part built to fit (the missing piece of the moment and contact scenes).
  software: { boxes: [[0, 0, 0, 2.4, 2.4, 1.2], [0, 0, 1.2, 2.4, 1.2, 1.2], [0, 1.2, 1.2, 1.2, 1.2, 1.2], [1.2, 1.2, 2.1, 1.2, 1.2, 1.2]] },
  // A row of steps, each lower than the last: work moving on by itself.
  automation: { boxes: [[0, 0, 0, 1, 1, 1.6], [1.3, 0, 0, 1, 1, 1.1], [2.6, 0, 0, 1, 1, 0.6]] },
  // Two systems, one connection.
  integration: { boxes: [[0, 0, 0, 1.2, 1.2, 1.2], [2.4, 1.4, 0, 1.2, 1.2, 1.2]], links: [[0, 1]] },
  // Rising columns.
  data: { boxes: [[0, 0, 0, 0.8, 0.8, 0.8], [1, 0, 0, 0.8, 0.8, 1.5], [2, 0, 0, 0.8, 0.8, 2.2]] },
  // A shared floor with people's places on it.
  platforms: { boxes: [[0, 0, 0, 3.4, 2.4, 0.3], [0.3, 0.3, 0.3, 0.8, 0.8, 0.8], [1.3, 1.3, 0.3, 0.8, 0.8, 0.8], [2.3, 0.3, 0.3, 0.8, 0.8, 0.8]] },
  // Stacked, running.
  hosting: { boxes: [[0, 0, 0, 2.4, 1.6, 0.5], [0, 0, 0.7, 2.4, 1.6, 0.5], [0, 0, 1.4, 2.4, 1.6, 0.5]] },
  // A part inside the system, doing a step.
  ai: { boxes: [[0, 0, 0, 2.4, 2.4, 1.2], [0.8, 0.8, 1.2, 0.8, 0.8, 0.8]] },
  // The eight offerings as the 3D model shows them: a 4×2 field of blocks.
  // The bento's centre stands in for the live model with this when WebGL is
  // absent, JavaScript is off, or before the 3D has loaded.
  disciplines: { boxes: [
    [0, 0, 0, 1, 1, 1.3], [1.25, 0, 0, 1, 1, 1.9], [2.5, 0, 0, 1, 1, 1.1], [3.75, 0, 0, 1, 1, 1.6],
    [0, 1.25, 0, 1, 1, 0.9], [1.25, 1.25, 0, 1, 1, 1.4], [2.5, 1.25, 0, 1, 1, 1.7], [3.75, 1.25, 0, 1, 1, 1.0],
  ] },
  // One flat page.
  websites: { boxes: [[0, 0, 0, 2.6, 0.2, 1.8]] },
};

const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
const U = 14; // px per grid unit

function pt(x: number, y: number, z: number) {
  return [(x - y) * C * U, (x + y) * S * U - z * U] as const;
}

function faces([x, y, z, w, d, h]: Box) {
  const P = (a: number, b: number, c: number) => pt(a, b, c).map((v) => v.toFixed(1)).join(',');
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const left = [P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)];
  const right = [P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)];
  return [top, left, right].map((f) => f.join(' '));
}

export interface IsoGlyphProps {
  name: GlyphName;
  className?: string | undefined;
  'data-stage-fallback'?: string | undefined;
}

export function IsoGlyph({ name, className, ...rest }: IsoGlyphProps) {
  const scene = SCENES[name];
  // Back to front: farther boxes (smaller x + y) first; lower first.
  const order = scene.boxes.map((b, i) => ({ b, i })).sort((p, q) => (p.b[0] + p.b[1]) - (q.b[0] + q.b[1]) || p.b[2] - q.b[2]);
  const all = scene.boxes.flatMap((b) => [pt(b[0], b[1], b[2]), pt(b[0] + b[3], b[1] + b[4], b[2] + b[5]), pt(b[0] + b[3], b[1], b[2]), pt(b[0], b[1] + b[4], b[2]), pt(b[0], b[1], b[2] + b[5])]);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const pad = 2;
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const vw = Math.max(...xs) - minX + pad, vh = Math.max(...ys) - minY + pad;
  const centre = (b: Box) => pt(b[0] + b[3] / 2, b[1] + b[4] / 2, b[2] + b[5] / 2);
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
      className={cn('overflow-visible', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    >
      {scene.links?.map(([a, b]) => {
        const p = centre(scene.boxes[a]!), q = centre(scene.boxes[b]!);
        return <line key={`${a}-${b}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} strokeDasharray="3 3" />;
      })}
      {order.map(({ b, i }) =>
        faces(b).map((f, k) => (
          <polygon key={`${i}-${k}`} points={f} fill="var(--color-ground)" vectorEffect="non-scaling-stroke" />
        )),
      )}
    </svg>
  );
}
