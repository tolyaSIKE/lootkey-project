import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { logAction } from "../services/logger";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadPurchases();

    logAction(
      "PROFILE_PAGE_OPENED",
      "User opened profile page",
      "/profile"
    );
  }, []);

  const loadProfile = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:7253/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setUsername(data.username || "");

        logAction(
          "PROFILE_LOADED",
          `Profile loaded. Username=${data.username}, Email=${data.email}`,
          "/profile"
        );
      })
      .catch((err) => {
        console.error("Profile loading error:", err);

        logAction(
          "PROFILE_LOAD_FAILED",
          `Profile loading failed: ${err}`,
          "/profile"
        );
      });
  };

  const loadFavorites = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:7253/api/favorites", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch((err) => console.error("Favorites loading error:", err));
  };

  const loadPurchases = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:7253/api/orders/my-purchases", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setPurchases(data))
      .catch((err) => console.error("Purchases loading error:", err));
  };

  const saveUsername = async () => {
    const token = localStorage.getItem("token");

    logAction(
      "USERNAME_CHANGE_ATTEMPT",
      `User tried to change username to: ${username}`,
      "/profile"
    );

    const res = await fetch("https://localhost:7253/api/users/update-username", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username
      })
    });

    if (res.ok) {
      setMessage("Username updated.");
      loadProfile();

      logAction(
        "USERNAME_CHANGED",
        `User changed username to: ${username}`,
        "/profile"
      );
    } else {
      setMessage("Username update failed.");

      logAction(
        "USERNAME_CHANGE_FAILED",
        `Username update failed. New username=${username}`,
        "/profile"
      );
    }
  };

  const changeAvatar = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Avatar = reader.result;
      const token = localStorage.getItem("token");

      logAction(
        "AVATAR_CHANGE_ATTEMPT",
        `User selected new avatar file: ${file.name}`,
        "/profile"
      );

      const res = await fetch("https://localhost:7253/api/users/update-avatar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          avatarUrl: base64Avatar
        })
      });

      if (res.ok) {
        setMessage("Avatar updated.");
        loadProfile();

        logAction(
          "AVATAR_CHANGED",
          `User changed avatar. File=${file.name}`,
          "/profile"
        );
      } else {
        setMessage("Avatar update failed.");

        logAction(
          "AVATAR_CHANGE_FAILED",
          `Avatar update failed. File=${file.name}`,
          "/profile"
        );
      }
    };

    reader.readAsDataURL(file);
  };

  if (!profile) {
    return (
      <main className="bg-gray-950 min-h-screen text-white p-4">
        <Navbar />
        <p className="text-center mt-10 text-gray-400">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="bg-gray-950 min-h-screen text-white p-4">
      <Navbar />

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
          <label className="cursor-pointer">
            <img
              src={profile.avatarUrl || "/lootkey-app/default-avatar.png"}
              alt="avatar"
              className="w-40 h-40 rounded-full object-cover"
            />

            <input
              type="file"
              accept="image/*"
              onChange={changeAvatar}
              className="hidden"
            />
          </label>

          <p className="mt-5 text-lg">{profile.email}</p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h1 className="text-2xl mb-4">Profile</h1>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded mb-3"
            />

            <button
              onClick={saveUsername}
              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded"
            >
              Save
            </button>

            {message && (
              <p className="mt-3 text-green-400">
                {message}
              </p>
            )}

            <div className="mt-5 space-y-2">
              <p>Name: {profile.firstName} {profile.lastName}</p>
              <p>Birth: {profile.birthDate}</p>
              <p>Role: {profile.role}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl mb-4">Favorites</h2>

            {favorites.length === 0 ? (
              <p className="text-gray-400">No favorite games yet.</p>
            ) : (
              <div className="space-y-3">
                {favorites.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      logAction(
                        "FAVORITE_GAME_OPENED_FROM_PROFILE",
                        `User opened favorite game from profile: ${game.title}, gameId=${game.id}`,
                        `/game/${game.id}`
                      );

                      navigate(`/game/${game.id}`);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 cursor-pointer rounded-xl flex items-center gap-4 overflow-hidden"
                  >
                    <img
                      src={`/lootkey-app${game.imageUrl}`}
                      alt={game.title}
                      className="w-36 h-20 object-cover"
                    />

                    <h3 className="font-semibold text-lg">
                      {game.title}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl mb-4">Purchased Keys</h2>

            {purchases.length === 0 ? (
              <p className="text-gray-400">No purchases yet.</p>
            ) : (
              <div className="space-y-3">
                {purchases.map((item, index) => (
                  <div
                    key={`${item.orderId}-${index}`}
                    className="bg-gray-700 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`/lootkey-app${item.imageUrl}`}
                        alt={item.title}
                        className="w-28 h-16 object-cover rounded"
                      />

                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-gray-300 text-sm">
                          Order #{item.orderId}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {new Date(item.purchasedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="font-mono text-green-400 bg-gray-900 px-3 py-2 rounded">
                      {item.keyCode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}