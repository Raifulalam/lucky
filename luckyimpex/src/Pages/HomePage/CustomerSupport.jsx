import React from "react";
import { ArrowRight, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerSupport = () => {
    const navigate = useNavigate();

    return (
        <section className="customer-support">
            <div className="customer-support-card">
                <div className="customer-support-copy">
                    <span className="section-kicker">Customer Support</span>
                    <h2>Need help choosing the right product?</h2>
                    <p>
                        Speak with the Lucky Impex team for product guidance, store information,
                        order support, and appliance recommendations.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => navigate("/contact")} aria-label="Contact customer support">
                    <PhoneCall size={18} /> Contact Us <ArrowRight size={18} />
                </button>
            </div>
        </section>
    );
};

export default CustomerSupport;
