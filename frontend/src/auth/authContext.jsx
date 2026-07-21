// src/auth/authContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY } from "../api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for a saved session
  const [error, setError] = useState("");

  // On first load, if a token was saved from a previous visit, validate it
  // against the backend and restore the session instead of starting logged out.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return true;
    } catch (e) {
      setError(e.response?.data?.message || "Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (email, password, displayName) => {
    setError("");
    try {
      const { data } = await api.post("/api/auth/signup", { email, password, displayName });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return true;
    } catch (e) {
      setError(e.response?.data?.message || "Signup failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // Both below return { ok, message } instead of throwing/setting just a
  // boolean — the pages need the actual message even on success ("check
  // your email") not just failure, unlike login/signup above.
  const forgotPassword = async (email) => {
    setError("");
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      return { ok: true, message: data.message };
    } catch (e) {
      const message = e.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      return { ok: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    setError("");
    try {
      const { data } = await api.post("/api/auth/reset-password", { token, password });
      return { ok: true, message: data.message };
    } catch (e) {
      const message = e.response?.data?.message || "Could not reset password.";
      setError(message);
      return { ok: false, message };
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      setError,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
    }),
    [user, loading, error]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
