// Appends each enquiry as a row in a Google Sheet, through a service account with Editor access on that Sheet.
// Dependency-free: the service-account JWT is signed with node:crypto and exchanged for an access token, then the
// row goes in through the Sheets REST API. Underscore prefix: Vercel does not deploy this file as a function.
// Env: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID, GOOGLE_SHEET_TAB_NAME (default Contact_Form).

import { createSign } from 'node:crypto'

type Env = Record<string, string | undefined>

export type SheetConfig = { clientEmail: string; privateKey: string; sheetId: string; tab: string }

/** The Sheet settings, or null when any required one is missing (then the Sheet is simply skipped). */
export function sheetConfig(env: Env): SheetConfig | null {
  const clientEmail = env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim()
  // Env files and the Vercel dashboard keep the key's line breaks as literal \n.
  const privateKey = env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()
  const sheetId = env.GOOGLE_SHEET_ID?.trim()
  if (!clientEmail || !privateKey || !sheetId) return null
  return { clientEmail, privateKey, sheetId, tab: env.GOOGLE_SHEET_TAB_NAME?.trim() || 'Contact_Form' }
}

export const SHEET_HEADER = ['Received (IST)', 'Name', 'Email', 'Company', 'Phone', 'Help with', 'Message', 'Marketing emails', 'Sent from']

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url')

/** A signed service-account assertion for the Sheets scope, valid for one hour. */
export function signedAssertion(cfg: SheetConfig, nowSec = Math.floor(Date.now() / 1000)): string {
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: cfg.clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${head}.${claims}`)
  return `${head}.${claims}.${b64url(signer.sign(cfg.privateKey))}`
}

// One token per warm function instance, refreshed a minute before it runs out.
let cached: { token: string; until: number; key: string } | null = null
export const resetSheetToken = () => {
  cached = null
}

async function accessToken(cfg: SheetConfig): Promise<string> {
  const now = Date.now()
  if (cached && cached.key === cfg.clientEmail && cached.until > now) return cached.token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: signedAssertion(cfg) }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`token ${res.status} ${(await res.text()).slice(0, 200)}`)
  const body = (await res.json()) as { access_token: string; expires_in?: number }
  cached = { token: body.access_token, until: now + ((body.expires_in ?? 3600) - 60) * 1000, key: cfg.clientEmail }
  return body.access_token
}

const range = (cfg: SheetConfig, cells: string) => encodeURIComponent(`'${cfg.tab.replace(/'/g, "''")}'!${cells}`)

/**
 * Adds one row (and the header row first, if the tab is still empty). Values go in RAW, so a visitor's text that
 * starts with "=" stays text and never runs as a formula.
 */
export async function appendRow(cfg: SheetConfig, row: string[]): Promise<void> {
  const token = await accessToken(cfg)
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cfg.sheetId)}/values`
  const auth = { Authorization: `Bearer ${token}` }

  const head = await fetch(`${base}/${range(cfg, 'A1:A1')}`, { headers: auth, signal: AbortSignal.timeout(8000) })
  if (!head.ok) throw new Error(`read ${head.status} ${(await head.text()).slice(0, 200)}`)
  const empty = !((await head.json()) as { values?: unknown[] }).values?.length

  const res = await fetch(`${base}/${range(cfg, 'A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: empty ? [SHEET_HEADER, row] : [row] }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`append ${res.status} ${(await res.text()).slice(0, 200)}`)
}
