/**
 * prebuild: writes public/sitemap.xml, public/sitemap-index.xml and public/robots.txt.
 *
 * Product URLs come from the live catalogue (real products only). If the API cannot be
 * reached the build continues with the static pages, and the existing sitemap is kept
 * rather than being replaced by a product-less one.
 */
const fs = require("fs");
const path = require("path");

const siteConfig = require("../src/seo/siteConfig.data.json");
const { fetchCatalog, fetchMobiles, saveCatalog } = require("./lib/catalog");
const { SAFE_SLUG } = require("./lib/seoText");

const SITE_URL = (process.env.REACT_APP_SITE_URL || siteConfig.siteUrl || "").replace(/\/+$/, "");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const TODAY = new Date().toISOString().split("T")[0];

const SAFE_SEGMENT = /^[A-Za-z0-9-]+$/;
const unique = (items) => [...new Set(items.filter(Boolean))];
const xmlEscape = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildUrlXml(entries) {
  return entries
    .map((e) => `  <url>\n    <loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}\n  </url>`)
    .join("\n");
}

const writeFile = (target, contents) => fs.writeFileSync(path.join(PUBLIC_DIR, target), contents, "utf8");

async function main() {
  const [products, mobiles] = await Promise.all([
    fetchCatalog().catch(() => null),
    fetchMobiles().catch(() => []),
  ]);

  const categories = unique([
    ...siteConfig.categories,
    ...(products || []).map((p) => p.category),
  ]).filter((c) => SAFE_SEGMENT.test(c));
  const brands = unique([
    ...siteConfig.brands,
    ...(products || []).map((p) => p.brand),
  ]).filter((b) => SAFE_SEGMENT.test(b));

  const entries = [
    ...siteConfig.staticRoutes.map((route) => ({ loc: `${SITE_URL}${route}` })),
    ...categories.map((c) => ({ loc: `${SITE_URL}/products/${c}` })),
    ...brands.map((b) => ({ loc: `${SITE_URL}/products/brand/${b}` })),
  ];

  if (products && products.length) {
    saveCatalog(products);
    for (const p of products) {
      if (!SAFE_SLUG.test(p.slug || "")) continue;
      entries.push({ loc: `${SITE_URL}/product/${p.slug}`, lastmod: String(p.updatedAt || p.createdAt || "").slice(0, 10) || undefined });
    }
    console.log(`[seo] catalogue loaded: ${products.length} products`);
  }

  if (mobiles && mobiles.length) {
    for (const m of mobiles) {
      const slug = m.slug || (m.name ? encodeURIComponent(String(m.name).toLowerCase().replace(/\s+/g, "-")) : null);
      if (!slug) continue;
      entries.push({ loc: `${SITE_URL}/mobile/${slug}`, lastmod: String(m.updatedAt || m.createdAt || "").slice(0, 10) || undefined });
    }
    console.log(`[seo] mobiles loaded: ${mobiles.length} phones`);
  }

  if (!products && !mobiles.length && fs.existsSync(path.join(PUBLIC_DIR, "sitemap.xml"))) {
    console.warn("[seo] Catalogue unavailable. Keeping the existing sitemap.xml so product URLs are not dropped.");
    writeFile("robots.txt", buildRobots());
    return;
  }

  const sorted = [...new Map(entries.map((e) => [e.loc, e])).values()].sort((a, b) => a.loc.localeCompare(b.loc));

  writeFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${buildUrlXml(sorted)}\n</urlset>\n`);
  writeFile("sitemap-index.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${SITE_URL}/sitemap.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n</sitemapindex>\n`);
  writeFile("robots.txt", buildRobots());
  console.log(`[seo] sitemap.xml written with ${sorted.length} URLs`);
}

function buildRobots() {
  return `User-agent: *

# Private / authenticated pages — keep out of index
Disallow: /cart
Disallow: /profile
Disallow: /orderpage
Disallow: /login
Disallow: /forgot-password
Disallow: /reset-password/
Disallow: /signup

# Admin & internal tools
Disallow: /admin
Disallow: /dashboard
Disallow: /admindashboard
Disallow: /manage-products
Disallow: /manageproducts
Disallow: /employee-manage
Disallow: /feedback
Disallow: /complaints
Disallow: /orders

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-index.xml
`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
