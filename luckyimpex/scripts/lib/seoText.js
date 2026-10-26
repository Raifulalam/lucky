/** Pure helpers shared by the sitemap + prerender scripts (unit-tested in seoText.test.js). */

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]{0,159}$/;

const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** JSON for an inline <script type="application/ld+json">; "<" is escaped so data can't close the tag. */
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");

const clip = (text, max) => {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
};

const withBrand = (product) => {
  const name = String(product.name || "").trim();
  const brand = String(product.brand || "").trim();
  return brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name;
};

/** "[Brand] [Name] Price in Nepal | Lucky Impex", shortened without cutting the brand suffix. */
const productTitle = (product) => {
  const suffix = " | Lucky Impex";
  const model = String(product.model || "").trim();
  let base = withBrand(product);
  if (model && !base.toLowerCase().includes(model.toLowerCase())) base = `${base} ${model}`;
  const tail = " Price in Nepal";
  const room = 62 - suffix.length;
  if (base.length + tail.length <= room) return `${base}${tail}${suffix}`;
  if (base.length <= room) return `${base}${suffix}`;
  return `${clip(base, room)}${suffix}`;
};

/** Description built only from verified fields. No price (it changes) and no warranty/delivery claims. */
const productDescription = (product) => {
  const parts = [`${withBrand(product)}`];
  if (product.model) parts.push(`model ${product.model}`);
  const lead = parts.join(", ");
  const spec = product.capacity ? ` (${product.capacity})` : "";
  const stock = Number(product.stock) > 0 ? "Currently in stock" : "Check availability";
  return clip(`${lead}${spec} at Lucky Impex, Birgunj. See the current price, specifications and availability. ${stock} – call or WhatsApp us to order.`, 158);
};

const toAbsolute = (siteUrl, value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
};

const productJsonLd = (product, siteUrl) => {
  const url = `${siteUrl}/product/${product.slug}`;
  const images = (product.images || []).filter(Boolean).map((i) => toAbsolute(siteUrl, i));
  const price = Number(product.price);
  const node = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    ...(images.length ? { image: images } : {}),
    ...(product.description ? { description: clip(product.description, 5000) } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.model ? { mpn: String(product.model), sku: String(product.model) } : {}),
    ...(product.category ? { category: product.category } : {}),
  };
  // Offer only when there is a real, positive price. Availability mirrors real stock.
  if (price > 0) {
    node.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "NPR",
      price: String(price),
      availability: Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Lucky Impex" },
    };
  }
  return node;
};

const breadcrumbJsonLd = (siteUrl, trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: `${siteUrl}${t.path}`,
  })),
});

module.exports = { SAFE_SLUG, escapeHtml, jsonLd, clip, productTitle, productDescription, productJsonLd, breadcrumbJsonLd, toAbsolute, withBrand };
