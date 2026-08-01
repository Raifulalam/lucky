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
  url: SITE_URL,
  image: [SITE_LOGO],
  logo: SITE_LOGO,
  description: SITE_CONFIG.description,
  telephone: SITE_CONFIG.phone,
  email: SITE_CONFIG.supportEmail,
  priceRange: "Rs",
  areaServed: "Birgunj, Nepal",
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
      "@type": "Organization",
      name: itemName,
    },
    author: {
      "@type": "Person",
      name: review.name || "Customer",
    },
    reviewBody: review.review || review.body,
    reviewRating: review.rating
      ? {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
        }
      : undefined,
  }));
};

