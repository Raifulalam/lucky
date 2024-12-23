import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import FeedbackCard from './FeedbackCard';
import './Feedback.css';

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

            {loading ? (
                <p>Loading feedback messages...</p>
            ) : (
                <>
                    {status && <p>{status}</p>}
                    {feedbacks.length > 0 ? (
                        feedbacks.map((feedback) => (
                            <FeedbackCard
                                key={feedback.id}
                                name={feedback.name}
                                email={feedback.email}
                                message={feedback.message}
                            />
                        ))
                    ) : (
                        <p>No feedback messages available.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default FeedbackList;
