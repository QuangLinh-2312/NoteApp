import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { API_URL } from "../config/env";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const verifyToken = useCallback(async (tokenToVerify) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token với server
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const login = async (email, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || "Đăng nhập thất bại" };
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'AbortError') {
        return { success: false, error: "Timeout - Server không phản hồi. Vui lòng kiểm tra kết nối!" };
      }
      if (error.message.includes('fetch')) {
        return { success: false, error: "Không thể kết nối tới server. Vui lòng kiểm tra:\n• Backend có đang chạy?\n• URL: " + API_URL };
      }
      return { success: false, error: "Lỗi kết nối server: " + error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || data.errors?.[0]?.msg || "Đăng ký thất bại",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      if (error.name === 'AbortError') {
        return { success: false, error: "Timeout - Server không phản hồi. Vui lòng kiểm tra kết nối!" };
      }
      if (error.message.includes('fetch')) {
        return { success: false, error: "Không thể kết nối tới server. Vui lòng kiểm tra backend!" };
      }
      return { success: false, error: "Lỗi kết nối server: " + error.message };
    }
  };


  const getAuthHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        getAuthHeaders,
        loading,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
