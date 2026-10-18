# Wezigns: immersive website

Scroll-driven 3D marketing site for Wezigns Software Private Limited.

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # tests + lint + typecheck
npm run build      # production build → dist/
```

- **Edit copy:** `src/content/site.ts`
- **Colours and type:** tokens at the top of `src/index.css`
- **3D story:** `src/scene/` and `src/lib/shapes.ts`
- **The Loom page** (`/loom.html`): `src/loom/`

See `CLAUDE.md` for architecture and conventions.

Deploys as a static site (Vercel or Netlify): build command `npm run build`, output `dist`.
