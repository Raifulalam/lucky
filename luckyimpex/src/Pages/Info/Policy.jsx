import React from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import MobileActionBar from "../../Components/MobileActionBar";
import PageSeo from "../../Components/PageSeo";
import Breadcrumbs from "../../Components/Breadcrumbs";
import "./InfoPages.css";

/**
 * These pages state only what is already true of the business (locations, hours, contact) and send
 * customers to the team for specific terms. TERMS_CONFIRMED stays false (page is noindex) until the
 * owner supplies the real policy wording; then replace the `summary` text and flip the flag.
 */
const TERMS_CONFIRMED = false;

const POLICIES = {
    delivery: {
        path: "/delivery-policy",
        title: "Delivery Information",
        summary: "We sell from our showroom in Birgunj. Delivery options, charges and timing depend on the product and your location, so we confirm them with you when you place an order.",
        points: [
            "Call 051-531789 or WhatsApp +977 9802594022 with your product and delivery location.",
            "We will confirm delivery availability, charges and expected timing before you pay.",
            "You can also collect your order from the showroom on Ghantaghar Link Road, Birgunj.",
        ],
    },
    return: {
        path: "/return-policy",
        title: "Return Policy",
        summary: "If there is a problem with a product you bought from us, contact us as soon as possible and keep your bill and the original packaging.",
        points: [
            "Bring or send us the bill, product and packaging.",
            "Our team will tell you what can be done for your specific product and situation.",
            "Reach us on 051-531789 or WhatsApp +977 9802594022.",
        ],
    },
    warranty: {
        path: "/warranty-policy",
        title: "Warranty Information",
        summary: "Warranty coverage depends on the brand and the model. Keep your bill, as the manufacturer's warranty terms for your product apply.",
        points: [
            "Ask us for the warranty terms of the exact model before you buy.",
            "For repairs, see our service page or contact the showroom with your bill.",
            "Reach us on 051-531789 or WhatsApp +977 9802594022.",
        ],
    },
};

const Policy = ({ kind }) => {
    const policy = POLICIES[kind];
    return (
        <>
            <PageSeo
                title={`${policy.title} | Lucky Impex Birgunj`}
                description={policy.summary}
                canonicalPath={policy.path}
                noIndex={!TERMS_CONFIRMED}
                breadcrumbs={[{ label: "Home", to: "/" }, { label: policy.title, to: policy.path }]}
            />
            <Header />
            <main className="info-page">
                <div className="info-page__inner">
                    <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: policy.title }]} />
                    <h1>{policy.title}</h1>
                    <p className="info-page__lead">{policy.summary}</p>
                    <div className="info-card">
                        <ul>{policy.points.map((point) => <li key={point}>{point}</li>)}</ul>
                    </div>
                    <p>
                        Lucky Impex, Ghantaghar Link Road, Birgunj. Open Sunday to Friday 10:00 AM to 8:00 PM, Saturday
                        10:00 AM to 3:00 PM. <Link to="/contact">Contact us</Link> or <Link to="/service">visit our service page</Link>.
                    </p>
                </div>
            </main>
            <Footer />
            <MobileActionBar />
        </>
    );
};

export default Policy;
