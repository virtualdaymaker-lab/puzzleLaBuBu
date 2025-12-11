
# PuzLabu — AI Agent Coding Guide

**Project Overview:**
- Vite + React SPA for puzzle games, with Supabase for activation/purchases and PayPal for payments.
- Entry: `index.html` → `index.tsx` → `App.tsx` (routes/views).
- Main UI: `components/PuzzleMenu.tsx`, `components/PuzzleBoard.tsx`, `components/ActivationGate.tsx`.
- Utilities: `utils/supabase.ts` (Supabase client, activation code), `utils/deviceId.ts` (device fingerprint), `utils/exportFlyers.ts`, `utils/googleDriveSync.ts`.
- Static assets: `public/images/` (see `public/images/README.txt` for naming rules).

**Critical Workflows:**
- Install deps: `npm ci`
- Dev server: `npm run dev` (localhost:3000)
- Build: `npm run build` (output: `dist/`)
- Preview prod build: `npm run preview`

**Deployment (Vercel):**
- Build command: `npm run build`, output: `dist/`
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PAYPAL_CLIENT_ID`, `VITE_PAYPAL_SECRET`, `GEMINI_API_KEY`
- If blank page: check DevTools console, network, and Vercel logs for missing files or env vars
- Enable `VITE_DEV_MODE=true` for local dev to bypass PayPal/Supabase (see DEV unlock in `ActivationGate.tsx`)

**Project-Specific Patterns & Conventions:**
- All runtime config via `import.meta.env` and `VITE_*` (except Gemini: see `vite.config.ts`)
- Some legacy code uses `process.env.REACT_APP_GOOGLE_CLIENT_ID` (see `components/GoogleAuth.tsx`); prefer `VITE_GOOGLE_CLIENT_ID` for new code
- Supabase: `utils/supabase.ts` expects `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; `purchases` table stores activation codes, PayPal order IDs, device IDs
- Device ID: `utils/deviceId.ts` uses canvas fingerprint; changes may affect activation/test logic
- DEV unlock passcode `123` in `ActivationGate.tsx` for test activation (do not rely on for security)

**Debugging & Troubleshooting:**
- If Vercel deploy is blank:
  1. Confirm commit SHA matches Vercel build
  2. Check Vercel logs for build/env errors
  3. Ensure output dir is `dist/`
  4. Check browser console for missing env vars/files
  5. If 404s for `index.css` or images, check file presence and references
  6. Redeploy if needed
- For local issues: rebuild (`npm ci`, `npm run build`), preview (`npm run preview`), check DevTools

**Key Files for Reference:**
- `index.html`: HTML entry, Tailwind CDN, `index.css` reference
- `vite.config.ts`: env var mapping, plugins
- `App.tsx`: top-level layout, activation/content switching
- `components/ActivationGate.tsx`: activation logic, Supabase, DEV unlock
- `components/PayPalCheckout.tsx`: PayPal integration
- `utils/supabase.ts`: Supabase client, activation code logic

**When requesting help, always provide:**
- Vercel build logs (with commit SHA)
- Browser console errors
- `git rev-parse HEAD` and last commit message

**Keep PRs focused and small.**
