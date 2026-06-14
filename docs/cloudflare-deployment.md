# Cloudflare Deployment

## Current resources

- Account ID: `044e1cfd0b5cc63030e0f77917f625ce`
- Zone: `condofinder.com`
- Zone ID: `bf82b46d3937d52066c9fd58ee8bd421`
- Worker: `condo-finder-api`
- Pages project: `condofinder`
- Pages URL: `https://condofinder.pages.dev`
- D1 database: `condo-finder-db`
- D1 database ID: `d228e929-dc38-4fc3-8b45-21cff34a4688`

## Worker routes

The Worker serves both the Angular static assets and API endpoints.

- `condofinder.com/*`
- `www.condofinder.com/*`

API paths are handled by the Worker first via `run_worker_first = ["/api/*"]`.
All other paths are served from `dist/condo-finder/browser` as static assets with SPA fallback.

## Deploy

```bash
npm run build
npm run worker:deploy
```

## Deploy to Cloudflare Pages

Use this URL when the custom domain is not active yet:

```bash
npm run pages:deploy
```

Live Pages URL:

```text
https://condofinder.pages.dev
```

## Local test

```bash
npm run worker:dev
curl http://127.0.0.1:8787/api/health
curl http://127.0.0.1:8787/api/properties
```

## Domain activation

Cloudflare zone status was `pending` after setup. The domain registrar still used:

- `ns73.domaincontrol.com`
- `ns74.domaincontrol.com`

Change the domain nameservers at the registrar to Cloudflare:

- `ariella.ns.cloudflare.com`
- `junade.ns.cloudflare.com`

After the nameserver change propagates, `https://condofinder.com` and
`https://www.condofinder.com` will route to the deployed Worker.
