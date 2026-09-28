/** "Custom business software" → "custom-business-software". Used for public anchors. */
export function slug(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
}
