import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildProductSchema,
  buildReviewSchema,
  buildWebsiteSchema,
} from "../seo/schemas";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_LOGO, SITE_NAME, absoluteUrl } from "../seo/siteConfig";

const escapeJsonLd = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const PageSeo = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  image = SITE_LOGO,
  noIndex = false,
  breadcrumbs = [],
  product = null,
  faq = [],
  localBusiness = false,
  reviews = [],
  review = null,
  schemas = [],
  ogType,
  robots,
  keywords,
  author = SITE_NAME,
  children,
}) => {
  const location = useLocation();

  const resolvedCanonical = useMemo(() => {
    const pathname = canonicalPath || `${location.pathname}${location.search || ""}`;
    const value = canonicalUrl || pathname;
    return value.startsWith("http") ? value : absoluteUrl(value);
  }, [canonicalPath, canonicalUrl, location.pathname, location.search]);

  const pageTitle = useMemo(() => {
    if (!title) return `${SITE_NAME} | Electronics & Home Appliances Birgunj Nepal`;
    const cleanTitle = title.trim();
    if (
      cleanTitle.toLowerCase().includes(SITE_NAME.toLowerCase()) ||
      cleanTitle.toLowerCase().includes("luckyimpex")
    ) {
      return cleanTitle;
    }
    return `${cleanTitle} | ${SITE_NAME}`;
  }, [title]);

  const resolvedDescription = description || SITE_DESCRIPTION;
  const resolvedKeywords = keywords || SITE_KEYWORDS;
  const resolvedImage = image ? (image.startsWith("http") ? image : absoluteUrl(image)) : SITE_LOGO;
  const resolvedOgType = ogType || (product ? "product" : "website");
  const robotsContent = robots || (noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

  const structuredData = useMemo(() => {
    const next = [];

    if (!noIndex) {
      next.push(buildOrganizationSchema());
      next.push(buildWebsiteSchema());
    }

    if (localBusiness) {
      next.push(typeof localBusiness === "object" ? localBusiness : buildLocalBusinessSchema());
    }

    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
    if (breadcrumbSchema) next.push(breadcrumbSchema);

    const productSchema = product ? buildProductSchema(product) : null;
    if (productSchema) next.push(productSchema);

    const faqSchema = buildFaqSchema(faq);
    if (faqSchema) next.push(faqSchema);

    const reviewSchemas = reviews.length ? buildReviewSchema(reviews) : review ? buildReviewSchema([review]) : null;
    if (Array.isArray(reviewSchemas)) {
      next.push(...reviewSchemas);
    } else if (reviewSchemas) {
      next.push(reviewSchemas);
    }

    schemas.forEach((schema) => {
      if (schema) next.push(schema);
    });

    return next;
  }, [breadcrumbs, faq, localBusiness, noIndex, product, review, reviews, schemas]);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={resolvedCanonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={resolvedOgType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      {product ? <meta property="product:price:amount" content={String(product.price || product.bestBuyPrice || "")} /> : null}
      {product ? <meta property="product:price:currency" content="NPR" /> : null}
      {product ? <meta property="product:availability" content={Number(product.stock || 0) > 0 ? "in stock" : "out of stock"} /> : null}
      {product?.brand ? <meta property="product:brand" content={product.brand} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />
      {structuredData.map((schema, index) => (
        <script
          key={`${schema["@type"] || "schema"}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(schema) }}
        />
      ))}
      {children}
    </Helmet>
  );
};

export default PageSeo;

