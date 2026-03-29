import React from "react";
import { brands } from "./Constants";
import { useNavigate } from "react-router-dom";

const BrandsCarousel = () => {
    const navigate = useNavigate();

    return (
        <section className="brands">
            <div className="section-heading">
                <span className="section-kicker">Brand Access</span>
                <h2>Featured partner brands</h2>
                <p>Recognizable names customers expect when shopping electronics and appliances.</p>
            </div>
            <div className="brand-carousel">
                {brands.map((brand) => (
                    <button
                        key={brand}
                        className="brand-logo"
                        onClick={() => navigate(`/products/brand/${brand}`)}
                        aria-label={`View ${brand} products`}
                    >
                        <img
                            src={`/${brand.toLowerCase()}.png`}
                            alt={`${brand} logo`}
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/lucky-logo.png";
                            }}
                        />
                        <span>{brand}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default BrandsCarousel;
