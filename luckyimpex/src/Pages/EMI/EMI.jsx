import React, { useState, useEffect, useRef } from "react";
import "./EMI.css";
import { BASE_URL } from "../../api/api";
import { useNotification } from "../../Components/NotificationContext";
import Header from "../../Components/Header";
import Breadcrumbs from "../../Components/Breadcrumbs";
import PageSeo from "../../Components/PageSeo";
import Footer from "../../Components/Footer";
import { buildEmiServiceSchema } from "../../seo/schemas";
import {
    ArrowRight,
    CheckCircle2,
    Search,
    Tv,
    Wind,
    IceCream,
    Sparkles,
    Smartphone,
    User,
    Users,
    Upload,
    FileText,
    Camera,
    ShieldCheck,
    Briefcase,
    X,
    MessageCircle,
    Calculator,
    ChevronDown,
    ChevronUp,
    Copy,
    Check
} from "lucide-react";

// Store categories for product selection
const CATEGORY_MAP = [
    { id: "LEDTelevisions", label: "LED Televisions", icon: <Tv size={18} /> },
    { id: "Refrigerators", label: "Refrigerators", icon: <IceCream size={18} /> },
    { id: "AirConditioners", label: "Air Conditioners", icon: <Wind size={18} /> },
    { id: "WashingMachines", label: "Washing Machines", icon: <Sparkles size={18} /> },
    { id: "ChestFreezer", label: "Chest Freezers", icon: <IceCream size={18} /> },
    { id: "KitchenAppliances", label: "Kitchen Appliances", icon: <Sparkles size={18} /> },
    { id: "mobiles", label: "Smartphones & Mobiles", icon: <Smartphone size={18} /> }
];

// Finance Partners in Nepal
const BANK_PARTNERS = [
    { name: "Lucky Impex Direct In-House EMI", type: "0% Interest Store Installment", note: "40% Down Payment" },
    { name: "Nabil Bank", type: "Credit Card / Personal EMI", note: "0% Available*" },
    { name: "Global IME Bank", type: "Credit Card EMI", note: "0% Available*" },
    { name: "NIC Asia Bank", type: "Card / Consumer Financing", note: "0% Available*" },
    { name: "Himalayan Bank", type: "Credit Card Installment", note: "0% Available*" },
    { name: "Sanima Bank", type: "Credit Card EMI", note: "0% Available*" },
    { name: "Everest Bank", type: "Consumer Loan / Card", note: "0% Available*" },
    { name: "Prabhu Bank", type: "Consumer Financing", note: "0% Available*" }
];

