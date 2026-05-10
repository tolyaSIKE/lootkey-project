import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { logAction } from "../services/logger";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    birthDate: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    logAction(
      "REGISTER_ATTEMPT",
      `User tried to register account. Email=${form.email}, Username=${form.username}`,
      "/register"
    );

    const res = await fetch("https://localhost:7253/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const text = await res.text();
      setMessage(text || "Registration failed.");

      logAction(
        "REGISTER_FAILED",
        `Registration failed. Email=${form.email}. Reason=${text}`,
        "/register"
      );

      return;
    }

    logAction(
      "REGISTER_SUCCESS",
      `New user registered. Email=${form.email}, Username=${form.username}`,
      "/register"
    );

    navigate("/login");
  };

  return (
    <main className="bg-gray-950 min-h-screen p-4 text-white">
      <Navbar />

      <div className="max-w-md mx-auto mt-10 bg-gray-800 p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            className="w-full bg-gray-700 p-3 rounded"
            value={form.username}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full bg-gray-700 p-3 rounded"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full bg-gray-700 p-3 rounded"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="firstName"
            placeholder="First name"
            className="w-full bg-gray-700 p-3 rounded"
            value={form.firstName}
            onChange={handleChange}
          />

          <input
            name="lastName"
            placeholder="Last name"
            className="w-full bg-gray-700 p-3 rounded"
            value={form.lastName}
            onChange={handleChange}
          />

          <input
            name="birthDate"
            type="date"
            className="w-full bg-gray-700 p-3 rounded"
            value={form.birthDate}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
          >
            Register
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