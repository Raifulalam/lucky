import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Lucky Impex";
const SITE_URL = process.env.REACT_APP_SITE_URL || "https://luckyimpex.vercel.app";
const DEFAULT_IMAGE = `${SITE_URL}/lucky-logo.png`;

const PageSeo = ({
  title,
  description,
  canonicalPath,
  image = DEFAULT_IMAGE,
  noIndex = false,
  children,
}) => {
  const location = useLocation();

  const canonicalUrl = useMemo(() => {
    const pathname = canonicalPath || `${location.pathname}${location.search || ""}`;
    return pathname.startsWith("http") ? pathname : `${SITE_URL}${pathname}`;
  }, [canonicalPath, location.pathname, location.search]);

  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={image} />
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : null}
      {children}
    </Helmet>
  );
};

export default PageSeo;

