const assert = require("assert");
const t = require("./seoText");

const p = { name: "Inverter Split AC 1.5 Ton", brand: "LG", model: "KS-Q18ENZA", slug: "lg-inverter-split-ac-1-5-ton-ks-q18enza", price: 98000, stock: 3, images: ["https://res.cloudinary.com/x/a.jpg"], category: "AirConditioners", capacity: "1.5 Ton" };

assert.ok(t.productTitle(p).endsWith(" | Lucky Impex"));
assert.ok(t.productTitle(p).length <= 66, t.productTitle(p));
assert.ok(t.productTitle(p).includes("LG"));
assert.strictEqual(t.withBrand({ name: "LG Washer", brand: "LG" }), "LG Washer"); // no "LG LG"
assert.ok(!/\d{2},?\d{3}/.test(t.productDescription(p)), "description must not embed a price");
assert.ok(t.productDescription(p).length <= 160);

const ld = t.productJsonLd(p, "https://luckyimpex4u.com");
assert.strictEqual(ld.offers.priceCurrency, "NPR");
assert.strictEqual(ld.offers.availability, "https://schema.org/InStock");
assert.strictEqual(t.productJsonLd({ ...p, stock: 0 }, "https://x.com").offers.availability, "https://schema.org/OutOfStock");
assert.strictEqual(t.productJsonLd({ ...p, price: 0 }, "https://x.com").offers, undefined, "no offer without a price");
assert.strictEqual(ld.aggregateRating, undefined, "never invent ratings");
assert.ok(!t.jsonLd({ a: "</script><script>alert(1)" }).includes("</script>"));
assert.strictEqual(t.escapeHtml(`<a href="x">&'`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
assert.ok(t.SAFE_SLUG.test(p.slug));
for (const bad of ["../etc", "A B", "a/b", "", "-x"]) assert.ok(!t.SAFE_SLUG.test(bad), bad);
console.log("seoText tests passed");
