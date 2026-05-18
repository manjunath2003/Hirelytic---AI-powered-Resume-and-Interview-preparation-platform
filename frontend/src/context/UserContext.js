import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load saved user on startup
  useEffect(() => {
    const saved = localStorage.getItem("user");

    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // 🔵 Completely replace the user (used for login)
  const setFullUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 🟢 Merge user updates (used when updating profile)
  const updateUser = (updatedData) => {
    const newUser = {
      ...(user || {}),
      ...updatedData
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // 🔴 Logout + clear all storage
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");

    // optional: redirect
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setFullUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
