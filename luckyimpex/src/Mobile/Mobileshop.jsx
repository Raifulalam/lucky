import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authRequest } from "../api/api";
import { useCartDispatch } from "../Components/CreateReducer";
import { useNotification } from "../Components/NotificationContext";
import PageSeo from "../Components/PageSeo";
import { featuredMobiles } from "./data";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
    Search,
    X,
    Filter,
    ArrowUpDown,
    ShoppingCart,
    Heart,
    Check,
    Cpu,
    HardDrive,
    Camera,
    Battery,
    ShieldCheck,
    CreditCard,
    Zap,
    Grid3X3,
    List,
    Smartphone,
    RotateCcw,
    SlidersHorizontal,
    PhoneCall,
    Award
} from "lucide-react";
import "./MobileShop.css";

export default function MobileShop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const cartDispatch = useCartDispatch();
    const { showNotification } = useNotification();

    const initialBrand = searchParams.get("brand") || "All";
    const initialSearch = searchParams.get("search") || "";
    const initialSort = searchParams.get("sort") || "default";

    const [data, setData] = useState(featuredMobiles);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState(initialSearch);
    const [brand, setBrand] = useState(initialBrand);
    const [sort, setSort] = useState(initialSort);
    const [only5G, setOnly5G] = useState(false);
    const [priceRange, setPriceRange] = useState("all"); // 'all', 'budget', 'mid', 'flagship'
    const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
    const [addedIds, setAddedIds] = useState({});
    const [wishlist, setWishlist] = useState({});
    const [activeModalItem, setActiveModalItem] = useState(null);

    // Sync state with URL params
    useEffect(() => {
        const brandParam = searchParams.get("brand");
        if (brandParam) setBrand(brandParam);

        const searchParam = searchParams.get("search");
        if (searchParam) setSearch(searchParam);

        const sortParam = searchParams.get("sort");
        if (sortParam) setSort(sortParam);
    }, [searchParams]);

    // Fetch mobiles or fallback
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await authRequest("/mobiles");
                if (Array.isArray(response?.data) && response.data.length > 0) {
                    setData(response.data);
                } else {
                    setData(featuredMobiles);
                }
            } catch (err) {
                console.warn("Using local mobile catalog data:", err);
                setData(featuredMobiles);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Extract brand list with counts
    const brandCounts = useMemo(() => {
        const counts = { All: data.length };
        data.forEach((item) => {
            if (item.brand) {
                counts[item.brand] = (counts[item.brand] || 0) + 1;
            }
        });
        return counts;
    }, [data]);

    const brandList = useMemo(() => {
        return ["All", ...Object.keys(brandCounts).filter((b) => b !== "All")];
    }, [brandCounts]);

    // Filter and Sort logic
    const filteredMobiles = useMemo(() => {
        let list = [...data];

        // Search query
        if (search.trim()) {
            const query = search.toLowerCase();
            list = list.filter((item) =>
                `${item.name} ${item.brand} ${item.model} ${item.processor}`
                    .toLowerCase()
                    .includes(query)
            );
        }

        // Brand filter
        if (brand !== "All") {
            list = list.filter(
                (item) => item.brand?.toLowerCase() === brand.toLowerCase()
            );
        }

        // 5G Only filter
        if (only5G) {
            list = list.filter((item) => item.fiveG);
        }

        // Price bracket filter
        if (priceRange === "budget") {
            list = list.filter((item) => item.price <= 40000);
        } else if (priceRange === "mid") {
            list = list.filter((item) => item.price > 40000 && item.price <= 90000);
        } else if (priceRange === "flagship") {
            list = list.filter((item) => item.price > 90000);
        }

        // Sorting
        if (sort === "low") {
            list.sort((a, b) => a.price - b.price);
        } else if (sort === "high") {
            list.sort((a, b) => b.price - a.price);
        } else if (sort === "name") {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === "camera") {
            list.sort((a, b) => (b.camera || 0) - (a.camera || 0));
        } else if (sort === "battery") {
            list.sort((a, b) => {
                const bNum = parseInt(b.battery, 10) || 0;
                const aNum = parseInt(a.battery, 10) || 0;
                return bNum - aNum;
            });
        }

        return list;
    }, [data, search, brand, only5G, priceRange, sort]);

    const handleAddToCart = (e, item) => {
        e.stopPropagation();
        cartDispatch({
            type: "ADD_ITEM",
            id: item._id || item.id,
            name: item.name,
            price: item.salePrice || item.price,
            image: item.image,
            mrp: item.mrp || item.price,
            quantity: 1,
        });

        setAddedIds((prev) => ({ ...prev, [item._id || item.id]: true }));
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [item._id || item.id]: false }));
        }, 1800);

        if (showNotification) {
            showNotification(`${item.name} added to cart`, "success");
        }
    };

    const toggleWishlist = (e, id) => {
        e.stopPropagation();
        setWishlist((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const resetFilters = () => {
        setSearch("");
        setBrand("All");
        setSort("default");
        setOnly5G(false);
        setPriceRange("all");
        setSearchParams({});
    };

    const formatPrice = (val) => Number(val || 0).toLocaleString("en-IN");
    const calcEmi = (price) => Math.round(Number(price || 0) / 12).toLocaleString("en-IN");

    return (
        <div className="mobile-catalog-root">
            {/* SEO Metadata */}
            <PageSeo
                title="All Mobile Phones & Smartphones Catalog | Lucky Impex"
                description="Browse and compare official Apple, Samsung, OnePlus, Xiaomi & Vivo 5G smartphones in Birgunj. Official warranty, 0% EMI financing, and showroom pickup."
                canonicalPath="/mobile products"
                localBusiness
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    { label: "Mobiles", to: "/mobiles" },
                    { label: "Catalog" },
                ]}
            />

            <Header />

            <main className="catalog-main-content">
                {/* 1. HERO BANNER */}
                <section className="catalog-hero-strip">
                    <div className="catalog-hero-inner">
                        <div className="catalog-hero-text">
                            <div className="hero-breadcrumbs">
                                <Link to="/">Home</Link>
                                <span>/</span>
                                <Link to="/mobiles">Mobiles</Link>
                                <span>/</span>
                                <span className="active">Catalog</span>
                            </div>

                            <h1>Official Smartphones & 5G Devices</h1>
                            <p>
                                100% Genuine, MDMS registered smartphones with 1-Year Brand Warranty, 
                                0% EMI financing, and showroom pickup at Ghantaghar Link Road, Birgunj.
                            </p>

                            <div className="catalog-kpi-row">
                                <div className="kpi-pill">
                                    <ShieldCheck size={14} className="text-emerald" />
                                    <span>MDMS Registered</span>
                                </div>
                                <div className="kpi-pill">
                                    <CreditCard size={14} className="text-sky" />
                                    <span>0% EMI Available</span>
                                </div>
                                <div className="kpi-pill">
                                    <Award size={14} className="text-amber" />
                                    <span>Official Nepal Warranty</span>
                                </div>
                            </div>
                        </div>

                        <div className="catalog-hero-counter">
                            <span className="count-number">{filteredMobiles.length}</span>
                            <span className="count-label">Available Models</span>
                        </div>
                    </div>
                </section>

                {/* 2. FILTER & TOOLBAR SECTION */}
                <section className="catalog-controls-container">
                    {/* Top Row: Search + Sort + View Mode */}
                    <div className="controls-top-row">
                        <div className="catalog-search-wrap">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by model, brand, processor (e.g. S25 Ultra, Snapdragon, iPhone)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="clear-search-btn"
                                    onClick={() => setSearch("")}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div className="controls-actions-group">
                            {/* Sort select */}
                            <div className="sort-dropdown-wrap">
                                <ArrowUpDown size={15} className="sort-icon" />
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="catalog-select"
                                >
                                    <option value="default">Sort: Recommended</option>
                                    <option value="low">Price: Low to High</option>
                                    <option value="high">Price: High to Low</option>
                                    <option value="camera">Best Camera (MP)</option>
                                    <option value="battery">Largest Battery</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>

                            {/* View Switcher */}
                            <div className="view-mode-toggle">
                                <button
                                    type="button"
                                    className={`mode-btn ${viewMode === "grid" ? "active" : ""}`}
                                    onClick={() => setViewMode("grid")}
                                    title="Grid View"
                                >
                                    <Grid3X3 size={17} />
                                </button>
                                <button
                                    type="button"
                                    className={`mode-btn ${viewMode === "list" ? "active" : ""}`}
                                    onClick={() => setViewMode("list")}
                                    title="Compact List View"
                                >
                                    <List size={17} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Brand Chips */}
                    <div className="brand-chips-row">
                        <span className="chips-label">Brands:</span>
                        <div className="chips-scroll-wrap">
                            {brandList.map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    className={`brand-chip-btn ${brand === b ? "active" : ""}`}
                                    onClick={() => setBrand(b)}
                                >
                                    <span>{b}</span>
                                    <span className="chip-count">{brandCounts[b] || 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Row: Feature & Budget Pills */}
                    <div className="quick-filters-row">
                        <div className="filter-pill-group">
                            <span className="chips-label">Budget:</span>
                            <button
                                type="button"
                                className={`filter-tag-pill ${priceRange === "all" ? "active" : ""}`}
                                onClick={() => setPriceRange("all")}
                            >
                                All Prices
                            </button>
                            <button
                                type="button"
                                className={`filter-tag-pill ${priceRange === "budget" ? "active" : ""}`}
                                onClick={() => setPriceRange("budget")}
                            >
                                Under Rs. 40,000
                            </button>
                            <button
                                type="button"
                                className={`filter-tag-pill ${priceRange === "mid" ? "active" : ""}`}
                                onClick={() => setPriceRange("mid")}
                            >
                                Rs. 40k – 90k
                            </button>
                            <button
                                type="button"
                                className={`filter-tag-pill ${priceRange === "flagship" ? "active" : ""}`}
                                onClick={() => setPriceRange("flagship")}
                            >
                                Flagships (> 90k)
                            </button>
                        </div>

                        <div className="filter-pill-group">
                            <button
                                type="button"
                                className={`feature-toggle-pill ${only5G ? "active" : ""}`}
                                onClick={() => setOnly5G((prev) => !prev)}
                            >
                                <Zap size={13} />
                                <span>5G Devices Only</span>
                            </button>

                            {(brand !== "All" || search || only5G || priceRange !== "all" || sort !== "default") && (
                                <button
                                    type="button"
                                    className="reset-all-btn"
                                    onClick={resetFilters}
                                >
                                    <RotateCcw size={13} />
                                    <span>Reset Filters</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. PRODUCT LISTING GRID */}
                <section className="catalog-products-section">
                    {/* Active Filter Chips Preview */}
                    <div className="filter-status-bar">
                        <div className="status-text">
                            Showing <strong>{filteredMobiles.length}</strong> of <strong>{data.length}</strong> phones
                            {brand !== "All" && ` in ${brand}`}
                            {only5G && ` with 5G`}
                            {search && ` matching "${search}"`}
                        </div>
                    </div>

                    {loading && (
                        <div className="catalog-loading-card">
                            <div className="spinner-ring" />
                            <p>Loading smartphone catalog...</p>
                        </div>
                    )}

                    {!loading && filteredMobiles.length === 0 && (
                        <div className="catalog-empty-state">
                            <div className="empty-icon-box">
                                <Smartphone size={40} />
                            </div>
                            <h3>No smartphones match your filters</h3>
                            <p>Try searching for a different brand, model, or clearing active filters.</p>
                            <button
                                type="button"
                                className="btn-empty-reset"
                                onClick={resetFilters}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {!loading && filteredMobiles.length > 0 && (
                        <div className={`catalog-products-grid view-${viewMode}`}>
                            {filteredMobiles.map((item) => {
                                const id = item._id || item.id;
                                const isAdded = addedIds[id];
                                const isWish = wishlist[id];
                                const discount = item.mrp && item.price && item.mrp > item.price
                                    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                                    : null;

                                return (
                                    <article 
                                        key={id} 
                                        className="catalog-mobile-card"
                                        onClick={() => setActiveModalItem(item)}
                                    >
                                        {/* Card Top Badges */}
                                        <div className="card-top-bar">
                                            <span className="brand-badge">{item.brand}</span>
                                            <div className="card-tags-right">
                                                {discount && (
                                                    <span className="badge-discount">{discount}% OFF</span>
                                                )}
                                                {item.fiveG && (
                                                    <span className="badge-fiveg">5G</span>
                                                )}
                                                <button
                                                    type="button"
                                                    className={`card-wishlist-btn ${isWish ? "active" : ""}`}
                                                    onClick={(e) => toggleWishlist(e, id)}
                                                    title={isWish ? "Remove from wishlist" : "Add to wishlist"}
                                                    aria-label="Wishlist"
                                                >
                                                    <Heart size={15} className={isWish ? "fill-heart" : ""} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Phone Image */}
                                        <div className="card-media-box">
                                            <img
                                                src={item.image || item.images?.[0] || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500"}
                                                alt={item.name}
                                                loading="lazy"
                                                className="phone-img"
                                            />
                                        </div>

                                        {/* Phone Info */}
                                        <div className="card-details-box">
                                            <h3 className="phone-title" title={item.name}>
                                                {item.name}
                                            </h3>

                                            {/* Key Specs Pills */}
                                            <div className="specs-grid-row">
                                                {item.processor && (
                                                    <span className="spec-badge" title="Processor">
                                                        <Cpu size={12} />
                                                        {item.processor.replace("Snapdragon", "SD")}
                                                    </span>
                                                )}
                                                <span className="spec-badge" title="RAM & Storage">
                                                    <HardDrive size={12} />
                                                    {item.ram}GB / {item.storage}GB
                                                </span>
                                                {item.camera && (
                                                    <span className="spec-badge" title="Main Camera">
                                                        <Camera size={12} />
                                                        {item.camera}MP
                                                    </span>
                                                )}
                                                {item.battery && (
                                                    <span className="spec-badge" title="Battery Capacity">
                                                        <Battery size={12} />
                                                        {item.battery}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price block */}
                                            <div className="price-container">
                                                <div className="price-row">
                                                    <span className="npr-price">Rs. {formatPrice(item.price)}</span>
                                                    {item.mrp && item.mrp > item.price && (
                                                        <span className="mrp-price">Rs. {formatPrice(item.mrp)}</span>
                                                    )}
                                                </div>
                                                <div className="emi-tag">
                                                    <CreditCard size={12} />
                                                    <span>0% EMI: <strong>Rs. {calcEmi(item.price)}/mo</strong></span>
                                                </div>
                                            </div>

                                            {/* Trust Line */}
                                            <div className="card-trust-pill">
                                                <ShieldCheck size={13} className="text-emerald" />
                                                <span>MDMS Verified · 1-Yr Nepal Warranty</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="card-btn-row">
                                                <button
                                                    type="button"
                                                    className={`btn-add-cart ${isAdded ? "added" : ""}`}
                                                    onClick={(e) => handleAddToCart(e, item)}
                                                >
                                                    {isAdded ? (
                                                        <>
                                                            <Check size={15} /> Added
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart size={15} /> Add to Cart
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-quick-specs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveModalItem(item);
                                                    }}
                                                >
                                                    Specs
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* 4. INTERACTIVE QUICK SPECS MODAL */}
            {activeModalItem && (
                <div 
                    className="modal-backdrop-mobile"
                    onClick={() => setActiveModalItem(null)}
                >
                    <div 
                        className="modal-dialog-mobile"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="modal-close-btn"
                            onClick={() => setActiveModalItem(null)}
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>

                        <div className="modal-content-grid">
                            {/* Modal Left: Image & Quick Buy */}
                            <div className="modal-left-media">
                                <img
                                    src={activeModalItem.image || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500"}
                                    alt={activeModalItem.name}
                                    className="modal-phone-img"
                                />

                                <div className="modal-price-box">
                                    <div className="price-tag-large">
                                        Rs. {formatPrice(activeModalItem.price)}
                                    </div>
                                    {activeModalItem.mrp && activeModalItem.mrp > activeModalItem.price && (
                                        <div className="mrp-strikethrough">
                                            MRP: Rs. {formatPrice(activeModalItem.mrp)}
                                        </div>
                                    )}
                                    <div className="modal-emi-info">
                                        <CreditCard size={14} className="text-sky" />
                                        <span>0% EMI: <strong>Rs. {calcEmi(activeModalItem.price)} / month</strong></span>
                                    </div>
                                </div>

                                <div className="modal-actions-col">
                                    <button
                                        type="button"
                                        className="btn-modal-cart"
                                        onClick={(e) => {
                                            handleAddToCart(e, activeModalItem);
                                            setActiveModalItem(null);
                                        }}
                                    >
                                        <ShoppingCart size={17} />
                                        <span>Add to Cart & Checkout</span>
                                    </button>
                                    <a
                                        href={`https://wa.me/9779802594022?text=Hello%20Lucky%20Impex,%20I%20am%20interested%20in%20${encodeURIComponent(activeModalItem.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-modal-whatsapp"
                                    >
                                        <PhoneCall size={16} />
                                        <span>Inquire on WhatsApp</span>
                                    </a>
                                </div>
                            </div>

                            {/* Modal Right: Specifications Table */}
                            <div className="modal-right-specs">
                                <div className="modal-badge-row">
                                    <span className="brand-tag">{activeModalItem.brand}</span>
                                    {activeModalItem.fiveG && (
                                        <span className="badge-fiveg">5G Dual SIM</span>
                                    )}
                                    <span className="badge-mdms">MDMS Compliant</span>
                                </div>

                                <h2>{activeModalItem.name}</h2>
                                <p className="modal-model-sub">Model SKU: {activeModalItem.sku || activeModalItem.model || "Official Nepal Model"}</p>

                                <div className="specs-table-wrapper">
                                    <h4>Technical Specifications</h4>
                                    <table className="specs-table">
                                        <tbody>
                                            <tr>
                                                <th>Processor / Chipset</th>
                                                <td>{activeModalItem.processor || activeModalItem.chipset || "Octa-Core 5G"}</td>
                                            </tr>
                                            <tr>
                                                <th>RAM & Storage</th>
                                                <td>{activeModalItem.ram}GB RAM / {activeModalItem.storage}GB ROM</td>
                                            </tr>
                                            <tr>
                                                <th>Display</th>
                                                <td>{activeModalItem.display || activeModalItem.displayType || "AMOLED 120Hz"} ({activeModalItem.resolution || "FHD+"})</td>
                                            </tr>
                                            <tr>
                                                <th>Main Camera</th>
                                                <td>{activeModalItem.camera}MP Ultra-Clear Camera with OIS</td>
                                            </tr>
                                            <tr>
                                                <th>Front Camera</th>
                                                <td>{activeModalItem.frontCamera || "16"}MP Selfie Camera</td>
                                            </tr>
                                            <tr>
                                                <th>Battery & Charging</th>
                                                <td>{activeModalItem.battery} with {activeModalItem.charging || "Fast Charge"}</td>
                                            </tr>
                                            <tr>
                                                <th>Operating System</th>
                                                <td>{activeModalItem.operatingSystem || "Android / iOS"}</td>
                                            </tr>
                                            <tr>
                                                <th>Build & Protection</th>
                                                <td>{activeModalItem.waterResistance || "IP68 Water Resistance"} · {activeModalItem.buildMaterial || "Glass & Metal"}</td>
                                            </tr>
                                            <tr>
                                                <th>Warranty</th>
                                                <td>1 Year Brand Warranty + Official VAT Bill</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}