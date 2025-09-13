import React from "react";
import { PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerSupport = () => {
    const navigate = useNavigate();

    return (
        <section className="customer-support">
            <h2>Need Help?</h2>
            <p>Our customer service is here for you 24/7.</p>
            <button className="btn-primary" onClick={() => navigate("/contact")} aria-label="Contact customer support">
                <PhoneCall /> Contact Us
            </button>
        </section>
    );
};

export default CustomerSupport;
