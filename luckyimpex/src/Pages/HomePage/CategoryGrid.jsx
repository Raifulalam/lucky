import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, PackageCheck, Sparkles, TrendingUp } from "lucide-react";
import { useWholesale } from "../../Components/WholesaleContext";
import "./CategoryGrid.css";

const CATEGORIES = [
    {
        id: "air-conditioners",
        title: "Air Conditioners",
        subtitle: "Split, Inverter & Heavy Commercial",
        tag: "1.0 - 2.0 Ton",
        slug: "AirConditioners",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
        localFallback: "/icon-ac.png",
        retailCount: "28+ Models In Stock",
        wholesaleCount: "Bulk Lots · 10+ Container Stock",
    },
    {
        id: "refrigerators",
        title: "Refrigerators",
        subtitle: "Single Door, Double Door & Side-by-Side",
        tag: "Frost-Free Tech",
        slug: "Refrigerators",
        image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80",
        localFallback: "/icon-refrigerator.png",
        retailCount: "35+ Models In Stock",
        wholesaleCount: "Dealer Crates Available",
    },
    {
        id: "washing-machines",
        title: "Washing Machines",
        subtitle: "Front Load, Top Load & Semi-Automatic",
        tag: "Inverter Direct Drive",
        slug: "WashingMachines",
        image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
        localFallback: "/icon-washing-machine.png",
        retailCount: "22+ Models In Stock",
        wholesaleCount: "Pallet Wholesale Orders",
    },
    {
        id: "smart-led-tvs",
        title: "Smart LED TVs",
        subtitle: "4K UHD, QLED, Google TV & Android",
        tag: "32\" up to 85\"",
        slug: "LEDTelevisions",
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80",
        localFallback: "/icon-tv.png",
        retailCount: "40+ Screens In Stock",
        wholesaleCount: "Distributor Carton Pricing",
    },
    {
        id: "kitchen-appliances",
        title: "Kitchen Appliances",
        subtitle: "Mixers, Blenders, Microwaves & Induction",
        tag: "Daily Essentials",
        slug: "KitchenAppliances",
        image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80",
        localFallback: "/guest4.jpg",
        retailCount: "50+ Kitchen Items",
        wholesaleCount: "Master Cartons Available",
    },
    {
        id: "home-appliances",
        title: "Home Appliances",
        subtitle: "Air Coolers, Heaters, Irons & Geysers",
        tag: "Energy Saving",
        slug: "HomeAppliances",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
        localFallback: "/guest5.jpg",
        retailCount: "45+ Appliances In Stock",
        wholesaleCount: "Bulk Commercial Units",
    },
    {
        id: "hot-deals",
        title: "Hot Deals & Clearance",
        subtitle: "Festive Discounts, EMI & Exchange Bonuses",
        tag: "Up to 35% OFF",
        slug: "products",
        isHot: true,
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80",
        localFallback: "/guest2.jpg",
        retailCount: "Limited Stock Deals",
        wholesaleCount: "Overstock Clearance Bundles",
    },
    {
        id: "wholesale-bundles",
        title: "Wholesale Bundles",
        subtitle: "Assorted Retailer Starter Packs & Crates",
        tag: "B2B Special",
        slug: "products",
        isWholesaleSpecial: true,
        image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
        localFallback: "/guest6.jpg",
        retailCount: "Showroom Package Deals",
        wholesaleCount: "Minimum 5 Units Tiered Rates",
    },
];

const CategoryGrid = () => {
    const { isWholesale } = useWholesale();

    return (
        <section className="category-grid-section" aria-label="Product categories">
            <div className="category-grid-inner">
                {/* Section Header */}
                <div className="category-grid-header">
                    <div className="header-text-group">
                        <span className="section-pill">
                            {isWholesale ? <TrendingUp size={14} /> : <Sparkles size={14} />}
                            {isWholesale ? "Wholesale Catalog By Category" : "Curated Showroom Categories"}
                        </span>
                        <h2 className="section-title">
                            {isWholesale ? "Bulk Electronics Distribution Categories" : "Explore Electronics by Category"}
                        </h2>
                        <p className="section-subtitle">
                            {isWholesale
                                ? "Direct factory-authorized distribution with tiered wholesale pricing for store dealers and resellers in Nepal."
                                : "Discover authentic electronics and home appliances with direct showroom warranty and Birgunj pickup."}
                        </p>
                    </div>
                    <Link to="/products" className="view-all-link">
                        <span>View All Categories</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* 2x4 Responsive Card Grid */}
                <div className="category-cards-grid">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/products/${cat.slug}`}
                            className={`category-card-item ${cat.isHot ? "card-hot" : ""} ${
                                cat.isWholesaleSpecial ? "card-wholesale-special" : ""
                            }`}
                        >
                            <div className="cat-card-image-wrap">
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = cat.localFallback;
                                    }}
                                    className="cat-card-img"
                                />
                                <span className="cat-tag-pill">
                                    {cat.isHot && <Flame size={12} className="inline-icon" />}
                                    {cat.isWholesaleSpecial && <PackageCheck size={12} className="inline-icon" />}
                                    {cat.tag}
                                </span>
                            </div>

                            <div className="cat-card-body">
                                <h3 className="cat-card-title">{cat.title}</h3>
                                <p className="cat-card-sub">{cat.subtitle}</p>
                                <div className="cat-card-footer">
                                    <span className="cat-card-count">
                                        {isWholesale ? cat.wholesaleCount : cat.retailCount}
                                    </span>
                                    <span className="cat-action-arrow">
                                        <ArrowRight size={15} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
