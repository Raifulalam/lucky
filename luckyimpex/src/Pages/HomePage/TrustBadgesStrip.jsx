import React from "react";
import { CreditCard, ShieldCheck, Store, Truck } from "lucide-react";
import "./TrustBadgesStrip.css";

const TRUST_ITEMS = [
    {
        icon: <ShieldCheck size={26} className="trust-icon text-amber" />,
        title: "100% Authorized Warranty",
        description: "Official manufacturer warranty on all major brands",
    },
    {
        icon: <Store size={26} className="trust-icon text-amber" />,
        title: "Live Showroom Pickup",
        description: "Test before purchase at Ghantaghar Link Road, Birgunj",
    },
    {
        icon: <CreditCard size={26} className="trust-icon text-amber" />,
        title: "Easy EMI & Installments",
        description: "Flexible financing & bank installment approvals",
    },
    {
        icon: <Truck size={26} className="trust-icon text-amber" />,
        title: "Fast Home Delivery",
        description: "Safe doorstep dispatch across Birgunj & all Nepal",
    },
];

const TrustBadgesStrip = () => {
    return (
        <section className="trust-strip-section" aria-label="Store guarantees and trust badges">
            <div className="trust-strip-inner">
                <div className="trust-strip-scrollable">
                    {TRUST_ITEMS.map((item, index) => (
                        <div key={index} className="trust-card-item">
                            <div className="trust-icon-box">
                                {item.icon}
                            </div>
                            <div className="trust-text-box">
                                <h4 className="trust-title">{item.title}</h4>
                                <p className="trust-desc">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBadgesStrip;
