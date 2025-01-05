import React from 'react';
import './NewYear.css';

const NewYear = () => {
    // Generate confetti with text
    const generateConfetti = () => {
        const confettiCount = 100; // Number of confetti pieces
        const letters = "HAPPYNEWYEARFROMLUCKYIMPEX0123456879"; // Characters for confetti text
        const confettiElements = [];

        for (let i = 0; i < confettiCount; i++) {
            // Randomly choose a letter/number for each confetti piece
            const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));

            // Create confetti with text
            confettiElements.push(
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        animationDelay: `${Math.random() * 2}s`,
                        fontSize: `${Math.random() * 10 + 12}px`, // Random font size for variety
                        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color for each confetti
                    }}
                >
                    {randomLetter}
                </div>
            );
        }

        return confettiElements;
    };

    // Get today's date
    const today = new Date();
    const date = today.toLocaleDateString(); // Formats the date as "MM/DD/YYYY"

    return (
        <div className="card-container">
            <div className="message-container">
                {generateConfetti()}
                <h1 className="happy-new-year">Happy New Year!</h1>
                <p className="sub-message">Wishing you a year filled with joy, success, and prosperity.</p>
                <p className="date-message">Today's Date: {date}</p>
            </div>
        </div>
    );
};

export default NewYear;
