# Belthera Proxy API — COMPLETE (Chat Proxy + Google OAuth Fix)

Includes:
- `api/chat.js` — robust CORS + OPTIONS + error handling
- `api/auth/google/start.js` — Google OAuth start (PKCE) + in-app to Chrome fallback
- `api/auth/google/callback.js` — token exchange + demo session cookie
- `vercel.json` — default headers for `/api/*`
- `openapi.yaml` — Custom GPT Action schema
- `.env.example` — environment variables

## Environment variables (Vercel → Settings)
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=
GOOGLE_REDIRECT_URI=https://<your-domain>.vercel.app/api/auth/google/callback
POST_LOGIN_REDIRECT=/login/success

## Google Cloud Console
Create OAuth 2.0 Client (Web app) and add the redirect URI above.

## Deploy
Push to GitHub → Import as **New Project** in Vercel → Deploy.

## Test
Chat proxy:
curl -X POST https://<your-domain>.vercel.app/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"ping"}]}'

Google login:
Open https://<your-domain>.vercel.app/api/auth/google/start (Kakao in-app will fall back to Chrome).

