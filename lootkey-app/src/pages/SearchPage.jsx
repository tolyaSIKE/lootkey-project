import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameCard from "../components/GameCard";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);

  const [filters, setFilters] = useState({
    price: 200,
    sort: "",
    genre: "",
    year: ""
  });

  const loadGames = (searchText) => {
    let url = `https://localhost:7253/api/games/search?query=${searchText || ""}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setGames(data));
  };

  useEffect(() => {
    loadGames(initialQuery);
  }, []);

  useEffect(() => {
    fetch(`https://localhost:7253/api/games`)
      .then(res => res.json())
      .then(data => {
        const unique = [...new Set(data.map(g => g.genre))];
        setGenres(unique);
      });
  }, []);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      setParams({ q: query });
      loadGames(query);
    }
  };

  const applyFilters = () => {
    const url =
      `https://localhost:7253/api/games/search?query=${query}` +
      `&maxPrice=${filters.price}` +
      `&genre=${filters.genre}` +
      `&year=${filters.year}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let result = data;

        if (filters.sort === "cheap") {
          result = [...result].sort((a, b) => a.price - b.price);
        }
        if (filters.sort === "expensive") {
          result = [...result].sort((a, b) => b.price - a.price);
        }

        setGames(result);
      });
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search games..."
          className="w-full p-3 bg-gray-800 rounded text-lg"
        />
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">

        <div className="bg-gray-800 p-3 rounded">
          <p className="text-sm mb-2">Max Price: €{filters.price}</p>

          <input
            type="range"
            min="0"
            max="200"
            value={filters.price}
            onChange={(e) =>
              setFilters({ ...filters, price: e.target.value })
            }
            className="w-full steam-slider"
          />
        </div>

        <select
          className="bg-gray-800 p-3 rounded"
          onChange={(e) =>
            setFilters({ ...filters, sort: e.target.value })
          }
        >
          <option value="">Sort by price</option>
          <option value="cheap">Cheapest first</option>
          <option value="expensive">Most expensive</option>
        </select>

        <select
          className="bg-gray-800 p-3 rounded"
          onChange={(e) =>
            setFilters({ ...filters, genre: e.target.value })
          }
        >
          <option value="">Genre</option>
          {genres.map((g, i) => (
            <option key={i} value={g}>{g}</option>
          ))}
        </select>

        <select
          className="bg-gray-800 p-3 rounded"
          onChange={(e) =>
            setFilters({ ...filters, year: e.target.value })
          }
        >
          <option value="">Year</option>
          {Array.from({ length: 27 }, (_, i) => 2026 - i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

      </div>

      <div className="px-4">
        <button
          onClick={applyFilters}
          className="w-full bg-green-500 p-3 rounded"
        >
          Apply filters
        </button>
      </div>

      <div className="p-4">
        {games.length === 0 ? (
          <p className="text-gray-400">No games found</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {games.map(game => (
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
    </div>
  );
}