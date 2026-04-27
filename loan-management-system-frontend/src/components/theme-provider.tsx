"use client";

import * as React from "react";
 
type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  attribute?: "class";
};

type ThemeContextValue = {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  enableSystem = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme | undefined>(undefined);

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
      return;
    }

    if (enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setThemeState(systemTheme);
      applyTheme(systemTheme);
      return;
    }

    setThemeState(defaultTheme);
    applyTheme(defaultTheme);
  }, [defaultTheme, enableSystem, storageKey]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      window.localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    },
    [storageKey],
  );

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
