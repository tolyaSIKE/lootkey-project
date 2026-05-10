import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import ReviewsSection from "../components/ReviewsSection";

export default function GamePage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`https://localhost:7253/api/games/${id}`)
      .then((res) => res.json())
      .then((data) => setGame(data))
      .catch((err) => console.error("Error loading game:", err));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && id) {
      fetch(`https://localhost:7253/api/recommendations/view/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => console.error("View logging error:", err));
    }
  }, [id]);

  if (!game) {
    return (
      <main className="bg-gray-950 min-h-screen p-4 text-white">
        <Navbar />
        <div className="mt-6 text-center text-gray-400">Loading...</div>
      </main>
    );
  }

  const hasDiscount =
    game.discountPrice !== null &&
    game.discountPrice !== undefined &&
    Number(game.discountPrice) > 0;

  return (
    <main className="bg-gray-950 min-h-screen p-4 text-white">
      <Navbar />

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{game.title}</h1>

          <div className="relative">
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg text-lg font-bold z-10">
                SALE
              </div>
            )}

            <img
              src={`/lootkey-app${game.imageUrl}`}
              alt={game.title}
              className="rounded-xl mb-4 w-full object-cover"
            />
          </div>

          <div className="bg-gray-800 p-5 rounded-xl mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-300 leading-relaxed">
              {game.description || "No description available."}
            </p>
          </div>

          <ReviewsSection gameId={id} />
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 p-5 rounded-xl">
            <p className="text-gray-400 mb-1">Price</p>

            {hasDiscount ? (
              <div>
                <p className="text-gray-400 text-xl line-through">
                  €{Number(game.price).toFixed(2)}
                </p>

                <p className="text-red-500 text-3xl font-bold">
                  €{Number(game.discountPrice).toFixed(2)}
                </p>

                <p className="text-green-400 mt-2 text-sm">Discount active</p>
              </div>
            ) : (
              <p className="text-green-400 text-3xl font-bold">
                €{Number(game.price).toFixed(2)}
              </p>
            )}
          </div>

          <button
            onClick={() => addToCart(game)}
            className="w-full bg-green-500 hover:bg-green-600 transition py-3 rounded-xl font-semibold"
          >
            BUY NOW
          </button>

          <div className="bg-gray-800 p-5 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">System Requirements</h2>

            <div>
              <h3 className="text-green-400 mb-1 font-medium">Minimum:</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-300">
                {game.minRequirements || "Not specified"}
              </pre>
            </div>

            <div>
              <h3 className="text-green-400 mb-1 font-medium">Recommended:</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-300">
                {game.recRequirements || "Not specified"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