const TENURE_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function EMI() {
    const { addNotification } = useNotification();
    const applicationFormRef = useRef(null);

    // Tab Selection: 'product' or 'custom'
    const [activeTab, setActiveTab] = useState("product");

    // Product Mode States
    const [selectedCategory, setSelectedCategory] = useState("LEDTelevisions");
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Custom Mode / Calculation Inputs (40% Down Payment & 0% Interest)
    const [price, setPrice] = useState(60000);
    const [downPayment, setDownPayment] = useState(24000); // 40% Down Payment
    const interestRate = 0; // 0% Interest EMI
    const [tenure, setTenure] = useState(12); // Months
    const [selectedBank, setSelectedBank] = useState(BANK_PARTNERS[0].name);

    // Derived Financial Metrics
    const [loanAmount, setLoanAmount] = useState(36000);
    const [monthlyEmi, setMonthlyEmi] = useState(3000);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(60000);

    // Amortization schedule toggle
    const [showAmortization, setShowAmortization] = useState(false);

    // Form: Applicant Details
    const [applicant, setApplicant] = useState({
        name: "",
        phone: "",
        email: "",
        currentAddress: "",
        permanentAddress: "",
        occupation: "Private Employee",
        monthlyIncome: "35,000 - 50,000",
    });

    // Form: Guarantor (Granter / Jamani) Details
    const [guarantor, setGuarantor] = useState({
        name: "",
        phone: "",
        relationship: "Father",
        address: "",
        occupation: "Business / Self-Employed",
    });

    // Form: Uploaded Documents (stored as preview DataURLs & file metadata)
    const [documents, setDocuments] = useState({
        applicantPhoto: null,
        applicantCitizenshipFront: null,
        applicantCitizenshipBack: null,
        applicantIncomeProof: null,
        guarantorPhoto: null,
        guarantorCitizenshipFront: null,
        guarantorCitizenshipBack: null,
    });

    // Consent
    const [agreedToTerms, setAgreedToTerms] = useState(true);

    // Submission states
    const [submittingApp, setSubmittingApp] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [copiedRef, setCopiedRef] = useState(false);

    // Fetch Products when Category changes
    useEffect(() => {
        if (!selectedCategory || activeTab !== "product") return;

        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                let url = `${BASE_URL}/products/products?limit=60`;
                if (selectedCategory === "mobiles") {
                    url = `${BASE_URL}/mobiles?limit=60`;
                } else if (selectedCategory) {
                    url += `&category=${selectedCategory}`;
                }

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok) {
                    const list = Array.isArray(data.products)
                        ? data.products
                        : Array.isArray(data?.data?.mobiles)
                            ? data.data.mobiles
                            : [];
                    setProducts(list);
                    if (list.length > 0) {
                        setSelectedProduct((prev) => {
                            if (!prev) {
                                const first = list[0];
                                const pPrice = Number(first.price || first.mrp || 45000);
                                setPrice(pPrice);
                                setDownPayment(Math.round(pPrice * 0.4));
                                return first;
                            }
                            return prev;
                        });
                    }
                }
            } catch (err) {
                console.warn("Could not load products for EMI:", err.message);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, activeTab]);

    // Handle Product Selection
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        const pPrice = Number(product.price || product.mrp || 45000);
        setPrice(pPrice);
        // Default down payment to 40%
        const dp = Math.round(pPrice * 0.4);
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

        const r = interestRate / 100 / 12; // Monthly rate
        const n = tenure;

        let emiVal = 0;
        if (r === 0) {
            emiVal = principal / n;
        } else {
            emiVal = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const emi = Math.round(emiVal);
        const totalPay = Math.round(emi * n + downPayment);
        const interest = Math.round(totalPay - price);

        setMonthlyEmi(emi);
        setTotalAmount(totalPay);
        setTotalInterest(interest > 0 ? interest : 0);
    }, [price, downPayment, interestRate, tenure]);

    // Bounds check on down payment
    const handleDownPaymentChange = (value) => {
        const val = Number(value);
        if (val < 0) return;
        if (val > price * 0.95) {
            setDownPayment(Math.round(price * 0.95));
        } else {
            setDownPayment(val);
        }
    };

    const handlePriceChange = (value) => {
        const val = Number(value);
        if (val < 0) return;
        setPrice(val);
        if (downPayment > val) {
            setDownPayment(Math.round(val * 0.4));
        }
    };

    // File handler with compression / DataURL conversion
    const handleFileUpload = (field, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 6MB check
        if (file.size > 6 * 1024 * 1024) {
            if (addNotification) {
                addNotification({
                    title: "File Too Large",
                    message: "Please choose an image under 6MB.",
                    type: "warning",
                    container: "top-right",
                    dismiss: { duration: 4000 }
                });
            } else {
                alert("File is too large. Please select an image under 6MB.");
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setDocuments((prev) => ({
                ...prev,
                [field]: {
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + " KB",
                    dataUrl: event.target.result,
                },
            }));
        };
        reader.readAsDataURL(file);
    };

    const removeDocument = (field) => {
        setDocuments((prev) => ({
            ...prev,
            [field]: null,
        }));
    };

    // Scroll to application form
    const scrollToApplication = () => {
        if (applicationFormRef.current) {
            applicationFormRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Format amortization schedule
    const getAmortizationSchedule = () => {
        let balance = loanAmount;
        const r = interestRate / 100 / 12;
        const schedule = [];

        for (let i = 1; i <= tenure; i++) {
            const interest = Math.round(balance * r);
            let principal = Math.round(monthlyEmi - interest);

            if (i === tenure) {
                principal = Math.round(balance);
            }

            const endBalance = Math.max(0, Math.round(balance - principal));

            schedule.push({
                month: i,
                opening: Math.round(balance),
                emi: Math.round(monthlyEmi),
                interest: Math.round(interest),
                principal: Math.round(principal),
                closing: Math.round(endBalance),
            });

            balance = endBalance;
        }
        return schedule;
    };

    // Filter products
    const filteredProducts = products.filter(
        (p) =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Compose rich WhatsApp message
    const getWhatsAppUrl = () => {
        const prodName = selectedProduct ? selectedProduct.name : "Custom Selected Appliance";
        const docsList = [];
        if (documents.applicantPhoto) docsList.push("Applicant Photo");
        if (documents.applicantCitizenshipFront) docsList.push("Applicant Citizenship (Front)");
        if (documents.applicantCitizenshipBack) docsList.push("Applicant Citizenship (Back)");
        if (documents.applicantIncomeProof) docsList.push("Income Proof");
        if (documents.guarantorPhoto) docsList.push("Guarantor Photo");
        if (documents.guarantorCitizenshipFront) docsList.push("Guarantor Citizenship");

        const message = `*नमस्ते Lucky Impex! म ०% ब्याज (0% Interest) EMI मा सामान लिन चाहन्छु:*
━━━━━━━━━━━━━━━━━━━━━
🛒 *उत्पादन (Product):* ${prodName}
💰 *मूल्य (Price):* NPR ${price.toLocaleString()}
💳 *Down Payment (40%):* NPR ${downPayment.toLocaleString()}
📊 *ऋण रकम (Loan Amount):* NPR ${loanAmount.toLocaleString()}
📈 *ब्याज दर (Interest Rate):* 0% (Zero Interest Scheme)
⏱️ *किस्ता अवधि (Tenure):* ${tenure} Months (@ NPR ${monthlyEmi.toLocaleString()}/month)
🏦 *Preferred Bank / Plan:* ${selectedBank}

👤 *मुख्य आवेदक (Applicant):*
- Name: ${applicant.name || "N/A"}
- Phone: ${applicant.phone || "N/A"}
- Address: ${applicant.currentAddress || "Birgunj"}
- Occupation: ${applicant.occupation} (Income: ${applicant.monthlyIncome})

🤝 *जमानी बस्ने व्यक्ति (Guarantor):*
- Name: ${guarantor.name || "N/A"}
- Phone: ${guarantor.phone || "N/A"}
- Relation: ${guarantor.relationship}
- Address: ${guarantor.address || "N/A"}

📂 *कागजात स्थिति (Documents):* ${docsList.length > 0 ? docsList.join(", ") : "कागजात तयार छ"}
━━━━━━━━━━━━━━━━━━━━━
कृपया मेरो 0% EMI प्रक्रिया सुरु गर्न मलाई सम्पर्क गर्नुहोला। धन्यवाद!`;

        return `https://wa.me/9779802594022?text=${encodeURIComponent(message)}`;
    };

    // Submit Complete Application
    const handleSubmitApplication = async (e) => {
        e.preventDefault();

        // Validation
        if (!applicant.name.trim() || !applicant.phone.trim() || !applicant.currentAddress.trim()) {
            if (addNotification) {
                addNotification({
                    title: "Missing Applicant Details",
                    message: "Please enter applicant full name, contact phone, and current address.",
                    type: "warning",
                    container: "top-right",
                    dismiss: { duration: 4000 }
                });
            } else {
                alert("Please fill in applicant full name, mobile number and address.");
            }
            return;
        }

        if (!guarantor.name.trim() || !guarantor.phone.trim()) {
            if (addNotification) {
                addNotification({
                    title: "Missing Guarantor Details",
                    message: "Guarantor (Granter/Jamani) full name and contact number are required.",
                    type: "warning",
                    container: "top-right",
                    dismiss: { duration: 4000 }
                });
            } else {
                alert("Please fill in guarantor (जमानी) name and phone number.");
            }
            return;
        }

        setSubmittingApp(true);

        const applicationPayload = {
            applicant: {
                name: applicant.name,
                phone: applicant.phone,
                email: applicant.email,
                currentAddress: applicant.currentAddress,
                permanentAddress: applicant.permanentAddress || applicant.currentAddress,
                occupation: applicant.occupation,
                monthlyIncome: applicant.monthlyIncome,
            },
            guarantor: {
                name: guarantor.name,
                phone: guarantor.phone,
                relationship: guarantor.relationship,
                address: guarantor.address || applicant.currentAddress,
                occupation: guarantor.occupation,
            },
            productDetails: {
                productId: selectedProduct?._id || "",
                name: selectedProduct ? selectedProduct.name : "Custom Loan / Appliance",
                brand: selectedProduct?.brand || "",
                model: selectedProduct?.model || "",
                price,
                downPayment,
                loanAmount,
                tenureMonths: tenure,
                interestRate,
                estimatedMonthlyEmi: monthlyEmi,
                partnerBank: selectedBank,
            },
            documents: {
                applicantPhoto: documents.applicantPhoto?.dataUrl || "",
                applicantCitizenshipFront: documents.applicantCitizenshipFront?.dataUrl || "",
                applicantCitizenshipBack: documents.applicantCitizenshipBack?.dataUrl || "",
                applicantIncomeProof: documents.applicantIncomeProof?.dataUrl || "",
                guarantorPhoto: documents.guarantorPhoto?.dataUrl || "",
                guarantorCitizenshipFront: documents.guarantorCitizenshipFront?.dataUrl || "",
                guarantorCitizenshipBack: documents.guarantorCitizenshipBack?.dataUrl || "",
            },
        };

        try {
            // Attempt primary dedicated /api/emi/apply endpoint
            let response = await fetch(`${BASE_URL}/emi/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationPayload),
            });

            let data;
            if (response.ok) {
                data = await response.json();
            } else {
                // Fallback to /contact/contact with rich message
                const fallbackMessage = `=== ONLINE EMI APPLICATION WITH DOCUMENTS ===
Application Ref: EMI-${Math.floor(100000 + Math.random() * 900000)}
Applicant: ${applicant.name} | Phone: ${applicant.phone} | Email: ${applicant.email}
Address: ${applicant.currentAddress}
Occupation: ${applicant.occupation} | Income: ${applicant.monthlyIncome}

Guarantor: ${guarantor.name} (${guarantor.relationship}) | Phone: ${guarantor.phone} | Address: ${guarantor.address}

Product: ${selectedProduct ? selectedProduct.name : 'Custom Plan'}
Price: Rs. ${price.toLocaleString()} | Downpayment: Rs. ${downPayment.toLocaleString()}
Loan: Rs. ${loanAmount.toLocaleString()} | Tenure: ${tenure} Mos @ Rs. ${monthlyEmi.toLocaleString()}/mo
Bank/Partner: ${selectedBank}

Documents Status:
- Applicant Photo: ${documents.applicantPhoto ? "Attached" : "Not Provided"}
- Applicant Citizenship: ${documents.applicantCitizenshipFront ? "Attached" : "Not Provided"}
- Guarantor Photo: ${documents.guarantorPhoto ? "Attached" : "Not Provided"}
- Guarantor Citizenship: ${documents.guarantorCitizenshipFront ? "Attached" : "Not Provided"}
`;

                const fallbackRes = await fetch(`${BASE_URL}/contact/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: applicant.name,
                        email: applicant.email || "emi-applicant@luckyimpex4u.com",
                        phone: applicant.phone,
                        productInterest: selectedProduct ? selectedProduct.name : "EMI Financing",
                        message: fallbackMessage,
                    }),
                });

                data = {
                    success: fallbackRes.ok,
                    applicationNo: `EMI-${new Date().toISOString().slice(2, 7).replace("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`,
                };
            }

            const appCode = data.applicationNo || `EMI-${Math.floor(100000 + Math.random() * 900000)}`;

            setSubmissionResult({
                applicationNo: appCode,
                applicantName: applicant.name,
                phone: applicant.phone,
                productName: selectedProduct ? selectedProduct.name : "Selected Item",
                monthlyEmi,
                downPayment,
                tenure,
            });

            if (addNotification) {
                addNotification({
                    title: "Application Received!",
                    message: `Reference #${appCode}. Our EMI team will contact you within 24 hours.`,
                    type: "success",
                    container: "top-right",
                    dismiss: { duration: 6000 }
                });
            }
        } catch (err) {
            console.error("Submission error:", err);
            // Even if offline, show receipt with ref and open WhatsApp
            const fallbackRef = `EMI-${Math.floor(100000 + Math.random() * 900000)}`;
            setSubmissionResult({
                applicationNo: fallbackRef,
                applicantName: applicant.name,
                phone: applicant.phone,
                productName: selectedProduct ? selectedProduct.name : "Selected Item",
                monthlyEmi,
                downPayment,
                tenure,
            });
        } finally {
            setSubmittingApp(false);
        }
    };

    const copyReference = () => {
        if (submissionResult?.applicationNo) {
            navigator.clipboard.writeText(submissionResult.applicationNo);
            setCopiedRef(true);
            setTimeout(() => setCopiedRef(false), 2500);
        }
    };

    return (
        <>
            <PageSeo
                title="0% Interest EMI with 40% Down Payment in Birgunj | Lucky Impex"
                description="Buy genuine home appliances, LED TVs, refrigerators, air conditioners & smartphones with 0% interest EMI and 40% down payment at Lucky Impex, Birgunj. Fast 24-hour approval with applicant & guarantor citizenship."
                canonicalPath="/emi"
                localBusiness
                schemas={[buildEmiServiceSchema()]}
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    { label: "0% EMI Facility" },
                ]}
            />

            <Header />

            <div className="emi-page-wrapper">
                <Breadcrumbs
                    items={[
                        { label: "Home", to: "/" },
                        { label: "0% EMI Financing (किस्ताबन्दी)" },
                    ]}
                />

                {/* ─── Hero Section ────────────────────────────────────────── */}
                <div className="emi-hero-banner">
                    <div className="hero-pill-tag">
                        <ShieldCheck size={16} />
                        <span>0% Interest EMI • 40% Down Payment • Birgunj, Nepal</span>
                    </div>
                    <h1>०% ब्याज दरमा किस्ताबन्दी (0% Interest EMI & 40% Down Payment)</h1>
                    <p className="hero-lead">
                        Pay only 40% down payment and enjoy 0% interest monthly installments across all
                        genuine LED TVs, Refrigerators, ACs, Washing Machines, and Smartphones at Lucky Impex Birgunj.
                        Zero hidden charges — fast 24-hour verification with applicant & guarantor citizenship!
                    </p>

                    <div className="hero-perks-row">
                        <div className="perk-chip">
                            <CheckCircle2 size={18} className="perk-icon" />
                            <span><strong>0% Interest Rate</strong> (०% ब्याज किस्ता)</span>
                        </div>
                        <div className="perk-chip">
                            <CheckCircle2 size={18} className="perk-icon" />
                            <span><strong>40% Easy Down Payment</strong> (४०% डाउनपेमेन्ट)</span>
                        </div>
                        <div className="perk-chip">
                            <CheckCircle2 size={18} className="perk-icon" />
                            <span><strong>Fast 24h Approval with Jamani</strong></span>
                        </div>
                        <div className="perk-chip">
                            <CheckCircle2 size={18} className="perk-icon" />
                            <span><strong>Free Delivery across Birgunj</strong></span>
                        </div>
                    </div>
                </div>

                {/* ─── Calculator & Product Selection ────────────────────────── */}
                <div className="emi-calculator-card">
                    <div className="calc-header-bar">
                        <div className="calc-title-group">
                            <Calculator size={22} className="calc-icon" />
                            <div>
                                <h3>Step 1: Calculate Your EMI & Select Product</h3>
                                <span>Adjust down payment and tenure to see your exact monthly installment</span>
                            </div>
                        </div>

                        <div className="mode-toggle-pills">
                            <button
                                className={`mode-pill ${activeTab === "product" ? "active" : ""}`}
                                onClick={() => { setActiveTab("product"); }}
                            >
                                Browse Store Catalog
                            </button>
                            <button
                                className={`mode-pill ${activeTab === "custom" ? "active" : ""}`}
                                onClick={() => { setActiveTab("custom"); }}
                            >
                                Custom Amount (NPR)
                            </button>
                        </div>
                    </div>

                    <div className="calc-body-grid">
                        {/* Left column: Selection & Sliders */}
                        <div className="calc-controls-col">
                            {activeTab === "product" ? (
                                <div className="product-mode-area">
                                    <label className="section-small-label">Choose Category</label>
                                    <div className="categories-pills-row">
                                        {CATEGORY_MAP.map((cat) => (
                                            <button
                                                key={cat.id}
                                                className={`cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
                                                onClick={() => {
                                                    setSelectedCategory(cat.id);
                                                }}
                                            >
                                                {cat.icon}
                                                <span>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="product-search-bar">
                                        <Search size={16} className="search-ico" />
                                        <input
                                            type="text"
                                            placeholder="Search model, brand (LG, Samsung, Whirlpool)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {loadingProducts ? (
                                        <div className="catalog-loading">Loading store items...</div>
                                    ) : filteredProducts.length > 0 ? (
                                        <div className="products-horizontal-shelf">
                                            {filteredProducts.map((p) => {
                                                const isSel = selectedProduct?._id === p._id;
                                                const thumb = p.images?.[0] || p.image || "/lucky-logo.png";
                                                return (
                                                    <div
                                                        key={p._id}
                                                        className={`shelf-product-card ${isSel ? "selected" : ""}`}
                                                        onClick={() => handleProductSelect(p)}
                                                    >
                                                        <div className="shelf-thumb">
                                                            <img
                                                                src={thumb}
                                                                alt={p.name}
                                                                onError={(e) => { e.target.src = "/lucky-logo.png"; }}
                                                            />
                                                        </div>
                                                        <div className="shelf-info">
                                                            <h4>{p.name}</h4>
                                                            <div className="shelf-tags">
                                                                {p.brand && <span className="brand-tag">{p.brand}</span>}
                                                                <span className="price-tag">NPR {Number(p.price || 0).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        {isSel && (
                                                            <span className="selected-badge">
                                                                <Check size={14} /> Selected
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="empty-catalog-msg">No products match your search.</div>
                                    )}

                                    {selectedProduct && (
                                        <div className="selected-product-callout">
                                            <CheckCircle2 size={18} className="check-icon" />
                                            <div>
                                                <span>Selected Product: <strong>{selectedProduct.name}</strong></span>
                                                <small>Official Brand Warranty included • NPR {price.toLocaleString()}</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="custom-mode-area">
                                    <label className="section-small-label">Enter Total Item Price (NPR)</label>
                                    <div className="amount-input-box">
                                        <span className="currency-prefix">NPR</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => handlePriceChange(e.target.value)}
                                            min="5000"
                                            step="1000"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Sliders */}
                            <div className="sliders-section">
                                <div className="slider-item">
                                    <div className="slider-label-row">
                                        <label>Down Payment (अग्रिम भुक्तानी - 40% Standard)</label>
                                        <span className="slider-highlight">NPR {downPayment.toLocaleString()} ({price > 0 ? Math.round((downPayment / price) * 100) : 0}%)</span>
                                    </div>
                                    <div className="dp-quick-pills">
                                        {[40, 50, 60, 70].map((pct) => (
                                            <button
                                                key={pct}
                                                type="button"
                                                className={`dp-pill ${price > 0 && Math.round((downPayment / price) * 100) === pct ? "active" : ""}`}
                                                onClick={() => setDownPayment(Math.round(price * (pct / 100)))}
                                            >
                                                {pct}% {pct === 40 ? "(Standard)" : ""}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.round(price * 0.9)}
                                        step={Math.round(price / 100) || 500}
                                        value={downPayment}
                                        onChange={(e) => handleDownPaymentChange(e.target.value)}
                                        className="styled-range"
                                    />
                                    <div className="range-bounds">
                                        <span>Min: NPR 0</span>
                                        <span className="text-blue">Standard 40%: NPR {Math.round(price * 0.4).toLocaleString()}</span>
                                        <span>Max: NPR {Math.round(price * 0.9).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="slider-item">
                                    <div className="slider-label-row">
                                        <label>EMI Tenure (किस्ता अवधि)</label>
                                        <span className="slider-highlight">{tenure} Months</span>
                                    </div>
                                    <div className="tenure-quick-buttons">
                                        {TENURE_OPTIONS.map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                className={`tenure-btn ${tenure === m ? "active" : ""}`}
                                                onClick={() => setTenure(m)}
                                            >
                                                {m} Mo
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="slider-item">
                                    <div className="slider-label-row">
                                        <label>Interest Rate (ब्याज दर)</label>
                                        <span className="slider-highlight highlight-zero">0% Interest (०% ब्याज)</span>
                                    </div>
                                    <div className="zero-interest-callout">
                                        <Sparkles size={16} className="text-green" />
                                        <span>Lucky Impex Promo: <strong>0% Interest Rate</strong> on 40% down payment — Zero extra cost!</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column: Summary Card */}
                        <div className="calc-summary-col">
                            <div className="summary-glass-card">
                                <div className="zero-rate-top-badge">
                                    <Sparkles size={14} />
                                    <span>0% INTEREST SCHEME APPLIED</span>
                                </div>
                                <div className="emi-result-top">
                                    <span className="emi-result-label">Monthly Installment (0% Interest)</span>
                                    <div className="emi-amount-display">
                                        <span className="npr-sign">NPR</span>
                                        <span className="huge-number">{monthlyEmi.toLocaleString()}</span>
                                        <span className="per-month">/ Month</span>
                                    </div>
                                    <p className="emi-clarity-note">
                                        Equal installments over <strong>{tenure} months</strong> with <strong>0% interest</strong>
                                    </p>
                                </div>

                                <div className="breakdown-list">
                                    <div className="b-row">
                                        <span>Product Price:</span>
                                        <strong>NPR {price.toLocaleString()}</strong>
                                    </div>
                                    <div className="b-row">
                                        <span>Down Payment (40%):</span>
                                        <strong className="text-green">- NPR {downPayment.toLocaleString()}</strong>
                                    </div>
                                    <div className="b-row highlight">
                                        <span>Loan Balance (60%):</span>
                                        <strong>NPR {loanAmount.toLocaleString()}</strong>
                                    </div>
                                    <div className="b-row zero-int-row">
                                        <span>Total Interest (0% Rate):</span>
                                        <strong className="text-green">NPR {totalInterest.toLocaleString()} (0% Interest!)</strong>
                                    </div>
                                    <div className="b-row total">
                                        <span>Total Cost (Same as Cash Price):</span>
                                        <strong>NPR {totalAmount.toLocaleString()}</strong>
                                    </div>
                                </div>

                                <div className="bank-select-box">
                                    <label>Preferred Financing Institution</label>
                                    <select
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                    >
                                        {BANK_PARTNERS.map((bp) => (
                                            <option key={bp.name} value={bp.name}>
                                                {bp.name} — ({bp.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className="cta-scroll-apply-btn"
                                    onClick={scrollToApplication}
                                >
                                    <span>Apply for EMI with this Plan</span>
                                    <ArrowRight size={18} />
                                </button>
                                <small className="approval-hint">
                                    ⚡ 24-Hour Approval • Required: Citizenship & Photos
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Amortization Table Accordion */}
                    <div className="amortization-drawer">
                        <button
                            type="button"
                            className="toggle-amortization-btn"
                            onClick={() => setShowAmortization(!showAmortization)}
                        >
                            <span>Monthly Amortization Schedule (मासिक किस्ता विवरण)</span>
                            {showAmortization ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {showAmortization && (
                            <div className="table-responsive">
                                <table className="styled-amort-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Opening Principal</th>
                                            <th>Monthly EMI</th>
                                            <th>Principal Repaid</th>
                                            <th>Interest Paid</th>
                                            <th>Ending Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAmortizationSchedule().map((row) => (
                                            <tr key={row.month}>
                                                <td>#{row.month}</td>
                                                <td>NPR {row.opening.toLocaleString()}</td>
                                                <td>NPR {row.emi.toLocaleString()}</td>
                                                <td className="text-blue">NPR {row.principal.toLocaleString()}</td>
                                                <td className="text-orange">NPR {row.interest.toLocaleString()}</td>
                                                <td>NPR {row.closing.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Application & Document Submission Section ───────────── */}
                <div className="emi-application-section" ref={applicationFormRef}>
                    <div className="section-title-wrap">
                        <span className="step-badge">Step 2 & 3: Official Verification</span>
                        <h2>Submit Details & Documents to Start EMI Process</h2>
                        <p>
                            To process your EMI application at Lucky Impex Birgunj, please provide your personal
                            information, guarantor details, and photos/citizenship copies below.
                        </p>
                    </div>

                    {submissionResult ? (
                        /* Success View */
                        <div className="application-success-card">
                            <div className="success-icon-circle">
                                <CheckCircle2 size={54} />
                            </div>
                            <h3>तपाईंको EMI आवेदन सफलतापूर्वक पेश भयो!</h3>
                            <p className="success-sub">
                                Application submitted successfully. Lucky Impex EMI verification team will contact
                                you within 24 hours.
                            </p>

                            <div className="ref-ticket-box">
                                <span className="ref-label">Application Reference Number:</span>
                                <div className="ref-code-row">
                                    <span className="ref-code">{submissionResult.applicationNo}</span>
                                    <button
                                        type="button"
                                        className="copy-btn"
                                        onClick={copyReference}
                                    >
                                        {copiedRef ? <Check size={16} /> : <Copy size={16} />}
                                        <span>{copiedRef ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="submitted-summary-grid">
                                <div className="summary-item">
                                    <span>Applicant Name:</span>
                                    <strong>{submissionResult.applicantName}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>Contact Phone:</span>
                                    <strong>{submissionResult.phone}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>Selected Item:</span>
                                    <strong>{submissionResult.productName}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>Monthly Installment:</span>
                                    <strong className="text-blue">NPR {submissionResult.monthlyEmi.toLocaleString()} / mo</strong>
                                </div>
                            </div>

                            <div className="next-steps-guide">
                                <h4>Next Steps for Approval (आगामी प्रक्रिया):</h4>
                                <ol>
                                    <li>Our EMI manager will call your number (<strong>{submissionResult.phone}</strong>) for identity confirmation.</li>
                                    <li>Keep your original Nepali Citizenship card ready.</li>
                                    <li>Once approved, sign documents and pick up your product or get free Birgunj delivery!</li>
                                </ol>
                            </div>

                            <div className="success-actions-row">
                                <a
                                    href={getWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="whatsapp-confirm-btn"
                                >
                                    <MessageCircle size={18} />
                                    <span>Direct Chat on WhatsApp (+977 9802594022)</span>
                                </a>

                                <button
                                    type="button"
                                    className="reset-btn"
                                    onClick={() => setSubmissionResult(null)}
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Active Application Form */
                        <form onSubmit={handleSubmitApplication} className="emi-full-form">
                            {/* Summary alert of selected plan */}
                            <div className="current-plan-banner">
                                <div className="plan-detail">
                                    <span>Selected Plan:</span>
                                    <strong>{selectedProduct ? selectedProduct.name : "Custom Financing"}</strong>
                                </div>
                                <div className="plan-detail">
                                    <span>Loan Amount:</span>
                                    <strong>NPR {loanAmount.toLocaleString()}</strong>
                                </div>
                                <div className="plan-detail">
                                    <span>Monthly Installment:</span>
                                    <strong className="text-blue">NPR {monthlyEmi.toLocaleString()} / mo ({tenure} Mos)</strong>
                                </div>
                                <div className="plan-detail">
                                    <span>Partner:</span>
                                    <strong>{selectedBank}</strong>
                                </div>
                            </div>

                            {/* Section 1: Applicant Details */}
                            <div className="form-subcard">
                                <div className="card-header-with-icon">
                                    <div className="circle-ico applicant-ico">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3>1. Applicant Details (मुख्य आवेदकको व्यक्तिगत विवरण)</h3>
                                        <p>The person in whose name the appliance/mobile will be purchased on EMI</p>
                                    </div>
                                </div>

                                <div className="form-fields-grid">
                                    <div className="form-field">
                                        <label>Full Name (नागरिकता अनुसार पूरा नाम) <span className="req">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Ramesh Kumar Yadav"
                                            value={applicant.name}
                                            onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Mobile / WhatsApp Number (सम्पर्क नम्बर) <span className="req">*</span></label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. 9802594022"
                                            value={applicant.phone}
                                            onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Email Address (ईमेल ठेगाना)</label>
                                        <input
                                            type="email"
                                            placeholder="e.g. ramesh@example.com"
                                            value={applicant.email}
                                            onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Current Residence Address (हालको ठेगाना) <span className="req">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Ghantaghar Link Road, Ward 10, Birgunj, Parsa"
                                            value={applicant.currentAddress}
                                            onChange={(e) => setApplicant({ ...applicant, currentAddress: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Permanent Address (स्थायी ठेगाना)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. District, Municipality, Ward No."
                                            value={applicant.permanentAddress}
                                            onChange={(e) => setApplicant({ ...applicant, permanentAddress: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Occupation / Employment Type (पेशा)</label>
                                        <select
                                            value={applicant.occupation}
                                            onChange={(e) => setApplicant({ ...applicant, occupation: e.target.value })}
                                        >
                                            <option value="Private Employee">Private Company Employee (निजी नोकरी)</option>
                                            <option value="Government Employee">Government Employee (सरकारी नोकरी)</option>
                                            <option value="Business Owner">Business / Shop Owner (व्यापार/पसल)</option>
                                            <option value="Foreign Employment">Foreign Employment / Remittance (वैदेशिक रोजगारी)</option>
                                            <option value="Agriculture / Farming">Agriculture / Farming (कृषि)</option>
                                            <option value="Student / Other">Student / Freelance / Other (अन्य)</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Monthly Income Bracket (मासिक आम्दानी)</label>
                                        <select
                                            value={applicant.monthlyIncome}
                                            onChange={(e) => setApplicant({ ...applicant, monthlyIncome: e.target.value })}
                                        >
                                            <option value="Under 25,000">Below NPR 25,000</option>
                                            <option value="25,000 - 40,000">NPR 25,000 - 40,000</option>
                                            <option value="40,000 - 70,000">NPR 40,000 - 70,000</option>
                                            <option value="70,000 - 1,00,000">NPR 70,000 - 1,00,000</option>
                                            <option value="Above 1,00,000">Above NPR 1,00,000</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Applicant Documents Upload */}
                                <div className="docs-upload-group">
                                    <h4 className="docs-header-title">
                                        <Camera size={16} />
                                        <span>Applicant Documents (आवेदकको कागजातहरू)</span>
                                    </h4>

                                    <div className="docs-grid">
                                        {/* Applicant Photo */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">1. Applicant Passport Size Photo <span className="req">*</span></span>
                                            {documents.applicantPhoto ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.applicantPhoto.dataUrl} alt="Applicant Preview" />
                                                    <div className="doc-meta">
                                                        <span>{documents.applicantPhoto.name}</span>
                                                        <small>{documents.applicantPhoto.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("applicantPhoto")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <Upload size={22} className="upload-ico" />
                                                    <span>Upload Photo</span>
                                                    <small>JPG, PNG up to 6MB</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("applicantPhoto", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Applicant Citizenship Front */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">2. Citizenship Front (नागरिकता अगाडि) <span className="req">*</span></span>
                                            {documents.applicantCitizenshipFront ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.applicantCitizenshipFront.dataUrl} alt="Citizenship Front" />
                                                    <div className="doc-meta">
                                                        <span>{documents.applicantCitizenshipFront.name}</span>
                                                        <small>{documents.applicantCitizenshipFront.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("applicantCitizenshipFront")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <FileText size={22} className="upload-ico" />
                                                    <span>Upload Front Side</span>
                                                    <small>Clear citizenship photo</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("applicantCitizenshipFront", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Applicant Citizenship Back */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">3. Citizenship Back (नागरिकता पछाडि) <span className="req">*</span></span>
                                            {documents.applicantCitizenshipBack ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.applicantCitizenshipBack.dataUrl} alt="Citizenship Back" />
                                                    <div className="doc-meta">
                                                        <span>{documents.applicantCitizenshipBack.name}</span>
                                                        <small>{documents.applicantCitizenshipBack.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("applicantCitizenshipBack")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <FileText size={22} className="upload-ico" />
                                                    <span>Upload Back Side</span>
                                                    <small>Clear citizenship photo</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("applicantCitizenshipBack", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Income Proof (Optional) */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">4. Salary Slip / Bank Statement / PAN (ऐच्छिक)</span>
                                            {documents.applicantIncomeProof ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.applicantIncomeProof.dataUrl} alt="Income Proof" />
                                                    <div className="doc-meta">
                                                        <span>{documents.applicantIncomeProof.name}</span>
                                                        <small>{documents.applicantIncomeProof.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("applicantIncomeProof")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <Briefcase size={22} className="upload-ico" />
                                                    <span>Upload Proof (Optional)</span>
                                                    <small>Speeds up approval</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("applicantIncomeProof", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Guarantor (Granter / Jamani) Details */}
                            <div className="form-subcard">
                                <div className="card-header-with-icon">
                                    <div className="circle-ico guarantor-ico">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h3>2. Guarantor (Granter / Jamani) Details (जमानी बस्ने व्यक्तिको विवरण)</h3>
                                        <p>In Nepal, a guarantor (Father, Mother, Spouse, Sibling or Relative) is required for EMI approval</p>
                                    </div>
                                </div>

                                <div className="form-fields-grid">
                                    <div className="form-field">
                                        <label>Guarantor Full Name (जमानीको पूरा नाम) <span className="req">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Hari Prasad Yadav"
                                            value={guarantor.name}
                                            onChange={(e) => setGuarantor({ ...guarantor, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Guarantor Contact Phone (जमानीको सम्पर्क नम्बर) <span className="req">*</span></label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. 9812345678"
                                            value={guarantor.phone}
                                            onChange={(e) => setGuarantor({ ...guarantor, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Relationship to Applicant (आवेदकसँगको सम्बन्ध / नाता) <span className="req">*</span></label>
                                        <select
                                            value={guarantor.relationship}
                                            onChange={(e) => setGuarantor({ ...guarantor, relationship: e.target.value })}
                                        >
                                            <option value="Father">Father (बुबा)</option>
                                            <option value="Mother">Mother (आमा)</option>
                                            <option value="Spouse">Spouse / Wife / Husband (पति/पत्नी)</option>
                                            <option value="Brother">Brother (दाजु/भाइ)</option>
                                            <option value="Sister">Sister (दिदी/बहिनी)</option>
                                            <option value="Uncle / Relative">Uncle / Close Relative (काका/नातेदार)</option>
                                            <option value="Friend / Co-worker">Colleague / Friend (सहकर्मी/साथी)</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Guarantor Address (जमानीको ठेगाना)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Birgunj, Parsa"
                                            value={guarantor.address}
                                            onChange={(e) => setGuarantor({ ...guarantor, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Guarantor Occupation (जमानीको पेशा)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Business / Government / Agriculture"
                                            value={guarantor.occupation}
                                            onChange={(e) => setGuarantor({ ...guarantor, occupation: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Guarantor Documents Upload */}
                                <div className="docs-upload-group">
                                    <h4 className="docs-header-title">
                                        <Camera size={16} />
                                        <span>Guarantor Documents (जमानीको कागजातहरू)</span>
                                    </h4>

                                    <div className="docs-grid">
                                        {/* Guarantor Photo */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">1. Guarantor Passport Photo (जमानीको फोटो)</span>
                                            {documents.guarantorPhoto ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.guarantorPhoto.dataUrl} alt="Guarantor document preview" />
                                                    <div className="doc-meta">
                                                        <span>{documents.guarantorPhoto.name}</span>
                                                        <small>{documents.guarantorPhoto.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("guarantorPhoto")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <Upload size={22} className="upload-ico" />
                                                    <span>Upload Photo</span>
                                                    <small>JPG, PNG up to 6MB</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("guarantorPhoto", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Guarantor Citizenship Front */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">2. Guarantor Citizenship Front (नागरिकता अगाडि)</span>
                                            {documents.guarantorCitizenshipFront ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.guarantorCitizenshipFront.dataUrl} alt="Guarantor Citizenship Front" />
                                                    <div className="doc-meta">
                                                        <span>{documents.guarantorCitizenshipFront.name}</span>
                                                        <small>{documents.guarantorCitizenshipFront.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("guarantorCitizenshipFront")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <FileText size={22} className="upload-ico" />
                                                    <span>Upload Front Side</span>
                                                    <small>Clear photo of citizenship</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("guarantorCitizenshipFront", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Guarantor Citizenship Back */}
                                        <div className="doc-upload-card">
                                            <span className="doc-label">3. Guarantor Citizenship Back (नागरिकता पछाडि)</span>
                                            {documents.guarantorCitizenshipBack ? (
                                                <div className="doc-preview-box">
                                                    <img src={documents.guarantorCitizenshipBack.dataUrl} alt="Guarantor Citizenship Back" />
                                                    <div className="doc-meta">
                                                        <span>{documents.guarantorCitizenshipBack.name}</span>
                                                        <small>{documents.guarantorCitizenshipBack.size}</small>
                                                    </div>
                                                    <button type="button" className="remove-doc-btn" onClick={() => removeDocument("guarantorCitizenshipBack")}>
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="doc-dropzone">
                                                    <FileText size={22} className="upload-ico" />
                                                    <span>Upload Back Side</span>
                                                    <small>Clear photo of citizenship</small>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload("guarantorCitizenshipBack", e)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Terms & Submission */}
                            <div className="submission-action-card">
                                <label className="consent-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    />
                                    <span>
                                        I certify that the information and documents provided are authentic and
                                        authorize Lucky Impex to contact myself and my guarantor to process this EMI inquiry.
                                    </span>
                                </label>

                                <div className="submit-buttons-cluster">
                                    <button
                                        type="submit"
                                        disabled={submittingApp || !agreedToTerms}
                                        className="main-submit-btn"
                                    >
                                        {submittingApp ? (
                                            <span>Submitting Application & Documents...</span>
                                        ) : (
                                            <>
                                                <span>Submit Application for EMI Review (फारम पेश गर्नुहोस्)</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <a
                                        href={getWhatsAppUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="whatsapp-direct-btn"
                                    >
                                        <MessageCircle size={20} />
                                        <span>Send & Chat Directly via WhatsApp (+977 9802594022)</span>
                                    </a>
                                </div>
                                <p className="privacy-badge">
                                    🔒 Your documents and data are securely handled in accordance with privacy laws and solely used for EMI processing.
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                {/* ─── EMI Eligibility & Required Documents Checklist ──────── */}
                <div className="emi-checklist-section">
                    <div className="checklist-card">
                        <h3>📋 Required Documents Checklist (आवश्यक कागजातहरूको सूची)</h3>
                        <div className="checklist-cols-grid">
                            <div className="check-col">
                                <h4>Applicant (आवेदक)</h4>
                                <ul>
                                    <li><CheckCircle2 size={16} /> Nepali Citizenship Card (Original + Photocopy / Photo)</li>
                                    <li><CheckCircle2 size={16} /> 2 Passport-sized Photographs</li>
                                    <li><CheckCircle2 size={16} /> Active Mobile Phone Number (WhatsApp enabled)</li>
                                    <li><CheckCircle2 size={16} /> Proof of Income (Salary Certificate, Bank Statement or PAN)</li>
                                </ul>
                            </div>
                            <div className="check-col">
                                <h4>Guarantor / Granter (जमानी बस्ने व्यक्ति)</h4>
                                <ul>
                                    <li><CheckCircle2 size={16} /> Nepali Citizenship Card (Photocopy / Photo)</li>
                                    <li><CheckCircle2 size={16} /> 1 Passport-sized Photograph</li>
                                    <li><CheckCircle2 size={16} /> Must be Family Member or Close Relative</li>
                                    <li><CheckCircle2 size={16} /> Active Contact Number for Verification Call</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Frequently Asked Questions ──────────────────────────── */}
                <div className="emi-faq-section">
                    <h3>Frequently Asked Questions on EMI (प्राय: सोधिने प्रश्नहरू)</h3>
                    <div className="faq-grid">
                        <div className="faq-card">
                            <h4>How does the 0% Interest EMI & 40% Down Payment work?</h4>
                            <p>
                                You pay a standard <strong>40% down payment</strong> upfront at the time of purchase.
                                The remaining 60% balance is split into equal monthly installments with <strong>0% interest rate</strong>
                                (zero finance charges — you pay exactly the cash price divided over your chosen tenure!).
                            </p>
                        </div>
                        <div className="faq-card">
                            <h4>Who is eligible for 0% EMI at Lucky Impex?</h4>
                            <p>
                                Any Nepali citizen above 18 years of age residing in Birgunj, Parsa, Bara, or nearby
                                districts with a steady income source (salaried, business, or remittance) and a guarantor is eligible.
                            </p>
                        </div>
                        <div className="faq-card">
                            <h4>Why is a Guarantor (जमानी) required?</h4>
                            <p>
                                In Nepal, a guarantor ensures identity security and fast approval without requiring collateral.
                                A family member (father, mother, brother, spouse) can easily act as guarantor.
                            </p>
                        </div>
                        <div className="faq-card">
                            <h4>How fast will my application be approved?</h4>
                            <p>
                                After submitting your online details and documents, our EMI desk calls you within 24 business hours.
                                Most applications are finalized the same day!
                            </p>
                        </div>
                        <div className="faq-card">
                            <h4>Can I visit the store to submit documents?</h4>
                            <p>
                                Yes! You can bring your citizenship and photo directly to our showroom at
                                <strong> Ghantaghar Link Road, Birgunj</strong> or contact us via WhatsApp at
                                <strong> +977 9802594022</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
