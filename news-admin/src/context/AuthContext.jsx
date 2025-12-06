import React, { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // Login function (called from login form)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post("https://api.anmol-goswami-resume.store/api/login", {
        email, password
      });
      console.log(response.data);
      const jwt = response.data.jwt;
      localStorage.setItem("token", jwt);
      setToken(jwt);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed"
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading ,setToken}}>
      {children}
    </AuthContext.Provider>
  );
};
