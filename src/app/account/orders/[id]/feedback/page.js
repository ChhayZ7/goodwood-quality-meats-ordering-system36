"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// This component displays the 5-star rating buttons
function StarRating({ value, onChange }) {
  
  const [hovered, setHovered] = useState(0); // hovered stores which star the user is currently hovering over

  return (
    
    <div className="flex gap-1">
      {/* Create 5 stars using an array */}
      {[1, 2, 3, 4, 5].map((star) => (
        // Each star is a button so the user can click it
        <button
          key={star}
          type="button"
          
          onClick={() => onChange(star)} // When a star is clicked, send the selected star value back to the parent component
          onMouseEnter={() => setHovered(star)} // When the mouse enters a star, update hovered state to show preview colour
          onMouseLeave={() => setHovered(0)} // When the mouse leaves, reset hover state back to 0
          
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          // Accessibility label for screen readers
          aria-label={`${star} star`}
        >
          <span
            // If the star is less than or equal to hovered or selected value, make it yellow. Otherwise, make it grey.
            className={
              star <= (hovered || value) ? "text-yellow-400" : "text-gray-300"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}


export default function FeedbackPage() {
  
  const router = useRouter(); // Allows the page to redirect the user, for example back to login
  const { id } = useParams();  // Gets the order id from the URL
  const [score, setScore] = useState(0);   // Stores the selected star rating
  const [feedbackText, setFeedbackText] = useState("");  // Stores the optional written feedback from the textarea
  const [submitting, setSubmitting] = useState(false); // Tracks whether the form is currently being submitted
  const [submitted, setSubmitted] = useState(false); // Tracks whether the feedback was submitted successfully
  const [error, setError] = useState(null); // Stores any error message to show on the page

  // This function runs when the user submits the feedback form
  async function handleSubmit(e) {
    
    e.preventDefault(); // Prevents the browser from refreshing the page

    // If the user has not selected any star rating, show an error
    if (score === 0) {
      setError("Please select a star rating.");
      return;
    }

    setError(null); // Clear previous errors before submitting
    setSubmitting(true); // Set submitting to true so the button can show "Submitting…"

    try {
      // Send the feedback data to the backend API
      const res = await fetch("/api/feedback", {
        method: "POST",

        headers: { "Content-Type": "application/json" }, // Tell the API that the request body is JSON

        // Convert the feedback information into JSON format
        body: JSON.stringify({
          order_id: id,
          score,
          feedback_text: feedbackText || undefined, // If feedbackText is empty, send undefined instead of an empty string
        }),
      });

      // If the user is not logged in, redirect them to the login page
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const json = await res.json(); // Convert the API response into JSONs

      // If feedback already exists for this order, show duplicate feedback error
      if (res.status === 409) {
        setError("You have already submitted feedback for this order.");
        setSubmitting(false);
        return;
      }

      // If the response is not successful, show the API error or a default message
      if (!res.ok) {
        setError(json.error ?? "Failed to submit feedback");
        setSubmitting(false);
        return;
      }

      setSubmitted(true); // If everything is successful, show the thank-you message
    } catch {
      
      setError("Something went wrong. Please try again."); // If something unexpected goes wrong, show a general error message
      setSubmitting(false);
    }
  }

  // If the feedback has been successfully submitted, show the success screen
  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24">
        {/* Celebration icon */}
        <div className="text-6xl mb-6">🎉</div>

        {/* Success heading */}
        <h2 className="text-3xl font-bold text-[#8B1A1A] mb-3">
          Thank you for your feedback!
        </h2>

        {/* Short success message */}
        <p className="text-gray-500 mb-8">
          Your review helps us improve our products and service.
        </p>

        {/* Link to go back to the order details page */}
        <Link
          href={`/account/orders/${id}`}
          className="inline-flex items-center gap-2 bg-[#8B1A1A] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          ← Back to Order
        </Link>
      </div>
    );
  }

  // Main feedback form shown before submission
  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header section ── */}
      <div style={{ marginBottom: "32px" }}>
        {/* Link to return to the order details page */}
        <Link
          href={`/account/orders/${id}`}
          className="text-sm text-[#8B1A1A] hover:underline flex items-center gap-1 mb-4"
        >
          ← Back to Order
        </Link>

        {/* Title row containing page heading and short order number */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {/* Page title */}
          <h1
            style={{
              fontFamily: '"Lato",serif',
              fontSize: "36px",
              fontWeight: 700,
              color: "#7B1A1A",
              margin: 0,
            }}
          >
            Leave a Review
          </h1>

          {/* Shows a shortened version of the order id */}
          <span
            style={{
              fontFamily: '"Lato",sans-serif',
              fontSize: "14px",
              color: "#9CA3AF",
            }}
          >
            Order #{typeof id === "string" ? id.slice(0, 8).toUpperCase() : ""}
          </span>
        </div>

        {/* Decorative gold line under the header */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, #C9A84C, transparent)",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Feedback form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Rating section heading */}
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Overall Rating
          </h2>

          {/* Helper text */}
          <p className="text-sm text-gray-500 mb-6">
            How would you rate your overall experience?
          </p>

          {/* Star rating and rating label */}
          <div className="flex items-center gap-6">
            {/* StarRating component receives the selected score and updates score when clicked */}
            <StarRating value={score} onChange={setScore} />

            {/* Show text label only after user selects a rating */}
            {score > 0 && (
              <span className="text-sm text-gray-500">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][score]}
              </span>
            )}
          </div>
        </div>

        {/* Additional comments card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Additional Comments{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </h2>

          {/* Textarea for optional customer feedback */}
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)} // Update feedbackText every time the user types
            rows={5}
            maxLength={1000}
            placeholder="Tell us about your experience — product freshness, packaging, anything you'd like us to know…"
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] placeholder-gray-400 transition"
          />

          {/* Character counter */}
          <p className="text-xs text-gray-400 mt-2 text-right">
            {feedbackText.length} / 1000
          </p>
        </div>

        {/* Show error message only if error exists */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* Submit and cancel buttons */}
        <div className="flex gap-4">
          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting} // Disable button while submitting to prevent duplicate clicks
            className="flex items-center gap-2 bg-[#8B1A1A] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Show different text while form is submitting */}
            {submitting ? "Submitting…" : "Submit Review"}
          </button>

          {/* Cancel button takes user back to order details page */}
          <Link
            href={`/account/orders/${id}`}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
