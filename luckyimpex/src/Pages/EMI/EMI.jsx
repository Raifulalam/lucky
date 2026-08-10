import React, { useState, useEffect } from 'react';
import './EMI.css';
import { BASE_URL } from "../../api/api";
import { useNotification } from "../../Components/NotificationContext";
import { 
    Calculator, 
    Percent, 
    Calendar, 
    ArrowRight, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    Search, 
    Info, 
    Smartphone, 
    Tv, 
    Wind, 
    IceCream, 
    Sparkles 
} from "lucide-react";

// Standard store categories map
const CATEGORY_MAP = [
    { id: 'LEDTelevisions', label: 'LED Televisions', icon: <Tv size={20} /> },
    { id: 'Refrigerators', label: 'Refrigerators', icon: <IceCream size={20} /> },
    { id: 'AirConditioners', label: 'Air Conditioners', icon: <Wind size={20} /> },
    { id: 'WashingMachines', label: 'Washing Machines', icon: <Sparkles size={20} /> },
    { id: 'ChestFreezer', label: 'Chest Freezers', icon: <IceCream size={20} /> },
    { id: 'KitchenAppliances', label: 'Kitchen Appliances', icon: <Sparkles size={20} /> }
];

const BANK_PARTNERS = [
    { name: 'HDFC Bank', rate: 11.5, type: 'Credit Card' },
    { name: 'ICICI Bank', rate: 12.0, type: 'Credit Card' },
    { name: 'SBI', rate: 10.5, type: 'Credit Card' },
    { name: 'Axis Bank', rate: 11.8, type: 'Credit Card' },
    { name: 'Bajaj Finserv', rate: 13.0, type: 'No Cost EMI Available*' }
];

