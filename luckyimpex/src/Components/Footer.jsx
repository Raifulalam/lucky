import React from 'react';
import './Footer.css'; // Assuming you create a Footer.css for the styles

const Footer = () => {
    return (
        <div className="footer">
            <div className="footer-content">


                <div className="footer-right">
                    <ul className="social-links">
                        <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                        <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                    </ul>
                </div>
                <div className="footer-left">
                    <p>&#169; 2025 All rights reserved to Lucky Impex</p>
                </div>
            </div>
        </div>
    );
};

export default Footer;
