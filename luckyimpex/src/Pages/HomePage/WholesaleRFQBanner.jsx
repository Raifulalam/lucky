import React, { useState, useEffect } from "react";
import {
    Building2,
    CheckCircle2,
    Clock,
    FileSpreadsheet,

    PhoneCall,


    Truck
} from "lucide-react";
import { useWholesale } from "../../Components/WholesaleContext";
import "./WholesaleRFQBanner.css";

const CATEGORY_OPTIONS = [
    "Air Conditioners (Split & Inverter)",
    "Refrigerators (Single & Double Door)",
    "Washing Machines (Front & Top Load)",
    "Smart LED TVs (32\" - 85\")",
    "Commercial Freezers & Coolers",
    "Kitchen & Small Home Appliances",
    "Full Store Assorted Stock Container",
];

const WholesaleRFQBanner = () => {
    const { selectedRfqProduct, rfqDrawerOpen, closeRfqModal } = useWholesale();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [category, setCategory] = useState("Air Conditioners (Split & Inverter)");
    const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success'

    useEffect(() => {
        if (selectedRfqProduct) {
            setCategory(selectedRfqProduct.category || "Air Conditioners (Split & Inverter)");
        }
    }, [selectedRfqProduct]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fullName.trim() || !phone.trim()) {
            alert("Please fill in both your business name and contact number.");
            return;
        }

        setStatus("submitting");

        setTimeout(() => {
            setStatus("success");
            // Auto format WhatsApp message for immediate callback if wanted
            const message = `Hello Lucky Impex B2B Desk! I am requesting a wholesale dealer callback.\n\nName/Business: ${fullName}\nContact: ${phone}\nInterested In: ${category}${selectedRfqProduct ? `\nModel: ${selectedRfqProduct.title}` : ""
                }`;

            // Optional direct WhatsApp ping
            window.open(
                `https://wa.me/9779809278236?text=${encodeURIComponent(message)}`,
                "_blank"
            );
        }, 900);
    };

    return (
        <section className="wholesale-rfq-section" id="wholesale-rfq" aria-label="B2B dealer request quote form">
            <div className="wholesale-rfq-inner">
                {/* Visual Left Pitch */}
                <div className="rfq-pitch-column">
                    <div className="rfq-badge-row">
                        <span className="rfq-kicker-pill">
                            <Building2 size={14} /> Official B2B Dealer Portal
                        </span>
                        <span className="rfq-city-badge">Nepal & Madhesh Province</span>
                    </div>

                    <h2 className="rfq-title">
                        Wholesale & Dealer Program: Partner with luckyimpex4u
                    </h2>

                    <p className="rfq-description">
                        Are you an electronics retailer, home appliance showroom owner, or institutional buyer in Nepal? Get direct container pricing, authorized brand warranties, official VAT billing, and priority freight logistics.
                    </p>

                    <div className="rfq-benefits-list">
                        <div className="rfq-benefit-item">
                            <span className="benefit-icon"><FileSpreadsheet size={18} /></span>
                            <div>
                                <strong>Tiered Volume Quotes</strong>
                                <span>Official price sheets updated weekly for verified dealers</span>
                            </div>
                        </div>

                        <div className="rfq-benefit-item">
                            <span className="benefit-icon"><Truck size={18} /></span>
                            <div>
                                <strong>Fast Dispatch from Birgunj Hub</strong>
                                <span>Centrally located distribution directly on Link Road Ghantaghar</span>
                            </div>
                        </div>

                        <div className="rfq-benefit-item">
                            <span className="benefit-icon"><Clock size={18} /></span>
                            <div>
                                <strong>15-Minute Response Guaranteed</strong>
                                <span>Direct connect with our wholesale account managers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* High-Contrast Quick Form */}
                <div className="rfq-form-card">
                    <div className="form-card-header">
                        <span className="form-header-badge">Fast 3-Field Request</span>
                        <h3 className="form-card-title">Request Wholesale Callback</h3>
                        <p className="form-card-sub">
                            {selectedRfqProduct
                                ? `Inquiring for: ${selectedRfqProduct.title}`
                                : "Submit your details & receive instant dealer discounts."}
                        </p>
                    </div>

                    {status === "success" ? (
                        <div className="rfq-success-message">
                            <CheckCircle2 size={48} className="success-icon" />
                            <h4>Callback Request Dispatched!</h4>
                            <p>
                                Thank you, <strong>{fullName}</strong>. Our Birgunj wholesale distribution desk will contact you at <strong>{phone}</strong> within 15 minutes.
                            </p>
                            <button
                                type="button"
                                className="reset-rfq-btn"
                                onClick={() => {
                                    setStatus("idle");
                                    setFullName("");
                                    setPhone("");
                                    if (rfqDrawerOpen) closeRfqModal();
                                }}
                            >
                                Submit Another Inquiry
                            </button>
                        </div>
                    ) : (
                        <form className="rfq-interactive-form" onSubmit={handleSubmit}>
                            {/* Field 1: Name / Business Name */}
                            <div className="form-field-group">
                                <label htmlFor="rfq-name" className="field-label">
                                    Full Name / Business Name *
                                </label>
                                <input
                                    id="rfq-name"
                                    type="text"
                                    required
                                    placeholder="e.g. Birgunj Electronics Pvt. Ltd."
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="field-input"
                                />
                            </div>

                            {/* Field 2: Mobile / WhatsApp */}
                            <div className="form-field-group">
                                <label htmlFor="rfq-phone" className="field-label">
                                    Mobile / WhatsApp Number *
                                </label>
                                <input
                                    id="rfq-phone"
                                    type="tel"
                                    required
                                    placeholder="e.g. 9807286786 / 9809278236"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="field-input"
                                />
                            </div>

                            {/* Field 3: Product Category Dropdown */}
                            <div className="form-field-group">
                                <label htmlFor="rfq-category" className="field-label">
                                    Primary Product Category *
                                </label>
                                <select
                                    id="rfq-category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="field-select"
                                >
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="rfq-submit-button"
                                disabled={status === "submitting"}
                            >
                                {status === "submitting" ? (
                                    <span>Sending Inquiry...</span>
                                ) : (
                                    <>
                                        <PhoneCall size={18} />
                                        <span>Request Wholesale Callback</span>
                                    </>
                                )}
                            </button>

                            <div className="form-disclaimer">
                                <span>🔒 100% Confidential. No spam. Direct wholesale sales team callback.</span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default WholesaleRFQBanner;
