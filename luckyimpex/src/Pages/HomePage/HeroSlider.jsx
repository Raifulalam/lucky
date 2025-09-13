import React, { useState, useEffect } from "react";
import { images } from "./Constants";
import { useNavigate } from "react-router-dom";

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero-slider">
            <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="hero-img" loading="lazy" />
            <div className="hero-overlay">
                <h1>Welcome to Lucky Impex</h1>
                <p>Your one-stop destination for electronics & home appliances</p>
                <button className="btn-primary" onClick={() => navigate("/products")}>Shop Now</button>
            </div>
        </section>
    );
};

export default HeroSlider;
