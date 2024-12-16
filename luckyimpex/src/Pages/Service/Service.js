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
    // State to handle personal details form
    const [personalDetails, setPersonalDetails] = useState({
        name: '',
        address: '',
        phone: '',
        province: '',
        district: '',
    });

    // State to handle product details form
    const [productDetails, setProductDetails] = useState({
        product: '',
        model: '',
        warranty: '',
        issue: '',
        image: null,
    });

    // State to handle customer review form
    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState(sampleReviews);

    // State to control modal visibility
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // Step management in the modal

    // Handle personal details input changes
    const handlePersonalDetailsChange = (e) => {
        setPersonalDetails({ ...personalDetails, [e.target.name]: e.target.value });
    };

    // Handle product details input changes
    const handleProductDetailsChange = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    // Handle file input (product image)
    const handleFileChange = (e) => {
        setProductDetails({ ...productDetails, image: e.target.files[0] });
    };

    // Handle form submission for complaint
    const handleComplaintSubmit = async (e) => {
        e.preventDefault();

        // Check if all required fields are filled
        if (!productDetails.product || !productDetails.model || !productDetails.issue || !productDetails.image) {
            alert('Please fill out all fields before submitting.');
            return;
        }

        // Prepare the data to send to the backend
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
            const response = await fetch('https://lucky-back.onrender.com/api/submitComplaint', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // If response is not OK, log error
                alert(`Error: ${data.message || 'Something went wrong'}`);
                return;
            }

            alert('Complaint Submitted! We will get back to you shortly.');
            // Reset form fields
            setPersonalDetails({
                name: '',
                address: '',
                phone: '',
                province: '',
                district: '',
            });
            setProductDetails({
                product: '',
                model: '',
                warranty: '',
                issue: '',
                image: null,
            });
            document.getElementById("image").value = "";  // Reset file input
            setShowModal(false); // Close the modal after submission
        } catch (error) {
            console.error('Error during submission:', error);
            alert('An error occurred while submitting the complaint.');
        }
    };

    // Handle opening and closing of the complaint modal
    const toggleModal = () => {
        setShowModal(!showModal);
        setCurrentStep(1); // Reset to the first step when opening the modal
    };

    // Handle "Next" step in the modal form
    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    // Handle "Previous" step in the modal form
    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    // Handle review submission
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
                    {/* Service Information */}
                    <div className="service-info">
                        <p>
                            Lucky Impex is a trusted and authorized dealer based in Birgunj, Nepal. We offer top-quality home appliances
                            and ensure the best customer service experience in the region. Our products include ACs, washing machines, TVs, LED
                            TVs, refrigerators, and much more. We are committed to providing you with fast, efficient, and reliable service.
                        </p>

                        {/* Customer Reviews */}
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

                    {/* Complaint Modal */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Register a Complaint</h2>
                                <hr />

                                {/* Step 1: Personal Details Form */}
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
                                                    <option value="">--Select Province--</option>
                                                    <option value="Koshi Pradesh">Koshi Pradesh</option>
                                                    <option value="Madhesh Pradesh">Madhesh Pradesh</option>
                                                    <option value="Bagmati Pradesh">Bagmati Pradesh</option>
                                                    <option value="Gandaki Pradesh">Gandaki Pradesh</option>
                                                    <option value="Lumbini Pradesh">Lumbini Pradesh</option>
                                                    <option value="Karnali Pradesh">Karnali Pradesh</option>
                                                    <option value="Sudurpaschim Pradesh">Sudurpaschim Pradesh</option>
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
                                                    <option>Select District</option>
                                                    <option value="lamjung">Lamjung</option>
                                                    <option value="mahottari">Mahottari</option>
                                                    <option value="makawanpur">Makawanpur</option>
                                                    <option value="manang">Manang</option>
                                                    <option value="morang">Morang</option>
                                                    <option value="mugu">Mugu</option>
                                                    <option value="nawalparasi">Nawalparasi</option>
                                                    <option value="nepalgunj">Nepalgunj</option>
                                                    <option value="okhaldhunga">Okhaldhunga</option>
                                                    <option value="palpa">Palpa</option>
                                                    <option value="parbat">Parbat</option>
                                                    <option value="parsa">Parsa</option>
                                                    <option value="rukum">Rukum</option>
                                                    <option value="rupandehi">Rupandehi</option>
                                                    <option value="saptari">Saptari</option>
                                                    <option value="sarlahi">Sarlahi</option>
                                                    <option value="sindhuli">Sindhuli</option>
                                                    <option value="sindhupalchok">Sindhupalchok</option>
                                                    <option value="siraha">Siraha</option>
                                                    <option value="solukhumbu">Solukhumbu</option>
                                                    <option value="sunsari">Sunsari</option>
                                                    <option value="surkhet">Surkhet</option>
                                                    <option value="syangja">Syangja</option>
                                                    <option value="taplejung">Taplejung</option>
                                                    <option value="terhathum">Terhathum</option>
                                                    <option value="udayapur">Udayapur</option>
                                                    <option value="kaski">Kaski</option>
                                                </select>
                                            </div>

                                            <button type="button" onClick={handleNextStep} className="nextBtn">
                                                Next
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Step 2: Product Details Form */}
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

                            <span className="modal-close-btn" onClick={toggleModal}>
                                X
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LuckyImpexServicePage;
