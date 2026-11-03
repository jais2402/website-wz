// Timelines for the AI page's two scripted visuals (pages/ai): the hero chat loop and the "Test run" window beside the
// How section. Pure: no DOM, no React. The components read these every frame and toggle classes; CSS does the motion.

/** One loop of the hero chat, in ms. */
export const CHAT_CYCLE = 10_000

/** When the question starts typing into the input, and how long each character takes. */
export const TYPE_START = 400
export const TYPE_PER_CHAR = 38

/**
 * The chat's states. Each is a class (`is-<flag>`) on the chat window while it is on:
 * reset → everything snaps back with no transition (hidden under `out`), send → the send button is pressed,
 * asked → the question bubble is in, thinking → the typing dots, answer → the words stream in, sources → the source
 * chips, action → the suggested step slides up, aim → the cursor glides to Approve, press → the button is down,
 * sent → Approve has become "Sent", reply → the supplier's reply arrives, out → the conversation fades for the loop.
 */
export type ChatFlag =
  | 'reset'
  | 'send'
  | 'asked'
  | 'thinking'
  | 'answer'
  | 'sources'
  | 'action'
  | 'aim'
  | 'press'
  | 'sent'
  | 'reply'
  | 'out'

/** [from, to) in ms within the cycle. */
const WINDOWS: Record<ChatFlag, [number, number][]> = {
  reset: [[0, 120]],
  send: [[2050, 2300]],
  asked: [[2250, CHAT_CYCLE]],
  thinking: [[2500, 3500]],
  answer: [[3500, CHAT_CYCLE]],
  sources: [[4600, CHAT_CYCLE]],
  action: [[5300, CHAT_CYCLE]],
  aim: [[6200, 7900]],
  press: [[6950, 7200]],
  sent: [[7150, CHAT_CYCLE]],
  reply: [[8000, CHAT_CYCLE]],
  out: [
    [0, 160],
    [9300, CHAT_CYCLE],
  ],
}

export const CHAT_FLAGS = Object.keys(WINDOWS) as ChatFlag[]

/** The finished conversation: what reduced motion and the static (prerendered) page show. */
export const CHAT_FINAL: ChatFlag[] = ['asked', 'answer', 'sources', 'action', 'sent', 'reply']

/** Which flags are on at `t` ms (any t: it wraps into the cycle). */
export function chatFlagsAt(t: number): Set<ChatFlag> {
  const at = ((t % CHAT_CYCLE) + CHAT_CYCLE) % CHAT_CYCLE
  const on = new Set<ChatFlag>()
  for (const flag of CHAT_FLAGS) {
    if (WINDOWS[flag].some(([a, b]) => at >= a && at < b)) on.add(flag)
  }
  return on
}

/** How many characters of the question are typed into the input at `t` (0 once it has been sent). */
export function typedChars(t: number, length: number): number {
  const at = ((t % CHAT_CYCLE) + CHAT_CYCLE) % CHAT_CYCLE
  if (at >= WINDOWS.asked[0][0]) return 0
  return Math.max(0, Math.min(length, Math.floor((at - TYPE_START) / TYPE_PER_CHAR)))
}

/** Test run: each row is checked for this long (ms), one after another. */
export const RUN_STEP = 900

/**
 * Where a test run of `rows` rows stands after `t` ms: rows before `index` are done, row `index` is being checked
 * (index === rows when the run is complete), and `progress` (0..1) fills the bar.
 */
export function testRunAt(t: number, rows: number): { index: number; progress: number; complete: boolean } {
  const total = RUN_STEP * rows
  const at = Math.max(0, Math.min(total, t))
  const index = Math.min(rows, Math.floor(at / RUN_STEP))
  return { index, progress: rows ? at / total : 1, complete: at >= total }
}
