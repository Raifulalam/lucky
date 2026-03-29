import React, { useState, useEffect } from "react";
import { images } from "./Constants";
import { ChevronRight, PlayCircle } from "lucide-react";
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
            <div className="hero-media">
                <img
                    src={images[currentSlide]}
                    alt={`Lucky Impex Slide ${currentSlide + 1}`}
                    className="hero-img"
                    width="1135"
                    height="890"
                    loading={currentSlide === 0 ? "eager" : "lazy"}
                    fetchPriority={currentSlide === 0 ? "high" : "auto"}
                />
            </div>
            <div className="hero-overlay">
                <div className="hero-copy">
                    <span className="section-kicker">Lucky Impex Electronics</span>

                    <p>
                        Explore trusted brands, practical offers, and category-led shopping built
                        for real product discovery instead of cluttered retail noise.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => navigate("/products")}>
                            Shop Products <ChevronRight size={18} />
                        </button>
                        <button className="btn-secondary" onClick={() => navigate("/contact")}>
                            <PlayCircle size={18} /> Talk to Sales
                        </button>
                    </div>
                    <div className="hero-metrics">
                        <div className="hero-metric">
                            <strong>Top brands</strong>
                            <span>Authorized product access across major categories.</span>
                        </div>
                        <div className="hero-metric">
                            <strong>Flexible offers</strong>
                            <span>Exchange and EMI options visible from the start.</span>
                        </div>
                        <div className="hero-metric">
                            <strong>Local support</strong>
                            <span>Store-backed buying confidence and customer assistance.</span>
                        </div>
                    </div>
                </div>

                <div className="hero-dots" aria-label="Hero slides">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`hero-dot ${index === currentSlide ? "active" : ""}`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSlider;
