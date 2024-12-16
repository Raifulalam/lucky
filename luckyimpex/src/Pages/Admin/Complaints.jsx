import React, { useEffect, useState } from "react";
import './Complaints.css'; // Import the CSS file

const ComplaintsComponent = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle data fetching
    const handleComplaintsData = async () => {
        setLoading(true); // Start loading when fetch is initiated
        try {
            const response = await fetch('https://lucky-back.onrender.com/api/getComplaints');
            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }
            const data = await response.json();
            console.log(data);  // Log the response to see the structure
            setComplaints(data.complaints); // Access the complaints array in the response
            setError(null); // Clear any previous errors
        } catch (error) {
            setError(error.message); // Set the error message if fetch fails
        } finally {
            setLoading(false); // Stop loading once the fetch is done
        }
    };

    useEffect(() => {
        handleComplaintsData();
    }, []); // Run once when the component is mounted

    return (
        <div className="complaints-container">
            <h3>Complaint Details</h3>

            {/* Show loading message */}
            {loading && <p className="loading-message">Loading complaints...</p>}

            {/* Show error message */}
            {error && <p className="error-message">Error: {error}</p>}

            {/* Show complaints list in a table */}
            {complaints.length > 0 ? (
                <table className="complaints-table">
                    <thead>
                        <tr>
                            <th>Complaint IDs</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>Product</th>
                            <th>Model</th>
                            <th>Warranty</th>
                            <th>Issue</th>
                            <th>Complaint Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map((complaint) => (
                            <tr key={complaint._id}>
                                <td>{complaint._id}</td>
                                <td>{complaint.name}</td>
                                <td>{complaint.address},{complaint.district},{complaint.province}</td>
                                <td>{complaint.phone}</td>
                                <td>{complaint.product}</td>
                                <td>{complaint.model}</td>
                                <td>{complaint.warranty}</td>
                                <td>{complaint.issue}</td>
                                <td>{new Date(complaint.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-complaints">No complaints available.</p>
            )}
        </div>
    );
};

export default ComplaintsComponent;
