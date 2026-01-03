# HR Tiba — Vite Migration Notes

This project was migrated to ESM + Vite-friendly structure (module entry at `/src/main.tsx`).

Development

- Install dependencies:
  npm install
- Start dev server:
  npm run dev

Notes

- The original inline script is preserved in `index.html` as a fallback but is disabled when the module entry runs.
- CSS was moved to `src/index.css` and is imported from `src/main.tsx`.
- This migration keeps Tailwind via CDN for now to avoid extra Tailwind build setup; I can add proper Tailwind PostCSS config if you want.
