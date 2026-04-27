import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("hrms_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  async function refreshProfile() {
    const { data } = await api.get("/auth/me");
    setUser(data.employee);
    return data.employee;
  }

  async function refreshNotifications() {
    if (!localStorage.getItem("hrms_token")) {
      setNotifications([]);
      return [];
    }

    const { data } = await api.get("/notifications");
    setNotifications(data.notifications || []);
    return data.notifications || [];
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("hrms_token", data.token);
    setToken(data.token);
    setUser(data.employee);
    await refreshNotifications();
    return data.employee;
  }

  function logout() {
    localStorage.removeItem("hrms_token");
    setToken(null);
    setUser(null);
    setNotifications([]);
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await Promise.all([refreshProfile(), refreshNotifications()]);
      } catch (error) {
        localStorage.removeItem("hrms_token");
        if (mounted) {
          setToken(null);
          setUser(null);
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      login,
      logout,
      refreshProfile,
      refreshNotifications,
    }),
    [token, user, loading, notifications]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
