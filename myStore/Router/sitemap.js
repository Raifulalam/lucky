/**
 * @file sitemap.js
 * @route GET /sitemap.xml  (served by Express, NOT the static file)
 *
 * Generates a dynamic XML sitemap that includes:
 *  - Static pages (home, contact, products, etc.)
 *  - Every product detail page  → /productdetails/:slug
 *  - Every mobile detail page   → /mobile/:slug  (if applicable)
 *
 * Why dynamic?
 *  A static sitemap only lists pages you know at build time.
 *  Products are stored in MongoDB; new items added via the admin panel
 *  would never appear in a hand-written sitemap.xml.
 *
 * Performance:
 *  - Result is cached in memory for 1 hour (CACHE_TTL_MS).
 *  - MongoDB queries run in parallel with Promise.all.
 *  - Output is gzip-compressed by the existing compression() middleware.
 */

"use strict";

const express  = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// ─── Config ──────────────────────────────────────────────────────────────────

const SITE_URL    = (process.env.SITE_URL || "https://luckyimpex4u.com").replace(/\/$/, "");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── In-memory cache ─────────────────────────────────────────────────────────

let cachedXml   = null;
let cachedAt    = 0;

// ─── Static pages ────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  { path: "/",                    priority: "1.0", changefreq: "daily"   },
  { path: "/products",            priority: "0.9", changefreq: "daily"   },
  { path: "/mobiles",             priority: "0.9", changefreq: "daily"   },
  { path: "/mobiles/all",         priority: "0.8", changefreq: "weekly"  },
  { path: "/store",               priority: "0.8", changefreq: "weekly"  },
  { path: "/service",             priority: "0.8", changefreq: "weekly"  },
  { path: "/reviews",             priority: "0.8", changefreq: "weekly"  },
  { path: "/contact",             priority: "0.8", changefreq: "monthly" },
  { path: "/emi",                 priority: "0.7", changefreq: "monthly" },
  { path: "/exchange",            priority: "0.7", changefreq: "monthly" },
  { path: "/wholesale",           priority: "0.7", changefreq: "monthly" },
  // Category pages
  { path: "/products/AirConditioners",   priority: "0.8", changefreq: "weekly" },
  { path: "/products/AirCooler",         priority: "0.8", changefreq: "weekly" },
  { path: "/products/Refrigerators",     priority: "0.8", changefreq: "weekly" },
  { path: "/products/WashingMachines",   priority: "0.8", changefreq: "weekly" },
  { path: "/products/LEDTelevisions",    priority: "0.8", changefreq: "weekly" },
  { path: "/products/ChestFreezer",      priority: "0.8", changefreq: "weekly" },
  { path: "/products/Chimney",           priority: "0.8", changefreq: "weekly" },
  { path: "/products/HomeAppliances",    priority: "0.8", changefreq: "weekly" },
  { path: "/products/HomeTheater",       priority: "0.7", changefreq: "weekly" },
  { path: "/products/KitchenAppliances", priority: "0.7", changefreq: "weekly" },
  // Brand pages
  { path: "/products/brand/LG",          priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Samsung",     priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Haier",       priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Whirlpool",   priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Bajaj",       priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/CG",          priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Skyworth",    priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Symphony",    priority: "0.7", changefreq: "weekly" },
  { path: "/products/brand/Videocon",    priority: "0.7", changefreq: "weekly" },
  // Policy pages
  { path: "/delivery-policy",    priority: "0.5", changefreq: "monthly" },
  { path: "/return-policy",      priority: "0.5", changefreq: "monthly" },
  { path: "/warranty-policy",    priority: "0.5", changefreq: "monthly" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escape XML special characters in URLs */
const escapeXml = (str) =>
  String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");

/** Format a Date as YYYY-MM-DD */
const toDateStr = (d) => (d ? new Date(d).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);

/** Build a single <url> block */
const urlEntry = ({ loc, lastmod, changefreq = "weekly", priority = "0.7" }) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// ─── Build XML ───────────────────────────────────────────────────────────────

async function buildSitemapXml() {
  const today = toDateStr(new Date());

  // ── Static pages ──
  const staticEntries = STATIC_PAGES.map(({ path, priority, changefreq }) =>
    urlEntry({ loc: `${SITE_URL}${path}`, lastmod: today, changefreq, priority })
  );

  // ── Dynamic product + mobile pages (parallel) ──
  let productEntries = [];
  let mobileEntries  = [];

  if (mongoose.connection.readyState === 1) {
    try {
      // Lazy-require models to avoid circular deps at startup
      const Product = mongoose.model("Product");
      const Mobile  = mongoose.model("Mobile");

      const [products, mobiles] = await Promise.all([
        // Only fetch the fields we need — keep the query light
        Product.find({ isActive: { $ne: false } })
          .select("slug name updatedAt")
          .lean()
          .exec(),
        Mobile.find({ isActive: { $ne: false } })
          .select("slug name updatedAt")
          .lean()
          .exec(),
      ]);

      productEntries = products.map((p) => {
        const slug = p.slug || encodeURIComponent((p.name || p._id).toString());
        return urlEntry({
          loc:        `${SITE_URL}/productdetails/${slug}`,
          lastmod:    toDateStr(p.updatedAt),
          changefreq: "weekly",
          priority:   "0.8",
        });
      });

      mobileEntries = mobiles.map((m) => {
        const slug = m.slug || encodeURIComponent((m.name || m._id).toString());
        return urlEntry({
          loc:        `${SITE_URL}/mobile/${slug}`,
          lastmod:    toDateStr(m.updatedAt),
          changefreq: "weekly",
          priority:   "0.8",
        });
      });
    } catch (err) {
      console.error("[Sitemap] DB query error:", err.message);
      // Fall through — static pages will still be returned
    }
  }

  const allEntries = [...staticEntries, ...productEntries, ...mobileEntries];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${allEntries.join("")}
</urlset>`;
}

// ─── Route ───────────────────────────────────────────────────────────────────

/**
 * GET /sitemap.xml
 *
 * Serves a dynamic sitemap. Cached in memory for 1 hour so repeated
 * Googlebot crawls don't hammer the database.
 *
 * Add ?refresh=1 to bust the cache (admin/debugging only).
 */
router.get("/sitemap.xml", async (req, res) => {
  try {
    const bustCache = req.query.refresh === "1";
    const now       = Date.now();

    if (!bustCache && cachedXml && now - cachedAt < CACHE_TTL_MS) {
      res.set("X-Sitemap-Cache", "HIT");
    } else {
      cachedXml = await buildSitemapXml();
      cachedAt  = now;
      res.set("X-Sitemap-Cache", "MISS");
    }

    res
      .status(200)
      .set({
        "Content-Type":  "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
      })
      .end(cachedXml);

  } catch (err) {
    console.error("[Sitemap] Generation error:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate sitemap" });
  }
});

module.exports = router;
