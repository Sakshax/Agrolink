import { createContext, useContext, useState, useCallback, useMemo } from "react";

const AuthContext = createContext();

/**
 * Predefined users for the AgroLink platform.
 * Each entry maps a username to a role and display info.
 */
const USERS = [
  { id: "buyer",   username: "Krishna",                   role: "buyer",   displayName: "Krishna",            avatar: "K" },
  { id: "farmer",  username: "Saksham",                   role: "farmer",  displayName: "Saksham",            avatar: "S" },
  { id: "admin",   username: "admin.agrolink@gmail.com",  role: "admin",   displayName: "Admin",              avatar: "A" },
  { id: "driver",  username: "Driver",                    role: "driver",  displayName: "Driver",             avatar: "D" },
];

const SESSION_KEY = "agrolink_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username) => {
    const found = USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!found) return { success: false, error: "User not found" };

    setUser(found);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(found)); } catch {}
    return { success: true, user: found };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  }, []);

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
