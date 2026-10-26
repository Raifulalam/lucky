# Lucky Impex: SEO, Performance and Security Audit (first pass)

Repo inspected: `lucky/` (`luckyimpex` = Create React App frontend, `myStore` = Express + MongoDB backend, API hosted on Render, frontend config for Vercel/Netlify-style hosting).

## 0. What I could and could not do

| Could do | Could not do (and why) |
|---|---|
| Read the whole codebase and git state | Run `npm install`, `react-scripts build`, Lighthouse or PageSpeed (the upload has no `node_modules`; the sandbox has no network) |
| Syntax-check every edited file, unit-test the new SEO helpers, run the prerender end to end on a throwaway fixture | Call your live API or site, so the "product loading failed" root cause below is **a code-level diagnosis, not a confirmed one** |
| Produce a patch you can review and apply | Measure before/after Core Web Vitals, validate with Google's Rich Results Test, touch Search Console, GBP, Merchant Center |

No performance numbers are reported because none were measured.

## 1. Audit findings (prioritised)

### Critical
1. **WhatsApp admin endpoints were public.** `/api/whatsapp/status`, `/send`, `/restart`, `/logout` had no authentication and were mounted before Helmet and the rate limiter. `/status` returns the WhatsApp **link QR code**, so anyone could link your business WhatsApp session to their device, or send messages from your number. **Fixed** (admin token required).
2. **Secrets and sessions are inside the zip you uploaded.** `myStore/.env` (Mongo, Cloudinary, JWT, Redis, WhatsApp tokens) and `myStore/auth_info_baileys/` (WhatsApp session keys). Rotate: Mongo password, Cloudinary secret, JWT secret, Redis URL, WhatsApp tokens, and log out and re-link the Baileys session. Treat all as exposed. (`.gitignore` already excludes them from git, which is good.)
3. **JWT fallback secret `"change-me-in-env"`** in four files. If `JWT_SECRET` were ever missing, anyone could forge an admin token. **Fixed**: the server now refuses to start without it outside `NODE_ENV=development`.

### High
4. **Probable cause of the homepage product failure** (needs confirmation in your Render logs):
   - `config/redis.js` exported a raw client with the default offline queue. If Redis is unreachable or `REDIS_URL` is wrong, `redisClient.get()` **never resolves**, so `/api/products/products` never answers and the browser reports a failed fetch.
   - The server only called `listen()` after MongoDB connected and called `process.exit(1)` on failure. A slow or failed DB connection (or a free-tier Render cold start) meant no response and no CORS headers.
   - The frontend had no timeout and no retry, and one failure blanked the homepage product section.
   **Fixed**: Redis is now an optional cache that can never block a request (1.5 s cap, no-op when unset); the server listens immediately and retries MongoDB with backoff; `/healthz` added; the frontend has a 15 s timeout and one retry for GETs.
5. **Every product URL was served the homepage's `<title>`, description and `canonical="/"`** to crawlers that don't run JavaScript (CRA shell). **Fixed** with build-time prerendering of real product, category and brand pages (details below).
6. **Fabricated data on the homepage cards**: random 4.5-5.0 star ratings and random review counts, a fake "10% OFF", invented wholesale tiers ("Save 15%", "5-9 units / 10+ units"), a made-up "EMI from price/12", and "Best Sellers" assigned by array index. **Removed.** Prices, MRP-based discount, and stock now show only when real.
7. **Sitemap listed login-only pages** (`/emi`, `/exchange`) and used `lastmod = today` on every URL, and contained no product URLs unless an env var was set. **Fixed.**
8. **CORS reflected any origin with credentials** when `CORS_ORIGIN` was unset. **Fixed**: defaults to the production domains.

### Needs your decision (I did not change these because I cannot verify the facts)
9. **Unverified marketing claims** in the live meta description and `siteConfig`: "Official retailer & wholesale distributor", "warranty, EMI & store pickup". Also `paymentAccepted: Cash, Credit Card, Fonepay, eSewa, Khalti, Bank Transfer` and `priceRange: "Rs"` in the LocalBusiness schema. Confirm each or remove it.
10. **Conflicting phone numbers in the source**: `051531789` (config/schema), `+977 9802594022` (WhatsApp), and also `9832710566` (7 occurrences), `9807286786`, `9810818276`, `9807216321`, `51170717`, and a placeholder `9800000000`. Tell me which are real and which role each has.
11. **Search action** in WebSite schema points to `/products?search={term}`; confirm that URL parameter actually filters products.
12. The `/products/:category` links use raw database category values such as `AirConditioners`, not readable URLs. Changing them needs a redirect plan (see plan, week 3).

## 2. What changed (all in `lucky-seo-changes.patch`)

