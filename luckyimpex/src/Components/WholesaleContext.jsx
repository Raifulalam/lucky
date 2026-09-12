import React, { createContext, useContext, useState, useEffect } from "react";

const WholesaleContext = createContext();

export const WholesaleProvider = ({ children }) => {
    // Mode: 'retail' (false) or 'wholesale' (true)
    const [isWholesale, setIsWholesale] = useState(() => {
        const saved = localStorage.getItem("lucky_mode");
        return saved === "wholesale";
    });

    // Currency & language preference
    const [currency, setCurrency] = useState("NPR"); // 'NPR' or 'USD'
    const [rfqDrawerOpen, setRfqDrawerOpen] = useState(false);
    const [selectedRfqProduct, setSelectedRfqProduct] = useState(null);

    useEffect(() => {
        localStorage.setItem("lucky_mode", isWholesale ? "wholesale" : "retail");
    }, [isWholesale]);

    const toggleMode = () => setIsWholesale((prev) => !prev);

    const openRfqModal = (product = null) => {
        setSelectedRfqProduct(product);
        setRfqDrawerOpen(true);
    };

    const closeRfqModal = () => {
        setRfqDrawerOpen(false);
        setSelectedRfqProduct(null);
    };

    return (
        <WholesaleContext.Provider
            value={{
                isWholesale,
                setIsWholesale,
                toggleMode,
                currency,
                setCurrency,
                rfqDrawerOpen,
                selectedRfqProduct,
                openRfqModal,
                closeRfqModal,
            }}
        >
            {children}
        </WholesaleContext.Provider>
    );
};

export const useWholesale = () => {
    const context = useContext(WholesaleContext);
    if (!context) {
        return {
            isWholesale: false,
            setIsWholesale: () => {},
            toggleMode: () => {},
            currency: "NPR",
            setCurrency: () => {},
            rfqDrawerOpen: false,
            selectedRfqProduct: null,
            openRfqModal: () => {},
            closeRfqModal: () => {},
        };
    }
    return context;
};
