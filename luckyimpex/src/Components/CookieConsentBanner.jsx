import React, { useEffect, useState } from "react";
import { ShieldCheck, Cookie } from "lucide-react";
import { getCookieConsent, setCookieConsent } from "../api/api";
import "./cookieConsent.css";

const CookieConsentBanner = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(!getCookieConsent());
    }, []);

    const handleChoice = (choice) => {
        setCookieConsent(choice);
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <aside className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookie consent">
            <div className="cookie-consent-icon" aria-hidden="true">
                <Cookie size={20} />
            </div>

            <div className="cookie-consent-copy">
                <strong>Cookie preferences</strong>
                <p>
                    We use cookies to keep you signed in, remember your session, and improve your shopping
                    experience.
                </p>
            </div>

            <div className="cookie-consent-actions">
                <button type="button" className="cookie-btn ghost" onClick={() => handleChoice("essential")}>
                    Essential only
                </button>
                <button type="button" className="cookie-btn primary" onClick={() => handleChoice("accepted")}>
                    Accept cookies
                </button>
            </div>

            <div className="cookie-consent-footer">
                <ShieldCheck size={14} />
                <span>You can change this later by clearing your browser storage.</span>
            </div>
        </aside>
    );
};

export default CookieConsentBanner;
