import React from 'react';

const FeedbackCard = ({ name, email, message }) => {
    return (
        <div className="feedback-card">
            <h3>{name}</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Message:</strong> {message}</p>
        </div>
    );
};

export default FeedbackCard;
