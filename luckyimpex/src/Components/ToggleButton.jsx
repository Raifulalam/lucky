import React, { useState } from 'react';

const ToggleButton = () => {
    const [isOn, setIsOn] = useState(false);  // State to track whether it's on or off

    const handleToggle = () => {
        setIsOn(!isOn); // Toggle the state between true and false
    };

    return (
        <div>
            <button
                onClick={handleToggle}
                style={{
                    backgroundColor: isOn ? 'green' : 'red',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                }}
            >
                {isOn ? 'In Stock' : 'Out of Stock'}
            </button>
        </div>
    );
};

export default ToggleButton;
