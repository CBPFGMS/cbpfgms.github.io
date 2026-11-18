# Connectivity pre-check for pfdata dashboards

A small (≈6 KB gzipped), dependency-free script that runs when the page opens, probes every external host the dashboard depends on, and warns users **before** they stare at empty charts.

## What the attribution page depends on (audited 12 Nov 2026)

| Host | Used for | Level |
|---|---|---|
| `raw.githubusercontent.com` | ~20 CSV/JSON data files (`CBPFGMS/cbpfgms-data`) | critical |
| `pfbi-eastus2-api-site.azurewebsites.net` | Donor attribution API | critical |
| `flagcdn.com` | Country flags | degraded |
| `cdnjs.cloudflare.com` | Font Awesome icons, AOS animations | degraded |
| `fonts.googleapis.com`, `fonts.gstatic.com` | Web fonts | info |
| `www.googletagmanager.com` | Analytics | info |

## How it works

1. Probes all hosts in parallel (8 s budget each), reading only the first ~600 bytes.
2. Classifies each failure:
   - **Blocked** – connection refused/reset/DNS filtered
   - **Timed out** – traffic silently dropped (common with VPNs)
   - **Intercepted** – HTTP 200 but an HTML "access denied" page instead of CSV/JSON (proxies like Zscaler)
   - **Error** – host answered with an HTTP error → shown as a *service outage*, not a network problem
   - If a CORS read fails, it retries in `no-cors` mode so "reachable but CORS-restricted" isn't misreported as blocked.
3. Shows, by severity:
   - **critical** → modal explaining the impact, the exact hosts to allowlist, *Copy report for IT*, *Check again*, *Continue to page*
   - **degraded** → slim dismissible bar
   - **info** → silent (so ad-blockers killing analytics never alarm anyone)
4. After an all-clear, skips re-checks for 30 minutes (sessionStorage).

## Integration (pfdata.unocha.org)

For this React attribution app, do not add this script as a head preflight:
the app now reports failures from its actual data requests in its error
fallback, avoiding separate probe requests. This standalone script is intended
for pages that do not already handle their own fetch failures.

Copy `connectivity-check.js` to `/assets/js/` and add **first** in `<head>`:

```html
<script src="/assets/js/connectivity-check.js"></script>
<script>PFConnectivityCheck.run(PFConnectivityCheck.presets.cbpfAttribution);</script>
```

It must be served from pfdata itself – never from a CDN, or it would be blocked by the very thing it checks.

Optional hooks for the React app:

```js
window.addEventListener('pf:connectivity', e => { if (e.detail.status === 'critical') { /* show inline empty states */ } });
PFConnectivityCheck.run({ ...PFConnectivityCheck.presets.cbpfAttribution,
  onComplete: r => navigator.sendBeacon('/api/connectivity-log', JSON.stringify({ status: r.status,
    failed: r.results.filter(x => x.state === 'fail').map(x => x.host) })) });
```

The beacon (same-origin, so it gets through) lets you measure how many users are actually affected and by which host.

Other pages: pass your own `targets` array (`id, label, url, level, expect: 'csv'|'json'|'css', method: 'fetch'|'image'|'opaque', impact`).

## Recommended alongside the check

The check tells users about the problem; removing the dependencies fixes it:

- **Serve the data from pfdata** (sync the GitHub CSVs on deploy, or proxy `/data/*` → GitHub) – removes the most-blocked host. GitHub raw is frequently filtered on corporate and government networks.
- **Self-host** Font Awesome, AOS and the four Google Font families under `/assets/` – removes three more hosts.
- **Bundle flag images** used by donor/fund lists, or proxy flagcdn.
- That leaves only the Azure API, which could also sit behind a pfdata path.

## Files

- `connectivity-check.js` – the drop-in script
- `connectivity-check-demo.html` – self-contained demo with scenario buttons (`?scenario=critical|timeout|intercept|degraded|adblock`)

Tested: syntax, 8 simulated network scenarios (OK, ad-block, degraded, blocked, timeout, proxy block page, CORS-restricted, HTTP 500, cache), and rendered in headless Chrome.
