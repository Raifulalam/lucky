# Product Slug Migration Guide

## Problem
Current product slugs contain UI text, city names, and marketing content:
- Example: `15-off-add-to-wishlist-compare-premium-series-in-stock-voltas-...-dryer-pune-new`
- This is bad for SEO and URL readability

## Solution
New slug format: `brand-model-type`
- Example: `lg-9-kg-top-load-washing-machine-t2109vsab`
- Clean, descriptive, and SEO-friendly

## Migration Steps

### 1. Generate Migration File
```bash
# Set API URL if needed
export SEO_API_BASE_URL=https://your-api-url.com

# Run migration analysis
node scripts/migrate-slugs.js
```

This creates `scripts/slug-migration.json` with:
- Product IDs
- Old slugs
- New slugs
- Reason for change

### 2. Apply Changes to MongoDB (Server-Side)

You need to update your backend API to:
1. Add an `oldSlug` field to the product schema
2. Create an endpoint to accept the migration file
3. Update product documents with new slugs
4. Save old slugs for redirection

Example MongoDB update (run on server):
```javascript
const migrations = require('./slug-migration.json');

for (const migration of migrations.migrations) {
  await Product.updateOne(
    { _id: migration.productId },
    {
      $set: {
        slug: migration.newSlug,
        oldSlug: migration.oldSlug,
      }
    }
  );
}
```

### 3. Add 301 Redirect Logic

Update your backend API route for product details to handle old slugs:

```javascript
// In your product details route
router.get('/product/:slug', async (req, res) => {
  const { slug } = req.params;

  // Try finding by current slug first
  let product = await Product.findOne({ slug });

  // If not found, try finding by oldSlug
  if (!product) {
    product = await Product.findOne({ oldSlug: slug });

    // If found by oldSlug, return 301 redirect to new slug
    if (product) {
      return res.redirect(301, `/product/${product.slug}`);
    }
  }

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});
```

### 4. Test Redirects

Test a few sample URLs from the migration file:
```bash
curl -I https://luckyimpex4u.com/product/OLD_SLUG
# Should return 301 with Location: /product/NEW_SLUG
```

### 5. Deploy to Production

1. Deploy backend with redirect logic
2. Run migration script on production database
3. Verify redirects work
4. Monitor for 404 errors on old URLs

### 6. Clean Up (After 30-90 days)

Once search engines have updated their indexes:
- Remove the `oldSlug` field from the database
- Remove the redirect logic from the API
- Remove the `/old-product/:slug` route from App.js

## Notes

- **DO NOT delete existing URLs** - always redirect them
- **Test thoroughly** before production deployment
- **Monitor logs** for 404s after deployment
- **Update sitemap** after migration (build script will handle this)
- **Prerendered pages** will be regenerated on next build with new slugs

## Files Modified

- `scripts/lib/slugify.js` - Slug generation logic
- `scripts/migrate-slugs.js` - Migration analysis script
- `src/App.js` - Added redirect route for old slugs
- `src/Pages/DetailsPage/Details.jsx` - (future) May need to handle slug changes
