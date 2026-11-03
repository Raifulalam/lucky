/**
 * Build-time sitemap generation from MongoDB via API.
 * Generates sitemap.xml with all products, categories, brands, and static pages.
 */
const fs = require("fs");
const path = require("path");

const { fetchCatalog, loadCachedCatalog } = require("./lib/catalog");
const siteConfig = require("../src/seo/siteConfig.data.json");

const SITE_URL = (process.env.REACT_APP_SITE_URL || siteConfig.siteUrl).replace(/\/+$/, "");
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const SAFE_SEGMENT = /^[A-Za-z0-9-]+$/;

const formatDate = (date) => date.toISOString().split("T")[0];

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/products", priority: "0.9", changefreq: "daily" },
  { path: "/mobiles", priority: "0.8", changefreq: "daily" },
  { path: "/service", priority: "0.7", changefreq: "monthly" },
  { path: "/wholesale", priority: "0.7", changefreq: "monthly" },
  { path: "/store", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/emi", priority: "0.6", changefreq: "monthly" },
  { path: "/exchange", priority: "0.6", changefreq: "monthly" },
  { path: "/delivery-policy", priority: "0.5", changefreq: "yearly" },
  { path: "/return-policy", priority: "0.5", changefreq: "yearly" },
  { path: "/warranty-policy", priority: "0.5", changefreq: "yearly" },
];

function sitemapEntry(url, lastmod, priority, changefreq) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`;
}

async function main() {
  console.log("[sitemap] Generating sitemap.xml...");

  // Fetch products from API or use cache
  const products = loadCachedCatalog() || (await fetchCatalog());
  if (!products || !products.length) {
    console.warn("[sitemap] No catalogue available; using static pages only.");
  }

  const entries = [];
  const today = formatDate(new Date());

  // Add static pages
  for (const page of STATIC_PAGES) {
    entries.push(sitemapEntry(`${SITE_URL}${page.path}`, today, page.priority, page.changefreq));
  }

  if (products && products.length) {
    const validProducts = products.filter((p) => SAFE_SEGMENT.test(p.slug || "") && p.name);
    const skipped = products.length - validProducts.length;

    // Collect categories and brands
    const categories = new Set();
    const brands = new Set();

    for (const p of validProducts) {
      // Product pages
      const lastmod = p.updatedAt ? formatDate(new Date(p.updatedAt)) : today;
      entries.push(sitemapEntry(`${SITE_URL}/product/${p.slug}`, lastmod, "0.8", "weekly"));

      // Categories
      if (p.category && SAFE_SEGMENT.test(p.category)) {
        categories.add(p.category);
      }

      // Brands
      if (p.brand && SAFE_SEGMENT.test(p.brand)) {
        brands.add(p.brand);
      }
    }

    // Add category pages
    for (const category of categories) {
      entries.push(sitemapEntry(`${SITE_URL}/products/${category}`, today, "0.7", "weekly"));
    }

    // Add brand pages
    for (const brand of brands) {
      entries.push(sitemapEntry(`${SITE_URL}/products/brand/${brand}`, today, "0.7", "weekly"));
    }

    console.log(`[sitemap] Added ${validProducts.length} products, ${categories.size} categories, ${brands.size} brands. Skipped ${skipped} invalid products.`);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  // Write to public/sitemap.xml
  const sitemapPath = path.join(PUBLIC_DIR, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml, "utf8");

  console.log(`[sitemap] Generated sitemap.xml with ${entries.length} URLs at ${sitemapPath}`);
}

main().catch((error) => {
  console.error("[sitemap] Failed:", error.message);
  process.exit(1);
});
