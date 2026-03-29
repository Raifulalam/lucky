import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Percent, RefreshCw } from "lucide-react";
import NewYear from "../../Components/Newyear";

const PromoBanner = ({ isNewYear }) => {
    const navigate = useNavigate();

    return (
        <section className="promo-banner">
            {isNewYear ? (
                <NewYear />
            ) : (
                <>
                    <div className="promo-copy">
                        <span className="section-kicker">Current Campaign</span>
                        <h2>Upgrade smarter with seasonal pricing, exchange value, and EMI support.</h2>
                        <p>
                            Make high-value appliance purchases feel more manageable with visible
                            financing routes and promotional buying options.
                        </p>
                        <button className="btn-primary" onClick={() => navigate("/products")}>
                            Shop current offers <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="offers">
                        <Link to="/emi" className="offer">
                            <Percent />
                            <div>
                                <strong>EMI Available</strong>
                                <span>Spread payments across supported product categories.</span>
                            </div>
                        </Link>
                        <Link to="/exchange" className="offer">
                            <RefreshCw />
                            <div>
                                <strong>Exchange Offers</strong>
                                <span>Trade older products and move into newer models faster.</span>
                            </div>
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
};





export default PromoBanner;
