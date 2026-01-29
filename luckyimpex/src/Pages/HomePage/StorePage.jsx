import React, { useEffect, useState, useCallback, useMemo } from "react";
import Header from "../../Components/Header";
import MapComponent from "../../Components/Leaflet";
import { ContactComponent } from "../Contact/Contact";
import "./StoreComponent.css";

const StoreComponent = () => {
    const branches = useMemo(
        () => [
            {
                name: "Lucky Impex Birgunj (Main)",
                location: [27.0138387, 84.8803044],
                contact:
                    "Phone: +977-9807286786, Tel: 051531789, Email: luckyimpex4u@gmail.com",
                address: "Link Road Ghantaghar, Birgunj, Nepal",
                hours: "Sun–Fri: 10:00 AM – 8:00 PM, Sat: 10:00 AM – 3:00 PM",
                description:
                    "Our flagship branch located in the heart of Birgunj offering a wide range of electronics.",
                images: ["lucky1.jpg", "guest6.jpg", "lucky2.jpg", "lucky3.jpg"],
            },
            {
                name: "Lucky Impex Birgunj",
                location: [27.01211, 84.8770902],
                contact:
                    "Phone: +977-9807216321, Email: luckyimpexmainroad@gmail.com",
                address: "Main Road Maisthan, Birgunj, Nepal",
                hours: "Sun–Fri: 10:00 AM – 8:00 PM, Sat: 10:00 AM – 3:00 PM",
                description:
                    "Wide range of electronics with trusted service.",
                images: ["lucky3.jpg", "lucky4.jpg"],
            },
            {
                name: "Lucky Impex Simra",
                location: [27.161434, 84.975124],
                contact:
                    "Phone: +977-9810818276, Email: luckyimpexsimra@gmail.com",
                address:
                    "Simra Main Road (in front of Surya Nepal Udhyog), Nepal",
                hours: "Sun–Fri: 10:00 AM – 8:00 PM, Sat: 10:00 AM – 3:00 PM",
                description:
                    "Serving Simra with quality electronics and support.",
                images: ["guest5.jpg", "lucky5.jpg"],
            },
        ],
        []
    );

    const awards = [
        { name: "Samsung Consistent Performer", year: "FY 2023/24", image: "samsung-award.jpg" },
        { name: "Samsung Rising Star", year: "FY 2023/24", image: "samsung-award2.jpg" },
        { name: "Samsung Dealership Certificate", year: "2024–2026", image: "samsung-delarship.jpg" },
        { name: "LG Dealership Certificate", year: "2023–2026", image: "lg-delarship.jpg" },
        { name: "Haier Authorized Dealer", year: "2024–2025", image: "haier-delarship.jpg" },
    ];

    const [currentSlides, setCurrentSlides] = useState(
        branches.map(() => 0)
    );

    const nextSlide = useCallback(
        (index) => {
            setCurrentSlides((prev) => {
                const updated = [...prev];
                updated[index] =
                    (updated[index] + 1) % branches[index].images.length;
                return updated;
            });
        },
        [branches]
    );

    useEffect(() => {
        const timers = branches.map((_, index) =>
            setInterval(() => nextSlide(index), 3000)
        );
        return () => timers.forEach(clearInterval);
    }, [branches, nextSlide]);

    return (
        <div className="store-container">
            <Header />

            <section className="branches-section">
                <h1>Our Branches</h1>

                <div className="branches-list">
                    {branches.map((branch, index) => (
                        <div key={index} className="branch-card">
                            <h2>{branch.name}</h2>
                            <p><strong>Address:</strong> {branch.address}</p>
                            <p><strong>Contact:</strong> {branch.contact}</p>
                            <p><strong>Hours:</strong> {branch.hours}</p>
                            <p>{branch.description}</p>

                            {branch.images?.length > 0 && (
                                <div className="branch-images">
                                    <img
                                        src={branch.images[currentSlides[index]]}
                                        alt={branch.name}
                                        className="slider-image"
                                    />
                                </div>
                            )}

                            <MapComponent position={branch.location} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="awards-container">
                <h1>Our Awards</h1>
                <div className="awards-list">
                    {awards.map((award, index) => (
                        <div key={index} className="award-card">
                            <img src={award.image} alt={award.name} />
                            <h2>{award.name}</h2>
                            <p>{award.year}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="contact-us-section">
                <ContactComponent />
            </section>
        </div>
    );
};

export default StoreComponent;
