import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({ show, onClose, children, title, size = "medium" }) => {
    // Close modal with Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (show) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
            role="presentation"
        >
            <div
                className={`modal-content modal-${size}`}
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
            >
                <div className="modal-header">
                    {title && (
                        <h2 id="modal-title" className="modal-title">
                            {title}
                        </h2>
                    )}

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;