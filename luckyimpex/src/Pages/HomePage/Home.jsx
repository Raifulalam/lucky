import { React, useState, useEffect } from "react";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

import luckyImage from '../../Images/lucky.png';
import mainbranch from '../../Images/main-branch.jpg';
import mobileImg from '../../Images/mobile.png';
import backimg from '../../Images/backimg.jpg';
import back01 from '../../Images/back01.png';
import back02 from '../../Images/back04.jpg';
import back03 from '../../Images/back03.jpg';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const images = [
        luckyImage,
        backimg,
        back01,
        back02,
        back03,
    ];

    // Handle radio button click
    const handleRadioChange = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div>
            <Header />
            {/* Home Section */}
            <div className="home-main">
                <div className="image">
                    <div className="lucky-details">
                        <h3 className="lucky-welcome">Welcome to!</h3>
                        <h1 className="lucky-head">Lucky Impex</h1>
                        <p className="lucky-para">Make dreams come true.</p>
                    </div>

                    {/* Slider Image */}
                    <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="slider-image" />

                    {/* Radio Buttons for Slide Navigation */}
                    <div className="slider-radio-buttons">
                        {images.map((_, index) => (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="slider"
                                    checked={currentSlide === index}
                                    onChange={() => handleRadioChange(index)}
                                    className="slider-radio"
                                    aria-label={`Slide ${index + 1}`}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="lucky-main-body">
                <div className="details">
                    <span>Our Products</span>
                    <p>
                        <strong>Lucky Impex</strong> is a well-known electronic brand showroom located in Birgunj, Nepal. We specialize in a wide range of electronic home appliances, including air conditioners, water heaters, washing machines, refrigerators, water coolers, and LED TVs. Lucky Impex offers products from reputable brands such as <strong>LG, Samsung, Haier, Whirlpool, CG, and Hyundai.</strong>
                    </p>

                    {/* Product List */}
                    <ul>
                        <li><strong>Air Conditioners:</strong> Lucky Impex provides LG air conditioners...</li>
                        <li><strong>Washing Machines:</strong> The showroom offers LG washing machines...</li>
                        <li><strong>LED TVs:</strong> Lucky Impex is Nepal’s No. 1 UHD TV brand...</li>
                        <li><strong>Microwave Ovens:</strong> Prepare delicious foods with microwave ovens...</li>
                        <li><strong>Washer Dryers:</strong> Washer dryers provide an all-in-one laundry solution...</li>
                        <li><strong>Water Heaters:</strong> Lucky Impex offers a wide range of water heaters...</li>
                    </ul>
                </div>
            </div>

            {/* Branch Details */}
            <div className="branch-details">
                <div className="main-branch">

                    <div className="main-branch-details">
                        <h2>Main Branch</h2>
                        <span>
                            Address: Link Road, Birgunj, 44300 <br />
                            Operating Hours: Monday to Saturday, 9:00 AM to 8:00 PM, Sunday 9:00 AM to 5:00 PM.
                        </span>
                        <div className="phone">
                            <img src={mobileImg} alt="Phone" />
                            <span>PH: 051531789</span>
                        </div>
                    </div>
                    <div className="image-container">
                        <img src={mainbranch} alt="Main Branch" />
                    </div>
                </div>

                <div className="maisthan-branch">
                    <div className="maisthan-branch-details">
                        <h2>Maisthan Branch</h2>
                        <span>
                            Lucky Impex recently opened its Maisthan branch in Birgunj, Nepal.
                            Location: Maisthan near Durga Medical (in front of Jyoti Bikash Bank).
                        </span>
                        <div className="phone">
                            <img src={mobileImg} alt="Phone" />
                            <span>PH: (+977) 9807216321</span>
                        </div>
                    </div>
                    <div className="image-container">
                        <img src={mainbranch} alt="Maisthan Branch" />
                    </div>
                </div>
                <div className="main-branch">

                    <div className="main-branch-details">
                        <h2>Simra Branch</h2>
                        <span>
                            Address: Link Road, Birgunj, 44300 <br />
                            Operating Hours: Monday to Saturday, 9:00 AM to 8:00 PM, Sunday 9:00 AM to 5:00 PM.
                        </span>
                        <div className="phone">
                            <img src={mobileImg} alt="Phone" />
                            <span>PH: 051531789</span>
                        </div>
                    </div>
                    <div className="image-container">
                        <img src={mainbranch} alt="Simra Branch" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
