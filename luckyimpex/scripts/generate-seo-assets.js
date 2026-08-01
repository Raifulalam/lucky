const fs = require("fs");
const path = require("path");

const siteConfig = require("../src/seo/siteConfig.data.json");

const SITE_URL = (process.env.REACT_APP_SITE_URL || siteConfig.siteUrl || "").replace(/\/+$/, "");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const TODAY = new Date().toISOString().split("T")[0];

const toUrlSegment = (value) =>
  encodeURIComponent(String(value).trim().replace(/\s+/g, "-"));

const unique = (items) => [...new Set(items.filter(Boolean))];

const staticEntries = siteConfig.staticRoutes.map((route) => ({
  loc: `${SITE_URL}${route}`,
  lastmod: TODAY,
  changefreq: route === "/" ? "daily" : "weekly",
  priority: route === "/" ? "1.0" : "0.8",
}));

const categoryEntries = siteConfig.categories.map((category) => ({
  loc: `${SITE_URL}/products/${toUrlSegment(category)}`,
  lastmod: TODAY,
  changefreq: "weekly",
  priority: "0.8",
}));

const brandEntries = siteConfig.brands.map((brand) => ({
  loc: `${SITE_URL}/products/brand/${toUrlSegment(brand)}`,
  lastmod: TODAY,
  changefreq: "weekly",
  priority: "0.7",
}));

async function fetchProductEntries() {
  if (!process.env.SEO_FETCH_PRODUCTS && !process.env.SEO_API_BASE_URL) {
    return [];
  }

  const apiBase = (process.env.SEO_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");
  if (!apiBase) return [];

  try {
    const response = await fetch(`${apiBase}/products/products?page=1&limit=1000`);
    if (!response.ok) return [];

    const payload = await response.json();
    const products = Array.isArray(payload?.products) ? payload.products : [];

    return products.map((product) => ({
      loc: `${SITE_URL}/product/${encodeURIComponent(product.slug || product._id)}`,
      lastmod: (product.updatedAt || product.createdAt || TODAY).toString().slice(0, 10),
      changefreq: "weekly",
      priority: "0.6",
    }));
  } catch (error) {
    console.warn("SEO product fetch skipped:", error.message);
    return [];
  }
}

function buildUrlXml(entries) {
  return entries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");
}

function writeFile(target, contents) {
  fs.writeFileSync(path.join(PUBLIC_DIR, target), contents, "utf8");
}

async function main() {
  const productEntries = await fetchProductEntries();
  const sitemapEntries = unique([...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries].map((entry) => JSON.stringify(entry)))
    .map((entry) => JSON.parse(entry))
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${buildUrlXml(sitemapEntries)}
</urlset>
`;

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`;

  const robots = `User-agent: *
Disallow: /cart
Disallow: /profile
Disallow: /orderpage
Disallow: /login
Disallow: /signup
Disallow: /admin
Disallow: /dashboard
Disallow: /admindashboard
Disallow: /manage-products
Disallow: /manageproducts
Disallow: /employee-manage
Disallow: /feedback
Disallow: /complaints
Disallow: /orders
Disallow: /review/
Disallow: /productdetails/

Allow: /product/
Allow: /products/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  writeFile("sitemap.xml", sitemap);
  writeFile("sitemap-index.xml", sitemapIndex);
  writeFile("robots.txt", robots);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
