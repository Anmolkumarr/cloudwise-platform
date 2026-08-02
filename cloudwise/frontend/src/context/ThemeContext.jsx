import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("dark");

  const applyTheme = (t) => {
    setThemeState(t);
    document.body.classList.toggle("theme-light", t === "light");
  };

  useEffect(() => {
    const token = localStorage.getItem("cloudwise_token");
    if (!token) return;
    api
      .get("/settings")
      .then(({ data }) => applyTheme(data.theme || "dark"))
      .catch(() => {});
  }, []);

  return <ThemeContext.Provider value={{ theme, applyTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);