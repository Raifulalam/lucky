import React, { useEffect, useState } from "react";
import './Complaints.css'; // Import the CSS file

const ComplaintsComponent = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch complaints data
    const fetchComplaintsData = async () => {
        try {
            const response = await fetch('https://lucky-back.onrender.com/api/getComplaint');
            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }
            const data = await response.json();
            setComplaints(data.complaints || []);  // Safely access complaints array
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Something went wrong. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false); // Stop loading once the fetch is done
        }
    };

    // Fetch complaints data on component mount
    useEffect(() => {
        fetchComplaintsData();
    }, []); // Empty array ensures this runs only once when the component mounts

    return (
        <div className="complaints-container">
            <h3>Complaint Details</h3>

            {/* Show loading spinner or message */}
            {loading && <p className="loading-message">Loading complaints...</p>}

            {/* Show error message if any */}
            {error && <p className="error-message">{error}</p>}

            {/* Display complaints if available */}
            {complaints.length > 0 ? (
                <table className="complaints-table">
                    <thead>
                        <tr>
                            <th>Complaint ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>Product</th>
                            <th>Model</th>
                            <th>Warranty</th>
                            <th>Issue</th>
                            <th>Complaint Date</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map((complaint) => (
                            <tr key={complaint._id}>
                                <td>{complaint._id}</td>
                                <td>{complaint.name}</td>
                                <td>{complaint.address}, {complaint.district}, {complaint.province}</td>
                                <td>{complaint.phone}</td>
                                <td>{complaint.product}</td>
                                <td>{complaint.model}</td>
                                <td>{complaint.warranty}</td>
                                <td>{complaint.issue}</td>
                                <td>{new Date(complaint.complaintdate).toLocaleDateString()}</td>
                                <td>
                                    {/* Render image with a fallback */}
                                    <img
                                        src={complaint.image}  // This is the Cloudinary URL
                                        alt="imgname"
                                        width="200"
                                        height="200"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p className="no-complaints">No complaints available.</p> // Only show if no complaints and not loading
            )}
        </div>
    );
};

export default ComplaintsComponent;
