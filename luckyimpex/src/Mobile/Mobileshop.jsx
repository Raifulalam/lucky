
import React, { useState, useEffect, useMemo } from "react";
import { authRequest } from "../api/api";
import { useCartDispatch } from "../Components/CreateReducer";
import { useNotification } from "../Components/NotificationContext";
import "./MobileShop.css";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

export default function MobileShop() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [brand, setBrand] = useState("All");
    const [sort, setSort] = useState("default");

    const cartDispatch = useCartDispatch();
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await authRequest("/mobiles");

                setData(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (error) {
                console.error("Error fetching mobiles:", error);
                setError("Unable to load mobile products.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get unique brands
    const brands = useMemo(() => {
        return [
            "All",
            ...new Set(
                data
                    .map((item) => item.brand)
                    .filter(Boolean)
            ),
        ];
    }, [data]);

    // Search, filter and sort
    const filteredMobiles = useMemo(() => {
        let products = [...data];

        if (search.trim()) {
            const query = search.toLowerCase();

            products = products.filter((item) =>
                `${item.name} ${item.brand} ${item.model}`
                    .toLowerCase()
                    .includes(query)
            );
        }

        if (brand !== "All") {
            products = products.filter(
                (item) => item.brand === brand
            );
        }

        if (sort === "low") {
            products.sort((a, b) => a.price - b.price);
        }

        if (sort === "high") {
            products.sort((a, b) => b.price - a.price);
        }

        if (sort === "name") {
            products.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        }

        return products;
    }, [data, search, brand, sort]);

    const addToCart = (item) => {
        // Adjust this action to match your reducer.
        cartDispatch({
            type: "ADD_TO_CART",
            payload: {
                ...item,
                quantity: 1,
            },
        });

        if (showNotification) {
            showNotification(
                `${item.name} added to cart`,
                "success"
            );
        }
    };

    return (
        <main className="mobile-shop">
            <Header/>

            {/* Hero Section */}
            <section className="shop-hero">
                <div className="hero-content">
                    <span className="hero-badge">
                        NEW COLLECTION
                    </span>

                    <h1>
                        Find Your
                        <span> Perfect Phone.</span>
                    </h1>

                    <p>
                        Discover the latest smartphones,
                        powerful performance, and
                        unbeatable prices.
                    </p>

                    <a href="#mobile-products" className="hero-btn">
                        Shop Mobiles →
                    </a>
                </div>

                <div className="hero-decoration">
                    <div className="hero-circle"></div>
                    <div className="hero-phone">📱</div>
                </div>
            </section>

            {/* Shop Header */}
            <section className="shop-container" id="mobile-products">

                <div className="shop-heading">
                    <div>
                        <span className="section-label">
                            OUR COLLECTION
                        </span>

                        <h2>Explore Mobiles</h2>

                        <p>
                            {filteredMobiles.length} products available
                        </p>
                    </div>
                </div>

                {/* Search and Sort */}
                <div className="shop-controls">

                    <div className="search-box">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search mobiles..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={sort}
                        onChange={(e) =>
                            setSort(e.target.value)
                        }
                    >
                        <option value="default">
                            Sort: Featured
                        </option>

                        <option value="low">
                            Price: Low to High
                        </option>

                        <option value="high">
                            Price: High to Low
                        </option>

                        <option value="name">
                            Name: A-Z
                        </option>
                    </select>

                </div>

                {/* Brand Filter */}
                <div className="brand-filters">
                    {brands.map((itemBrand) => (
                        <button
                            key={itemBrand}
                            className={
                                brand === itemBrand
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setBrand(itemBrand)
                            }
                        >
                            {itemBrand}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="shop-message">
                        Loading mobiles...
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="shop-message error">
                        {error}
                    </div>
                )}

                {/* Product Grid */}
                {!loading && !error && (
                    <div className="mobile-grid">

                        {filteredMobiles.map((item) => (
                            <article
                                className="mobile-card"
                                key={item._id}
                            >

                                <div className="product-image">

                                    {item.featured && (
                                        <span className="featured-badge">
                                            Featured
                                        </span>
                                    )}

                                    <img
                                        src={
                                            item.image ||
                                            item.images?.[0] ||
                                            "/placeholder-mobile.png"
                                        }
                                        alt={item.name}
                                        loading="lazy"
                                    />

                                    <button
                                        className="wishlist-btn"
                                        aria-label={`Add ${item.name} to wishlist`}
                                    >
                                        ♡
                                    </button>

                                </div>

                                <div className="product-info">

                                    <span className="product-brand">
                                        {item.brand}
                                    </span>

                                    <h3>{item.name}</h3>

                                    <p className="product-description">
                                        {item.description ||
                                            `${item.ram || ""}GB RAM • ${
                                                item.storage || ""
                                            }GB Storage`}
                                    </p>

                                    <div className="product-bottom">

                                        <div>
                                            <span className="price-label">
                                                Starting at
                                            </span>

                                            <strong>
                                                ₹{Number(item.price).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>
                                        </div>

                                        <button
                                            className="cart-btn"
                                            onClick={() =>
                                                addToCart(item)
                                            }
                                        >
                                            🛒
                                        </button>

                                    </div>

                                </div>

                            </article>
                        ))}

                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredMobiles.length === 0 && (
                        <div className="shop-message">
                            No mobiles found.
                        </div>
                    )}

            </section>
<Footer/>
        </main>
    );
}