| File | Change |
|---|---|
| `myStore/Router/whatsaap.js` | `auth` + `isAdmin` on status/send/restart/logout |
| `myStore/index.js` | listen first, Mongo retry, `/healthz`, JWT guard, CORS allowlist, WhatsApp router moved behind Helmet/rate limit |
| `myStore/config/redis.js` | non-blocking optional cache wrapper (same `get/setEx/del/scan` API, so `createProducts`, `productcategory`, `MobileRouter` need no changes) |
| `luckyimpex/src/api/api.js` | request timeout + one retry on idempotent GETs |
| `luckyimpex/src/Pages/HomePage/ProductListingSection.jsx` | real data only, crawlable `<Link>` to each product |
| `luckyimpex/scripts/generate-seo-assets.js` | sitemap from real catalogue, keeps the old sitemap if API unreachable, no fake `lastmod`/priority |
| `luckyimpex/scripts/prerender-products.js` (new) | per-URL static HTML: title, description, canonical, Open Graph, Product + BreadcrumbList JSON-LD, H1, real links; runs as `postbuild` |
| `luckyimpex/scripts/lib/*` (new) | catalogue fetch, text/schema helpers, unit tests (`npm run test:seo`) |
| `luckyimpex/src/seo/siteConfig.data.json` | removed login-only routes from sitemap routes |
| `luckyimpex/package.json`, `.gitignore` | `postbuild`, `test:seo`, ignore generated cache |

Structured-data rules in the prerender: `Offer` only when price > 0; availability from real stock; currency NPR; **no** ratings, reviews, GTINs or shipping/return claims; descriptions contain no price (prices change), titles follow `[Brand] [Name] [Model] Price in Nepal | Lucky Impex` and drop the "Price in Nepal" part rather than truncate when too long.

Caveat: JSON-LD price is a build-time snapshot. Rebuild on a schedule (e.g. a daily Vercel deploy hook) or whenever prices change; React's live metadata takes over after load.

## 3. Tests actually run

- `node --check` on every edited/new backend and script file: pass.
- TypeScript-parser syntax check on edited `.jsx`/`.js` frontend files: pass (this is a syntax check, **not** a webpack build or ESLint run).
- `npm run test:seo` (title length, no "LG LG", no price in description, no invented rating, no offer without price, NPR currency, `</script>` escaping, slug safety): pass.
- Redis wrapper against stubbed `redis`: unset → returns in ~4 ms; not ready → ~4 ms; commands that hang forever → released after the 300 ms test timeout. Pass.
- Prerender end to end on a throwaway template and fixture catalogue: wrote 2 products + 2 categories + 2 brands, one canonical per page, JSON-LD parses, a path-traversal slug (`../../evil`) was refused, a product with price 0 got no `offers`. Pass.
- **Not run**: production build, ESLint (CRA fails CI builds on warnings, so run `npm run build` once before deploying), Lighthouse, Rich Results Test, any live request.

## 4. Keyword map (intent → page). No volumes are given because none were measured.

Pages marked **(exists)** are routes in the current app; **(to build)** do not exist yet.

| Intent | Keyword group | Target page |
|---|---|---|
| Brand/navigational | Lucky Impex, Lucky Impex Birgunj | `/` (exists) |
| Local commercial | electronics store/shop/showroom Birgunj, home appliances Birgunj | `/` and `/store` (exists) |
| Category + price | AC / split / inverter AC price Nepal, AC shop Birgunj | `/products/AirConditioners` (exists; prerendered) |
| Category + price | refrigerator / fridge price Nepal | `/products/Refrigerators` (exists) |
| Category + price | washing machine price Nepal | `/products/WashingMachines` (exists) |
| Category + price | LED / smart TV price Nepal | `/products/LEDTelevisions` (exists) |
| Other categories | chimney, air cooler, chest freezer, kitchen appliances, home theater | their `/products/<Category>` pages (exist) |
| Brand + category | LG/Samsung/Haier/CG … price Nepal | `/products/brand/<Brand>` (exists; prerendered) |
| Exact model | model numbers | `/product/<slug>` (exists; prerendered) |
| Wholesale/B2B | wholesale electronics Nepal/Birgunj, appliance distributor | `/wholesale` (**to build**, needs your real MOQ and terms) |
| Informational | AC capacity guide, fridge/washer/TV buying guides | `/blog/...` (**to build**) |
| Regional | Parsa, Bara, Kalaiya, Simara | one section on `/store` or `/contact` **only if you actually deliver there**; no doorway pages |

Only build pages for brands, sizes and capacities that exist in your database (I could not read your data, only the code). Check real queries in Search Console before adding Nepali/Romanized terms.

## 5. Access still needed from you

