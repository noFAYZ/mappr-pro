"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useCallback, useMemo } from "react";
import { type ThemeId, getThemeConfig, getAllThemes, getThemesByCategory } from "@/lib/themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, themes, systemTheme } = useNextTheme();

  const currentThemeConfig = useMemo(() => {
    const currentTheme = (resolvedTheme || theme || "light") as ThemeId;
    return getThemeConfig(currentTheme);
  }, [resolvedTheme, theme]);

  const availableThemes = useMemo(() => getAllThemes(), []);

  const themesByCategory = useMemo(() => {
    return {
      standard: getThemesByCategory("standard"),
      neo: getThemesByCategory("neo"),
      nature: getThemesByCategory("nature"),
      professional: getThemesByCategory("professional"),
      creative: getThemesByCategory("creative"),
    };
  }, []);

  const switchTheme = useCallback((themeId: ThemeId) => {
    setTheme(themeId);
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    const currentTheme = resolvedTheme || theme || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [resolvedTheme, theme, setTheme]);

  const isDark = useMemo(() => {
    return currentThemeConfig?.isDark || resolvedTheme === "dark";
  }, [currentThemeConfig, resolvedTheme]);

  const getThemePreview = useCallback((themeId: ThemeId) => {
    const config = getThemeConfig(themeId);
    return {
      primary: config.colors.primary,
      background: config.colors.background,
      foreground: config.colors.foreground,
    };
  }, []);

  return {
    theme: theme as ThemeId,
    resolvedTheme: resolvedTheme as ThemeId,
    systemTheme: systemTheme as ThemeId,
    themes: themes as ThemeId[],
    setTheme: switchTheme,
    toggleTheme,
    currentConfig: currentThemeConfig,
    availableThemes,
    themesByCategory,
    isDark,
    getThemePreview,
  };
}