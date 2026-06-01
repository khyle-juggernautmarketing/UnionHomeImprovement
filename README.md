# Union Home Improvement — Landing Page

Production Next.js landing page for Union Home Improvement (Burlington, MA).

## Local development

```bash
npm install
cp .env.local.example .env.local   # add N8N_WEBHOOK_URL and N8N_AUTH_BEARER
npm run dev
```

Open **http://127.0.0.1:3010** (port 3010 avoids conflicts with other local projects on 3000).

## Environment variables (Vercel / server only)

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_URL` | HTTPS n8n webhook endpoint |
| `N8N_AUTH_BEARER` | Bearer token for webhook auth (never expose in client code) |

## Deploy

Push to [UnionHomeImprovement](https://github.com/UnionHomeImprovement) on GitHub, then deploy via Vercel with the env vars above set for Production.
