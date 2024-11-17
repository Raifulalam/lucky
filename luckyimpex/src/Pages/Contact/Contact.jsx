import React, { useState } from "react";
import './ContactComponent.css';
import { useNavigate } from "react-router-dom";

export const ContactComponent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission (e.g., send form data to an API or email)
        console.log(formData);
    };
    const handleBack = () => {
        navigate('/')
    }

    return (
        <div className="contact">
            <button onClick={handleBack}>go back</button>
            <div className="contact-header">
                <h1>Contact Us</h1>
                <p>We'd love to hear from you! Please fill out the form below.</p>
            </div>

            <div className="contact-container">
                <div className="contact-left">
                    <h2>Get in Touch</h2>
                    <p>If you have any questions, feel free to reach out to us!</p>
                    <ul>
                        <li><strong>Email:</strong> support@example.com</li>
                        <li><strong>Phone:</strong> +1 (800) 123-4567</li>
                        <li><strong>Address:</strong> 123 Street, City, Country</li>
                    </ul>
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
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
