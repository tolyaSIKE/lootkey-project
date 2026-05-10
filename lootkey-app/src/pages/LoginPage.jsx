import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { logAction } from "../services/logger";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    logAction(
      "LOGIN_ATTEMPT",
      `User tried to login with email: ${email}`,
      "/login"
    );

    const res = await fetch("https://localhost:7253/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (!res.ok) {
      setMessage("Login failed.");

      logAction(
        "LOGIN_FAILED",
        `Login failed for email: ${email}`,
        "/login"
      );

      return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    login(data.token);

    logAction(
      "LOGIN_SUCCESS",
      `User successfully logged in: ${email}`,
      "/login"
    );

    navigate("/");
  };

  return (
    <main className="bg-gray-950 min-h-screen p-4 text-white">
      <Navbar />

      <div className="max-w-md mx-auto mt-10 bg-gray-800 p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-700 p-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-700 p-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-red-400">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}