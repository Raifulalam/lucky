import React from 'react';

const FeedbackCard = ({ name, email, message }) => {
    return (
        <div className="feedback-card">
            <div className="feedback-header">
                <h3>{name}</h3>
                <p className="feedback-email"><strong>Email:</strong> {email}</p>
            </div>
            <div className="feedback-body">
                <p><strong>Message:</strong></p>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default FeedbackCard;
