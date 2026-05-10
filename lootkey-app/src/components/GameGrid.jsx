import { useEffect, useState } from "react";
import GameCard from "./GameCard";

export default function GameGrid() {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const gamesPerPage = 8;

  useEffect(() => {
    fetch("https://localhost:7253/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error("API error:", err));
  }, []);

  const totalPages = Math.ceil(games.length / gamesPerPage);

  const startIndex = (currentPage - 1) * gamesPerPage;
  const currentGames = games.slice(startIndex, startIndex + gamesPerPage);

  return (
    <div className="mt-4 sm:mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {currentGames.map((game) => (
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-800 disabled:opacity-40 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Previous
          </button>

          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-gray-800 disabled:opacity-40 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}