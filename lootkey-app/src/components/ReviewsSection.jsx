import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ReviewsSection({ gameId }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(() => {
    const token = localStorage.getItem("token");

    fetch(`https://localhost:7253/api/reviews/game/${gameId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    })
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Reviews loading error:", err));
  }, [gameId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const submitReview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You need to login before writing a review.");
      return;
    }

    const res = await fetch("https://localhost:7253/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        gameId: Number(gameId),
        rating: Number(rating),
        comment,
      }),
    });

    if (res.ok) {
      setMessage("Review added successfully.");
      setComment("");
      setRating(5);
      loadReviews();
    } else {
      const text = await res.text();
      setMessage(text || "Error while adding review.");
    }
  };

  const toggleReaction = async (reviewId, reactionType) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You need to login before reacting.");
      return;
    }

    const res = await fetch(
      `https://localhost:7253/api/reviews/${reviewId}/reaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reactionType,
        }),
      },
    );

    if (res.ok) {
      loadReviews();
    }
  };

  const deleteOwnReview = async (reviewId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You need to login before deleting a review.");
      return;
    }

    const confirmed = window.confirm("Delete your review?");

    if (!confirmed) return;

    const res = await fetch(
      `https://localhost:7253/api/reviews/my/${reviewId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (res.ok) {
      setMessage("Review deleted successfully.");
      loadReviews();
    } else {
      setMessage("You can delete only your own review.");
    }
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

      <div className="bg-gray-900 p-4 rounded-xl mb-5">
        <h3 className="text-lg font-semibold mb-3">Write your review</h3>

        {user ? (
          <>
            <label className="block text-gray-300 mb-1">Rating</label>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="bg-gray-700 p-2 rounded mb-3 w-full"
            >
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Good</option>
              <option value="3">3 — Normal</option>
              <option value="2">2 — Bad</option>
              <option value="1">1 — Very bad</option>
            </select>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your opinion about the game or service..."
              className="bg-gray-700 p-3 rounded w-full min-h-[120px]"
            />

            <button
              onClick={submitReview}
              className="mt-3 bg-green-500 hover:bg-green-600 px-5 py-2 rounded"
            >
              Send Review
            </button>
          </>
        ) : (
          <p className="text-gray-400">Login to write a review.</p>
        )}

        {message && <p className="mt-3 text-green-400">{message}</p>}
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-400">There are no reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-900 p-4 rounded-xl">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatarUrl || "/lootkey-app/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-semibold">{review.username}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {review.canDelete && (
                  <button
                    onClick={() => deleteOwnReview(review.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="text-yellow-400 mb-2">
                {"⭐".repeat(review.rating)}
              </div>

              <p className="text-gray-300 mb-4">{review.comment}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleReaction(review.id, "Like")}
                  className={`px-3 py-1 rounded ${
                    review.myReaction === "Like"
                      ? "bg-green-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  👍 {review.likes}
                </button>

                <button
                  onClick={() => toggleReaction(review.id, "Dislike")}
                  className={`px-3 py-1 rounded ${
                    review.myReaction === "Dislike"
                      ? "bg-red-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  👎 {review.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
