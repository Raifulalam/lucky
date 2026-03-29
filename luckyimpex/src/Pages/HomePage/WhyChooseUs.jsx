import React from "react";
import { benefits } from "./Constants";

const WhyChooseUs = () => (
    <section className="why-choose-us">
        <div className="section-heading">
            <span className="section-kicker">Why Lucky Impex</span>
            <h2>Reasons customers choose us</h2>
            <p>Clear value signals matter on a production storefront. These are the trust markers customers look for.</p>
        </div>
        <div className="benefits-grid">
            {benefits.map((b, idx) => (
                <div key={idx} className="benefit">
                    {b.icon}
                    <h4>{b.title}</h4>
                    <p>{b.text}</p>
                </div>
            ))}
        </div>
    </section>
);

export default WhyChooseUs;
