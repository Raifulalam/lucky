import React, { useState } from "react";
import "./ContactComponent.css";
import { Helmet } from "react-helmet";
import {
    FaFacebook,
    FaInstagram,
    FaWhatsapp,
    FaYoutube,
} from "react-icons/fa";

export const ContactComponent = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        productInterest: "",
        message: "",
        website: "", // honeypot
    });

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const validateForm = () => {
        if (formData.website) return "Spam detected.";

        if (formData.name.trim().length < 3) {
            return "Name must be at least 3 characters.";
        }

        const emailRegex =
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if (!emailRegex.test(formData.email)) {
            return "Please enter a valid email address.";
        }

        if (!formData.productInterest) {
            return "Please select a product interest.";
        }

        if (formData.message.trim().length < 10) {
            return "Message must be at least 10 characters.";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            setStatus(error);
            return;
        }

        setLoading(true);
        setStatus("");

        try {
            const response = await fetch(
                `https://lucky-1-6ma5.onrender.com/api/contact/contact`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) throw new Error("Server Error");

            setStatus("success");
            setFormData({
                name: "",
                email: "",
                productInterest: "",
                message: "",
                website: "",
            });
        } catch (error) {
            setStatus("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact">

            {/* ================= SEO ================= */}
            <Helmet>
                <title>
                    Contact Lucky Impex | AC, LED TV & Appliances in Birgunj
                </title>

                <meta
                    name="description"
                    content="Contact Lucky Impex in Birgunj for Air Conditioners, Refrigerators, LED TVs, Washing Machines and home appliances. Call 051531789 or WhatsApp us today."
                />

                <meta
                    name="keywords"
                    content="Lucky Impex Birgunj, electronics shop Nepal, AC store Birgunj, LED TV Nepal"
                />

                <meta name="author" content="Lucky Impex" />

                <meta property="og:title" content="Contact Lucky Impex - Birgunj" />
                <meta
                    property="og:description"
                    content="Visit Lucky Impex for premium electronics and appliances in Birgunj."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://luckyimpex.vercel.app/contact" />

                <meta name="twitter:card" content="summary_large_image" />

                <link rel="canonical" href="https://luckyimpex.vercel.app/contact" />
            </Helmet>

            {/* ================= HEADER ================= */}
            <div className="contact-header">
                <h1>Contact Lucky Impex – Electronics Store in Birgunj</h1>
                <p>
                    Have questions about AC, Refrigerators, LED TVs or other
                    electronics? Get in touch with us today.
                </p>
            </div>

            {/* ================= MAIN SECTION ================= */}
            <div className="contact-container">

                {/* LEFT SIDE INFO */}
                <div className="contact-left">
                    <h2>Get in Touch</h2>
                    <ul>
                        <li><strong>Email:</strong> luckyimpex4u@gmail.com</li>
                        <li><strong>Phone:</strong> 051531789</li>
                        <li><strong>Address:</strong> Ghantaghar Link Road, Birgunj, Nepal</li>
                        <li><strong>Hours:</strong> 10:00 AM – 8:00 PM (Sun–Sat)</li>
                    </ul>

                    {/* WhatsApp Direct Button */}
                    <a
                        href="https://wa.me/9779809278236"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-button"
                    >
                        <FaWhatsapp /> Chat on WhatsApp
                    </a>

                    {/* Google Map */}
                    <div className="map-container">
                        <iframe
                            title="Lucky Impex Location"
                            src="https://www.google.com/maps?q=Ghantaghar+Birgunj+Nepal&output=embed"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>

                {/* RIGHT SIDE FORM */}
                <div className="contact-right">
                    <form onSubmit={handleSubmit}>

                        {/* Honeypot */}
                        <input
                            type="text"
                            id="website"
                            value={formData.website}
                            onChange={handleChange}
                            style={{ display: "none" }}
                        />

                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Product Interest</label>
                            <select
                                id="productInterest"
                                value={formData.productInterest}
                                onChange={handleChange}
                            >
                                <option value="">Select Product</option>
                                <option>Air Conditioner</option>
                                <option>Refrigerator</option>
                                <option>LED TV</option>
                                <option>Washing Machine</option>
                                <option>Kitchen Appliances</option>
                                <option>Home Theater</option>
                                <option>Air Cooler</option>
                                <option>Chest Freezer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                id="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Message"}
                        </button>

                        {status && status !== "success" && (
                            <div className="error-msg">{status}</div>
                        )}

                        {status === "success" && (
                            <div className="success-msg">
                                ✅ Message sent successfully!
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* ================= SOCIAL ================= */}
            <div className="social-media">
                <h3>Follow Lucky Impex</h3>
                <div className="social-icons">
                    <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
                        <FaFacebook />
                    </a>
                    <a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer">
                        <FaInstagram />
                    </a>
                    <a href="https://youtube.com/yourchannel" target="_blank" rel="noopener noreferrer">
                        <FaYoutube />
                    </a>
                </div>
            </div>

            {/* ================= STRUCTURED DATA ================= */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ElectronicsStore",
                    name: "Lucky Impex",
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: "Ghantaghar Link Road",
                        addressLocality: "Birgunj",
                        addressCountry: "NP"
                    },
                    telephone: "051531789",
                    email: "luckyimpex4u@gmail.com",
                    sameAs: [
                        "https://www.facebook.com/luckyimpex4u/",
                        "https://instagram.com/yourpage",
                        "https://youtube.com/yourchannel"
                    ]
                })}
            </script>

        </div>
    );
};
