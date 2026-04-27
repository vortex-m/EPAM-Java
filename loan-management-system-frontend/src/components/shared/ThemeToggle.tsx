"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!theme) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`${compact ? "h-9 w-9 p-0" : "gap-1.5"} ${className ?? ""}`.trim()}
        disabled
        aria-label="Toggle theme"
      >
        {!compact ? "Theme" : null}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`${compact ? "h-9 w-9 p-0" : "gap-1.5"} ${className ?? ""}`.trim()}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
      {!compact ? (theme === "dark" ? "Light" : "Dark") : null}
    </Button>
  );
}