import React, { useState, useEffect } from 'react';
import './Exchange.css';
import { BASE_URL } from "../../api/api";
import { useNotification } from "../../Components/NotificationContext";
import { 
  
   
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft, 
    Search, 
    Tv, 
    IceCream, 
    Wind, 
    Sparkles, 
    AlertTriangle, 
} from "lucide-react";

// Categories catalog for trade-in
const OLD_CATEGORIES = [
    { id: 'TV', label: 'LED Television', icon: <Tv size={24} />, baseVal: 12000 },
    { id: 'Refrigerator', label: 'Refrigerator', icon: <IceCream size={24} />, baseVal: 14000 },
    { id: 'AC', label: 'Air Conditioner', icon: <Wind size={24} />, baseVal: 16000 },
    { id: 'WashingMachine', label: 'Washing Machine', icon: <Sparkles size={24} />, baseVal: 10000 },
    { id: 'ChestFreezer', label: 'Chest Freezer', icon: <IceCream size={24} />, baseVal: 12000 }
];

// Mapping frontend old categories to backend categories
const NEW_CATEGORY_MAP = {
    'TV': 'LEDTelevisions',
    'Refrigerator': 'Refrigerators',
    'AC': 'AirConditioners',
    'WashingMachine': 'WashingMachines',
    'ChestFreezer': 'ChestFreezer'
};

const BRANDS = ['Samsung', 'LG', 'Whirlpool', 'Haier', 'CG', 'Videocon', 'Skyworth', 'Symphony', 'Bajaj'];

