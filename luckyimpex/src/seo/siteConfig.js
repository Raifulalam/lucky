import data from "./siteConfig.data.json";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const envSiteUrl = process.env.REACT_APP_SITE_URL?.trim();

export const SITE_CONFIG = {
  ...data,
  siteUrl: trimTrailingSlash(envSiteUrl || data.siteUrl),
  googleAnalyticsId: process.env.REACT_APP_GA4_ID?.trim() || data.googleAnalyticsId || "",
  googleSiteVerification: process.env.REACT_APP_GOOGLE_SITE_VERIFICATION?.trim() || data.googleSiteVerification || "",
};

export const SITE_NAME = SITE_CONFIG.name;
export const SITE_URL = SITE_CONFIG.siteUrl;
export const SITE_DESCRIPTION = SITE_CONFIG.description;
export const SITE_LOGO = `${SITE_URL}${SITE_CONFIG.defaultImage}`;

export const absoluteUrl = (path = "") => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
};

export const toSlug = (value = "") =>
  String(value)
    .trim()
    .replace(/&/g, " and ")
    .replace(/['".,]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

export const toTitleCase = (value = "") =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

