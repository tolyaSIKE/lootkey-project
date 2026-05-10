import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { logAction } from "../services/logger";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gameKeys, setGameKeys] = useState([]);

  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const [newKey, setNewKey] = useState({
    gameId: "",
    keyName: "",
    keyCode: ""
  });

  const [newGame, setNewGame] = useState({
    title: "",
    price: "",
    discountPrice: "",
    imageUrl: "",
    description: "",
    minRequirements: "",
    recRequirements: "",
    genre: "",
    year: "",
    steamUrl: "",
    epicUrl: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "Admin") {
      logAction(
        "ADMIN_ACCESS_DENIED",
        "Non-admin user tried to open Admin Panel",
        "/admin"
      );

      navigate("/");
      return;
    }

    logAction(
      "ADMIN_PANEL_OPENED",
      "Admin opened Admin Panel",
      "/admin"
    );

    loadGames();
    loadOrders();
    loadReviews();
    loadGameKeys();
  }, [user, navigate]);

  const loadGames = () => {
    fetch("https://localhost:7253/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error("Games loading error:", err));
  };

  const loadOrders = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:7253/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Orders loading error:", err));
  };

  const loadReviews = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:7253/api/reviews/admin/all", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Reviews loading error:", err));
  };

  const loadGameKeys = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:7253/api/gamekeys", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setGameKeys(data))
      .catch((err) => console.error("Game keys loading error:", err));
  };

  const handleChange = (e) => {
    setNewGame({
      ...newGame,
      [e.target.name]: e.target.value
    });
  };

  const handleKeyChange = (e) => {
    setNewKey({
      ...newKey,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    logAction(
      "ADMIN_GAME_EDIT_CANCELLED",
      "Admin cancelled game editing",
      "/admin"
    );

    setNewGame({
      title: "",
      price: "",
      discountPrice: "",
      imageUrl: "",
      description: "",
      minRequirements: "",
      recRequirements: "",
      genre: "",
      year: "",
      steamUrl: "",
      epicUrl: ""
    });

    setEditingId(null);
  };

  const saveGame = async () => {
    const token = localStorage.getItem("token");

    const gameData = {
      title: newGame.title,
      price: Number(newGame.price),
      discountPrice: newGame.discountPrice ? Number(newGame.discountPrice) : null,
      imageUrl: newGame.imageUrl,
      description: newGame.description,
      minRequirements: newGame.minRequirements,
      recRequirements: newGame.recRequirements,
      genre: newGame.genre,
      year: newGame.year ? Number(newGame.year) : null,
      steamUrl: newGame.steamUrl,
      epicUrl: newGame.epicUrl
    };

    logAction(
      editingId ? "ADMIN_GAME_UPDATE_ATTEMPT" : "ADMIN_GAME_CREATE_ATTEMPT",
      `${editingId ? "Updating" : "Creating"} game: ${newGame.title}`,
      "/admin"
    );

    let res;

    if (editingId) {
      res = await fetch(`https://localhost:7253/api/games/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(gameData)
      });
    } else {
      res = await fetch("https://localhost:7253/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(gameData)
      });
    }

    if (res.ok) {
      setMessage(editingId ? "Game updated!" : "Game added!");

      logAction(
        editingId ? "ADMIN_GAME_UPDATED" : "ADMIN_GAME_CREATED",
        `${editingId ? "Updated" : "Created"} game: ${newGame.title}`,
        "/admin"
      );

      resetForm();
      loadGames();
    } else {
      const text = await res.text();
      setMessage(text || "Error while saving game.");

      logAction(
        editingId ? "ADMIN_GAME_UPDATE_FAILED" : "ADMIN_GAME_CREATE_FAILED",
        `Game save failed: ${newGame.title}. Reason=${text}`,
        "/admin"
      );
    }
  };

  const deleteGame = async (id) => {
    const token = localStorage.getItem("token");

    const game = games.find((g) => g.id === id);

    if (!window.confirm("Delete this game?")) return;

    logAction(
      "ADMIN_GAME_DELETE_ATTEMPT",
      `Admin tried to delete game: ${game?.title}, gameId=${id}`,
      "/admin"
    );

    const res = await fetch(`https://localhost:7253/api/games/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      setMessage("Game deleted!");

      logAction(
        "ADMIN_GAME_DELETED",
        `Admin deleted game: ${game?.title}, gameId=${id}`,
        "/admin"
      );

      loadGames();
    } else {
      setMessage("Error while deleting game.");

      logAction(
        "ADMIN_GAME_DELETE_FAILED",
        `Admin failed to delete gameId=${id}`,
        "/admin"
      );
    }
  };

  const editGame = (game) => {
    logAction(
      "ADMIN_GAME_EDIT_STARTED",
      `Admin started editing game: ${game.title}, gameId=${game.id}`,
      "/admin"
    );

    setEditingId(game.id);

    setNewGame({
      title: game.title,
      price: game.price,
      discountPrice: game.discountPrice || "",
      imageUrl: game.imageUrl,
      description: game.description || "",
      minRequirements: game.minRequirements || "",
      recRequirements: game.recRequirements || "",
      genre: game.category?.name || game.genre || "",
      year: game.year || "",
      steamUrl: game.steamUrl || "",
      epicUrl: game.epicUrl || ""
    });
  };

  const removeDiscount = async (id) => {
    const token = localStorage.getItem("token");

    const game = games.find((g) => g.id === id);

    if (!window.confirm("Remove discount from this game?")) return;

    logAction(
      "ADMIN_DISCOUNT_REMOVE_ATTEMPT",
      `Admin tried to remove discount from: ${game?.title}, gameId=${id}`,
      "/admin"
    );

    const res = await fetch(`https://localhost:7253/api/games/${id}/discount`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      setMessage("Discount removed!");

      logAction(
        "ADMIN_DISCOUNT_REMOVED",
        `Admin removed discount from: ${game?.title}, gameId=${id}`,
        "/admin"
      );

      loadGames();

      if (editingId === id) {
        setNewGame({
          ...newGame,
          discountPrice: ""
        });
      }
    } else {
      const text = await res.text();
      setMessage(text || "Error while removing discount.");

      logAction(
        "ADMIN_DISCOUNT_REMOVE_FAILED",
        `Failed to remove discount from gameId=${id}. Reason=${text}`,
        "/admin"
      );
    }
  };

  const createGameKey = async () => {
    const token = localStorage.getItem("token");

    const selectedGame = games.find((g) => g.id === Number(newKey.gameId));

    logAction(
      "ADMIN_KEY_CREATE_ATTEMPT",
      `Admin tried to create key. Game=${selectedGame?.title}, KeyName=${newKey.keyName}`,
      "/admin"
    );

    const res = await fetch("https://localhost:7253/api/gamekeys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        gameId: Number(newKey.gameId),
        keyName: newKey.keyName,
        keyCode: newKey.keyCode
      })
    });

    if (res.ok) {
      setMessage("Game key added successfully!");

      logAction(
        "ADMIN_KEY_CREATED",
        `Admin created key. Game=${selectedGame?.title}, KeyName=${newKey.keyName}, KeyCode=${newKey.keyCode}`,
        "/admin"
      );

      setNewKey({
        gameId: "",
        keyName: "",
        keyCode: ""
      });

      loadGameKeys();
    } else {
      const text = await res.text();
      setMessage(text || "Error while adding game key.");

      logAction(
        "ADMIN_KEY_CREATE_FAILED",
        `Failed to create key. Reason=${text}`,
        "/admin"
      );
    }
  };

  const deleteGameKey = async (id) => {
    const token = localStorage.getItem("token");

    const key = gameKeys.find((k) => k.id === id);

    if (!window.confirm("Delete this key?")) return;

    logAction(
      "ADMIN_KEY_DELETE_ATTEMPT",
      `Admin tried to delete key id=${id}, keyName=${key?.keyName}, game=${key?.gameTitle}`,
      "/admin"
    );

    const res = await fetch(`https://localhost:7253/api/gamekeys/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      setMessage("Game key deleted!");

      logAction(
        "ADMIN_KEY_DELETED",
        `Admin deleted key id=${id}, keyName=${key?.keyName}, game=${key?.gameTitle}`,
        "/admin"
      );

      loadGameKeys();
    } else {
      const text = await res.text();
      setMessage(text || "Error while deleting key.");

      logAction(
        "ADMIN_KEY_DELETE_FAILED",
        `Failed to delete key id=${id}. Reason=${text}`,
        "/admin"
      );
    }
  };

  const deleteReview = async (id) => {
    const token = localStorage.getItem("token");

    const review = reviews.find((r) => r.id === id);

    if (!window.confirm("Delete this review?")) return;

    logAction(
      "ADMIN_REVIEW_DELETE_ATTEMPT",
      `Admin tried to delete review id=${id}, game=${review?.gameTitle}, user=${review?.userEmail}`,
      "/admin"
    );

    const res = await fetch(`https://localhost:7253/api/reviews/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      setMessage("Review deleted!");

      logAction(
        "ADMIN_REVIEW_DELETED",
        `Admin deleted review id=${id}, game=${review?.gameTitle}, user=${review?.userEmail}`,
        "/admin"
      );

      loadReviews();
    } else {
      setMessage("Error while deleting review.");

      logAction(
        "ADMIN_REVIEW_DELETE_FAILED",
        `Failed to delete review id=${id}`,
        "/admin"
      );
    }
  };

  const sendBroadcastEmail = async () => {
    const token = localStorage.getItem("token");

    logAction(
      "ADMIN_EMAIL_BROADCAST_ATTEMPT",
      `Admin tried to send email broadcast. Subject=${emailSubject}`,
      "/admin"
    );

    const res = await fetch("https://localhost:7253/api/email/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: emailSubject,
        message: emailMessage
      })
    });

    if (res.ok) {
      setMessage("Email broadcast sent successfully!");

      logAction(
        "ADMIN_EMAIL_BROADCAST_SENT",
        `Admin sent email broadcast. Subject=${emailSubject}`,
        "/admin"
      );

      setEmailSubject("");
      setEmailMessage("");
    } else {
      setMessage("Error while sending emails.");

      logAction(
        "ADMIN_EMAIL_BROADCAST_FAILED",
        `Email broadcast failed. Subject=${emailSubject}`,
        "/admin"
      );
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        {message && (
          <div className="bg-gray-800 border border-green-500 p-3 rounded-xl mb-6">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl mb-4">
              {editingId ? "Edit Game" : "Add Game"}
            </h2>

            <div className="space-y-3">
              <input name="title" value={newGame.title} onChange={handleChange} placeholder="Title" className="w-full bg-gray-700 p-3 rounded" />
              <input name="price" value={newGame.price} onChange={handleChange} placeholder="Price" type="number" className="w-full bg-gray-700 p-3 rounded" />
              <input name="discountPrice" value={newGame.discountPrice} onChange={handleChange} placeholder="Discount price" type="number" className="w-full bg-gray-700 p-3 rounded" />
              <input name="imageUrl" value={newGame.imageUrl} onChange={handleChange} placeholder="/games/..." className="w-full bg-gray-700 p-3 rounded" />
              <input name="genre" value={newGame.genre} onChange={handleChange} placeholder="Genre" className="w-full bg-gray-700 p-3 rounded" />
              <input name="year" value={newGame.year} onChange={handleChange} placeholder="Year" type="number" className="w-full bg-gray-700 p-3 rounded" />
              <input name="steamUrl" value={newGame.steamUrl} onChange={handleChange} placeholder="Steam URL" className="w-full bg-gray-700 p-3 rounded" />
              <input name="epicUrl" value={newGame.epicUrl} onChange={handleChange} placeholder="Epic URL" className="w-full bg-gray-700 p-3 rounded" />

              <textarea name="description" value={newGame.description} onChange={handleChange} placeholder="Description" className="w-full bg-gray-700 p-3 rounded min-h-[100px]" />
              <textarea name="minRequirements" value={newGame.minRequirements} onChange={handleChange} placeholder="Min requirements" className="w-full bg-gray-700 p-3 rounded min-h-[100px]" />
              <textarea name="recRequirements" value={newGame.recRequirements} onChange={handleChange} placeholder="Rec requirements" className="w-full bg-gray-700 p-3 rounded min-h-[100px]" />

              <button onClick={saveGame} className="w-full bg-green-500 hover:bg-green-600 p-3 rounded font-semibold">
                {editingId ? "Update Game" : "Add Game"}
              </button>

              {editingId && (
                <button onClick={resetForm} className="w-full bg-gray-600 hover:bg-gray-500 p-2 rounded">
                  Cancel Editing
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl mb-4">Games List</h2>

            <div className="space-y-3 max-h-[800px] overflow-y-auto">
              {games.map((game) => (
                <div key={game.id} className="bg-gray-700 p-3 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={`/lootkey-app${game.imageUrl}`} alt={game.title} className="w-24 h-14 object-cover rounded" />

                    <div>
                      <h3 className="font-semibold">{game.title}</h3>

                      <p className="text-gray-300 text-sm">
                        {game.discountPrice ? (
                          <>
                            <span className="line-through text-gray-400">€{Number(game.price).toFixed(2)}</span>{" "}
                            <span className="text-red-500 font-bold">€{Number(game.discountPrice).toFixed(2)}</span>
                          </>
                        ) : (
                          <>€{Number(game.price).toFixed(2)}</>
                        )}
                        {" | "}
                        {game.category?.name || game.genre}
                        {" | "}
                        {game.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => editGame(game)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                      Edit
                    </button>

                    {game.discountPrice && (
                      <button onClick={() => removeDiscount(game.id)} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded">
                        Remove Sale
                      </button>
                    )}

                    <button onClick={() => deleteGame(game.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl lg:col-span-2">
            <h2 className="text-2xl mb-4">Game Keys Management</h2>

            <div className="grid md:grid-cols-3 gap-3 mb-5">
              <select name="gameId" value={newKey.gameId} onChange={handleKeyChange} className="bg-gray-700 p-3 rounded">
                <option value="">Select game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>{game.title}</option>
                ))}
              </select>

              <input name="keyName" value={newKey.keyName} onChange={handleKeyChange} placeholder="Key name" className="bg-gray-700 p-3 rounded" />

              <input name="keyCode" value={newKey.keyCode} onChange={handleKeyChange} placeholder="Key code" className="bg-gray-700 p-3 rounded" />
            </div>

            <button onClick={createGameKey} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded mb-5">
              Add Game Key
            </button>

            {gameKeys.length === 0 ? (
              <p className="text-gray-400">There are no keys yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {gameKeys.map((key) => (
                  <div key={key.id} className="bg-gray-700 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{key.gameTitle}</h3>
                      <p className="text-gray-300 text-sm">Name: {key.keyName}</p>
                      <p className="font-mono text-green-400 text-sm">{key.keyCode}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-sm ${key.isSold ? "bg-red-700" : "bg-green-700"}`}>
                        {key.isSold ? "Sold" : "Available"}
                      </span>

                      {!key.isSold && (
                        <button onClick={() => deleteGameKey(key.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl lg:col-span-2">
            <h2 className="text-2xl mb-4">Email Notifications</h2>

            <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject" className="w-full bg-gray-700 p-3 rounded mb-3" />

            <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Email message for users" className="w-full bg-gray-700 p-3 rounded min-h-[120px] mb-3" />

            <button onClick={sendBroadcastEmail} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded">
              Send Email Broadcast
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl lg:col-span-2">
            <h2 className="text-2xl mb-4">Users Orders</h2>

            {orders.length === 0 ? (
              <p className="text-gray-400">There are no orders yet.</p>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-700 p-4 rounded-xl">
                    <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-gray-300 text-sm">User: {order.userEmail}</p>
                        <p className="text-gray-300 text-sm">Date: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="text-green-400 font-bold text-xl">
                        €{Number(order.totalPrice).toFixed(2)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="bg-gray-800 p-3 rounded flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <span>{item.gameTitle}</span>
                          <span className="font-mono text-green-400">{item.keyCode}</span>
                          <span>€{Number(item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl lg:col-span-2">
            <h2 className="text-2xl mb-4">Users Reviews</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-400">There are no reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-700 p-4 rounded-xl">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{review.gameTitle}</h3>
                        <p className="text-gray-300 text-sm">
                          User: {review.username} ({review.userEmail})
                        </p>
                        <p className="text-gray-300 text-sm">
                          Date: {new Date(review.createdAt).toLocaleString()}
                        </p>
                        <p className="text-yellow-400 mt-2">
                          {"⭐".repeat(review.rating)}
                        </p>
                      </div>

                      <button onClick={() => deleteReview(review.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded h-fit">
                        Delete Review
                      </button>
                    </div>

                    <p className="mt-4 text-gray-200">{review.comment}</p>

                    <div className="mt-3 flex gap-3 text-sm text-gray-300">
                      <span>👍 {review.likes}</span>
                      <span>👎 {review.dislikes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}