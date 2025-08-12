// /api/auth/google/callback.js — token exchange (PKCE)
function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const parts = header.split(/;\s*/);
  for (const p of parts) {
    const [k, ...v] = p.split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const savedState = readCookie(req, 'oauth_state');
    const verifier = readCookie(req, 'oauth_verifier');

    if (!code || !state || !savedState || !verifier || state !== savedState) {
      return res.status(400).send('Invalid OAuth state');
    }

    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier
    });

    const token = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    }).then(r => r.json());

    if (!token.id_token && !token.access_token) {
      return res.status(400).json({ error: 'token_exchange_failed', detail: token });
    }

    res.setHeader('Set-Cookie', `sid=${token.id_token || token.access_token}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Lax`);
    res.statusCode = 302;
    res.setHeader('Location', process.env.POST_LOGIN_REDIRECT || '/login/success');
    res.end();
  } catch (e) {
    return res.status(500).json({ error: 'auth_callback_failed', detail: String(e) });
  }
}
