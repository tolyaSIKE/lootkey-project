import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (user && token) {
      fetch("https://localhost:7253/api/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setGames(data);
          setCurrentIndex(0);
        })
        .catch((err) => console.error("Recommendations error:", err));
    } else {
      fetch("https://localhost:7253/api/games")
        .then((res) => res.json())
        .then((data) => {
          setGames(data);
          setCurrentIndex(0);
        })
        .catch((err) => console.error("Default hero error:", err));
    }
  }, [user]);

  const changeSlide = (newIndex) => {
    if (isAnimating || newIndex === currentIndex) return;

    setIsAnimating(true);

    setTimeout(() => {
      setCurrentIndex(newIndex);

      setTimeout(() => {
        setIsAnimating(false);
      }, 250);
    }, 250);
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % games.length;
    changeSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? games.length - 1 : currentIndex - 1;
    changeSlide(newIndex);
  };

  if (games.length === 0) {
    return (
      <div className="w-full h-[250px] md:h-[350px] bg-gray-900 rounded-xl flex items-center justify-center text-white">
        Loading recommendations...
      </div>
    );
  }

  const game = games[currentIndex];

  const hasDiscount =
    game.discountPrice !== null &&
    game.discountPrice !== undefined &&
    Number(game.discountPrice) > 0;

  return (
    <div
      className={`w-full h-[280px] md:h-[390px] bg-cover bg-center rounded-xl relative overflow-hidden mt-4 transition-all duration-500 ease-in-out ${
        isAnimating ? "opacity-60 scale-[0.99]" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: `url('/lootkey-app${game.imageUrl}')`,
      }}
    >
      <div className="absolute inset-0 bg-black/35"></div>

      {hasDiscount && (
        <div className="absolute top-5 left-5 bg-red-600 text-white px-4 py-2 rounded-lg font-bold z-20">
          SALE
        </div>
      )}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white w-10 h-10 rounded-full z-20 text-3xl leading-none"
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white w-10 h-10 rounded-full z-20 text-3xl leading-none"
      >
        ›
      </button>

      <div
        className={`absolute bottom-0 left-0 bg-black/75 w-full p-6 z-10 transition-all duration-500 ${
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <h1 className="text-2xl md:text-4xl text-white font-bold">
          {game.title}
        </h1>

        <div className="mt-2">
          {hasDiscount ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 line-through text-lg">
                €{Number(game.price).toFixed(2)}
              </span>

              <span className="text-red-500 font-bold text-2xl">
                €{Number(game.discountPrice).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-green-400 font-bold text-2xl">
              €{Number(game.price).toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => navigate(`/game/${game.id}`)}
          className="bg-green-500 hover:bg-green-600 px-5 py-2 mt-3 rounded font-semibold"
        >
          BUY NOW
        </button>

        <div className="flex gap-2 mt-4">
          {games.map((item, index) => (
            <button
              key={item.id}
              onClick={() => changeSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-green-400 scale-125"
                  : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
