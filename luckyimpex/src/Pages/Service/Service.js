import React, { useState } from 'react';
import './Service.css';
import Header from '../../Components/Header';

// Sample data for reviews
const sampleReviews = [
    { id: 1, name: 'Raj', review: 'Excellent customer service and quick delivery!' },
    { id: 2, name: 'Priya', review: 'Wide range of appliances available. Great experience.' },
    { id: 3, name: 'Suman', review: 'Fast response to issues. Highly recommended!' },
];

const LuckyImpexServicePage = () => {
    // Initialize with provided data
    const [personalDetails, setPersonalDetails] = useState({
        name: 'Marin',
        address: '1234 Elm Street, Kathmandu, Nepal',
        phone: '+977 1 234 5678',
        province: 'Bagmati Pradesh',
        district: 'Kathmandu',
    });

    const [productDetails, setProductDetails] = useState({
        product: 'Washing Machine',
        model: 'LG TWINWash',
        warranty: 'yes',
        issue: 'The washing machine is not starting.',
        image: null,
    });

    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState(sampleReviews);

    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const handlePersonalDetailsChange = (e) => {
        setPersonalDetails({ ...personalDetails, [e.target.name]: e.target.value });
    };

    const handleProductDetailsChange = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProductDetails({ ...productDetails, image: e.target.files[0] });
    };

    // Handle form submission for complaint
    const handleComplaintSubmit = async (e) => {
        e.preventDefault();

        if (!productDetails.product || !productDetails.model || !productDetails.issue || !productDetails.image) {
            alert('Please fill out all fields before submitting.');
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
            const response = await fetch('https://lucky-back-2.onrender.com/api/submitComplaint', {
                method: 'POST',
                body: formData,
            });

            // Check if the response is not ok (status not in the 200-299 range)
            if (!response.ok) {
                const textResponse = await response.text();
                console.error('Response error:', textResponse); // Log the HTML error response
                alert('Something went wrong with the server. Please try again.');
                return;
            }

            // Check if the response is JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();

                if (result.message) {
                    alert('Complaint Submitted! We will get back to you shortly.');
                    setPersonalDetails({ name: '', address: '', phone: '', province: '', district: '' });
                    setProductDetails({ product: '', model: '', warranty: '', issue: '', image: null });
                    document.getElementById("image").value = ""; // Clear the image input
                    setShowModal(false); // Close the modal after submission
                } else {
                    alert(`Error: ${result.message}`);
                }
            } else {
                alert('Expected JSON, but received a non-JSON response.');
                console.error('Unexpected response content:', contentType);
            }
        } catch (error) {
            console.error('Error during submission:', error);
            alert('An error occurred while submitting the complaint.');
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
        setCurrentStep(1); // Reset the modal to step 1
    };

    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        setReviews([...reviews, { id: reviews.length + 1, name: 'Anonymous', review }]);
        setReview('');
    };

    return (
        <>
            <Header />
            <div className="service-page-container">
                <h1>Welcome to Lucky Impex Service</h1>

                <button className="complaint-section" onClick={toggleModal}>Register a Complaint</button>

                <div className="service-page">
                    <div className="service-info">
                        <p>
                            Lucky Impex is a trusted and authorized dealer based in Birgunj, Nepal. We offer top-quality home appliances
                            and ensure the best customer service experience in the region. Our products include ACs, washing machines, TVs, LED
                            TVs, refrigerators, and much more. We are committed to providing you with fast, efficient, and reliable service.
                        </p>

                        <div className="reviews-section">
                            <h2>Customer Reviews</h2>
                            <ul>
                                {reviews.map((review) => (
                                    <li key={review.id}>
                                        <strong>{review.name}:</strong> {review.review}
                                    </li>
                                ))}
                            </ul>

                            <h3>Leave a Review</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Write your review"
                                    required
                                />
                                <button type="submit">Submit Review</button>
                            </form>
                        </div>
                    </div>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Register a Complaint</h2>
                                <hr />

                                {currentStep === 1 && (
                                    <div className="personal-details-form">
                                        <h3>Step 1: Personal Details</h3>
                                        <form>
                                            <div>
                                                <label htmlFor="name">Full Name:</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={personalDetails.name}
                                                    onChange={handlePersonalDetailsChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="address">Full Address:</label>
                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={personalDetails.address}
                                                    onChange={handlePersonalDetailsChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phone">Phone Number:</label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={personalDetails.phone}
                                                    onChange={handlePersonalDetailsChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="province">Select Province:</label>
                                                <select
                                                    id="province"
                                                    name="province"
                                                    value={personalDetails.province}
                                                    onChange={handlePersonalDetailsChange}
                                                    required
                                                >
                                                    <option value="Bagmati Pradesh">Bagmati Pradesh</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="district">Select District:</label>
                                                <select
                                                    id="district"
                                                    name="district"
                                                    value={personalDetails.district}
                                                    onChange={handlePersonalDetailsChange}
                                                    required
                                                >
                                                    <option value="Kathmandu">Kathmandu</option>
                                                </select>
                                            </div>

                                            <button type="button" onClick={handleNextStep} className="nextBtn">
                                                Next
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="product-details-form">
                                        <h3>Step 2: Product Details</h3>
                                        <form onSubmit={handleComplaintSubmit}>
                                            <div>
                                                <label htmlFor="product">Product Name:</label>
                                                <input
                                                    type="text"
                                                    id="product"
                                                    name="product"
                                                    value={productDetails.product}
                                                    onChange={handleProductDetailsChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="model">Model Number:</label>
                                                <input
                                                    type="text"
                                                    id="model"
                                                    name="model"
                                                    value={productDetails.model}
                                                    onChange={handleProductDetailsChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>Is the product under warranty?</label>
                                                <div className="audioBtn">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="warranty"
                                                            value="yes"
                                                            checked={productDetails.warranty === 'yes'}
                                                            onChange={handleProductDetailsChange}
                                                            required
                                                        />{' '}
                                                        Yes
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="warranty"
                                                            value="no"
                                                            checked={productDetails.warranty === 'no'}
                                                            onChange={handleProductDetailsChange}
                                                        />{' '}
                                                        No
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="issue">Describe the issue:</label>
                                                <textarea
                                                    id="issue"
                                                    name="issue"
                                                    value={productDetails.issue}
                                                    onChange={handleProductDetailsChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="image">Upload Product Image:</label>
                                                <input
                                                    type="file"
                                                    id="image"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-actions">
                                                <button type="button" onClick={handlePreviousStep}>
                                                    Previous
                                                </button>
                                                <button type="submit">Submit Complaint</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <span className="modal-close-btn" onClick={toggleModal}>X</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LuckyImpexServicePage;
