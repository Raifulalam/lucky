import React from "react";
import { categories } from "./Constants";
import { useNavigate } from "react-router-dom";

const Categories = () => {
    const navigate = useNavigate();
    const formatCategory = (value) => value.replace(/([A-Z])/g, " $1").trim();

    return (
        <section className="card-container">
            <div className="section-heading">
                <span className="section-kicker">Browse Categories</span>
                <h2>Shop by category</h2>
                <p>Move directly into the appliance group you need without searching through unrelated products.</p>
            </div>
            <div className="category-grid">
                {categories.map((c) => (
                    <button
                        key={c.name}
                        type="button"
                        className="category-card"
                        onClick={() => navigate(`/products/${c.name}`)}
                    >
                        <span className="category-icon">{c.icon}</span>
                        <h3>{formatCategory(c.name)}</h3>
                        <p>{c.description}</p>
                        <span className="category-link">Explore collection</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default Categories;
