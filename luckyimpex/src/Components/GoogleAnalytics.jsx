import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_CONFIG, SITE_NAME } from "../seo/siteConfig";

const GA_ID = SITE_CONFIG.googleAnalyticsId;

const ensureGtag = () => {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  return window.gtag;
};

const loadScript = () => {
  if (typeof document === "undefined" || !GA_ID) return;
  if (document.getElementById("ga4-script")) return;

  ensureGtag();

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.onload = () => {
    const gtag = ensureGtag();
    if (!gtag) return;

    gtag("js", new Date());
    gtag("config", GA_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
  };

  document.head.appendChild(script);
};

export const trackEvent = (eventName, params = {}) => {
  const gtag = ensureGtag();
  if (!gtag || !GA_ID) return;

  gtag("event", eventName, params);
};

export const trackPageView = (location, title = document?.title || SITE_NAME) => {
  trackEvent("page_view", {
    page_location: window?.location?.href,
    page_path: `${location.pathname}${location.search || ""}`,
    page_title: title,
  });
};

export const trackSearch = (searchTerm, params = {}) => {
  if (!searchTerm) return;

  trackEvent("search", {
    search_term: searchTerm,
    ...params,
  });
};

export const trackAddToCart = (product, params = {}) => {
  if (!product) return;

  const price = Number(product.price || product.bestBuyPrice || 0);
  trackEvent("add_to_cart", {
    currency: "NPR",
    value: price,
    items: [
      {
        item_id: String(product._id || product.id || product.slug || ""),
        item_name: product.name || "Product",
        item_brand: product.brand || "",
        item_category: product.category || "",
        price,
        quantity: 1,
      },
    ],
    ...params,
  });
};

export const trackViewItem = (product, params = {}) => {
  if (!product) return;

  const price = Number(product.price || product.bestBuyPrice || 0);
  trackEvent("view_item", {
    currency: "NPR",
    value: price,
    items: [
      {
        item_id: String(product._id || product.id || product.slug || ""),
        item_name: product.name || "Product",
        item_brand: product.brand || "",
        item_category: product.category || "",
        price,
        quantity: 1,
      },
    ],
    ...params,
  });
};

export const trackPurchase = (order, params = {}) => {
  if (!order) return;

  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        item_id: String(item.itemId || item.id || item._id || ""),
        item_name: item.name || "Product",
        item_brand: item.brand || "",
        item_category: item.category || "",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      }))
    : [];

  trackEvent("purchase", {
    transaction_id: String(order._id || order.orderId || order.id || Date.now()),
    affiliation: SITE_NAME,
    currency: "NPR",
    value: Number(order.totalPrice || order.total || 0),
    tax: Number(order.tax || 0),
    shipping: Number(order.shipping || 0),
    items,
    ...params,
  });
};

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    loadScript();
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window === "undefined") return;
    if (!window.gtag) return;

    trackPageView(location);
  }, [location]);

  return null;
};

export default GoogleAnalytics;
