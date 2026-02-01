import React, { useState, useEffect } from "react";
import { images } from "./Constants";


const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero-slider">
            <div className="hero-slide">
                <img
                    src={images[currentSlide]}
                    alt={`Lucky Impex Slide ${currentSlide + 1}`}
                    className="hero-img"
                    width="1335"
                    height="890"
                    loading={currentSlide === 0 ? "eager" : "lazy"}
                    fetchpriority={currentSlide === 0 ? "high" : "auto"}
                />

                {/* Text overlay */}
                {currentSlide === 0 && (  // Show only on first image
                    <div className="hero-text">
                        <h1>Premium Electrical & Home Appliances in Nepal</h1>
                        <p>Wholesale & retail solutions you can trust.</p>
                    </div>
                )}
            </div>
        </section>


    );
};

export default HeroSlider;
