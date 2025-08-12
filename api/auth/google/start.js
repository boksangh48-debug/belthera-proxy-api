// /api/auth/google/start.js — Google OAuth start (PKCE) + Chrome fallback
function base64url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export default async function handler(req, res) {
  try {
    const state = crypto.randomUUID();
    const verifier = crypto.randomUUID().replace(/-/g,'');
    const challengeData = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const challenge = base64url(new Uint8Array(challengeData));

    const cookieOpts = "HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax";
    res.setHeader('Set-Cookie', [
      `oauth_state=${state}; ${cookieOpts}`,
      `oauth_verifier=${verifier}; ${cookieOpts}`
    ]);

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      prompt: 'consent'
    });

    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const inApp = /(kakaotalk|instagram|fbav|line|naver)/.test(ua);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    if (inApp && /android/.test(ua)) {
      res.setHeader('Location', authUrl);
      return res.status(302).end();
    }
    res.setHeader('Location', authUrl);
    return res.status(302).end();
  } catch (e) {
    return res.status(500).json({ error: 'auth_start_failed', detail: String(e) });
  }
}
