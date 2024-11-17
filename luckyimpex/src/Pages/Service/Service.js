import React, { useState } from 'react';
import './Service.css';
import Header from '../../Components/Header';
// Sample data for reviews (this would be fetched from an API in a real app)
const sampleReviews = [
    { id: 1, name: 'Raj', review: 'Excellent customer service and quick delivery!' },
    { id: 2, name: 'Priya', review: 'Wide range of appliances available. Great experience.' },
    { id: 3, name: 'Suman', review: 'Fast response to issues. Highly recommended!' },
];

const LuckyImpexServicePage = () => {
    // State to handle the current step of the form (Personal Details / Product Details)
    const [currentStep, setCurrentStep] = useState(1);

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

    // Handle form submission
    const handleComplaintSubmit = (e) => {
        e.preventDefault();
        // Handle complaint submission logic (API call or form processing)
        alert('Complaint Submitted! We will get back to you shortly.');
        setPersonalDetails('')
        setProductDetails('')
    };

    // Handle moving to the next step
    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    // Handle previous step
    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <div className="service-page-container">
            <Header />
            <h1>Welcome to Lucky Impex Service</h1>
            <div className="service-page">

                <div className="service-info">
                    <p>
                        Lucky Impex is a trusted and authorized dealer based in Birgunj, Nepal. We offer top-quality home appliances
                        and ensure the best customer service experience in the region. Our products include ACs, washing machines, TVs, LED
                        TVs, refrigerators, and much more. We are committed to providing you with fast, efficient, and reliable service.
                    </p>
                    {/* Customer Reviews Section */}
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
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setReviews([...reviews, { id: reviews.length + 1, name: 'Anonymous', review }]);
                                setReview('');
                            }}
                        >
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

                <div className="complaint-section">
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
                                        <option value="achham">Achham</option>
                                        <option value="arghakhanchi">Arghakhanchi</option>
                                        <option value="argakhanchi">Argakhanchi</option>
                                        <option value="baglung">Baglung</option>
                                        <option value="bagmati">Bagmati</option>
                                        <option value="bajhang">Bajhang</option>
                                        <option value="bajura">Bajura</option>
                                        <option value="banke">Banke</option>
                                        <option value="bara">Bara</option>
                                        <option value="bardiya">Bardiya</option>
                                        <option value="bhaktapur">Bhaktapur</option>
                                        <option value="bhojpur">Bhojpur</option>
                                        <option value="chandrapur">Chandrapur</option>
                                        <option value="chitwan">Chitwan</option>
                                        <option value="darchula">Darchula</option>
                                        <option value="dailekh">Dailekh</option>
                                        <option value="dang">Dang</option>
                                        <option value="dhanusa">Dhanusa</option>
                                        <option value="dholkha">Dholkha</option>
                                        <option value="dolakha">Dolakha</option>
                                        <option value="dolpa">Dolpa</option>
                                        <option value="doti">Doti</option>
                                        <option value="eastern">Eastern</option>
                                        <option value="gulmi">Gulmi</option>
                                        <option value="gorkha">Gorkha</option>
                                        <option value="hadiya">Hadiya</option>
                                        <option value="himalaya">Himalaya</option>
                                        <option value="illam">Ilam</option>
                                        <option value="jajarkot">Jajarkot</option>
                                        <option value="jakhar">Jakhar</option>
                                        <option value="jajarkot">Jajarkot</option>
                                        <option value="janakpur">Janakpur</option>
                                        <option value="japdi">Japdi</option>
                                        <option value="kailali">Kailali</option>
                                        <option value="kaski">Kaski</option>
                                        <option value="kathmandu">Kathmandu</option>
                                        <option value="kavre">Kavre</option>
                                        <option value="khotang">Khotang</option>
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

                                <button type="button" onClick={handleNextStep} className='nextBtn'>
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

                                <div >
                                    <label>Is the product under warranty?</label>
                                    <div className='audioBtn'>
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


            </div>
        </div>
    );
};

export default LuckyImpexServicePage;
