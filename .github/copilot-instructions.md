<!--
AI Assistant instructions for contributors and AI agents working on the PuzLabu repo.
This doc is intentionally short and actionable. Avoid generic coding guidance;
focus on repository-specific rules, patterns, and checks.
-->

# PuzLabu — AI/Agent Instructions

High-level goal: Keep the app small, predictable, and reliable. This is a Vite + React SPA that uses Supabase for purchases and PayPal for payments.

Quick orientation
- Entry point: `index.html` -> `index.tsx` -> `App.tsx` (top-level routes/views).
- Main components: `components/PuzzleMenu.tsx`, `components/PuzzleBoard.tsx`, `components/ActivationGate.tsx`.
- Utilities: `utils/supabase.ts` (Supabase client + activation code generator), `utils/deviceId.ts` (client device fingerprinting).
 - Utilities: `utils/supabase.ts` (Supabase client + activation code generator), `utils/deviceId.ts` (client device fingerprinting).
- Static assets: `public/images/*` (puzzle images) — follow the naming documented in `public/images/README.txt`.

Build & local workflow
- Install: `npm ci`
- Dev server: `npm run dev` (Vite dev server on `localhost:3000`).
- Production build: `npm run build` (output -> `dist`).
- Preview build locally: `npm run preview` (serves the `dist` bundle on a local dev server).

Vercel deployment specifics (common cause of blank page)
- This is a static SPA with Vite; use Build Command: `npm run build` and Output Directory: `dist`.
- Ensure environment variables (Vite naming) are configured in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PAYPAL_CLIENT_ID`, `VITE_PAYPAL_SECRET`, and `GEMINI_API_KEY` (vite config maps GEMINI into runtime `process.env.GEMINI_API_KEY`).
- Verify branch and commit in Vercel dashboard: compare `git rev-parse HEAD` SHA to the Vercel deployment commit SHA for the latest deploy.
- If the deployed site is blank: open DevTools -> Console and Network logs for errors such as missing `dist` or runtime errors (`ReferenceError`, `TypeError`, or a script failing to load). Export and paste logs in PRs if you need help diagnosing.
 - For local development you can enable `VITE_DEV_MODE=true` to test without contacting PayPal or Supabase: this enables "DEV: Skip Activation" in the activation gate and a "Simulate Payment (DEV)" button in the PayPal modal.

Repository-specific patterns & gotchas
- Environment variables: Almost all runtime config uses `import.meta.env` for `VITE_*` prefixed values (see `utils/supabase.ts`, `components/PayPalCheckout.tsx`). Some code uses `process.env.REACT_APP_GOOGLE_CLIENT_ID` directly (in `components/GoogleAuth.tsx`) which is non-standard for Vite — prefer `VITE_GOOGLE_CLIENT_ID` and `import.meta.env.VITE_GOOGLE_CLIENT_ID` if changing.
- `vite.config.ts` maps `GEMINI_API_KEY` into `process.env.GEMINI_API_KEY`. This is deliberate for the Gemini key; keep this mapping if you update how it’s consumed.
- Supabase: `utils/supabase.ts` expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The `purchases` table stores activation codes, PayPal order IDs, and device IDs (see `components/ActivationGate.tsx`).
- Device fingerprint: `utils/deviceId.ts` uses a harmless canvas fingerprint to generate a device id; changes here may affect test harness and activation logic.
- DEV Unlock: There’s a development unlock passcode `123` in `components/ActivationGate.tsx` to quickly test payout-free activation — do not commit a PR that relies on this as a security control.

Suggested debugging steps when Vercel shows a blank page
1. Confirm commit was pushed: `git rev-parse HEAD` -> checkout in Vercel’s dashboard build logs (should match).
2. Open Vercel Deployments -> Deployment logs. Look for build failures, warnings about missing files (e.g. `/index.css` missing), or environment variable errors.
3. Check that Output Directory is `dist` (Vite default). Vercel sometimes defaults to `public` for some frameworks — that will give a blank page.
4. If build succeeded but page is blank, open browser DevTools console for runtime errors caused by undefined globals (window.google is used for optional Google sign-in) or missing env variables.
5. If there are 404s for `index.css` or assets that were not built, ensure `/index.css` is intentionally omitted or included — Vite won't generate a file missing from the source; if the project needs an `index.css` file, add it to the root or update references.
6. Redeploy: from Vercel UI redeploy the latest commit (or `vercel` CLI), confirm a new deployment and check build logs.

Quick developer scripts for local triage
- Check git status and push:
  - `git status` (see if you have uncommitted changes)
  - `git rev-parse HEAD` to get SHA and confirm Vercel deployed same commit
  - `git push` to ensure latest commits are on origin
- Rebuild and preview locally:
  - `npm ci`
  - `npm run build`
  - `npm run preview` (open the local preview URL and check DevTools — if your local preview fails, Vercel likely will too)

Files to reference when troubleshooting
- `index.html` — top-level HTML. Pay attention to the `index.css` reference and Tailwind CDN inclusion.
- `vite.config.ts` — environment mapping (GEMINI -> process.env), host/port and plugin list.
- `App.tsx` — top-level layout: Activation flow, content switching (menu/puzzle).
- `components/ActivationGate.tsx` — activation flow, Supabase lookups, DEV Unlock test hook.
- `components/PayPalCheckout.tsx` — PayPal usage; use `import.meta.env.VITE_PAYPAL_CLIENT_ID`.
- `utils/supabase.ts` — exports `supabase` client, `generateActivationCode`, and constants like `MAX_DEVICES`.

If you're stuck, always provide the following when requesting help:
- Build logs from Vercel (include the commit SHA at the top of the logs).
- Browser console errors (copy-paste or screenshot). Example: `ReferenceError: ReactDOM is not defined` or `Uncaught TypeError: ...`.
- `git rev-parse HEAD` and `git log -1 --pretty=format:%h|%s` (commit hash and message).

Thanks — keep breaks small and PRs focused (one change per PR). If you prefer, ask for an automated PR with a fix for the specific issue.
