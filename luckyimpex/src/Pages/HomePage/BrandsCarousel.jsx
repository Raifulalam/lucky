import React from "react";
import { brands } from "./Constants";
import { useNavigate } from "react-router-dom";

const BrandsCarousel = () => {
    const navigate = useNavigate();

    return (
        <section className="brands">
            <h2>Our Top Deal Brands</h2>
            <div className="brand-carousel">
                {brands.map((brand) => (
                    <button
                        key={brand}
                        className="brand-logo"
                        onClick={() => navigate(`/products/brand/${brand}`)}
                        aria-label={`View ${brand} products`}
                    >
                        <img src={`/${brand.toLowerCase()}.png`} alt={`${brand} logo`} loading="lazy" />
                    </button>
                ))}
            </div>
        </section>
    );
};

export default BrandsCarousel;
