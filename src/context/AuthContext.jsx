import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("admin"))
  );

  const login = (data) => {
    setUser(data);
    localStorage.setItem("admin", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
