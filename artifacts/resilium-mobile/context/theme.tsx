import React, { createContext, useContext } from "react";
import { DarkColors, ColorsType } from "@/constants/colors";

type ThemeContextType = {
  theme: "dark";
  colors: ColorsType;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  colors: DarkColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: "dark", colors: DarkColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors(): ColorsType {
  return DarkColors;
}