export default function EMI() {
    const { addNotification } = useNotification();

    // Tab Selection: 'product' or 'custom'
    const [activeTab, setActiveTab] = useState('product');

    // Product Mode States
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Mode / Calculation Inputs
    const [price, setPrice] = useState(50000);
    const [downPayment, setDownPayment] = useState(10000);
    const [interestRate, setInterestRate] = useState(12); // Annual Rate (%)
    const [tenure, setTenure] = useState(12); // Months

    // Derived Financial Metrics
    const [loanAmount, setLoanAmount] = useState(40000);
    const [monthlyEmi, setMonthlyEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    // Expandable Sections
    const [showAmortization, setShowAmortization] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState(BANK_PARTNERS[0].name);

    // Form inputs for Application
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [submittingApp, setSubmittingApp] = useState(false);
    const [appSuccess, setAppSuccess] = useState(false);

    // Fetch Products when Category changes
    useEffect(() => {
        if (!selectedCategory && activeTab === 'product') {
            setProducts([]);
            setSelectedProduct(null);
            return;
        }

        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                let url = `${BASE_URL}/products/products?limit=100`;
                if (selectedCategory) {
                    url += `&category=${selectedCategory}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                
                if (response.ok) {
                    const list = Array.isArray(data.products) ? data.products : [];
                    setProducts(list);
                } else {
                    console.error("Failed to fetch products for EMI");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, activeTab]);

    // Handle Product Selection
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        const pPrice = Number(product.price || product.mrp || 0);
        setPrice(pPrice);
        
        // Default down payment to 20% of price
        const dp = Math.round(pPrice * 0.2);
        setDownPayment(dp);
    };

    // Calculate Loan Details in real-time
    useEffect(() => {
        const principal = Math.max(0, price - downPayment);
        setLoanAmount(principal);

        if (principal <= 0) {
            setMonthlyEmi(0);
            setTotalInterest(0);
            setTotalAmount(downPayment);
            return;
        }

        const r = (interestRate / 100) / 12; // Monthly rate
        const n = tenure;

        let emiVal = 0;
        if (r === 0) {
            emiVal = principal / n;
        } else {
            emiVal = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const emi = Math.round(emiVal * 100) / 100;
        const totalPay = Math.round((emi * n + downPayment) * 100) / 100;
        const interest = Math.round((totalPay - price) * 100) / 100;

        setMonthlyEmi(emi);
        setTotalAmount(totalPay);
        setTotalInterest(interest > 0 ? interest : 0);
    }, [price, downPayment, interestRate, tenure]);

    // Bounds check on down payment
    const handleDownPaymentChange = (value) => {
        const val = Number(value);
        if (val < 0) return;
        if (val > price * 0.95) {
            setDownPayment(Math.round(price * 0.95)); // Maximum 95% down payment
        } else {
            setDownPayment(val);
        }
    };

    const handlePriceChange = (value) => {
        const val = Number(value);
        if (val < 0) return;
        setPrice(val);
        // Reset downpayment if it exceeds new price
        if (downPayment > val) {
            setDownPayment(Math.round(val * 0.2));
        }
    };

    // Formulate Amortization Schedule
    const getAmortizationSchedule = () => {
        let balance = loanAmount;
        const r = (interestRate / 100) / 12;
        const schedule = [];

        for (let i = 1; i <= tenure; i++) {
            const interest = Math.round((balance * r) * 100) / 100;
            let principal = Math.round((monthlyEmi - interest) * 100) / 100;
            
            if (i === tenure) {
                // Adjust last month for minor rounding differences
                principal = Math.round(balance * 100) / 100;
            }

            const endBalance = Math.max(0, Math.round((balance - principal) * 100) / 100);

            schedule.push({
                month: i,
                opening: Math.round(balance),
                emi: Math.round(monthlyEmi),
                interest: Math.round(interest),
                principal: Math.round(principal),
                closing: Math.round(endBalance)
            });

            balance = endBalance;
        }
        return schedule;
    };

    // Filter products by search query
    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply Form submission
    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email) {
            if (addNotification) {
                addNotification({
                    title: "Validation Error",
                    message: "Please fill in all fields.",
                    type: "warning",
                    container: "top-right",
                    dismiss: { duration: 3000 }
                });
            }
            return;
        }

        setSubmittingApp(true);
        try {
            const productDetailsText = selectedProduct 
                ? `${selectedProduct.name} (Model: ${selectedProduct.model || 'N/A'}, Brand: ${selectedProduct.brand})`
                : 'Custom Manual Calculation';

            const payload = {
                name: formData.name,
                email: formData.email,
                message: `=== NEW EMI APPLICATION REQUEST ===
Applicant Details:
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

Loan / Product Details:
Product: ${productDetailsText}
Product Price: Rs. ${price}
Down Payment Paid: Rs. ${downPayment}
Principal Loan Amount: Rs. ${loanAmount}
Chosen Partner Bank: ${selectedBank}
Tenure Selected: ${tenure} Months
Interest Rate: ${interestRate}% per annum
Estimated Monthly EMI: Rs. ${monthlyEmi}
Total Interest Payable: Rs. ${totalInterest}
Total Cost: Rs. ${totalAmount}
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
                setAppSuccess(true);
                if (addNotification) {
                    addNotification({
                        title: "Application Submitted!",
                        message: "We have received your EMI request. Our agent will call you shortly.",
                        type: "success",
                        container: "top-right",
                        dismiss: { duration: 5000 }
                    });
                }
            } else {
                throw new Error("API responded with an error");
            }
        } catch (err) {
            console.error("Failed to submit EMI app:", err);
            if (addNotification) {
                addNotification({
                    title: "Submission Failed",
                    message: "Something went wrong. Please try again later.",
                    type: "danger",
                    container: "top-right",
                    dismiss: { duration: 4000 }
                });
            }
        } finally {
            setSubmittingApp(false);
        }
    };

    // Calculate percentage breakdown
    const interestPercent = loanAmount > 0 ? (totalInterest / totalAmount) * 100 : 0;
    const principalPercent = loanAmount > 0 ? ((loanAmount) / totalAmount) * 100 : 0;
    const downpaymentPercent = (downPayment / totalAmount) * 100;

    return (
        <div className="emi-page-wrapper">
            <div className="emi-header-section">
                <h1>Flexible EMI Calculator</h1>
                <p>Calculate your monthly payments, customize down payments, and apply for instant financing options.</p>
            </div>

            {/* Main Split Grid */}
            <div className="emi-grid">
                
                {/* Inputs Container */}
                <div className="emi-panel-card inputs-panel">
                    <div className="tab-headers">
                        <button 
                            className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('product'); setSelectedProduct(null); }}
                        >
                            Select Store Product
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('custom'); setSelectedProduct(null); }}
                        >
                            Custom Manual Amount
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'product' ? (
                            <div className="product-mode-content">
                                <label className="input-label">Select Category</label>
                                <div className="categories-slider">
                                    {CATEGORY_MAP.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                setSelectedProduct(null);
                                            }}
                                        >
                                            {cat.icon}
                                            <span>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedCategory && (
                                    <div className="product-picker-container">
                                        <div className="search-bar-wrapper">
                                            <Search size={18} className="search-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Search products in category..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="search-input"
                                            />
                                        </div>

                                        {loadingProducts ? (
                                            <div className="loading-spinner">Loading store items...</div>
                                        ) : filteredProducts.length > 0 ? (
                                            <div className="products-scroll-grid">
                                                {filteredProducts.map(p => (
                                                    <div 
                                                        key={p._id}
                                                        className={`product-picker-card ${selectedProduct?._id === p._id ? 'selected' : ''}`}
                                                        onClick={() => handleProductSelect(p)}
                                                    >
                                                        <div className="product-thumb">
                                                            <img 
                                                                src={p.images?.[0] || p.image || '/lucky-logo.png'} 
                                                                alt={p.name}
                                                                onError={(e) => { e.target.src = '/lucky-logo.png' }}
                                                            />
                                                        </div>
                                                        <div className="product-picker-meta">
                                                            <h5>{p.name}</h5>
                                                            <span className="brand-tag">{p.brand}</span>
                                                            <span className="price-tag">Rs. {p.price}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-products">No products found matching your filter.</div>
                                        )}
                                    </div>
                                )}

                                {selectedProduct && (
                                    <div className="selected-product-alert">
                                        <CheckCircle2 size={18} className="success-icon" />
                                        <span>Selected <strong>{selectedProduct.name}</strong> - Price: <strong>Rs. {selectedProduct.price}</strong></span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="custom-mode-content">
                                <div className="form-group">
                                    <label className="input-label">Purchase Value (Rs.)</label>
                                    <div className="input-with-icon">
                                        <span className="input-symbol">Rs</span>
                                        <input 
                                            type="number"
                                            value={price}
                                            onChange={(e) => handlePriceChange(e.target.value)}
                                            placeholder="Enter item price"
                                            className="number-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Calculation Parameters */}
                        <div className="calculation-controls">
                            <div className="control-group">
                                <div className="control-label-wrapper">
                                    <label className="input-label">Down Payment</label>
                                    <span className="value-badge">Rs. {downPayment}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0"
                                    max={Math.round(price * 0.95)}
                                    step={Math.round(price / 100) || 1}
                                    value={downPayment}
                                    onChange={(e) => handleDownPaymentChange(e.target.value)}
                                    className="slider-input"
                                />
                                <div className="slider-limits">
                                    <span>Rs. 0</span>
                                    <span>Max (95%): Rs. {Math.round(price * 0.95)}</span>
                                </div>
                            </div>

                            <div className="control-group">
                                <div className="control-label-wrapper">
                                    <label className="input-label">Interest Rate (% P.A.)</label>
                                    <span className="value-badge">{interestRate}%</span>
                                </div>
                                <input 
                                    type="range"
                                    min="5"
                                    max="25"
                                    step="0.5"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="slider-input"
                                />
                                <div className="slider-limits">
                                    <span>5%</span>
                                    <span>25%</span>
                                </div>
                            </div>

                            <div className="control-group">
                                <label className="input-label">Tenure (Months)</label>
                                <div className="tenure-chips-grid">
                                    {[3, 6, 9, 12, 18, 24, 36].map(m => (
                                        <button
                                            key={m}
                                            className={`tenure-chip ${tenure === m ? 'active' : ''}`}
                                            onClick={() => setTenure(m)}
                                        >
                                            {m} Months
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Visualizer Card */}
                <div className="emi-panel-card results-panel">
                    <div className="results-main-card">
                        <span className="results-label">ESTIMATED MONTHLY PAYMENT</span>
                        <h2>Rs. {monthlyEmi.toLocaleString()} <span className="per-month">/ month</span></h2>
                        
                        <div className="price-details-grid">
                            <div className="detail-item">
                                <span>Product Price</span>
                                <strong>Rs. {price.toLocaleString()}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Down Payment</span>
                                <strong>Rs. {downPayment.toLocaleString()}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Loan Principal</span>
                                <strong>Rs. {loanAmount.toLocaleString()}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Interest Payable</span>
                                <strong className="interest-highlight">Rs. {totalInterest.toLocaleString()}</strong>
                            </div>
                        </div>

                        {/* Stacked Percentage Progress Bar */}
                        <div className="visual-progress-bar">
                            <div 
                                className="progress-slice slice-downpayment" 
                                style={{ width: `${downpaymentPercent}%` }}
                                title={`Downpayment: ${downpaymentPercent.toFixed(1)}%`}
                            />
                            <div 
                                className="progress-slice slice-principal" 
                                style={{ width: `${principalPercent}%` }}
                                title={`Principal: ${principalPercent.toFixed(1)}%`}
                            />
                            <div 
                                className="progress-slice slice-interest" 
                                style={{ width: `${interestPercent}%` }}
                                title={`Interest: ${interestPercent.toFixed(1)}%`}
                            />
                        </div>
                        <div className="progress-legend">
                            <span className="legend-item"><span className="bullet bullet-downpayment" /> Down Payment</span>
                            <span className="legend-item"><span className="bullet bullet-principal" /> Principal</span>
                            <span className="legend-item"><span className="bullet bullet-interest" /> Interest</span>
                        </div>

                        <div className="total-cost-badge">
                            <span>Total cost to pay (Principal + Interest + Downpayment)</span>
                            <h3>Rs. {totalAmount.toLocaleString()}</h3>
                        </div>

                        <button 
                            className="apply-emi-btn"
                            onClick={() => setShowApplyModal(true)}
                        >
                            Apply for EMI Financing <ArrowRight size={18} />
                        </button>
                    </div>

                    {/* Bank Offers list */}
                    <div className="bank-offers-container">
                        <h4>Financing Partner Offers</h4>
                        <div className="bank-offers-list">
                            {BANK_PARTNERS.map((bank, index) => {
                                const r = (bank.rate / 100) / 12;
                                let emi = 0;
                                if (r === 0) {
                                    emi = loanAmount / tenure;
                                } else {
                                    emi = (loanAmount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
                                }
                                return (
                                    <div key={index} className="bank-offer-row">
                                        <div className="bank-meta">
                                            <h5>{bank.name}</h5>
                                            <span>{bank.type} • {bank.rate}% Interest</span>
                                        </div>
                                        <div className="bank-price">
                                            <strong>Rs. {Math.round(emi).toLocaleString()}/mo</strong>
                                            <span>for {tenure}m</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Tenure comparison grid */}
            <div className="emi-section-block">
                <h3>Compare Standard Terms</h3>
                <p>Compare how your payments vary depending on the length of your financing contract.</p>
                <div className="comparison-cards-grid">
                    {[3, 6, 9, 12, 18, 24, 36].map(t => {
                        const r = (interestRate / 100) / 12;
                        let emi = 0;
                        if (r === 0) {
                            emi = loanAmount / t;
                        } else {
                            emi = (loanAmount * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);
                        }
                        const totalPay = emi * t + downPayment;
                        const interest = totalPay - price;
                        return (
                            <div key={t} className={`comparison-pill-card ${tenure === t ? 'highlighted' : ''}`} onClick={() => setTenure(t)}>
                                <h4>{t} Months</h4>
                                <div className="comparison-metric">
                                    <span>EMI Amount</span>
                                    <strong>Rs. {Math.round(emi).toLocaleString()}</strong>
                                </div>
                                <div className="comparison-metric">
                                    <span>Total Interest</span>
                                    <span className="interest-color">Rs. {interest > 0 ? Math.round(interest).toLocaleString() : 0}</span>
                                </div>
                                <div className="comparison-metric border-top">
                                    <span>Total Value</span>
                                    <strong>Rs. {Math.round(totalPay).toLocaleString()}</strong>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Amortization schedule section */}
            <div className="emi-section-block amortization-schedule-block">
                <button 
                    className="toggle-amortization-btn"
                    onClick={() => setShowAmortization(!showAmortization)}
                >
                    <span>View Detailed Monthly Amortization Table</span>
                    {showAmortization ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showAmortization && (
                    <div className="amortization-table-wrapper">
                        <table className="amortization-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Opening Balance</th>
                                    <th>EMI Paid</th>
                                    <th>Principal Paid</th>
                                    <th>Interest Paid</th>
                                    <th>Ending Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getAmortizationSchedule().map(row => (
                                    <tr key={row.month}>
                                        <td>{row.month}</td>
                                        <td>Rs. {row.opening.toLocaleString()}</td>
                                        <td>Rs. {row.emi.toLocaleString()}</td>
                                        <td className="principal-col">Rs. {row.principal.toLocaleString()}</td>
                                        <td className="interest-col">Rs. {row.interest.toLocaleString()}</td>
                                        <td>Rs. {row.closing.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Apply Financing Modal */}
            {showApplyModal && (
                <div className="modal-overlay">
                    <div className="modal-content-card">
                        <button className="close-modal-btn" onClick={() => { setShowApplyModal(false); setAppSuccess(false); }}>&times;</button>
                        
                        {!appSuccess ? (
                            <form onSubmit={handleApplySubmit} className="apply-form-wrapper">
                                <h3>Apply for EMI Financing</h3>
                                <p>Provide details below to submit your pre-approval application. Our partner executive will contact you for verification.</p>

                                <div className="loan-brief-summary">
                                    <div className="brief-item">
                                        <span>Product</span>
                                        <strong>{selectedProduct ? selectedProduct.name : 'Custom Manual'}</strong>
                                    </div>
                                    <div className="brief-item">
                                        <span>Loan Principal</span>
                                        <strong>Rs. {loanAmount.toLocaleString()}</strong>
                                    </div>
                                    <div className="brief-item">
                                        <span>EMI Installment</span>
                                        <strong>Rs. {monthlyEmi.toLocaleString()} / mo</strong>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="input-label">Finance Partner Bank</label>
                                    <select 
                                        value={selectedBank} 
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        className="select-input"
                                    >
                                        {BANK_PARTNERS.map(bp => (
                                            <option key={bp.name} value={bp.name}>{bp.name} ({bp.type})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="input-label">Full Name</label>
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
                                            placeholder="Enter phone number"
                                            className="text-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="input-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="Enter email address"
                                            className="text-input"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submittingApp}
                                    className="submit-application-btn"
                                >
                                    {submittingApp ? 'Submitting pre-approval...' : 'Submit Pre-Approval Application'}
                                </button>
                            </form>
                        ) : (
                            <div className="success-screen-wrapper">
                                <div className="check-icon-circle">
                                    <CheckCircle2 size={64} className="checkmark" />
                                </div>
                                <h3>Application Submitted!</h3>
                                <p>Thank you, <strong>{formData.name}</strong>. Your pre-approval request for financing through <strong>{selectedBank}</strong> has been logged.</p>
                                <p className="followup-info">An evaluation representative will call you on <strong>{formData.phone}</strong> within 24 business hours to complete documentation.</p>
                                
                                <div className="ticket-summary">
                                    <span>Pre-Approval Reference</span>
                                    <strong>EMI-{Math.floor(100000 + Math.random() * 900000)}</strong>
                                </div>

                                <button 
                                    className="close-success-btn" 
                                    onClick={() => { setShowApplyModal(false); setAppSuccess(false); }}
                                >
                                    Return to Calculator
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
