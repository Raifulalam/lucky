import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
      <ol className="seo-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${item.to || index}`} className="seo-breadcrumbs-item">
              {item.to && !isLast ? (
                <Link to={item.to} className="seo-breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span className="seo-breadcrumbs-current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
