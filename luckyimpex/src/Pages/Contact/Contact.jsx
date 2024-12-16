import React, { useState } from "react";
import './ContactComponent.css';
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header";
import Leaflet from '../../Components/Leaflet';

export const ContactComponent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState(null); // To handle success/error messages
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Handle form submission (e.g., send form data to an API or email)
            console.log(formData);
            // Example API request can go here (like `await sendMessage(formData);`)

            // On success:
            setStatus('Message sent successfully!');
        } catch (error) {
            setStatus('Failed to send message. Please try again later.');
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

                        <button type="submit" className="btn-submit">Send Message</button>
                    </form>
                    {status && <div className="status-message">{status}</div>}
                </div>
            </div>
        </div>
    );
};
