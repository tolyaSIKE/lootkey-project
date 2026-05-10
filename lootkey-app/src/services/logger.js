const API_URL = "https://localhost:7253/api";

export function logAction(action, details = "", page = window.location.pathname) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      action,
      page,
      details
    })
  }).catch((err) => console.error("Log error:", err));
}