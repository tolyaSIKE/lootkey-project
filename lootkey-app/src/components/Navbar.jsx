import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { logAction } from "../services/logger";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setIsCartOpen, totalCount, clearCart } = useCart();

  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("https://localhost:7253/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile loading error:", err));
    } else {
      setProfile(null);
    }
  }, [user]);

  const goHome = () => {
    logAction("NAVIGATION_CLICK", "User clicked LootKey logo and opened home page", "/");
    navigate("/");
  };

  const goSearch = () => {
    logAction("SEARCH_STARTED", `User searched games by text: ${search}`, `/search?q=${search}`);
    navigate(`/search?q=${search}`);
    setMobileMenuOpen(false);
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      goSearch();
    }
  };

  const logoutUser = () => {
    logAction("USER_LOGOUT", "User logged out from account");

    clearCart();
    localStorage.removeItem("lootkey_cart");
    logout();
    setMobileMenuOpen(false);
  };

  const goToPage = (path, details) => {
    logAction("NAVIGATION_CLICK", details, path);
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-black text-white px-4 md:px-6 py-4 relative">
      <div className="flex items-center justify-between gap-3">
        <img
          src="/lootkey-app/logo.png"
          className="h-8 sm:h-10 cursor-pointer shrink-0"
          onClick={goHome}
          alt="LootKey logo"
        />

        <div className="hidden lg:flex gap-3">
          <button
            onClick={() => goToPage("/latest", "User opened Latest page")}
            className="bg-gray-800 px-3 py-1 rounded"
          >
            Latest
          </button>

          <button
            onClick={() => goToPage("/sales", "User opened Sales page")}
            className="bg-gray-800 px-3 py-1 rounded"
          >
            Sales
          </button>

          <button
            onClick={() => goToPage("/search", "User opened Catalog/Search page")}
            className="bg-gray-800 px-3 py-1 rounded"
          >
            Catalog
          </button>

          {user?.role === "Admin" && (
            <button
              onClick={() => goToPage("/admin", "Admin opened Admin Panel")}
              className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded"
            >
              Admin Panel
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div
                onClick={() => goToPage("/profile", "User opened profile page from navbar")}
                className="flex items-center gap-2 cursor-pointer bg-gray-800 px-2 py-1 rounded hover:bg-gray-700"
              >
                <img
                  src={profile?.avatarUrl || "/lootkey-app/default-avatar.png"}
                  className="w-8 h-8 rounded-full object-cover"
                  alt="User avatar"
                />

                <span className="max-w-[90px] truncate">
                  {profile?.username || user.email}
                </span>
              </div>

              <button
                onClick={logoutUser}
                className="bg-gray-800 px-3 py-1 rounded hover:bg-red-600 transition"
                title="Logout"
              >
                🚪
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => goToPage("/login", "Anonymous user opened login page")}
                className="bg-gray-800 px-3 py-1 rounded"
              >
                Login
              </button>

              <button
                onClick={() => goToPage("/register", "Anonymous user opened register page")}
                className="bg-gray-800 px-3 py-1 rounded"
              >
                Register
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search games..."
              className="bg-green-800 px-3 py-1 rounded w-48"
            />

            <button
              onClick={goSearch}
              className="text-green-400 text-xl hover:text-green-300"
            >
              🔍
            </button>
          </div>

          <button
            onClick={() => {
              logAction("CART_OPENED", "User opened cart from navbar");
              setIsCartOpen(true);
            }}
            className="relative text-green-400 text-2xl hover:scale-110 transition"
            title="Open cart"
          >
            🛒

            {totalCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              logAction("MOBILE_MENU_TOGGLED", mobileMenuOpen ? "User closed mobile menu" : "User opened mobile menu");
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden bg-gray-800 px-3 py-2 rounded text-xl"
            title="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-4 right-4 top-full mt-2 bg-gray-900 border border-green-600 rounded-xl p-4 z-50 shadow-2xl">
          <div className="flex flex-col gap-3">
            <button onClick={() => goToPage("/latest", "User opened Latest page from mobile menu")} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left">
              Latest
            </button>

            <button onClick={() => goToPage("/sales", "User opened Sales page from mobile menu")} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left">
              Sales
            </button>

            <button onClick={() => goToPage("/search", "User opened Catalog/Search page from mobile menu")} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left">
              Catalog
            </button>

            {user?.role === "Admin" && (
              <button onClick={() => goToPage("/admin", "Admin opened Admin Panel from mobile menu")} className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-left">
                Admin Panel
              </button>
            )}

            <div className="md:hidden flex items-center gap-2 pt-2 border-t border-gray-700">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search games..."
                className="bg-green-800 px-3 py-2 rounded w-full"
              />

              <button onClick={goSearch} className="text-green-400 text-xl">
                🔍
              </button>
            </div>

            {user ? (
              <div className="sm:hidden flex flex-col gap-3 pt-2 border-t border-gray-700">
                <button
                  onClick={() => goToPage("/profile", "User opened profile page from mobile menu")}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left flex items-center gap-2"
                >
                  <img
                    src={profile?.avatarUrl || "/lootkey-app/default-avatar.png"}
                    className="w-8 h-8 rounded-full object-cover"
                    alt="User avatar"
                  />
                  {profile?.username || user.email}
                </button>

                <button
                  onClick={logoutUser}
                  className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-left"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="sm:hidden flex flex-col gap-3 pt-2 border-t border-gray-700">
                <button onClick={() => goToPage("/login", "Anonymous user opened login page from mobile menu")} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left">
                  Login
                </button>

                <button onClick={() => goToPage("/register", "Anonymous user opened register page from mobile menu")} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}