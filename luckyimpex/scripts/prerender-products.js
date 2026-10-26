/**
 * postbuild: writes static, crawlable HTML for real product, category and brand pages.
 *
 * The CRA shell ships one index.html whose <title>, description and canonical all describe the
 * homepage, so a crawler that does not run JavaScript saw every product URL as a copy of "/".
 * This script copies build/index.html per URL and fills in the page's own title, description,
 * canonical, Open Graph tags, JSON-LD (Product + BreadcrumbList) and a plain-HTML content block with
 * real links. React replaces the content block when it loads, so the interactive app is unchanged.
 *
 * Static hosts serve an existing file before the SPA rewrite, so no hosting change is needed.
 * Only data returned by the real API is used. Nothing is written if the catalogue is unavailable.
 */
const fs = require("fs");
const path = require("path");

const siteConfig = require("../src/seo/siteConfig.data.json");
const { fetchCatalog, loadCachedCatalog } = require("./lib/catalog");
const T = require("./lib/seoText");

const SITE_URL = (process.env.REACT_APP_SITE_URL || siteConfig.siteUrl).replace(/\/+$/, "");
const BUILD_DIR = path.resolve(__dirname, "..", "build");
const SAFE_SEGMENT = /^[A-Za-z0-9-]+$/;

const fmtNpr = (n) => `NPR ${Number(n).toLocaleString("en-IN")}`;

