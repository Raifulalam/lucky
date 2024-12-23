import React, { useState } from "react";
import './ContactComponent.css';
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header";
import Leaflet from '../../Components/Leaflet';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // You can import more social icons if needed

export const ContactComponent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState(null); // To handle success/error messages
    const [loading, setLoading] = useState(false); // To handle loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading state to true when submitting

        // Basic email validation
        if (!formData.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            setStatus("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://lucky-back-2.onrender.com/api/contactMessage", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (result.message === 'Contact message saved successfully!') {
                setStatus('Message sent successfully');
                setFormData({ name: '', email: '', message: '' }); // Reset form on success
            } else {
                setStatus('Failed to send message');
            }
        } catch (error) {
            setStatus('Failed to send message. Please try again later.');
            console.error('Error during message submission:', error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className="contact">
            <Helmet>
                <title>Contact Us</title>
                <meta name="description" content="Contact us at Lucky Impex" />
            </Helmet>
            <Header />

            <div className="contact-header">
                <h1>Contact Us</h1>
                <p>We'd love to hear from you! Please fill out the form below.</p>
            </div>

            <div className="contact-container">
                <div className="contact-left">
                    <h2>Get in Touch</h2>
                    <p>If you have any questions, feel free to reach out to us!</p>
                    <ul>
                        <li><strong>Email:</strong> luckyimpex4u@gmail.com</li>
                        <li><strong>Phone:</strong> 051531789</li>
                        <li><strong>Address:</strong> Ghantaghar linkroad, Birgunj, Nepal</li>
                    </ul>
                    <Leaflet />
                </div>

                <div className="contact-right">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                aria-label="Name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                aria-label="Email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message:</label>
                            <textarea
                                className="form-control"
                                id="message"
                                rows="4"
                                placeholder="Enter your message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                aria-label="Message"
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>

                    {status && (
                        <div className={`status-message ${status.includes('successfully') ? 'success' : 'error'}`}>
                            {status}
                        </div>
                    )}
                </div>
            </div>

            {/* Social Media Section */}
            <div className="social-media">
                <h3>Follow Us</h3>
                <div className="social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <FaFacebook />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <FaTwitter />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaInstagram />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <FaLinkedin />
                    </a>
                </div>
            </div>
        </div>
    );
};
