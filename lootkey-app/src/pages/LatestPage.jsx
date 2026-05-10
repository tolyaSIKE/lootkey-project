import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import GameCard from "../components/GameCard";

export default function LatestPage() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("https://localhost:7253/api/games")
      .then((res) => res.json())
      .then((data) => {
        const sortedGames = [...data].sort((a, b) => b.id - a.id);
        setGames(sortedGames);
      })
      .catch((err) => console.error("Latest games loading error:", err));
  }, []);

  return (
    <main className="bg-gray-950 min-h-screen p-4 text-white">
      <Navbar />

      <div className="mt-6">
        <h1 className="text-3xl font-bold mb-6">Latest Games</h1>

        {games.length === 0 ? (
          <p className="text-gray-400">No games found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                price={game.price}
                discountPrice={game.discountPrice}
                image={game.imageUrl}
                steamUrl={game.steamUrl}
                epicUrl={game.epicUrl}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
