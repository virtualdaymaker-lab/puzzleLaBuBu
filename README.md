<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the environment variables needed for local development and Vercel deployment in `.env.local`:

- `GEMINI_API_KEY` — used by `vite.config.ts` to expose `process.env.GEMINI_API_KEY`.
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_PAYPAL_CLIENT_ID`, `VITE_PAYPAL_SECRET` — PayPal config
- `VITE_GOOGLE_CLIENT_ID` — To enable Google Sign-In (if you use the optional sign in flow).

Note: Use the `VITE_` prefix (e.g. `VITE_GOOGLE_CLIENT_ID`) so Vite exposes these variables to client code using `import.meta.env`.
3. Run the app:
   `npm run dev`
