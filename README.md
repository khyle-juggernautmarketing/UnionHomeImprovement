# Union Home Improvement — Landing Page

Production Next.js landing page for Union Home Improvement (Burlington, MA).

## Local development

```bash
npm install
cp .env.local.example .env.local   # add N8N_WEBHOOK_URL and N8N_JWT_SECRET
npm run dev
```

Open **http://127.0.0.1:3010** (port 3010 avoids conflicts with other local projects on 3000).

## Environment variables (Vercel / server only)

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_URL` | HTTPS n8n webhook endpoint |
| `N8N_JWT_SECRET` | HMAC secret to sign short-lived JWTs for n8n (e.g. `UnionHomeImprovement@123`) |

## Deploy

Push to [UnionHomeImprovement](https://github.com/UnionHomeImprovement) on GitHub, then deploy via Vercel with the env vars above set for Production.
