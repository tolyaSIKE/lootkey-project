import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser({
        email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      });
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);

    const payload = JSON.parse(atob(token.split(".")[1]));

    setUser({
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);