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
            <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="hero-img" loading="lazy" />

        </section>
    );
};

export default HeroSlider;
