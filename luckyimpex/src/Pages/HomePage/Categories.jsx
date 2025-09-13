import React from "react";
import { categories } from "./Constants";
import { useNavigate } from "react-router-dom";

const Categories = () => {
    const navigate = useNavigate();

    return (
        <section className="card-container">
            <h2>Shop by Category</h2>
            <div className="category-grid">
                {categories.map((c) => (
                    <div key={c.name} className="category-card" onClick={() => navigate(`/products/${c.name}`)}>
                        <span className="category-icon">{c.icon}</span>
                        <h3>{c.name}</h3>
                        <p>{c.description}</p>
                        <button className="btn-secondary">Explore</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Categories;
