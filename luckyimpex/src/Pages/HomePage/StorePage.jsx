import React, { useEffect, useState } from 'react';
import MapComponent from '../../Components/Leaflet'; // Assuming this is the map component
import './StoreComponent.css'; // Add this CSS file for styling
// import { useNavigate } from 'react-router-dom';
import { ContactComponent } from '../Contact/Contact';
import Header from '../../Components/Header';

const StoreComponent = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    // const navigaet = useNavigate();
    // const handleNavigate = (path) => {
    //     navigaet(path);
    // }

    const branches = [
        {
            name: "Lucky Impex Birgunj (Main)",
            location: [27.0138387, 84.8803044],
            contact: "Phone: +977-9807286786, Tel: 051531789, Email: luckyimpex4u@gmail.com",
            address: "Link Road Ghantaghar, Birgunj, Nepal",
            hours: "Sun-Fri: 10:00 AM - 8:00 PM, Sat: 10:AM - 3:00 PM",
            description: "Our flagship branch located in the heart of Birgunj offering a wide range of Electronics products.",
            images: ["lucky1.jpg", "guest6.jpg", "lucky2.jpg", "lucky3.jpg"],

        },
        {
            name: "Lucky Impex Birgunj",
            location: [27.01211, 84.8770902],
            contact: "Phone: +977-9807216321, Email: luckyimpexmainroad@gmial.com",
            address: "Main Road Maisthan, Birguj, Nepal",
            hours: "Sun-Fri: 10:00 AM - 8:00 PM, Sat: 10:AM - 3:00 PM",
            description: "Our flagship branch located in the heart of Birgunj offering a wide range of Electronics products.",
            images: ["lucky3.jpg", "lucky4.jpg"],

        },
        {
            name: "Lucky Impex Simra",
            location: [27.161434, 84.975124],
            contact: "Phone: +977-9810818276, Email: luckyimpexsimra@gmial.com",
            address: "Simra Main Road (infront of Surya Nepal Udhyog), Nepal",
            hours: "Sun-Fri: 10:00 AM - 8:00 PM, Sat: 10:AM - 3:00 PM",
            description: "Our flagship branch located in the heart of Birgunj offering a wide range of Electronics products.",
            images: ["guest5.jpg", "lucky5.jpg"],

        }
    ];

    const awards = [
        {
            name: "The Consistent Performer of Samsung ",
            year: "FY 2023/24",
            image: "samsung-award.jpg",
        },
        {
            name: "The Rising Star award of Samsung ",
            year: "FY 2023/24",
            image: "/samsung-award2.jpg",

        },
        {
            name: "Samsung Delarship Certificate",
            year: "2024-2026",
            image: "/samsung-delarship.jpg",

        },
        {
            name: "Authorized Delarship Certificate of Lomus Degital pvt.ltd",
            year: "2024",
            image: "/whirlpool-certificate.jpg",

        },
        {
            name: "LG Delarship Certificate ",
            year: "2023-2026",
            image: "/lg-delarship.jpg",

        },
        {
            name: "Best Customer Service in Birgunj",
            year: "2021",
            image: "/hitachi-delarship.jpg",

        },
        {
            name: "Haier Authorized Delarship",
            year: "2024-2025",
            image: "/haier-delarship.jpg",

        },
        {
            name: "Yasuda Authorized Destributor",
            year: "2024-2026",
            image: "/yasuda-distributor.jpg",

        }

    ]

    const NextSlide = (branchIndex) => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % branches[branchIndex].images.length);
    };

    useEffect(() => {
        // Set intervals for each branch image carousel
        const intervalIds = branches.map((branch, index) =>
            setInterval(() => NextSlide(index), 3000)
        );
        return () => intervalIds.forEach(clearInterval); // Cleanup on unmount
    }, [NextSlide, branches]);

    return (
        <div className="store-container">
            <Header />
            {/* <div className="promotion-container">
                <div className="promotion">
                    <h2>10000+</h2>
                    <p>Satisfied Customers</p>


                </div>
                <div className="promotion">
                    <h2>3</h2>
                    <p>Branches </p>


                </div>
                <div className="promotion">
                    <h2>100+</h2>
                    <p>Awards & Certifications</p>


                </div>
                <div className="promotion">
                    <h2>15+</h2>
                    <p>Authorized Delarships</p>


                </div>
            </div> */}

            <div className="main-branch">



                <section className="branches-section">
                    <h1>Our Branches</h1>
                    <div className="branches-list">
                        {branches.map((branch, branchIndex) => (
                            <div key={branchIndex} className="branch-card">
                                <h2>{branch.name}</h2>
                                <p><strong>Address:</strong> {branch.address}</p>
                                <p><strong>Contact:</strong> {branch.contact}</p>
                                <p><strong>Hours:</strong> {branch.hours}</p>
                                <p>{branch.description}</p>


                                {/* Display images for the branch */}
                                <div className="branch-images">
                                    {branch.images && branch.images.length > 0 ? (
                                        <div className="slides">
                                            <img
                                                src={branch.images[currentSlide]} // Correct usage of currentSlide for each branch
                                                alt={`Branch ${branch.name} Slide ${currentSlide + 1}`}
                                                className="slider-image"
                                            />
                                        </div>
                                    ) : (
                                        <p>No images available.</p>
                                    )}
                                </div>

                                <MapComponent position={branch.location} />
                            </div>
                        ))}
                    </div>
                </section>
                <div className="awards-container">
                    <h1>Our Awards</h1>
                    <div className="awards-list">
                        {awards.map((award, awardIndex) => (
                            <div key={awardIndex} className="award-card">
                                <img src={award.image} alt="award" />
                                <h2>{award.name}</h2>
                                <p>{award.year}</p>
                            </div>
                        ))}
                    </div>
                </div>


                <section className="contact-us-section">
                    <ContactComponent />
                </section>
            </div>
        </div>
    );
};

export default StoreComponent;
