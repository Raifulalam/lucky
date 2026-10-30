import { absoluteUrl, SITE_CONFIG, SITE_LOGO, SITE_NAME, SITE_URL, toSlug } from "./siteConfig";

const availabilityMap = {
  inStock: "https://schema.org/InStock",
  outOfStock: "https://schema.org/OutOfStock",
  preorder: "https://schema.org/PreOrder",
  backOrder: "https://schema.org/BackOrder",
};

const createId = (suffix) => `${SITE_URL}/#${suffix}`;

export const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "Store"],
  "@id": createId("organization"),
  name: SITE_NAME,
  alternateName: ["luckyimpex4u", "Lucky Impex Birgunj", "Lucky Impex Nepal"],
  url: SITE_URL,
  logo: SITE_LOGO,
  image: SITE_LOGO,
  description: SITE_CONFIG.description,
  telephone: SITE_CONFIG.phone,
  email: SITE_CONFIG.supportEmail,
  sameAs: SITE_CONFIG.socialLinks,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: SITE_CONFIG.phone,
      email: SITE_CONFIG.supportEmail,
      areaServed: "NP",
      availableLanguage: ["en", "ne"],
    },
  ],
});

export const buildWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": createId("website"),
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ["luckyimpex4u", "Lucky Impex Birgunj", "Lucky Impex Nepal"],
  description: SITE_CONFIG.description,
  publisher: {
    "@id": createId("organization"),
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  "@id": createId("localbusiness"),
  name: SITE_NAME,
  alternateName: ["luckyimpex4u", "Lucky Impex Birgunj", "Lucky Impex Nepal"],
  url: SITE_URL,
  image: [SITE_LOGO],
  logo: SITE_LOGO,
  description: SITE_CONFIG.description,
  telephone: SITE_CONFIG.phone,
  email: SITE_CONFIG.supportEmail,
  priceRange: "Rs",
  currenciesAccepted: "NPR",
  paymentAccepted: "Cash, Credit Card, Fonepay, eSewa, Khalti, Bank Transfer",
  areaServed: [
    {
      "@type": "City",
      name: "Birgunj"
    },
    {
      "@type": "AdministrativeArea",
      name: "Madhesh Province"
    },
    {
      "@type": "Country",
      name: "Nepal"
    }
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE_CONFIG.address.streetAddress,
    addressLocality: SITE_CONFIG.address.addressLocality,
    addressRegion: SITE_CONFIG.address.addressRegion,
    postalCode: SITE_CONFIG.address.postalCode,
    addressCountry: SITE_CONFIG.address.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE_CONFIG.geo.latitude,
    longitude: SITE_CONFIG.geo.longitude,
  },
  openingHoursSpecification: SITE_CONFIG.hours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.day,
    opens: slot.opens,
    closes: slot.closes,
  })),
  sameAs: SITE_CONFIG.socialLinks,
  hasMap: `https://www.google.com/maps?q=${SITE_CONFIG.geo.latitude},${SITE_CONFIG.geo.longitude}`,
});

export const buildBreadcrumbSchema = (items = []) => {
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.to ? absoluteUrl(item.to) : undefined,
    })),
  };
};

export const buildFaqSchema = (items = []) => {
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};

export const buildProductSchema = (product, options = {}) => {
  if (!product) return null;

  const slug = product.slug || toSlug(`${product.name || ""}-${product.model || ""}`) || product._id;
  const image = product.images?.[0] || product.image || SITE_LOGO;
  const isInStock = Number(product.stock || 0) > 0;
  const price = Number(product.price || product.bestBuyPrice || 0);
  const currency = options.currency || "NPR";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/product/${slug}`),
    name: product.name,
    description: product.description || SITE_CONFIG.description,
    image: [absoluteUrl(image)],
    sku: product.sku || product.model || String(product._id || slug),
    mpn: product.model || undefined,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    category: product.category,
    url: absoluteUrl(`/product/${slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: price || undefined,
      availability: isInStock ? availabilityMap.inStock : availabilityMap.outOfStock,
      itemCondition: "https://schema.org/NewCondition",
      url: absoluteUrl(`/product/${slug}`),
      seller: {
        "@id": createId("organization"),
      },
    },
  };
};

export const buildReviewSchema = (reviews = [], itemName = SITE_NAME) => {
  if (!reviews.length) return null;

  return reviews.map((review, index) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": createId(`review-${index + 1}`),
    itemReviewed: {
      "@type": "LocalBusiness",
      name: itemName,
      url: SITE_URL,
    },
    author: {
      "@type": "Person",
      name: review.name || "Customer",
    },
    reviewBody: review.review || review.body || "",
    datePublished: review.createdAt
      ? new Date(review.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    reviewRating: {
      "@type": "Rating",
      ratingValue: Number(review.rating) || 5,
      bestRating: 5,
      worstRating: 1,
    },
  }));
};

/**
 * buildAggregateRatingSchema
 *
 * This is what Google actually uses to show ⭐ stars in search results.
 * It must be an ElectronicsStore / LocalBusiness with:
 *   - aggregateRating (ratingValue, reviewCount)
 *   - review[] (individual reviews as sub-items)
 *
 * Google requires at least ONE review and ratingCount >= 1.
 * @param {Array}  reviews     - Array of review objects from the API
 * @param {number} [avgRating] - Pre-computed average (optional, will auto-compute)
 */
export const buildAggregateRatingSchema = (reviews = [], avgRating = null) => {
  if (!reviews.length) return null;

  const ratingCount = reviews.filter((r) => r.rating).length;
  if (ratingCount === 0) return null;

  const computedAvg = avgRating ??
    (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / ratingCount);

  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "@id": createId("localbusiness"),
    name: SITE_NAME,
    url: SITE_URL,
    image: SITE_LOGO,
    telephone: SITE_CONFIG.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: parseFloat(computedAvg.toFixed(1)),
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    // Include up to 5 individual reviews — Google reads these for snippets
    review: reviews.slice(0, 5).map((review, index) => ({
      "@type": "Review",
      "@id": createId(`agg-review-${index + 1}`),
      author: {
        "@type": "Person",
        name: review.name || "Customer",
      },
      datePublished: review.createdAt
        ? new Date(review.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      reviewBody: review.review || review.body || "",
      reviewRating: {
        "@type": "Rating",
        ratingValue: Number(review.rating) || 5,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
};

/**
 * buildEmiServiceSchema
 *
 * Rich schema for Google Search highlighting 0% Interest EMI & 40% Down Payment
 */
export const buildEmiServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "@id": createId("emi-service"),
  name: "Lucky Impex 0% Interest EMI Facility (किस्ताबन्दी सुविधा)",
  alternateName: "0% Interest EMI with 40% Down Payment Birgunj Nepal",
  description: "0% interest rate EMI facility with 40% down payment on electronics, home appliances, LED TVs, refrigerators, air conditioners, and smartphones at Lucky Impex, Birgunj, Nepal.",
  url: `${SITE_URL}/emi`,
  provider: {
    "@type": "ElectronicsStore",
    "@id": createId("localbusiness"),
    name: SITE_NAME,
    telephone: SITE_CONFIG.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
  },
  annualPercentageRate: 0,
  interestRate: 0,
  feesAndCommissionsSpecification: "0% interest financing with 40% down payment. Equal monthly installments for 3, 6, 9, 12, 18, or 24 months.",
});

