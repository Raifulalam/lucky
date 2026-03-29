import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgePercent, PackageCheck, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { useCartDispatch } from "../../Components/CreateReducer";
import { useNotification } from "../../Components/NotificationContext";
import useGoBack from "../../hooks/useGoback";
import "./Details.css";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`;

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useCartDispatch();
    const { addNotification } = useNotification();
    const [productData, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const goBack = useGoBack();

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`https://lucky-1-6ma5.onrender.com/api/products/products/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Product not found");
                    }
                    throw new Error("Failed to fetch product details");
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching product details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const savings = useMemo(() => {
        if (!productData?.mrp || !productData?.price) return null;
        const amount = Number(productData.mrp) - Number(productData.price);
        if (amount <= 0) return null;
        const percent = Math.round((amount / Number(productData.mrp)) * 100);
        return { amount, percent };
    }, [productData]);

    const handleAddToCart = () => {
        if (!productData) return;

        dispatch({
            type: "ADD_ITEM",
            id: productData._id,
            image: productData.image,
            name: productData.name,
            mrp: productData.mrp,
            price: productData.price,
        });

        addNotification({
            title: "Success",
            message: "Item added to cart.",
            type: "success",
            container: "top-right",
            dismiss: { duration: 5000 },
        });
    };

    if (loading) {
        return (
            <div className="details-page">
                <Header />
                <div className="details-loading">Loading product details...</div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="details-page">
                <Header />
                <div className="details-error">
                    <p>{error}</p>
                    <button onClick={() => navigate("/products")}>Back to products</button>
                </div>
                <Footer />
            </div>
        );
    }

    const imageUrl = productData?.image ? `${productData.image}` : "/lucky-logo.png";
    const isOutOfStock = Number(productData?.stock) <= 0;

    return (
        <div className="details-page">
            <Helmet>
                <title>{productData.name} - Lucky Impex</title>
                <meta name="description" content={`Buy ${productData.name} from Lucky Impex.`} />
            </Helmet>

            <Header />

            <main className="product-detail-container">
                <button className="details-back-btn" onClick={goBack}>
                    <ArrowLeft size={18} /> Back
                </button>

                <section className="product-details-content">
                    <div className="product-visual-card">
                        <div className="product-image-frame">
                            <img
                                className="details-product-image"
                                src={imageUrl}
                                alt={productData?.name || "Product image"}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/lucky-logo.png";
                                }}
                            />
                            {savings && (
                                <span className="details-savings-badge">
                                    Save {formatCurrency(savings.amount)}
                                </span>
                            )}
                        </div>
                        <div className="details-support-strip">
                            <div><Truck size={18} /> Delivery support available</div>
                            <div><ShieldCheck size={18} /> Store-backed product guidance</div>
                            <div><PackageCheck size={18} /> Category-ready buying help</div>
                        </div>
                    </div>

                    <div className="details-product-info-container">
                        <span className="details-kicker">{productData.brand || "Lucky Impex"}</span>
                        <h1>{productData.name}</h1>
                        <p className="details-subcopy">
                            {productData.description || "Product information available from Lucky Impex."}
                        </p>

                        <div className="details-price-panel">
                            <div className="details-current-price">{formatCurrency(productData.price)}</div>
                            <div className="details-mrp">MRP {formatCurrency(productData.mrp)}</div>
                            {savings && (
                                <div className="details-discount-note">
                                    <BadgePercent size={16} /> {savings.percent}% off on listed MRP
                                </div>
                            )}
                        </div>

                        <div className="details-status-row">
                            <span className={`stock-pill ${isOutOfStock ? "out" : "in"}`}>
                                {isOutOfStock ? "Out of stock" : `In stock${productData.stock ? ` (${productData.stock})` : ""}`}
                            </span>
                            <span className="category-pill">{productData.category || "General"}</span>
                        </div>

                        <div className="details-spec-grid">
                            <div className="detail-spec-card">
                                <span>Model</span>
                                <strong>{productData.model || "N/A"}</strong>
                            </div>
                            <div className="detail-spec-card">
                                <span>Brand</span>
                                <strong>{productData.brand || "N/A"}</strong>
                            </div>
                            <div className="detail-spec-card">
                                <span>Capacity / Size</span>
                                <strong>{productData.capacity || "N/A"}</strong>
                            </div>
                            <div className="detail-spec-card">
                                <span>Category</span>
                                <strong>{productData.category || "N/A"}</strong>
                            </div>
                        </div>

                        <div className="details-actions">
                            <button className="details-primary-btn" onClick={handleAddToCart} disabled={isOutOfStock}>
                                <ShoppingCart size={18} />
                                {isOutOfStock ? "Unavailable" : "Add to Cart"}
                            </button>
                            <button className="details-secondary-btn" onClick={() => navigate("/products")}>
                                Explore More Products
                            </button>
                        </div>

                        <section className="details-description-card">
                            <h2>Product overview</h2>
                            <p>{productData.description || "Detailed description not available."}</p>
                        </section>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetails;
