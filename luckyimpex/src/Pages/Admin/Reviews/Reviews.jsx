import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Reviews.css";

import { BASE_URL } from "../../../api/api";


import {
    Check,
    Clock,
    RefreshCw,
    Star,
    Trash2,
    Users,
} from "lucide-react";


const Reviews = () => {
    const token = localStorage.getItem("authToken");

    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    // ============================================
    // FETCH ALL REVIEWS
    // ============================================

    const fetchReviews = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${BASE_URL}/review/admin`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch reviews."
                );
            }

            setReviews(data.reviews || []);
        } catch (err) {
            console.error("Fetch reviews error:", err);
            setError(err.message || "Unable to load reviews.");
        } finally {
            setLoading(false);
        }
    }, [token]);


    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);


    // ============================================
    // APPROVE REVIEW
    // ============================================

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this review?")) {
            return;
        }

        try {
            setActionLoading(id);
            setError("");

            const response = await fetch(
                `${BASE_URL}/review/${id}/approve`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to approve review."
                );
            }

            // Update UI immediately
            setReviews((prevReviews) =>
                prevReviews.map((review) =>
                    review._id === id
                        ? { ...review, isApproved: true }
                        : review
                )
            );
        } catch (err) {
            console.error("Approve review error:", err);

            setError(
                err.message || "Unable to approve review."
            );
        } finally {
            setActionLoading(null);
        }
    };


    // ============================================
    // DELETE REVIEW
    // ============================================

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to permanently delete this review?"
            )
        ) {
            return;
        }

        try {
            setActionLoading(id);
            setError("");

            const response = await fetch(
                `${BASE_URL}/review/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete review."
                );
            }

            // Remove from UI
            setReviews((prevReviews) =>
                prevReviews.filter(
                    (review) => review._id !== id
                )
            );
        } catch (err) {
            console.error("Delete review error:", err);

            setError(
                err.message || "Unable to delete review."
            );
        } finally {
            setActionLoading(null);
        }
    };


    // ============================================
    // FILTER REVIEWS
    // ============================================

    const pendingReviews = useMemo(
        () =>
            reviews.filter(
                (review) => review.isApproved === false
            ),
        [reviews]
    );

    const publishedReviews = useMemo(
        () =>
            reviews.filter(
                (review) => review.isApproved === true
            ),
        [reviews]
    );


    const displayedReviews =
        activeTab === "pending"
            ? pendingReviews
            : publishedReviews;


    // ============================================
    // FORMAT DATE
    // ============================================

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-NP", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };


    // ============================================
    // RATING
    // ============================================

    const renderStars = (rating) => {
        return (
            <div className="admin-review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={17}
                        fill={
                            star <= rating
                                ? "currentColor"
                                : "none"
                        }
                    />
                ))}
            </div>
        );
    };


    // ============================================
    // LOADING
    // ============================================

    if (loading) {
        return (
            <div className="reviews-admin-page">
                <div className="reviews-loading">
                    <RefreshCw
                        size={28}
                        className="loading-spinner"
                    />

                    <p>Loading reviews...</p>
                </div>
            </div>
        );
    }


    // ============================================
    // PAGE
    // ============================================

    return (
        <div className="reviews-admin-page">

            {/* HEADER */}
            <div className="reviews-admin-header">

                <div>
                    <h1>Reviews ⭐</h1>

                    <p>
                      
                        Manage customer reviews submitted
                        through your website.
                    </p>
                </div>

                <button
                    className="refresh-reviews-btn"
                    onClick={fetchReviews}
                    disabled={loading}
                >
                    <RefreshCw size={17} />

                    Refresh
                </button>

            </div>


            {/* ERROR */}
            {error && (
                <div className="reviews-error">
                    {error}
                </div>
            )}


            {/* STATISTICS */}
            <div className="reviews-stats">

                <div className="review-stat-card">

                    <div className="review-stat-icon total">
                        <Users size={21} />
                    </div>

                    <div>
                        <span>Total Reviews</span>

                        <strong>
                            {reviews.length}
                        </strong>
                    </div>

                </div>


                <div className="review-stat-card">

                    <div className="review-stat-icon pending">
                        <Clock size={21} />
                    </div>

                    <div>
                        <span>Pending</span>

                        <strong>
                            {pendingReviews.length}
                        </strong>
                    </div>

                </div>


                <div className="review-stat-card">

                    <div className="review-stat-icon published">
                        <Check size={21} />
                    </div>

                    <div>
                        <span>Published</span>

                        <strong>
                            {publishedReviews.length}
                        </strong>
                    </div>

                </div>

            </div>


            {/* TABS */}
            <div className="reviews-tabs">

                <button
                    className={
                        activeTab === "pending"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("pending")
                    }
                >
                    <Clock size={17} />

                    Pending

                    <span>
                        {pendingReviews.length}
                    </span>
                </button>


                <button
                    className={
                        activeTab === "published"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("published")
                    }
                >
                    <Check size={17} />

                    Published

                    <span>
                        {publishedReviews.length}
                    </span>
                </button>

            </div>


            {/* REVIEW LIST */}
            <div className="admin-reviews-list">

                {displayedReviews.length === 0 ? (

                    <div className="reviews-empty">

                        <div className="reviews-empty-icon">
                            {activeTab === "pending" ? (
                                <Clock size={30} />
                            ) : (
                                <Check size={30} />
                            )}
                        </div>

                        <h3>
                            {activeTab === "pending"
                                ? "No pending reviews"
                                : "No published reviews"}
                        </h3>

                        <p>
                            {activeTab === "pending"
                                ? "New customer reviews will appear here for approval."
                                : "Approved reviews will appear here."}
                        </p>

                    </div>

                ) : (

                    displayedReviews.map((review) => (

                        <div
                            className="admin-review-card"
                            key={review._id}
                        >

                            {/* TOP */}
                            <div className="admin-review-top">

                                <div className="admin-review-user">

                                    <div className="review-avatar">
                                        {review.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                    </div>

                                    <div>

                                        <h3>
                                            {review.name}
                                        </h3>

                                        <p>
                                            {review.email}
                                        </p>

                                    </div>

                                </div>


                                <div className="admin-review-date">
                                    {formatDate(
                                        review.createdAt
                                    )}
                                </div>

                            </div>


                            {/* RATING */}
                            <div className="admin-review-rating">

                                {renderStars(
                                    Number(review.rating)
                                )}

                                <span>
                                    {review.rating}/5
                                </span>

                            </div>


                            {/* REVIEW */}
                            <div className="admin-review-content">

                                <p>
                                    "{review.review}"
                                </p>

                            </div>


                            {/* STATUS */}
                            <div className="admin-review-bottom">

                                <span
                                    className={
                                        review.isApproved
                                            ? "review-status published"
                                            : "review-status pending"
                                    }
                                >
                                    {review.isApproved ? (
                                        <>
                                            <Check size={14} />
                                            Published
                                        </>
                                    ) : (
                                        <>
                                            <Clock size={14} />
                                            Pending Approval
                                        </>
                                    )}
                                </span>


                                {/* ACTIONS */}
                                <div className="admin-review-actions">

                                    {!review.isApproved && (
                                        <button
                                            className="approve-review-btn"
                                            onClick={() =>
                                                handleApprove(
                                                    review._id
                                                )
                                            }
                                            disabled={
                                                actionLoading ===
                                                review._id
                                            }
                                        >
                                            <Check size={16} />

                                            {actionLoading ===
                                            review._id
                                                ? "Processing..."
                                                : "Approve"}
                                        </button>
                                    )}


                                    <button
                                        className="delete-review-btn"
                                        onClick={() =>
                                            handleDelete(
                                                review._id
                                            )
                                        }
                                        disabled={
                                            actionLoading ===
                                            review._id
                                        }
                                    >
                                        <Trash2 size={16} />

                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
};

export default Reviews;