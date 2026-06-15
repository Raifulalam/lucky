import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PromoModal.css";

const PromoModal = ({ open, onClose }) => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        interest: ""
    });

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const { name, phone, interest } = form;

        const message = `
🏗️ *New Branch Pre-Booking Request*

👤 Name: ${name}
📞 Phone: ${phone}
🛍️ Interest: ${interest || "Not specified"}

Please contact me for early offers and launch updates.
`;

        const encodedMessage = encodeURIComponent(message);

        const whatsappNumber = "9779809278236"; // your WhatsApp number

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // open WhatsApp
        window.open(whatsappURL, "_blank");

        setSubmitted(true);

        setTimeout(() => {
            onClose();
        }, 1500);
    };

    if (!open) return null;

    return (
        <div className="promo-overlay" onClick={onClose}>
            <div className="promo-modal" onClick={(e) => e.stopPropagation()}>

                <button className="close-btn" onClick={onClose}>✕</button>

                <h2>🏗️ New Branch Coming Soon</h2>

                <p>
                    We are expanding! Pre-book your interest and get early offers,
                    launch discounts, and priority service.
                </p>

                <img
                    src="/commingsoon.webp"
                    alt="New branch coming soon"
                    className="promo-image"
                />

                {!submitted ? (
                    <form className="prebook-form" onSubmit={handleSubmit}>

                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="interest"
                            placeholder="What products are you interested in?"
                            value={form.interest}
                            onChange={handleChange}
                        />

                        <button type="submit" className="cta-btn">
                            Pre-Book Interest
                        </button>
                    </form>
                ) : (
                    <div className="success-msg">
                        🎉 Thanks! We will contact you soon.
                    </div>
                )}

                <button
                    className="secondary-btn"
                    onClick={() => {
                        onClose();
                        navigate("/products");
                    }}
                >
                    Explore Products Instead
                </button>
            </div>
        </div>
    );
};

export default PromoModal;