1. Render logs for the failing period, and the real `REDIS_URL` / `CORS_ORIGIN` values: to confirm the diagnosis in §1.4.
2. Set on Render: `JWT_SECRET`, `CORS_ORIGIN=https://luckyimpex4u.com,https://www.luckyimpex4u.com`; optionally `REDIS_URL` (with `rediss://` for TLS). On the frontend host: `REACT_APP_API_BASE_URL`, `REACT_APP_SITE_URL`, `REACT_APP_GOOGLE_SITE_VERIFICATION`. Note the build now needs the API reachable to prerender; otherwise it skips safely.
3. Search Console: verify the domain, submit `https://luckyimpex4u.com/sitemap.xml`, inspect a few product URLs after deploy.
4. Google Business Profile: confirm name, phone, address, hours, categories; collect real reviews.
5. Upload all-product data or an API export if you want category/brand copy and the keyword map tied to real inventory.

## 6. Prioritised 30-day plan

**Week 1: stabilise and ship**
- Rotate the exposed secrets; set env vars; deploy backend, confirm `/healthz` and `/api/products/products` respond fast.
- Run `npm run build` locally/CI, fix any lint warnings, deploy; `curl -s https://luckyimpex4u.com/product/<slug> | grep -E "<title>|canonical|<h1>"` to confirm the static HTML is served (I could not verify how your host maps directory indexes).
- Confirm the true phone numbers and claims (§1.9-1.10); then I update config, schema, footer and meta.
- Set a daily rebuild hook so prices/stock in JSON-LD stay fresh.

**Week 2: measure and fix indexing**
- Search Console: verify, submit sitemap, inspect 10 key URLs, watch Pages/Indexing for "soft 404" (removed products currently return the SPA with 200; fix by redirecting or a real 404 once you choose the host strategy).
- Run PageSpeed Insights on home, a category, a product; record real LCP/INP/CLS as the baseline. Likely wins: compress/resize Cloudinary images (`f_auto,q_auto,w_…`), explicit image dimensions, lazy-load below the fold, drop the long-splash delay, trim unused dependencies (`react-helmet` and `react-helmet-async` are both installed; `framer-motion`, `recharts` should be admin-only chunks).

**Week 3: pages that earn traffic**
- Build `/wholesale` with real MOQ, terms and an inquiry form.
- Write 3 buying guides from real inventory (AC capacity, fridge, smart TV), each linking to the real category pages.
- Plan readable category/brand URLs with 301 redirects (only after the baseline is measured).

**Week 4: local authority and iteration**
- GBP cleanup, photos, review requests to real customers, respond to reviews.
- List in genuine directories and manufacturer dealer pages where eligible.
- Review Search Console queries; add pages only for real demand; decide Nepali-language content from actual queries.

## 7. Not done in this pass (so you know the boundary)

Phase 12 full redesign, `/wholesale`, `/blog`, `/offers`, policy pages, readable URL restructure, image optimisation pipeline, Merchant Center feed, and analytics event audit (GA ID `G-N8H0F7KBS1` is in config; I did not audit duplicate tagging). Each is better done after the build is verified and the facts in §1.9-1.10 are confirmed.

---

## 8. Update: contacts, new pages, dead-code removal

**Main contacts (confirmed by owner):** landline `051531789`, WhatsApp/mobile `9802594022`. Replaced the other numbers on the header, hero "Call B2B Desk", showroom hub, flagship store card and invoice header (which had the placeholder `9800000000`). Branch cards for Maisthan and Simra keep their own branch phone numbers. Also fixed a **typo that sent customers to the wrong WhatsApp number** in the homepage FAQ (`9802894022` instead of `9802594022`) and removed its claim of "MOQ and tiered volume discounts" (no such real data exists).

**Invoice header** now uses `luckyimpex4u@gmail.com` instead of `info@luckyimpex.com`. Confirm that is correct. The PAN/VAT number printed there (`301294812`) was left as is.

**Added:** `/wholesale` (quotation request using the existing form, no invented MOQ or discounts; added to sitemap), and `/delivery-policy`, `/return-policy`, `/warranty-policy`. The policy pages contain only facts already true of the business and are **noindex until you send the real terms**; then edit `Pages/Info/Policy.jsx` and set `TERMS_CONFIRMED = true`. Footer now links to all four, and footer brand links point to `/products/brand/<Brand>` (the prerendered pages) instead of `?brand=`.

**Removed (no file imported them; apply `DELETE_THESE_FILES.txt`):** `Admin/ManageProducts.jsx/.css` (the only unrouted admin page), `ToggleButton`, `ProductContext`, `PromoBanner`, `Categories`, `Mobile/MobileDetails`. Every other admin page is reachable from `App.js`, so I left them; tell me if you want specific routed admin pages (for example WhatsApp, Warehouses, Serial Numbers, Movement Ledger) removed. `Forgot-password/*` is also unrouted but is real functionality, so I kept it. Wire it in or tell me to delete it.

**`/emi` and `/exchange` are now public** (they only use the public contact form and product list), added back to the sitemap and removed from the robots.txt disallow list.
