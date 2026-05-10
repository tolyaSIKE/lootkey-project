import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { logAction } from "../services/logger";

export default function GameCard({
  id,
  title,
  price,
  discountPrice,
  image,
  steamUrl,
  epicUrl
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState("");

  const hasDiscount = discountPrice !== null && discountPrice !== undefined;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (user && token) {
      fetch("https://localhost:7253/api/favorites/ids", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setIsFavorite(data.includes(id));
        })
        .catch(err => console.error("Favorites loading error:", err));
    } else {
      setIsFavorite(false);
    }
  }, [user, id]);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2000);
  };

  const openGamePage = () => {
    logAction(
      "GAME_CARD_OPENED",
      `User opened game card: ${title}, gameId=${id}`,
      `/game/${id}`
    );

    navigate(`/game/${id}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      logAction(
        "FAVORITE_ATTEMPT_WITHOUT_LOGIN",
        `Anonymous user tried to add favorite: ${title}, gameId=${id}`
      );

      navigate("/login");
      return;
    }

    fetch(`https://localhost:7253/api/favorites/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "added") {
          setIsFavorite(true);
          showToast("Game added to favourites");

          logAction(
            "FAVORITE_ADDED",
            `Added to favourites: ${title}, gameId=${id}`
          );
        }

        if (data.status === "removed") {
          setIsFavorite(false);
          showToast("Game removed from favourites");

          logAction(
            "FAVORITE_REMOVED",
            `Removed from favourites: ${title}, gameId=${id}`
          );
        }
      })
      .catch(err => console.error("Favourite error:", err));
  };

  const openSteam = (e) => {
    e.stopPropagation();

    logAction(
      "EXTERNAL_LINK_OPENED",
      `Opened Steam link for ${title}, gameId=${id}`
    );

    window.open(steamUrl, "_blank");
  };

  const openEpic = (e) => {
    e.stopPropagation();

    logAction(
      "EXTERNAL_LINK_OPENED",
      `Opened Epic Games link for ${title}, gameId=${id}`
    );

    window.open(epicUrl, "_blank");
  };

  return (
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 border border-green-500 text-white px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div
        onClick={openGamePage}
        className="bg-gray-900 text-white rounded-xl overflow-hidden w-full cursor-pointer hover:scale-105 transition relative"
      >
        <div className="w-full aspect-[16/9]">
          <img
            src={`/lootkey-app${image}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {user && (
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 text-xl transition hover:scale-125 ${
              isFavorite ? "text-yellow-400" : "text-gray-400"
            }`}
            title="Add/remove favourite"
          >
            ⭐
          </button>
        )}

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
            SALE
          </div>
        )}

        <div className="p-3 flex justify-between items-end">
          <div>
            <h3 className="text-base sm:text-lg">{title}</h3>

            {hasDiscount ? (
              <div>
                <p className="text-gray-400 line-through">
                  €{Number(price).toFixed(2)}
                </p>
                <p className="text-red-500 font-bold">
                  €{Number(discountPrice).toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">
                €{Number(price).toFixed(2)}
              </p>
            )}
          </div>

          <div
            className="flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {steamUrl && (
              <img
                src="/lootkey-app/icons/steam.png"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition"
                onClick={openSteam}
                alt="Steam"
              />
            )}

            {epicUrl && (
              <img
                src="/lootkey-app/icons/epic_games.png"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition"
                onClick={openEpic}
                alt="Epic Games"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}