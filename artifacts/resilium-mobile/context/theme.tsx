import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LightColors, DarkColors, ColorsType } from "@/constants/colors";

export type ThemeType = "light" | "dark";

type ThemeContextType = {
  theme: ThemeType;
  colors: ColorsType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>("dark");

  useEffect(() => {
    AsyncStorage.getItem("resilium-theme").then((savedTheme) => {
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      }
    });
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem("resilium-theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const colors = theme === "light" ? LightColors : DarkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useColors() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useColors must be used within a ThemeProvider");
  }
  return context.colors;
}
