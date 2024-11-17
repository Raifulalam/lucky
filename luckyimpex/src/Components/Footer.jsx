import React from 'react';

import logo from '../Images/logo.png';
import messageImg from '../Images/icon-messages.svg';
import facebookImg from '../Images/facebook.webp';
import mailImg from '../Images/gmail.png';
import callImg from '../Images/phone-call.png';

const Footer = () => {
    return (
        <div className="footer">
            <divv className="footInfo">
                <div className="left-section" id="lucky-contact">
                    <div className="lef">
                        <img src={messageImg} alt="Contact Us" />
                        <h2>Contact Us</h2>
                    </div>
                    <div className="lorem">
                        <p>
                            For more information, you can visit our Facebook page here. If you’re interested in specific products or have any other inquiries, feel free to contact us.
                            Happy shopping!
                        </p>
                    </div>
                    <div className="contact">
                        <div className="whatsapp">
                            <a href="https://www.facebook.com/luckyimpex4u/">
                                <img src={facebookImg} alt="Facebook" />
                            </a>
                            <p>Facebook</p>
                        </div>
                        <div className="email">
                            <a href="mailto:luckyimpex4u@gmail.com">
                                <img src={mailImg} alt="Email" />
                            </a>
                            <a href="mailto:luckyimpex4u@gmail.com">luckyimpex4u@gmail.com</a>
                        </div>
                        <div className="whatsapp">
                            <a href="https://wa.me/+9779845268651">
                                <img src={logo} alt="Whatsapp" />
                            </a>
                            <p>+977 9845268651</p>
                        </div>
                        <div className="phone">
                            <img src={callImg} alt="Phone" />
                            <span>PH: 051531789,</span>
                            <span> 9807216321</span>
                        </div>
                    </div>
                </div>

                <div className="right-section" id="lucky-services">
                    <div>
                        <h3>Our Services</h3>
                    </div>
                    <div className="note">
                        <p>Customer service is not a department, it's everyone's job. We provide the best services to our customers 24x7, with home service facility.</p>
                        <span>Since 2009</span>
                    </div>
                </div>
            </divv>


            <div className="foot">
                <div>
                    <p>@2024 All rights reserved to Lucky Impex</p>
                </div>
            </div>
        </div>

    );
};

export default Footer;
