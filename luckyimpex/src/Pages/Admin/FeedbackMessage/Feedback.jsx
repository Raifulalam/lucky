import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import './Feedback.css';

// TableRow component to display each feedback entry
const TableRow = ({ name, email, message }) => (
    <tr className="feedback-table-row">
        <td className="feedback-table-cell">{name}</td>
        <td className="feedback-table-cell">
            {/* Create a mailto link for the email */}
            <a href={`mailto:${email}`} className="feedback-email-link">
                {email}
            </a>
        </td>
        <td className="feedback-table-cell">{message}</td>
    </tr>
);

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://lucky-back-2.onrender.com/api/contactMessages');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setFeedbacks(data);
                setStatus('');
            } catch (error) {
                setStatus('Failed to load feedback messages');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    return (
        <div className="feedback-list">
            <Helmet>
                <title>Feedback - Lucky Impex</title>
                <meta name="description" content="View feedback messages from customers of Lucky Impex." />
            </Helmet>

            <div className="feedback-head">
                <h1>Customer Feedback</h1>
                <p>Your opinion matters! Here's what our clients have to say about us.</p>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading feedback messages...</p>
                </div>
            ) : (
                <>
                    {status && <p className="error-message">{status}</p>}
                    {feedbacks.length > 0 ? (
                        <div className="feedback-table-container">
                            <table className="feedback-table">
                                <thead>
                                    <tr>
                                        <th className="feedback-table-header">Name</th>
                                        <th className="feedback-table-header">Email</th>
                                        <th className="feedback-table-header">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.map((feedback) => (
                                        <TableRow
                                            key={feedback.id}
                                            name={feedback.name}
                                            email={feedback.email}
                                            message={feedback.message}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No feedback messages available.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default FeedbackList;
