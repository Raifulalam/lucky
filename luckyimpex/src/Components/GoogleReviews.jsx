
import React, { useEffect } from "react";

const GoogleReviews = () => {
    useEffect(() => {
        const scriptId = "sociablekit-google-reviews-script";

        // Prevent loading the script multiple times
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");

            script.id = scriptId;
            script.src =
                "https://widgets.sociablekit.com/google-reviews/widget.js";

            script.async = true;
            script.defer = true;

            document.body.appendChild(script);
        }
    }, []);

    return (
        <section className="google-reviews-wrapper">

            <div className="google-reviews-heading">
                <div className="google-icon">G</div>

                <div>
                    <h2>Customer Reviews</h2>
                    <p>
                        What our customers say about Lucky Impex
                    </p>
                </div>
            </div>

            {/* SociableKIT Google Reviews */}
            <div
                className="sk-ww-google-reviews"
                data-embed-id="25709454"
            ></div>

        </section>
    );
};

export default GoogleReviews;

