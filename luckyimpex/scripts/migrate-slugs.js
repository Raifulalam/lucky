/**
 * Migration script to clean up product slugs.
 * Generates a migration file with old->new slug mappings.
 * This should be run on the server with direct MongoDB access or via an admin API.
 *
 * Run: node scripts/migrate-slugs.js
 * Output: scripts/slug-migration.json
 */
const fs = require("fs");
const path = require("path");

const { fetchCatalog, loadCachedCatalog } = require("./lib/catalog");
const { generateSlug } = require("./lib/slugify");

const MIGRATION_FILE = path.resolve(__dirname, "slug-migration.json");

async function main() {
  console.log("[slug-migration] Starting slug migration analysis...");

  // Fetch products from API or use cache
  const products = loadCachedCatalog() || (await fetchCatalog());
  if (!products || !products.length) {
    console.error("[slug-migration] No products available. Run with SEO_API_BASE_URL set.");
    process.exit(1);
  }

  const migrations = [];
  const duplicateCheck = new Map(); // Track new slug duplicates

  for (const product of products) {
    if (!product.slug || !product.name) {
      console.warn(`[slug-migration] Skipping product without slug or name: ${product._id}`);
      continue;
    }

    const { newSlug, oldSlug, changed } = generateSlug(product);

    if (!changed) {
      continue; // No change needed
    }

    // Check for duplicate new slugs
    if (duplicateCheck.has(newSlug)) {
      const existing = duplicateCheck.get(newSlug);
      console.warn(`[slug-migration] Duplicate new slug "${newSlug}" for products: ${existing} and ${product._id}`);
      // Add suffix to make unique
      const suffix = Math.random().toString(36).substring(2, 5);
      newSlug = `${newSlug}-${suffix}`;
    }
    duplicateCheck.set(newSlug, product._id);

    migrations.push({
      productId: product._id,
      oldSlug,
      newSlug,
      name: product.name,
      reason: 'slug-cleanup',
    });
  }

  if (migrations.length === 0) {
    console.log("[slug-migration] No slug changes needed. All products have clean slugs.");
    return;
  }

  // Write migration file
  const migrationData = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    migrationsNeeded: migrations.length,
    migrations,
  };

  fs.writeFileSync(MIGRATION_FILE, JSON.stringify(migrationData, null, 2), "utf8");

  console.log(`[slug-migration] Generated migration file: ${MIGRATION_FILE}`);
  console.log(`[slug-migration] ${migrations.length} products need slug updates.`);
  console.log(`[slug-migration]`);
  console.log(`[slug-migration] NEXT STEPS:`);
  console.log(`[slug-migration] 1. Review ${MIGRATION_FILE}`);
  console.log(`[slug-migration] 2. Apply changes to MongoDB (server-side):`);
  console.log(`[slug-migration]    - Update each product's slug field`);
  console.log(`[slug-migration]    - Save oldSlug field for redirection`);
  console.log(`[slug-migration] 3. Add 301 redirect logic in API routes for oldSlug -> newSlug`);
  console.log(`[slug-migration] 4. Test a few sample redirects`);
  console.log(`[slug-migration] 5. Deploy to production`);
}

main().catch((error) => {
  console.error("[slug-migration] Failed:", error.message);
  process.exit(1);
});
