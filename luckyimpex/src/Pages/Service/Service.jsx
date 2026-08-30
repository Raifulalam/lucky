import React, { useState } from "react";
import "./Service.css";

import Header from "../../Components/Header";
import { BASE_URL } from "../../api/api";
import PageSeo from "../../Components/PageSeo";
import Breadcrumbs from "../../Components/Breadcrumbs";
import GoogleReviews from "../../Components/GoogleReviews";

const LuckyImpexServicePage = () => {
    // =========================
    // Personal Details
    // =========================
    const [personalDetails, setPersonalDetails] = useState({
        name: "",
        address: "",
        phone: "",
        province: "",
        district: "",
    });

    // =========================
    // Product Details
    // =========================
    const [productDetails, setProductDetails] = useState({
        product: "",
        model: "",
        warranty: "",
        issue: "",
        image: null,
    });

    // =========================
    // Complaint Modal
    // =========================
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // =========================
    // Handle Personal Details
    // =========================
    const handlePersonalDetailsChange = (e) => {
        const { name, value } = e.target;

        setPersonalDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // Handle Product Details
    // =========================
    const handleProductDetailsChange = (e) => {
        const { name, value } = e.target;

        setProductDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // Handle Image
    // =========================
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;

        setProductDetails((prev) => ({
            ...prev,
            image: file,
        }));
    };

    // =========================
    // Open / Close Modal
    // =========================
    const toggleModal = () => {
        setShowModal((prev) => !prev);
        setCurrentStep(1);
    };

    // =========================
    // Next Step
    // =========================
    const handleNextStep = () => {
        // Validate personal details before going to Step 2
        if (
            !personalDetails.name ||
            !personalDetails.address ||
            !personalDetails.phone ||
            !personalDetails.province ||
            !personalDetails.district
        ) {
            alert("Please fill out all personal details before continuing.");
            return;
        }

        setCurrentStep(2);
    };

    // =========================
    // Previous Step
    // =========================
    const handlePreviousStep = () => {
        setCurrentStep(1);
    };

    // =========================
    // Submit Complaint
    // =========================
    const handleComplaintSubmit = async (e) => {
        e.preventDefault();

        if (
            !productDetails.product ||
            !productDetails.model ||
            !productDetails.warranty ||
            !productDetails.issue ||
            !productDetails.image
        ) {
            alert("Please fill out all fields before submitting.");
            return;
        }

        const formData = new FormData();

        formData.append("name", personalDetails.name);
        formData.append("address", personalDetails.address);
        formData.append("phone", personalDetails.phone);
        formData.append("province", personalDetails.province);
        formData.append("district", personalDetails.district);

        formData.append("product", productDetails.product);
        formData.append("model", productDetails.model);
        formData.append("warranty", productDetails.warranty);
        formData.append("issue", productDetails.issue);
        formData.append("image", productDetails.image);

        try {
            setSubmitting(true);

            const response = await fetch(
                `${BASE_URL}/complaints/complaints`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const contentType =
                response.headers.get("content-type") || "";

            if (!response.ok) {
                const errorText = await response.text();

                console.error(
                    "Complaint submission error:",
                    errorText
                );

                alert(
                    "Something went wrong with the server. Please try again."
                );

                return;
            }

            if (contentType.includes("application/json")) {
                const result = await response.json();

                if (result.message) {
                    alert(
                        "Complaint Submitted! We will get back to you shortly."
                    );

                    // Reset personal details
                    setPersonalDetails({
                        name: "",
                        address: "",
                        phone: "",
                        province: "",
                        district: "",
                    });

                    // Reset product details
                    setProductDetails({
                        product: "",
                        model: "",
                        warranty: "",
                        issue: "",
                        image: null,
                    });

                    // Clear file input
                    const imageInput =
                        document.getElementById("image");

                    if (imageInput) {
                        imageInput.value = "";
                    }

                    // Close modal
                    setShowModal(false);
                    setCurrentStep(1);
                } else {
                    alert(
                        result.message ||
                            "Unable to submit complaint."
                    );
                }
            } else {
                alert(
                    "Unexpected response from server. Please try again."
                );

                console.error(
                    "Unexpected content type:",
                    contentType
                );
            }
        } catch (error) {
            console.error(
                "Error during complaint submission:",
                error
            );

            alert(
                "An error occurred while submitting the complaint."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* =========================
                SEO
            ========================= */}
            <PageSeo
                title="Service & Customer Reviews | Lucky Impex"
                description="Register complaints, view genuine customer reviews, and get support from Lucky Impex in Birgunj, Nepal."
                canonicalPath="/service"
                breadcrumbs={[
                    {
                        label: "Home",
                        to: "/",
                    },
                    {
                        label: "Service",
                    },
                ]}
            />

            {/* =========================
                Header
            ========================= */}
            <Header />

            {/* =========================
                Breadcrumbs
            ========================= */}
            <Breadcrumbs
                items={[
                    {
                        label: "Home",
                        to: "/",
                    },
                    {
                        label: "Service",
                    },
                ]}
            />

            {/* =========================
                Main Container
            ========================= */}
            <div className="service-page-container">

                <h1>
                    Welcome to Lucky Impex Service
                </h1>

                {/* =========================
                    Complaint Button
                ========================= */}
                <button
                    className="complaint-section"
                    onClick={toggleModal}
                >
                    Register a Complaint
                </button>

                <div className="service-page">

                    <div className="service-info">

                        {/* =========================
                            Service Description
                        ========================= */}
                        <p>
                            Lucky Impex is a trusted and authorized
                            dealer based in Birgunj, Nepal. We offer
                            top-quality home appliances and ensure
                            the best customer service experience in
                            the region.
                        </p>

                        <p>
                            Our products include ACs, washing
                            machines, TVs, LED TVs, refrigerators,
                            microwave ovens, and much more. We are
                            committed to providing fast, efficient,
                            and reliable service to our customers.
                        </p>

                        {/* =========================
                            GOOGLE REVIEWS
                        ========================= */}
                        <GoogleReviews />

                    </div>

                    {/* =========================
                        COMPLAINT MODAL
                    ========================= */}
                    {showModal && (
                        <div
                            className="modal-overlay"
                            onClick={(e) => {
                                if (
                                    e.target ===
                                    e.currentTarget
                                ) {
                                    toggleModal();
                                }
                            }}
                        >

                            <div className="modal">

                                {/* Close Button */}
                                <button
                                    type="button"
                                    className="modal-close-btn"
                                    onClick={toggleModal}
                                    aria-label="Close"
                                >
                                    ×
                                </button>

                                <h2>
                                    Register a Complaint
                                </h2>

                                <hr />

                                {/* =========================
                                    STEP 1
                                ========================= */}
                                {currentStep === 1 && (
                                    <div className="personal-details-form">

                                        <h3>
                                            Step 1: Personal Details
                                        </h3>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleNextStep();
                                            }}
                                        >

                                            {/* Name */}
                                            <div>
                                                <label htmlFor="name">
                                                    Full Name:
                                                </label>

                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={
                                                        personalDetails.name
                                                    }
                                                    onChange={
                                                        handlePersonalDetailsChange
                                                    }
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label htmlFor="address">
                                                    Full Address:
                                                </label>

                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={
                                                        personalDetails.address
                                                    }
                                                    onChange={
                                                        handlePersonalDetailsChange
                                                    }
                                                    placeholder="Enter your full address"
                                                    required
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label htmlFor="phone">
                                                    Phone Number:
                                                </label>

                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={
                                                        personalDetails.phone
                                                    }
                                                    onChange={
                                                        handlePersonalDetailsChange
                                                    }
                                                    placeholder="+977"
                                                    required
                                                />
                                            </div>

                                            {/* Province */}
                                            <div>
                                                <label htmlFor="province">
                                                    Select Province:
                                                </label>

                                                <select
                                                    id="province"
                                                    name="province"
                                                    value={
                                                        personalDetails.province
                                                    }
                                                    onChange={
                                                        handlePersonalDetailsChange
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select Province
                                                    </option>

                                                    <option value="Koshi Province">
                                                        Koshi Province
                                                    </option>

                                                    <option value="Madhesh Province">
                                                        Madhesh Province
                                                    </option>

                                                    <option value="Bagmati Province">
                                                        Bagmati Province
                                                    </option>

                                                    <option value="Gandaki Province">
                                                        Gandaki Province
                                                    </option>

                                                    <option value="Lumbini Province">
                                                        Lumbini Province
                                                    </option>

                                                    <option value="Karnali Province">
                                                        Karnali Province
                                                    </option>

                                                    <option value="Sudurpashchim Province">
                                                        Sudurpashchim Province
                                                    </option>
                                                </select>
                                            </div>

                                            {/* District */}
                                            <div>
                                                <label htmlFor="district">
                                                    District:
                                                </label>

                                                <input
                                                    type="text"
                                                    id="district"
                                                    name="district"
                                                    value={
                                                        personalDetails.district
                                                    }
                                                    onChange={
                                                        handlePersonalDetailsChange
                                                    }
                                                    placeholder="Enter your district"
                                                    required
                                                />
                                            </div>

                                            {/* Next */}
                                            <button
                                                type="submit"
                                                className="nextBtn"
                                            >
                                                Next
                                            </button>

                                        </form>
                                    </div>
                                )}

                                {/* =========================
                                    STEP 2
                                ========================= */}
                                {currentStep === 2 && (
                                    <div className="product-details-form">

                                        <h3>
                                            Step 2: Product Details
                                        </h3>

                                        <form
                                            onSubmit={
                                                handleComplaintSubmit
                                            }
                                        >

                                            {/* Product */}
                                            <div>
                                                <label htmlFor="product">
                                                    Product Name:
                                                </label>

                                                <input
                                                    type="text"
                                                    id="product"
                                                    name="product"
                                                    value={
                                                        productDetails.product
                                                    }
                                                    onChange={
                                                        handleProductDetailsChange
                                                    }
                                                    placeholder="e.g. Refrigerator"
                                                    required
                                                />
                                            </div>

                                            {/* Model */}
                                            <div>
                                                <label htmlFor="model">
                                                    Model Number:
                                                </label>

                                                <input
                                                    type="text"
                                                    id="model"
                                                    name="model"
                                                    value={
                                                        productDetails.model
                                                    }
                                                    onChange={
                                                        handleProductDetailsChange
                                                    }
                                                    placeholder="Enter model number"
                                                    required
                                                />
                                            </div>

                                            {/* Warranty */}
                                            <div>
                                                <label>
                                                    Is the product under warranty?
                                                </label>

                                                <div className="audioBtn">

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="warranty"
                                                            value="yes"
                                                            checked={
                                                                productDetails.warranty ===
                                                                "yes"
                                                            }
                                                            onChange={
                                                                handleProductDetailsChange
                                                            }
                                                            required
                                                        />

                                                        {" "}
                                                        Yes
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="warranty"
                                                            value="no"
                                                            checked={
                                                                productDetails.warranty ===
                                                                "no"
                                                            }
                                                            onChange={
                                                                handleProductDetailsChange
                                                            }
                                                        />

                                                        {" "}
                                                        No
                                                    </label>

                                                </div>
                                            </div>

                                            {/* Issue */}
                                            <div>
                                                <label htmlFor="issue">
                                                    Describe the issue:
                                                </label>

                                                <textarea
                                                    id="issue"
                                                    name="issue"
                                                    value={
                                                        productDetails.issue
                                                    }
                                                    onChange={
                                                        handleProductDetailsChange
                                                    }
                                                    placeholder="Describe the problem with your product"
                                                    required
                                                />
                                            </div>

                                            {/* Image */}
                                            <div>
                                                <label htmlFor="image">
                                                    Upload Product Image:
                                                </label>

                                                <input
                                                    type="file"
                                                    id="image"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={
                                                        handleFileChange
                                                    }
                                                    required
                                                />

                                                {productDetails.image && (
                                                    <small>
                                                        Selected:{" "}
                                                        {
                                                            productDetails
                                                                .image
                                                                .name
                                                        }
                                                    </small>
                                                )}
                                            </div>

                                            {/* Buttons */}
                                            <div className="form-actions">

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handlePreviousStep
                                                    }
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    Previous
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    {submitting
                                                        ? "Submitting..."
                                                        : "Submit Complaint"}
                                                </button>

                                            </div>

                                        </form>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default LuckyImpexServicePage;

