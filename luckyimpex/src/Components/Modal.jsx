import React from 'react';
import './Modal.css'; // Import the CSS for styling

const Modal = ({ show, onClose, children }) => {
    if (!show) return null; // If show is false, the modal won't render

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    &times; {/* This is the close button */}
                </button>
                {children} {/* Content passed as children */}
            </div>
        </div>
    );
};

export default Modal;
