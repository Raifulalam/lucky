
import React, { useEffect, useState } from "react";

import "./Reviews.css";

import Header from "../../Components/Header";
import Breadcrumbs from "../../Components/Breadcrumbs";
import PageSeo from "../../Components/PageSeo";
import GoogleReviews from "../../Components/GoogleReviews"

import { BASE_URL } from "../../api/api";


const Reviews = () => {

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        rating: 5,
        review: "",
    });


    /**
     * =====================================================
     * FETCH REVIEWS
     * =====================================================
     */
    const fetchReviews = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `${BASE_URL}/review`
            );

            const data = await response.json();

            if (response.ok && data.success) {

                setReviews(data.reviews || []);

            } else {

                console.error(
                    "Failed to load reviews:",
                    data
                );

            }

        } catch (error) {

            console.error(
                "Fetch Reviews Error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchReviews();

    }, []);


    /**
     * =====================================================
     * HANDLE FORM
     * =====================================================
     */
    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    /**
     * =====================================================
     * STAR RATING
     * =====================================================
     */
    const handleRating = (rating) => {

        setFormData((prev) => ({
            ...prev,
            rating,
        }));

    };


    /**
     * =====================================================
     * SUBMIT REVIEW
     * =====================================================
     */
    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.review.trim()
        ) {

            setMessage(
                "Please fill in all fields."
            );

            return;
        }


        try {

            setSubmitting(true);

            const response = await fetch(
                `${BASE_URL}/review`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        name:
                            formData.name.trim(),

                        email:
                            formData.email.trim(),

                        rating:
                            Number(
                                formData.rating
                            ),

                        review:
                            formData.review.trim(),
                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                if (data.errors?.length) {

                    setMessage(
                        data.errors[0].msg
                    );

                } else {

                    setMessage(
                        data.message ||
                            "Unable to submit review."
                    );

                }

                return;
            }


            setMessage(
                data.message ||
                    "Thank you for your review!"
            );


            setFormData({
                name: "",
                email: "",
                rating: 5,
                review: "",
            });


        } catch (error) {

            console.error(
                "Submit Review Error:",
                error
            );

            setMessage(
                "Something went wrong. Please try again."
            );

        } finally {

            setSubmitting(false);

        }

    };


    /**
     * =====================================================
     * AVERAGE RATING
     * =====================================================
     */
    const averageRating =
        reviews.length > 0
            ? (
                reviews.reduce(
                    (sum, item) =>
                        sum +
                        Number(item.rating),
                    0
                ) / reviews.length
            ).toFixed(1)
            : "0.0";


    /**
     * =====================================================
     * RENDER STARS
     * =====================================================
     */
    const renderStars = (rating) => {

        return (
            <div
                className="review-stars"
                aria-label={`${rating} out of 5 stars`}
            >
                {[1, 2, 3, 4, 5].map(
                    (star) => (
                        <span
                            key={star}
                            className={
                                star <= rating
                                    ? "star active"
                                    : "star"
                            }
                        >
                            ★
                        </span>
                    )
                )}
            </div>
        );

    };


    /**
     * =====================================================
     * FORMAT DATE
     * =====================================================
     */
    const formatDate = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleDateString(
            "en-NP",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );

    };


    return (
        <>
            <PageSeo
                title="Customer Reviews | Lucky Impex"
                description="Read customer reviews and share your experience with Lucky Impex."
                canonicalPath="/reviews"
                breadcrumbs={[
                    {
                        label: "Home",
                        to: "/",
                    },
                    {
                        label: "Reviews",
                    },
                ]}
            />


            <Header />


            <Breadcrumbs
                items={[
                    {
                        label: "Home",
                        to: "/",
                    },
                    {
                        label: "Reviews",
                    },
                ]}
            />


            <main className="reviews-page">

                {/* =================================================
                    HERO
                ================================================= */}

                <section className="reviews-hero">

                    <span className="reviews-label">
                        CUSTOMER EXPERIENCE
                    </span>

                    <h1>
                        What Our Customers Say
                    </h1>

                    <p>
                        Your experience matters to us.
                        Read reviews from Lucky Impex
                        customers and share your own
                        experience.
                    </p>

                </section>


                {/* =================================================
                    WEBSITE REVIEW SUMMARY
                ================================================= */}

                <section className="review-summary">

                    <div className="summary-rating">

                        <strong>
                            {averageRating}
                        </strong>

                        {renderStars(
                            Math.round(
                                Number(
                                    averageRating
                                )
                            )
                        )}

                        <span>
                            Based on{" "}
                            {reviews.length}{" "}
                            customer reviews
                        </span>

                    </div>


                    <div className="summary-text">

                        <h2>
                            Reviews from Lucky Impex
                            Customers
                        </h2>

                        <p>
                            These reviews are submitted
                            directly through our website
                            and published after verification.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    WEBSITE REVIEWS
                ================================================= */}

                <section className="website-reviews-section">

                    <div className="section-heading">

                        <span>
                            ⭐ WEBSITE REVIEWS
                        </span>

                        <h2>
                            Customer Experiences
                        </h2>

                    </div>


                    {loading ? (

                        <div className="reviews-loading">
                            Loading reviews...
                        </div>

                    ) : reviews.length === 0 ? (

                        <div className="no-reviews">

                            <div className="no-reviews-icon">
                                ⭐
                            </div>

                            <h3>
                                Be the first to review us
                            </h3>

                            <p>
                                Your feedback helps other
                                customers make better
                                decisions.
                            </p>

                        </div>

                    ) : (

                        <div className="reviews-grid">

                            {reviews.map(
                                (item) => (

                                    <article
                                        className="review-card"
                                        key={item._id}
                                    >

                                        <div className="review-card-top">

                                            <div className="customer-avatar">

                                                {item.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}

                                            </div>


                                            <div>

                                                <h3>
                                                    {item.name}
                                                </h3>

                                                <span>
                                                    Verified
                                                    Customer
                                                </span>

                                            </div>

                                        </div>


                                        {renderStars(
                                            item.rating
                                        )}


                                        <p className="review-text">
                                            "{item.review}"
                                        </p>


                                        <time>
                                            {formatDate(
                                                item.createdAt
                                            )}
                                        </time>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    SUBMIT REVIEW
                ================================================= */}

                <section className="review-form-section">

                    <div className="review-form-header">

                        <span>
                            SHARE YOUR EXPERIENCE
                        </span>

                        <h2>
                            Leave a Review
                        </h2>

                        <p>
                            Had a good experience with
                            Lucky Impex? Let others know.
                        </p>

                    </div>


                    <form
                        className="review-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Name */}

                        <div className="form-group">

                            <label htmlFor="name">
                                Your Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your name"
                                maxLength={100}
                                required
                            />

                        </div>


                        {/* Email */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your email"
                                required
                            />

                        </div>


                        {/* Rating */}

                        <div className="form-group">

                            <label>
                                Your Rating
                            </label>

                            <div className="rating-selector">

                                {[1, 2, 3, 4, 5].map(
                                    (star) => (

                                        <button
                                            key={star}
                                            type="button"
                                            className={
                                                star <=
                                                Number(
                                                    formData.rating
                                                )
                                                    ? "rating-star selected"
                                                    : "rating-star"
                                            }
                                            onClick={() =>
                                                handleRating(
                                                    star
                                                )
                                            }
                                            aria-label={`Rate ${star} stars`}
                                        >
                                            ★
                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        {/* Review */}

                        <div className="form-group">

                            <label htmlFor="review">
                                Your Review
                            </label>

                            <textarea
                                id="review"
                                name="review"
                                value={
                                    formData.review
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Tell us about your experience..."
                                rows="6"
                                maxLength={1000}
                                required
                            />

                            <small>
                                {formData.review.length}
                                /1000
                            </small>

                        </div>


                        {/* Message */}

                        {message && (

                            <div className="review-message">

                                {message}

                            </div>

                        )}


                        {/* Submit */}

                        <button
                            type="submit"
                            className="submit-review-btn"
                            disabled={submitting}
                        >

                            {submitting
                                ? "Submitting..."
                                : "Submit Review"}

                        </button>


                        <p className="review-note">
                            Your review will be
                            published after approval.
                        </p>

                    </form>

                </section>


                {/* =================================================
                    GOOGLE REVIEWS
                ================================================= */}

                <section className="google-reviews-section">

                    <div className="section-heading">

                        <span>
                            ⭐ GOOGLE REVIEWS
                        </span>

                        <h2>
                            What Customers Say on Google
                        </h2>

                        <p>
                            See what our customers are
                            saying about Lucky Impex on
                            Google.
                        </p>
 <GoogleReviews />
                    </div>


                 

                </section>

            </main>

        </>
    );
};


export default Reviews;
