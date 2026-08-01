import React, { useState } from "react";
import "./ContactComponent.css";
import {
    FaFacebook,
    FaInstagram,
    FaWhatsapp,
    FaYoutube,
} from "react-icons/fa";

import { BASE_URL } from "../../api/api";
import PageSeo from "../../Components/PageSeo";
import Breadcrumbs from "../../Components/Breadcrumbs";
import { SITE_CONFIG } from "../../seo/siteConfig";

export const ContactComponent = ({ embedded = false }) => {
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
                `${BASE_URL}/contact/contact`,
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
            {!embedded && (
                <>
                    <PageSeo
                        title="Contact Lucky Impex | AC, LED TV & Appliances in Birgunj"
                        description="Contact Lucky Impex in Birgunj for Air Conditioners, Refrigerators, LED TVs, Washing Machines and home appliances."
                        canonicalPath="/contact"
                        localBusiness
                        breadcrumbs={[
                            { label: "Home", to: "/" },
                            { label: "Contact" },
                        ]}
                    />
                    <Breadcrumbs items={[
                        { label: "Home", to: "/" },
                        { label: "Contact" },
                    ]} />
                </>
            )}

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
                        <li><strong>Email:</strong> {SITE_CONFIG.supportEmail}</li>
                        <li><strong>Phone:</strong> {SITE_CONFIG.phone}</li>
                        <li><strong>Address:</strong> {SITE_CONFIG.address.streetAddress}, {SITE_CONFIG.address.addressLocality}, Nepal</li>
                        <li><strong>Hours:</strong> 10:00 AM – 8:00 PM (Sun–Sat)</li>
                    </ul>

                    {/* WhatsApp Direct Button */}
                    <a
                        href={SITE_CONFIG.whatsapp}
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
                    <a href={SITE_CONFIG.socialLinks[0]} target="_blank" rel="noopener noreferrer">
                        <FaFacebook />
                    </a>
                    <a href={SITE_CONFIG.socialLinks[1]} target="_blank" rel="noopener noreferrer">
                        <FaInstagram />
                    </a>
                    <a href={SITE_CONFIG.socialLinks[2]} target="_blank" rel="noopener noreferrer">
                        <FaYoutube />
                    </a>
                </div>
            </div>
        </div>
    );
};