function applyHead(template, { title, description, canonicalPath, image, jsonLdBlocks, type = "website" }) {
  const url = `${SITE_URL}${canonicalPath}`;
  const e = T.escapeHtml;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${e(title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${e(description)}"/>`)
    .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${e(url)}"/>`)
    .replace(/<meta\s+(?:property|name)="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");

  const social = [
    `<meta property="og:site_name" content="Lucky Impex"/>`,
    `<meta property="og:type" content="${type}"/>`,
    `<meta property="og:title" content="${e(title)}"/>`,
    `<meta property="og:description" content="${e(description)}"/>`,
    `<meta property="og:url" content="${e(url)}"/>`,
    image ? `<meta property="og:image" content="${e(image)}"/>` : "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}"/>`,
  ].filter(Boolean).join("");
  const ld = jsonLdBlocks.map((b) => `<script type="application/ld+json">${T.jsonLd(b)}</script>`).join("");
  return html.replace("</head>", `${social}${ld}</head>`);
}

function withBody(html, inner) {
  const marker = /<div id="root"><\/div>/;
  if (!marker.test(html)) throw new Error('build/index.html has no empty <div id="root"></div> to fill');
  return html.replace(marker, `<div id="root"><main id="seo-content">${inner}</main></div>`);
}

function writePage(routePath, html) {
  const dir = path.join(BUILD_DIR, ...routePath.split("/").filter(Boolean));
  if (!dir.startsWith(BUILD_DIR + path.sep)) throw new Error(`Refusing to write outside build: ${routePath}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

const productLink = (p) => `<li><a href="/product/${p.slug}">${T.escapeHtml(T.withBrand(p))}${p.model ? ` – ${T.escapeHtml(p.model)}` : ""}</a></li>`;

function productPage(template, p, all) {
  const e = T.escapeHtml;
  const catPath = SAFE_SEGMENT.test(p.category || "") ? `/products/${p.category}` : "/products";
  const brandPath = SAFE_SEGMENT.test(p.brand || "") ? `/products/brand/${p.brand}` : null;
  const trail = [
    { name: "Home", path: "/" },
    { name: p.category || "Products", path: catPath },
    { name: p.name, path: `/product/${p.slug}` },
  ];
  const related = all.filter((o) => o.slug !== p.slug && o.category === p.category && SAFE_SLUG(o.slug)).slice(0, 6);
  const image = T.toAbsolute(SITE_URL, (p.images || [])[0]);
  const price = Number(p.price) > 0 ? `<p><strong>${fmtNpr(p.price)}</strong></p>` : "";
  const stock = Number(p.stock) > 0 ? "In stock" : "Currently out of stock – contact us for availability";

  const inner = `
<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="${e(catPath)}">${e(p.category || "Products")}</a> / <span>${e(p.name)}</span></nav>
<h1>${e(T.withBrand(p))}${p.model ? ` ${e(p.model)}` : ""}</h1>
${image ? `<img src="${e(image)}" alt="${e(`${T.withBrand(p)}${p.model ? ` ${p.model}` : ""}`)}" width="480" height="480" loading="eager"/>` : ""}
${price}
<p>${stock}.</p>
<ul>
${p.brand ? `<li>Brand: ${brandPath ? `<a href="${e(brandPath)}">${e(p.brand)}</a>` : e(p.brand)}</li>` : ""}
${p.model ? `<li>Model: ${e(p.model)}</li>` : ""}
${p.capacity ? `<li>Capacity: ${e(p.capacity)}</li>` : ""}
${p.category ? `<li>Category: <a href="${e(catPath)}">${e(p.category)}</a></li>` : ""}
</ul>
${p.description ? `<p>${e(T.clip(p.description, 1200))}</p>` : ""}
<p>Lucky Impex, ${e(siteConfig.address.streetAddress)}, ${e(siteConfig.address.addressLocality)}, Nepal. Phone ${e(siteConfig.phone)} · WhatsApp ${e(siteConfig.whatsappDisplay)}</p>
${related.length ? `<h2>Related products</h2><ul>${related.map(productLink).join("")}</ul>` : ""}`;

  const head = applyHead(template, {
    title: T.productTitle(p),
    description: T.productDescription(p),
    canonicalPath: `/product/${p.slug}`,
    image,
    type: "product",
    jsonLdBlocks: [T.productJsonLd(p, SITE_URL), T.breadcrumbJsonLd(SITE_URL, trail)],
  });
  return withBody(head, inner);
}

function SAFE_SLUG(s) { return T.SAFE_SLUG.test(s || ""); }

function listingPage(template, { heading, intro, routePath, trail, items, title, description }) {
  const e = T.escapeHtml;
  const inner = `
<nav aria-label="Breadcrumb">${trail.map((t, i) => (i === trail.length - 1 ? `<span>${e(t.name)}</span>` : `<a href="${e(t.path)}">${e(t.name)}</a>`)).join(" / ")}</nav>
<h1>${e(heading)}</h1>
<p>${e(intro)}</p>
<ul>${items.map(productLink).join("")}</ul>`;
  const head = applyHead(template, {
    title,
    description,
    canonicalPath: routePath,
    jsonLdBlocks: [T.breadcrumbJsonLd(SITE_URL, trail)],
  });
  return withBody(head, inner);
}

const splitCamel = (s) => s.replace(/([a-z])([A-Z])/g, "$1 $2");

async function main() {
  const templatePath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(templatePath)) throw new Error("build/index.html not found. Run react-scripts build first.");
  const template = fs.readFileSync(templatePath, "utf8");

  const products = loadCachedCatalog() || (await fetchCatalog());
  if (!products || !products.length) {
    console.warn("[prerender] No catalogue available; skipping. The app still works client-side.");
    return;
  }
  const valid = products.filter((p) => SAFE_SLUG(p.slug) && p.name);
  const skipped = products.length - valid.length;

  let count = 0;
  for (const p of valid) {
    writePage(`/product/${p.slug}`, productPage(template, p, valid));
    count += 1;
  }

  const byCategory = new Map();
  const byBrand = new Map();
  for (const p of valid) {
    if (SAFE_SEGMENT.test(p.category || "")) (byCategory.get(p.category) || byCategory.set(p.category, []).get(p.category)).push(p);
    if (SAFE_SEGMENT.test(p.brand || "")) (byBrand.get(p.brand) || byBrand.set(p.brand, []).get(p.brand)).push(p);
  }

  for (const [category, items] of byCategory) {
    const label = splitCamel(category);
    const brands = [...new Set(items.map((i) => i.brand).filter(Boolean))].slice(0, 8);
    writePage(`/products/${category}`, listingPage(template, {
      heading: `${label} in Birgunj, Nepal`,
      intro: `Browse ${items.length} ${label.toLowerCase()} product${items.length === 1 ? "" : "s"} at Lucky Impex, Birgunj${brands.length ? `, including ${brands.join(", ")}` : ""}. Open a product to see its model, specifications, current price and availability.`,
      routePath: `/products/${category}`,
      trail: [{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: label, path: `/products/${category}` }],
      items,
      title: T.clip(`${label} Price in Nepal | Lucky Impex Birgunj`, 66),
      description: T.clip(`Compare ${label.toLowerCase()} at Lucky Impex, Birgunj. See models, current prices and availability for ${items.length} product${items.length === 1 ? "" : "s"}.`, 158),
    }));
    count += 1;
  }

  for (const [brand, items] of byBrand) {
    writePage(`/products/brand/${brand}`, listingPage(template, {
      heading: `${brand} products at Lucky Impex`,
      intro: `${items.length} ${brand} product${items.length === 1 ? "" : "s"} currently listed at Lucky Impex, Birgunj.`,
      routePath: `/products/brand/${brand}`,
      trail: [{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: brand, path: `/products/brand/${brand}` }],
      items,
      title: T.clip(`${brand} Products Price in Nepal | Lucky Impex`, 66),
      description: T.clip(`Shop ${brand} products at Lucky Impex, Birgunj. See models, current prices and availability.`, 158),
    }));
    count += 1;
  }

  console.log(`[prerender] wrote ${count} pages (${valid.length} products, ${byCategory.size} categories, ${byBrand.size} brands). Skipped ${skipped} product(s) without a safe slug.`);
}

main().catch((error) => {
  // Never fail a deploy because SEO pages could not be generated; the SPA keeps working.
  console.error("[prerender] failed:", error.message);
  process.exit(0);
});
