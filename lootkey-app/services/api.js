const API_URL = "https://localhost:7253/api";

export const getGames = () =>
  fetch(`${API_URL}/games`).then(res => res.json());

export const searchGames = (query) =>
  fetch(`${API_URL}/games/search?query=${query}`)
    .then(res => res.json());

export const login = (email, password) =>
  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  }).then(res => res.json());