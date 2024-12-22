import React, { useEffect, useState } from 'react';
import FeedbackCard from './FeedbackCard';
import './Feedback.css';

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                // Example: Replace with actual API call
                const response = await fetch('https://lucky-back-2.onrender.com/api/contactMessages');
                const data = await response.json();
                setFeedbacks(data);  // Assuming response is an array of feedback objects
            } catch (error) {
                setStatus('Failed to load feedback messages');
            }
        };

        fetchFeedbacks();
    }, []);

    return (
        <div className="feedback-list">
            {status && <p>{status}</p>}
            {feedbacks.length > 0 ? (
                feedbacks.map((feedback, index) => (
                    <FeedbackCard
                        key={index}
                        name={feedback.name}
                        email={feedback.email}
                        message={feedback.message}
                    />
                ))
            ) : (
                <p>No feedback messages available.</p>
            )}
        </div>
    );
};

export default FeedbackList;
