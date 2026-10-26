import React from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import MobileActionBar from "../../Components/MobileActionBar";
import PageSeo from "../../Components/PageSeo";
import Breadcrumbs from "../../Components/Breadcrumbs";
import { WholesaleProvider } from "../../Components/WholesaleContext";
import WholesaleRFQBanner from "../HomePage/WholesaleRFQBanner";
import "./InfoPages.css";

const WHATSAPP = "https://wa.me/9779802594022?text=Hello%20Lucky%20Impex%2C%20I%20need%20a%20wholesale%20quotation.";

const Wholesale = () => (
    <>
        <PageSeo
            title="Wholesale Electronics & Home Appliances in Birgunj, Nepal | Lucky Impex"
            description="Request a wholesale quotation from Lucky Impex, Birgunj for home appliances and electronics. Tell us the models and quantities and we will reply with rates."
            canonicalPath="/wholesale"
            localBusiness
            breadcrumbs={[{ label: "Home", to: "/" }, { label: "Wholesale", to: "/wholesale" }]}
        />
        <Header />
        <main className="info-page">
            <div className="info-page__inner">
                <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wholesale" }]} />
                <h1>Wholesale electronics and home appliances in Birgunj</h1>
                <p className="info-page__lead">
                    Lucky Impex supplies shops, contractors and businesses as well as individual customers. Wholesale
                    rates depend on the model and the quantity, so we quote each order directly.
                </p>

                <div className="info-card">
                    <h2>How to request a quotation</h2>
                    <ol>
                        <li>List the products or <Link to="/products">catalogue</Link> models you need and the quantity of each.</li>
                        <li>Send the form below, or message us on WhatsApp.</li>
                        <li>Our team replies with rates and availability.</li>
                    </ol>
                    <div className="info-actions">
                        <a className="info-btn" href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp +977 9802594022</a>
                        <a className="info-btn info-btn--alt" href="tel:+977051531789">Call 051-531789</a>
                    </div>
                </div>

                <h2>Visit or contact us</h2>
                <p>
                    Ghantaghar Link Road, Birgunj, Madhesh Province, Nepal. Open Sunday to Friday 10:00 AM to 8:00 PM and
                    Saturday 10:00 AM to 3:00 PM. Email <a href="mailto:luckyimpex4u@gmail.com">luckyimpex4u@gmail.com</a>.
                    See our <Link to="/store">showroom page</Link> for all branches.
                </p>
                <p className="info-note">
                    Minimum order quantities, payment terms and delivery charges are confirmed in each quotation.
                </p>
            </div>
            <WholesaleProvider>
                <WholesaleRFQBanner />
            </WholesaleProvider>
        </main>
        <Footer />
        <MobileActionBar />
    </>
);

export default Wholesale;