export default function Exchange() {
    const { addNotification } = useNotification();

    // Wizard Navigation State
    const [currentStep, setCurrentStep] = useState(1); // 1 to 4

    // Step 1 State: Old Device Category & Brand
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    // Step 2 State: Condition Assessment
    const [conditionTier, setConditionTier] = useState('good'); // flawless, good, average, broken
    const [isWorking, setIsWorking] = useState('yes'); // yes, no
    const [hasDamages, setHasDamages] = useState('no'); // yes, no
    const [isClean, setIsClean] = useState('yes'); // yes, no
    const [hasAccessories, setHasAccessories] = useState('yes'); // yes, no
    const [deviceAge, setDeviceAge] = useState(2); // years
    const [notes, setNotes] = useState('');
    const [exchangeValue, setExchangeValue] = useState(0);

    // Step 3 State: Select New Upgrade Product
    const [newProducts, setNewProducts] = useState([]);
    const [loadingNewProducts, setLoadingNewProducts] = useState(false);
    const [selectedNewProduct, setSelectedNewProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Step 4 State: Booking Details
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        slot: 'morning' // morning, afternoon, evening
    });
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderRef, setOrderRef] = useState('');

    // Compute Exchange Value in real-time
    useEffect(() => {
        if (!selectedCategory) {
            setExchangeValue(0);
            return;
        }

        const catData = OLD_CATEGORIES.find(c => c.id === selectedCategory);
        if (!catData) return;

        let value = catData.baseVal;

        // Apply Brand Multiplier
        if (selectedBrand === 'Samsung' || selectedBrand === 'LG') {
            value *= 1.1; // 10% premium brand boost
        } else if (selectedBrand === 'Whirlpool' || selectedBrand === 'Haier') {
            value *= 1.05; // 5% boost
        }

        // Apply Age Depreciation (-10% per year, max 70% reduction)
        const ageFactor = Math.min(0.7, deviceAge * 0.1);
        value *= (1 - ageFactor);

        // Apply Condition Multiplier
        let condMultiplier = 1.0;
        if (conditionTier === 'flawless') condMultiplier = 1.0;
        else if (conditionTier === 'good') condMultiplier = 0.85;
        else if (conditionTier === 'average') condMultiplier = 0.6;
        else if (conditionTier === 'broken') condMultiplier = 0.15;
        value *= condMultiplier;

        // Questionnaire Deductions
        if (isWorking === 'no') value *= 0.5; // major hit
        if (hasDamages === 'yes') value *= 0.85; // 15% reduction
        if (isClean === 'no') value *= 0.95; // 5% reduction
        if (hasAccessories === 'no') value *= 0.85; // 15% reduction

        // Round and set floor value of Rs. 500
        const finalValue = Math.max(500, Math.round(value));
        setExchangeValue(finalValue);
    }, [selectedCategory, selectedBrand, conditionTier, isWorking, hasDamages, isClean, hasAccessories, deviceAge]);

    // Fetch New Products for Step 3 (Category mapped to Old selected category)
    useEffect(() => {
        if (!selectedCategory || currentStep !== 3) return;

        const fetchNewProducts = async () => {
            setLoadingNewProducts(true);
            try {
                const newCategory = NEW_CATEGORY_MAP[selectedCategory] || 'LEDTelevisions';
                const url = `${BASE_URL}/products/products?category=${newCategory}&limit=100`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (response.ok) {
                    const list = Array.isArray(data.products) ? data.products : [];
                    setNewProducts(list);
                } else {
                    console.error("Failed to fetch new upgrade products");
                }
            } catch (err) {
                console.error("Error fetching upgrade products:", err);
            } finally {
                setLoadingNewProducts(false);
            }
        };

        fetchNewProducts();
    }, [selectedCategory, currentStep]);

    // Filter upgrade products by search query
    const filteredNewProducts = newProducts.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Validation checks for next step transitions
    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!selectedCategory || !selectedBrand) {
                addNotification({
                    title: "Selection Needed",
                    message: "Please choose your old product category and brand to proceed.",
                    type: "warning",
                    container: "top-right",
                    dismiss: { duration: 3000 }
                });
                return;
            }
        } else if (currentStep === 3) {
            if (!selectedNewProduct) {
                addNotification({
                    title: "Product Needed",
                    message: "Please select the product you want to upgrade to.",
                    type: "warning",
                    container: "top-right",
                    dismiss: { duration: 3000 }
                });
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    // Submit booking request
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.address) {
            addNotification({
                title: "Validation Error",
                message: "Please fill in your name, contact phone, and pickup address.",
                type: "warning",
                container: "top-right",
                dismiss: { duration: 3000 }
            });
            return;
        }

        setSubmittingOrder(true);
        try {
            const ref = `EXC-${Math.floor(100000 + Math.random() * 900000)}`;
            const newProductPrice = Number(selectedNewProduct.price || selectedNewProduct.mrp || 0);
            const netPayable = Math.max(0, newProductPrice - exchangeValue);

            const payload = {
                name: formData.name,
                email: 'exchange@luckyimpex.com', // fallback system tag
                message: `=== NEW EXCHANGE & UPGRADE ORDER ===
Order Reference: ${ref}

Customer Details:
Name: ${formData.name}
Phone: ${formData.phone}
Address: ${formData.address}
Preferred Assessment Slot: ${formData.slot.toUpperCase()}

Old Trade-In Device Details:
Category: ${selectedCategory}
Brand: ${selectedBrand}
Reported Physical Condition: ${conditionTier.toUpperCase()}
Operational Working Status: ${isWorking === 'yes' ? 'Works' : 'Does not work'}
Cosmetic Dents/Defects? ${hasDamages === 'yes' ? 'Yes' : 'No'}
Well Maintained/Clean? ${isClean === 'yes' ? 'Yes' : 'No'}
Has Original Accessories? ${hasAccessories === 'yes' ? 'Yes' : 'No'}
Age of Device: ${deviceAge} Years
Estimated Trade-In Value: Rs. ${exchangeValue}
Additional notes: ${notes || 'None'}

New Purchase Upgrade Details:
Product: ${selectedNewProduct.name} (Model: ${selectedNewProduct.model || 'N/A'}, Brand: ${selectedNewProduct.brand})
Store Price: Rs. ${newProductPrice}
Trade-In Valuation Discount: - Rs. ${exchangeValue}
Final Net Amount to Pay on Delivery: Rs. ${netPayable}
`
            };

            const response = await fetch(`${BASE_URL}/contact/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setOrderRef(ref);
                setOrderSuccess(true);
                addNotification({
                    title: "Exchange Booked!",
                    message: "Your exchange request has been scheduled successfully.",
                    type: "success",
                    container: "top-right",
                    dismiss: { duration: 5000 }
                });
            } else {
                throw new Error("Failed backend submission");
            }
        } catch (err) {
            console.error("Exchange booking failed:", err);
            addNotification({
                title: "Booking Failed",
                message: "Something went wrong. Please check connection and try again.",
                type: "danger",
                container: "top-right",
                dismiss: { duration: 4000 }
            });
        } finally {
            setSubmittingOrder(false);
        }
    };

    const newProductPriceVal = selectedNewProduct ? Number(selectedNewProduct.price || selectedNewProduct.mrp || 0) : 0;
    const finalNetPayable = Math.max(0, newProductPriceVal - exchangeValue);

    return (
        <div className="exchange-page-wrapper">
            <div className="exchange-header-section">
                <h1>Smart Exchange & Upgrade</h1>
                <p>Trade in your old home appliance for a brand new upgrade. Instantly calculate its value and schedule a pickup.</p>
            </div>

            {/* Wizard Steps indicator */}
            {!orderSuccess && (
                <div className="wizard-progress-tracker">
                    <div className={`step-node ${currentStep >= 1 ? 'active' : ''} ${currentStep === 1 ? 'current' : ''}`}>
                        <div className="circle">1</div>
                        <span>Select Old</span>
                    </div>
                    <div className="line-connector" />
                    <div className={`step-node ${currentStep >= 2 ? 'active' : ''} ${currentStep === 2 ? 'current' : ''}`}>
                        <div className="circle">2</div>
                        <span>Evaluate Condition</span>
                    </div>
                    <div className="line-connector" />
                    <div className={`step-node ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'current' : ''}`}>
                        <div className="circle">3</div>
                        <span>Choose Upgrade</span>
                    </div>
                    <div className="line-connector" />
                    <div className={`step-node ${currentStep >= 4 ? 'active' : ''} ${currentStep === 4 ? 'current' : ''}`}>
                        <div className="circle">4</div>
                        <span>Quote & Book</span>
                    </div>
                </div>
            )}

            {/* Wizard Content Layout */}
            {!orderSuccess ? (
                <div className="wizard-main-layout">
                    <div className="wizard-content-card">
                        
                        {/* Step 1: Category & Brand */}
                        {currentStep === 1 && (
                            <div className="wizard-step-panel step-1">
                                <h3>Select your old device category</h3>
                                <p>Select the type of appliance you want to exchange and its brand name.</p>
                                
                                <div className="old-cat-grid">
                                    {OLD_CATEGORIES.map(cat => (
                                        <div 
                                            key={cat.id}
                                            className={`old-cat-card ${selectedCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            <div className="icon-wrapper">{cat.icon}</div>
                                            <h4>{cat.label}</h4>
                                        </div>
                                    ))}
                                </div>

                                <div className="brand-select-wrapper">
                                    <label className="input-label">Select Brand of Old Appliance</label>
                                    <select 
                                        value={selectedBrand} 
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="select-input"
                                    >
                                        <option value="">-- Choose Brand --</option>
                                        {BRANDS.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Condition Questionnaire */}
                        {currentStep === 2 && (
                            <div className="wizard-step-panel step-2">
                                <h3>Device Condition Assessment</h3>
                                <p>Be as accurate as possible. Our pickup agent will verify these details on-site.</p>

                                <div className="condition-tiers-grid">
                                    <div 
                                        className={`condition-tier-card ${conditionTier === 'flawless' ? 'active' : ''}`}
                                        onClick={() => setConditionTier('flawless')}
                                    >
                                        <h4>Flawless / Like New</h4>
                                        <p>No scratches or dents. Completely spotless cosmetic look.</p>
                                    </div>
                                    <div 
                                        className={`condition-tier-card ${conditionTier === 'good' ? 'active' : ''}`}
                                        onClick={() => setConditionTier('good')}
                                    >
                                        <h4>Good / Minor Scratches</h4>
                                        <p>Light signs of usage. Very small cosmetic scratches or scuffs.</p>
                                    </div>
                                    <div 
                                        className={`condition-tier-card ${conditionTier === 'average' ? 'active' : ''}`}
                                        onClick={() => setConditionTier('average')}
                                    >
                                        <h4>Average / Dents</h4>
                                        <p>Noticeable scratches, paint wear, or small body dents.</p>
                                    </div>
                                    <div 
                                        className={`condition-tier-card ${conditionTier === 'broken' ? 'active' : ''}`}
                                        onClick={() => setConditionTier('broken')}
                                    >
                                        <h4>Broken / Heavy Damage</h4>
                                        <p>Deep body cracks, severe corrosion, or broken components.</p>
                                    </div>
                                </div>

                                <div className="questionnaire-list">
                                    <div className="form-group-binary">
                                        <label>Does the device turn on and function properly?</label>
                                        <div className="binary-toggles">
                                            <button 
                                                className={`toggle-choice-btn ${isWorking === 'yes' ? 'active' : ''}`}
                                                onClick={() => setIsWorking('yes')}
                                            >Yes</button>
                                            <button 
                                                className={`toggle-choice-btn toggle-no ${isWorking === 'no' ? 'active' : ''}`}
                                                onClick={() => setIsWorking('no')}
                                            >No</button>
                                        </div>
                                    </div>

                                    <div className="form-group-binary">
                                        <label>Does the screen, glass, or body have cracks or structural damage?</label>
                                        <div className="binary-toggles">
                                            <button 
                                                className={`toggle-choice-btn toggle-no ${hasDamages === 'yes' ? 'active' : ''}`}
                                                onClick={() => setHasDamages('yes')}
                                            >Yes</button>
                                            <button 
                                                className={`toggle-choice-btn ${hasDamages === 'no' ? 'active' : ''}`}
                                                onClick={() => setHasDamages('no')}
                                            >No</button>
                                        </div>
                                    </div>

                                    <div className="form-group-binary">
                                        <label>Is the appliance clean and free of heavy mold/bad odors?</label>
                                        <div className="binary-toggles">
                                            <button 
                                                className={`toggle-choice-btn ${isClean === 'yes' ? 'active' : ''}`}
                                                onClick={() => setIsClean('yes')}
                                            >Yes</button>
                                            <button 
                                                className={`toggle-choice-btn toggle-no ${isClean === 'no' ? 'active' : ''}`}
                                                onClick={() => setIsClean('no')}
                                            >No</button>
                                        </div>
                                    </div>

                                    <div className="form-group-binary">
                                        <label>Does it come with original critical accessories (e.g. remote, power cord)?</label>
                                        <div className="binary-toggles">
                                            <button 
                                                className={`toggle-choice-btn ${hasAccessories === 'yes' ? 'active' : ''}`}
                                                onClick={() => setHasAccessories('yes')}
                                            >Yes</button>
                                            <button 
                                                className={`toggle-choice-btn toggle-no ${hasAccessories === 'no' ? 'active' : ''}`}
                                                onClick={() => setHasAccessories('no')}
                                            >No</button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <div className="control-label-wrapper">
                                            <label className="input-label">Age of Appliance (Years)</label>
                                            <span className="value-badge">{deviceAge} Year(s) Old</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="10"
                                            step="1"
                                            value={deviceAge}
                                            onChange={(e) => setDeviceAge(Number(e.target.value))}
                                            className="slider-input"
                                        />
                                        <div className="slider-limits">
                                            <span>Less than 1 yr</span>
                                            <span>10+ yrs</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="input-label">Any extra details/defects worth mentioning?</label>
                                        <textarea 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Specify brand model number, missing buttons, noise issues etc."
                                            className="textarea-input"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Browse/Select Upgrade Product */}
                        {currentStep === 3 && (
                            <div className="wizard-step-panel step-3">
                                <h3>Select your brand new Upgrade</h3>
                                <p>Select the store product you wish to purchase. The exchange discount will apply directly to its price.</p>

                                <div className="search-bar-wrapper">
                                    <Search size={18} className="search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Search new store items by brand or name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>

                                {loadingNewProducts ? (
                                    <div className="loading-spinner">Fetching available inventory...</div>
                                ) : filteredNewProducts.length > 0 ? (
                                    <div className="new-products-grid">
                                        {filteredNewProducts.map(p => (
                                            <div 
                                                key={p._id}
                                                className={`new-product-card ${selectedNewProduct?._id === p._id ? 'selected' : ''}`}
                                                onClick={() => setSelectedNewProduct(p)}
                                            >
                                                <div className="img-holder">
                                                    <img 
                                                        src={p.images?.[0] || p.image || '/lucky-logo.png'} 
                                                        alt={p.name}
                                                        onError={(e) => { e.target.src = '/lucky-logo.png' }}
                                                    />
                                                </div>
                                                <div className="meta-holder">
                                                    <h5>{p.name}</h5>
                                                    <span className="brand">{p.brand} • {p.model || 'Standard'}</span>
                                                    <div className="price-tag-row">
                                                        <span className="price">Rs. {p.price.toLocaleString()}</span>
                                                        {p.mrp && p.mrp > p.price && (
                                                            <span className="mrp">Rs. {p.mrp.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-products">No new products available in this category at the moment.</div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Summary & Checkout Booking */}
                        {currentStep === 4 && (
                            <div className="wizard-step-panel step-4">
                                <h3>Complete your Upgrade Booking</h3>
                                <p>Review the calculated discount below and provide pickup coordinates to book the home evaluation.</p>

                                <div className="upgrade-receipt-card">
                                    <div className="receipt-row">
                                        <span>New Upgrade Product</span>
                                        <strong>{selectedNewProduct.name}</strong>
                                    </div>
                                    <div className="receipt-row indent">
                                        <span>Retail Value</span>
                                        <strong>Rs. {newProductPriceVal.toLocaleString()}</strong>
                                    </div>
                                    <div className="receipt-row text-discount border-top-dash">
                                        <span>Trade-In Value ({selectedBrand} {selectedCategory})</span>
                                        <strong>- Rs. {exchangeValue.toLocaleString()}</strong>
                                    </div>
                                    <div className="receipt-row text-grand border-top-solid">
                                        <span>Net Amount to Pay</span>
                                        <strong>Rs. {finalNetPayable.toLocaleString()}</strong>
                                    </div>
                                    <div className="disclaimer-alert">
                                        <AlertTriangle size={16} className="alert-icon" />
                                        <span>The quote is subject to physical checks. Net payment must be made COD at delivery.</span>
                                    </div>
                                </div>

                                <form onSubmit={handleBookingSubmit} className="pickup-form">
                                    <div className="form-group">
                                        <label className="input-label">Your Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="Enter your full name"
                                            className="text-input"
                                        />
                                    </div>

                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label className="input-label">Mobile Number</label>
                                            <input 
                                                type="tel" 
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                placeholder="Phone number"
                                                className="text-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="input-label">Preferred Pickup Slot</label>
                                            <select 
                                                value={formData.slot}
                                                onChange={(e) => setFormData({...formData, slot: e.target.value})}
                                                className="select-input"
                                            >
                                                <option value="morning">Morning (9 AM - 12 PM)</option>
                                                <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                                                <option value="evening">Evening (5 PM - 8 PM)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="input-label">Pickup & Delivery Address</label>
                                        <textarea 
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            placeholder="Enter complete house address, street details, and locality"
                                            className="textarea-input"
                                            rows="3"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={submittingOrder}
                                        className="book-upgrade-btn"
                                    >
                                        {submittingOrder ? 'Booking evaluation...' : 'Book Exchange Evaluation & Delivery'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Navigation Footer Buttons */}
                        <div className="wizard-nav-footer">
                            {currentStep > 1 && (
                                <button 
                                    className="nav-btn btn-prev"
                                    onClick={handlePrevStep}
                                >
                                    <ChevronLeft size={16} /> Back
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button 
                                    className="nav-btn btn-next"
                                    onClick={handleNextStep}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Sidebar Estimator Summary */}
                    {currentStep < 4 && (
                        <div className="wizard-estimator-sidebar">
                            <h4>Estimated Trade-in Value</h4>
                            <div className="estimator-value-dial">
                                <h2>Rs. {exchangeValue.toLocaleString()}</h2>
                                <span>Approx. Trade-in Credit</span>
                            </div>

                            <div className="estimator-breakdown-details">
                                <div className="est-row">
                                    <span>Category Base</span>
                                    <span>{selectedCategory ? `Rs. ${OLD_CATEGORIES.find(c => c.id === selectedCategory).baseVal.toLocaleString()}` : 'Rs. 0'}</span>
                                </div>
                                <div className="est-row">
                                    <span>Brand Boost</span>
                                    <span>{(selectedBrand === 'Samsung' || selectedBrand === 'LG') ? '+ 10%' : (selectedBrand === 'Whirlpool' || selectedBrand === 'Haier') ? '+ 5%' : '0%'}</span>
                                </div>
                                <div className="est-row">
                                    <span>Depreciation</span>
                                    <span className="depreciation-highlight">-{Math.min(70, deviceAge * 10)}%</span>
                                </div>
                                <div className="est-row">
                                    <span>Condition Ratio</span>
                                    <span>{conditionTier === 'flawless' ? '1.0' : conditionTier === 'good' ? '0.85' : conditionTier === 'average' ? '0.6' : '0.15'}x</span>
                                </div>
                            </div>

                            {selectedNewProduct && (
                                <div className="sidebar-product-upgrade-preview">
                                    <h5>Upgrading to:</h5>
                                    <div className="preview-mini-card">
                                        <div className="mini-img">
                                            <img src={selectedNewProduct.images?.[0] || selectedNewProduct.image || '/lucky-logo.png'} alt={selectedNewProduct.name} />
                                        </div>
                                        <div className="mini-meta">
                                            <h6>{selectedNewProduct.name}</h6>
                                            <strong>Rs. {Number(selectedNewProduct.price || selectedNewProduct.mrp || 0).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                    <div className="net-payable-preview">
                                        <span>Estimated Balance to Pay:</span>
                                        <h4>Rs. {finalNetPayable.toLocaleString()}</h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Success booking confirmation */
                <div className="exchange-success-card animate-in">
                    <div className="success-badge-container">
                        <CheckCircle2 size={64} className="success-icon" />
                    </div>
                    <h2>Exchange Upgrade Booked!</h2>
                    <p className="success-lead">Congratulations! Your request has been logged. Reference: <strong>{orderRef}</strong></p>
                    
                    <div className="evaluation-steps-summary">
                        <h4>What happens next?</h4>
                        <div className="flow-step">
                            <div className="num">1</div>
                            <div className="text">
                                <h5>In-person verification</h5>
                                <p>Our technician will arrive during the selected slot to check the working condition and cosmetic state of your old appliance.</p>
                            </div>
                        </div>
                        <div className="flow-step">
                            <div className="num">2</div>
                            <div className="text">
                                <h5>Trade-in Finalization</h5>
                                <p>Once the evaluation is approved, the new device will be unboxed, and your old appliance will be collected.</p>
                            </div>
                        </div>
                        <div className="flow-step">
                            <div className="num">3</div>
                            <div className="text">
                                <h5>Final Cash on Delivery</h5>
                                <p>You pay the remaining balance of <strong>Rs. {finalNetPayable.toLocaleString()}</strong> via Cash, Card, or UPI on spot.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="reset-wizard-btn"
                        onClick={() => {
                            setCurrentStep(1);
                            setSelectedCategory('');
                            setSelectedBrand('');
                            setSelectedNewProduct(null);
                            setOrderSuccess(false);
                        }}
                    >
                        Book Another Exchange
                    </button>
                </div>
            )}
        </div>
    );
}

