/**
 * Build-time catalogue access for SEO assets.
 * Reads REAL products from the production API. It never invents products:
 * if the API cannot be reached, callers get `null` and must keep whatever exists.
 */
const fs = require("fs");
const path = require("path");

const CACHE_FILE = path.resolve(__dirname, "..", ".seo-catalog.json");
const DEFAULT_API = "https://lucky-1-6ma5.onrender.com/api";

const apiBase = () =>
  (process.env.SEO_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || DEFAULT_API).replace(/\/+$/, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, attempts = 4) {
  let lastError;
  for (let i = 1; i <= attempts; i += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000); // free hosts can take ~30-50s to wake
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      if (i < attempts) await sleep(2000 * i);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

/** Fetch every product (all variants, not grouped by model). Returns null if unreachable. */
async function fetchCatalog() {
  const base = apiBase();
  const limit = 200;
  const products = [];
  try {
    let page = 1;
    let pages = 1;
    do {
      const data = await getJson(`${base}/products/products?includeAll=true&page=${page}&limit=${limit}`);
      if (!Array.isArray(data?.products)) throw new Error("Unexpected response shape (no products array)");
      products.push(...data.products);
      pages = Number(data.pages) || 1;
      page += 1;
    } while (page <= pages && page <= 100);
  } catch (error) {
    console.warn(`[seo] Could not load catalogue from ${base}: ${error.message}`);
    return null;
  }
  return products;
}

const saveCatalog = (products) =>
  fs.writeFileSync(CACHE_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), products }), "utf8");

const loadCachedCatalog = () => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")).products || null;
  } catch {
    return null;
  }
};

module.exports = { fetchCatalog, saveCatalog, loadCachedCatalog, apiBase };
