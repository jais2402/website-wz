/** Fills an AI assistant's URL template: `{q}` becomes the URL-encoded prompt. */
export function summaryUrl(template: string, prompt: string) {
  return template.split('{q}').join(encodeURIComponent(prompt))
}
