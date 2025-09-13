import React from "react";
import { benefits } from "./Constants";

const WhyChooseUs = () => (
    <section className="why-choose-us">
        <h2>Why Choose Lucky Impex?</h2>
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
