import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Percent,
    ShieldCheck,
    ShoppingBag,
    Store,
    Truck
} from "lucide-react";
import { useWholesale } from "../../Components/WholesaleContext";
import "./HeroSlider.css";

const RETAIL_SLIDES = [
    {
        id: "retail-1",
        badge: "Official Authorized Showroom · Birgunj",
        title: "Upgrade Your Home with Official Electronics",
        subtitle: "Authorized Dealer in Birgunj. Zero-hassle EMI, genuine brand warranty & immediate in-store pickup available.",
        ctaPrimary: { label: "Shop Now", link: "/products" },
        ctaSecondary: { label: "Visit Showroom", link: "/store" },
        image: "/guest1.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=80",
        stats: [
            { icon: <ShieldCheck size={16} />, label: "100% Genuine Warranty" },
            { icon: <Percent size={16} />, label: "0% Down Easy EMI" },
            { icon: <Store size={16} />, label: "Live Showroom Demo" },
        ],
    },
    {
        id: "retail-2",
      
        title: "Beat the Heat with Inverter ACs & Coolers",
        subtitle: "Top brands: LG, Samsung, Haier, Symphony with professional delivery and prompt installation in Birgunj & Parsa.",
        ctaPrimary: { label: "Explore AC Range", link: "/products/AirConditioners" },
        ctaSecondary: { label: "Calculate EMI", link: "/emi" },
        image: "/guest2.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
        stats: [
            { icon: <Truck size={16} />, label: "Express Doorstep Delivery" },
            { icon: <CheckCircle2 size={16} />, label: "Authorized Tech Support" },
            { icon: <Percent size={16} />, label: "Exchange Old Appliances" },
        ],
    },
];

const WHOLESALE_SLIDES = [
    {
        id: "wholesale-1",
     
        title: "Bulk Electronics & Home Appliance Supplier",
        subtitle: "Special wholesale discounts & direct distribution for retailers across Madhesh Province & Nepal. Tiered volume quotes.",
        ctaPrimary: { label: "Get Wholesale Quote", action: "rfq" },
        ctaSecondary: { label: "Become a Dealer", link: "/contact" },
        image: "/guest3.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
        stats: [
            { icon: <Building2 size={16} />, label: "Tiered Bulk Discounts" },
            { icon: <FileText size={16} />, label: "Official VAT Invoicing" },
            { icon: <Truck size={16} />, label: "Full Truckload Logistics" },
        ],
    },
    {
        id: "wholesale-2",
       
        title: "Empower Your Retail Shop with Direct Stock",
        subtitle: "Direct container rates for Smart TVs, Washing Machines, Commercial Freezers & Kitchen Appliances with dedicated account management.",
        ctaPrimary: { label: "Request Price Sheet", action: "rfq" },
        ctaSecondary: { label: "Call B2B Desk", href: "tel:+9779807286786" },
        image: "/guest6.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
        stats: [
            { icon: <ShieldCheck size={16} />, label: "Brand Certified Stock" },
            { icon: <Building2 size={16} />, label: "Priority Dealer Allocation" },
            { icon: <CheckCircle2 size={16} />, label: "Fast Credit Terms" },
        ],
    },
];

const HeroSlider = () => {
    const { isWholesale, toggleMode, openRfqModal } = useWholesale();
    const navigate = useNavigate();

    const slides = isWholesale ? WHOLESALE_SLIDES : RETAIL_SLIDES;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Touch swipe handling for mobile
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Reset slide index if mode switches
    useEffect(() => {
        setCurrentIndex(0);
    }, [isWholesale]);

    // Auto-advance timer
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides.length, isHovered]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const delta = touchStartX.current - touchEndX.current;
        if (Math.abs(delta) > 50) {
            if (delta > 0) {
                handleNext(); // Swiped left -> next slide
            } else {
                handlePrev(); // Swiped right -> previous slide
            }
        }
    };

    const handleCtaClick = (cta) => {
        if (cta.action === "rfq") {
            openRfqModal();
        } else if (cta.href) {
            window.location.href = cta.href;
        } else if (cta.link) {
            navigate(cta.link);
        }
    };

    const activeSlide = slides[currentIndex];

    return (
        <section
            className={`hero-section ${isWholesale ? "wholesale-theme" : "retail-theme"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-label="Main promotional slider"
        >
            {/* Background Slides */}
            <div className="hero-slides-wrapper">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`hero-slide-bg ${index === currentIndex ? "active" : ""}`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = slide.fallbackImage;
                            }}
                            className="hero-slide-img"
                        />
                        <div className="hero-overlay-gradient" />
                    </div>
                ))}
            </div>

            {/* Mobile Mode Switcher Banner Strip */}
            <div className="hero-mode-pill-strip">
              
                <button
                    type="button"
                    className={`mode-quick-btn ${!isWholesale ? "active" : ""}`}
                    onClick={() => isWholesale && toggleMode()}
                >
                    <ShoppingBag size={13} />
                    Retail Shopper
                </button>
                <button
                    type="button"
                    className={`mode-quick-btn ${isWholesale ? "active" : ""}`}
                    onClick={() => !isWholesale && toggleMode()}
                >
                    <Building2 size={13} />
                    Wholesale Dealer
                </button>
            </div>

            {/* Hero Content Overlay */}
            <div className="hero-content-container">
                <div className="hero-content-box" key={`${isWholesale ? "w" : "r"}-${currentIndex}`}>
                    {/* Badge */}
                  

                    {/* Headline */}
                    <h1 className="hero-heading">{activeSlide.title}</h1>

                    {/* Subtitle */}
                    <p className="hero-subtext">{activeSlide.subtitle}</p>

                    {/* CTAs */}
                    <div className="hero-cta-group">
                        <button
                            type="button"
                            className="hero-btn-primary"
                            onClick={() => handleCtaClick(activeSlide.ctaPrimary)}
                        >
                            <span>{activeSlide.ctaPrimary.label}</span>
                            <ArrowRight size={18} />
                        </button>
                        <button
                            type="button"
                            className="hero-btn-secondary"
                            onClick={() => handleCtaClick(activeSlide.ctaSecondary)}
                        >
                            <span>{activeSlide.ctaSecondary.label}</span>
                        </button>
                    </div>

                    {/* Quick Stats Strip */}
                    <div className="hero-stats-row">
                        {activeSlide.stats.map((stat, idx) => (
                            <div key={idx} className="hero-stat-item">
                                <span className="stat-icon">{stat.icon}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Slide Arrows */}
            <button
                type="button"
                className="hero-nav-arrow arrow-left"
                onClick={handlePrev}
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                type="button"
                className="hero-nav-arrow arrow-right"
                onClick={handleNext}
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Slide Dots */}
            <div className="hero-dots-container">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`hero-dot-btn ${idx === currentIndex ? "active" : ""}`}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;
