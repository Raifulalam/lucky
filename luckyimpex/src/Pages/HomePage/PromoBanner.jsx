import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Percent, RefreshCw } from "lucide-react";
import NewYear from "../../Components/Newyear";

const PromoBanner = ({ isNewYear }) => {
    const navigate = useNavigate();

    return (
        <section className="promo-banner">
            {isNewYear ? (
                <NewYear />
            ) : (
                <>
                    <h2>🔥 Flash Sale: 20% OFF on all electronics!</h2>
                    <p>Get the best deals on top brands. Limited Time Offer.</p>
                    <button className="btn-primary" onClick={() => navigate("/products")}>Shop Now</button>
                    <div className="offers">
                        <Link to="/emi" className="offer"><Percent /> EMI Available</Link>
                        <Link to="/exchange" className="offer"><RefreshCw /> Exchange Offers</Link>
                    </div>
                </>
            )}
        </section>
    );
};

export default PromoBanner;
